import {
  BottomSheetModal,
  BottomSheetView as View,
  WINDOW_HEIGHT,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import {
  apiGetMyInfo,
  apiModifyMasterVideoComment,
  apiRemoveMasterVideoComment,
  apiSaveMasterVideoComment,
} from '../../../api/RestAPI';
import { SPSvgs } from '../../../assets/svg';
import { IS_IOS } from '../../../common/constants/constants';
import { CustomException } from '../../../common/exceptions';
import fontStyles from '../../../styles/fontStyles';
import { handleError } from '../../../utils/HandleError';
import Utils from '../../../utils/Utils';
import SPHeader from '../../SPHeader';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../SPMoreModal';
import { SPToast } from '../../SPToast';
import CommentInputSection from '../challenge-detail/CommentInputSection';
import CommentSectionItem from '../challenge-detail/CommentSectionItem';
import { COLORS } from '../../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';

const MasterCommentSection = forwardRef(
  (
    {
      videoIdx = '',
      onSubmit = () => null,
      onEndReached = () => null,
      ListFooterComponent = () => null,
      refreshControl = () => null,
      commentList = [],
    },
    ref,
  ) => {
    const isLogin = useSelector(selector => selector.auth)?.isLogin;

    const commentListRef = useRef();
    const bottomSheetRef = useRef();
    const insets = useSafeAreaInsets();
    const statusBarHeight = StatusBar.currentHeight;
    const screenWidth = useWindowDimensions()?.width;
    const [userInfo, setUserInfo] = useState({});

    const getUserInfo = async () => {
      try {
        const { data } = await apiGetMyInfo();

        if (data) {
          setUserInfo(data.data);
        }
      } catch (error) {
        handleError(error);
      }
    };
    useFocusEffect(
      useCallback(() => {
        getUserInfo();
      }, []),
    );

    let imageHeight;

    if (screenWidth <= 480) {
      imageHeight = 202;
    } else {
      const aspectRatio = 16 / 9;
      imageHeight = screenWidth / aspectRatio;
    }

    function show() {
      bottomSheetRef?.current?.present();
    }

    function hide() {
      setCommentInput('');
      bottomSheetRef?.current?.close();
    }

    useImperativeHandle(ref, () => ({ show, hide }), []);

    const bottomSheetInsets = useMemo(() => {
      if (IS_IOS) {
        return WINDOW_HEIGHT - imageHeight - 60 - insets.top;
      }
      return WINDOW_HEIGHT - imageHeight - 60 - insets.top - statusBarHeight;
    }, [WINDOW_HEIGHT, imageHeight, statusBarHeight, insets]);

    // [ state ] 댓글
    const [commentInput, setCommentInput] = useState('');

    // [ state ] 다중 클릭 방지
    const trlRef = useRef({ current: { disabled: false } });

    // [ state ] 댓글 더보기
    const [showCommentMore, setShowCommentMore] = useState(false);
    const [showCommentModify, setShowCommentModify] = useState(false);
    const [targetComment, setTargetComment] = useState({
      commentIdx: '',
      comment: '',
      memberIdx: '',
      isMine: false,
    });
    const [editCommentInput, setEditCommentInput] = useState('');

    // [ util ] 코멘트 '더보기' 모달 Open
    const openCommentModal = ({ idx, isMine, comment, memberIdx }) => {
      setTargetComment({ idx, comment, isMine, memberIdx });
      setEditCommentInput(comment);
      setShowCommentMore(true);
    };

    // [ util ] 코멘트 '더보기' 모달 Close
    const closeCommentModal = () => {
      setShowCommentMore(false);
    };

    // [ util ] 코멘트 '수정' 모달 Open
    const openModifyCommentModal = () => {
      setShowCommentModify(true);
    };

    // [ util ] 코멘트 '수정' 모달 Close
    const closeModifyCommentModal = () => {
      setEditCommentInput('');
      setShowCommentModify(false);
    };

    // [ util ] 코멘트 렌더
    const renderItem = useCallback(({ item }) => {
      return <CommentSectionItem item={item} onPressMore={openCommentModal} />;
    }, []);

    // [ api ] 트레이닝 마스터 영상 댓글 '등록'
    const saveMasterVideoComment = async () => {
      if (!isLogin) {
        handleError(new CustomException('로그인이 필요합니다.'));
        return;
      }

      try {
        if (trlRef.current.disabled) return;

        if (!commentInput || !commentInput.trim()) {
          Utils.openModal({ title: '확인 요청', body: '댓글을 입력해주세요.' });
          return;
        }

        trlRef.current.disabled = true;

        const { data } = await apiSaveMasterVideoComment({
          videoIdx,
          comment: commentInput,
        });

        if (data) {
          onSubmit();
          trlRef.current.disabled = false;
          setCommentInput('');
          commentListRef.current.scrollToOffset({
            animated: false,
            offset: 0,
          });
        }
      } catch (error) {
        handleError(error);
        trlRef.current.disabled = false;
      }
    };

    // [ api ] 트레이닝 마스터 영상 댓글 '수정'
    const modifyMasterVideoComment = async () => {
      try {
        if (trlRef.current.disabled) return;

        if (!editCommentInput || !editCommentInput.trim()) {
          Utils.openModal({
            title: '확인 요청',
            content: '댓글을 입력해주세요.',
          });
          return;
        }

        trlRef.current.disabled = true;

        const { data } = await apiModifyMasterVideoComment({
          videoIdx,
          commentIdx: targetComment.idx,
          comment: editCommentInput,
        });

        if (data) {
          Keyboard.dismiss();
          closeModifyCommentModal();

          onSubmit();
          trlRef.current.disabled = false;
          commentListRef.current.scrollToOffset({
            animated: false,
            offset: 0,
          });

          SPToast.show({ text: '댓글을 수정했어요' });
        }
      } catch (error) {
        handleError(error);
        trlRef.current.disabled = false;
      }
    };

    // [ api ] 트레이닝 마스터 영상 댓글 '삭제'
    const removeMasterVideoComment = async () => {
      try {
        if (trlRef.current.disabled) return;

        if (!editCommentInput || !editCommentInput.trim()) {
          Utils.openModal({
            title: '확인 요청',
            content: '댓글을 입력해주세요.',
          });
          return;
        }

        trlRef.current.disabled = true;

        const { data } = await apiRemoveMasterVideoComment(targetComment.idx);

        if (data) {
          Utils.openModal({
            title: '성공',
            body: '삭제되었습니다.',
          });
        }
        trlRef.current.disabled = false;
      } catch (error) {
        handleError(error);
        trlRef.current.disabled = false;
      }
    };

    return (
      <BottomSheetModal
        keyboardBehavior="extend"
        snapPoints={[bottomSheetInsets]}
        index={0}
        ref={bottomSheetRef}
        style={{
          shadowColor: COLORS.black,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 5,
        }}
        handleComponent={null}>
        <View
          style={[
            styles.container,
            {
              paddingBottom: insets.bottom,
            },
          ]}>
          <View style={styles.headerWrapper}>
            <Text style={fontStyles.fontSize18_Semibold}>댓글</Text>
            <Pressable
              onPress={() => {
                hide();
              }}>
              <SPSvgs.Close width={24} height={24} />
            </Pressable>
          </View>

          <FlatList
            ref={commentListRef}
            data={commentList}
            renderItem={renderItem}
            onEndReached={onEndReached}
            ListFooterComponent={ListFooterComponent}
            refreshControl={refreshControl}
          />

          <CommentInputSection
            onChangeText={text => setCommentInput(text)}
            onSubmit={saveMasterVideoComment}
            maxLength={1000}
            userInfo={userInfo} // userInfo를 props로 전달
          />

          {/* 모달 > 댓글 더보기 */}
          <SPMoreModal
            transparent={true}
            visible={showCommentMore}
            onClose={closeCommentModal}
            onReport={hide}
            type={MODAL_MORE_TYPE.MASTER_VIDEO_COMMENT}
            idx={targetComment.idx}
            targetUserIdx={targetComment.memberIdx}
            onDelete={removeMasterVideoComment}
            onModify={openModifyCommentModal}
            onConfirm={onSubmit}
            memberButtons={
              targetComment.isMine
                ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
                : [MODAL_MORE_BUTTONS.REPORT]
            }
          />

          {/* 모달 > 댓글 수정 */}
          <Modal
            animationType="fade"
            transparent={false}
            visible={showCommentModify}
            onRequestClose={closeModifyCommentModal}>
            <SafeAreaView style={{ flex: 1 }}>
              <SPHeader
                title="댓글 수정"
                onPressLeftBtn={closeModifyCommentModal}
                rightCancelText
                rightText="완료"
                rightTextStyle={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#313779',
                  lineHeight: 24,
                  letterSpacing: 0.091,
                  minHeight: 28,
                }}
                onPressRightText={modifyMasterVideoComment}
              />
              <View style={{ flex: 1, padding: 16 }}>
                <TextInput
                  style={styles.textInput}
                  value={editCommentInput}
                  defaultValue={editCommentInput}
                  onChangeText={text => {
                    if (text?.length > 1000) return;
                    setEditCommentInput(text);
                  }}
                  multiline={true}
                  placeholder="댓글을 남겨보세요(최대 1000자)"
                  placeholderTextColor="#1A1C1E"
                  autoFocus={true}
                  autoCorrect={false}
                  autoCapitalize="none"
                  textAlignVertical="top"
                  retrunKeyType="next"
                />
              </View>
            </SafeAreaView>
          </Modal>
        </View>
      </BottomSheetModal>
    );
  },
);

export default memo(MasterCommentSection);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  textInput: {
    flexGrow: 1,
    flexShrink: 1,
  },
});
