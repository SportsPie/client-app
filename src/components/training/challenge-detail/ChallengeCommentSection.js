import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
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
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  apiGetMyInfo,
  apiModifyChallengeVideoComment,
  apiRemoveChallengeVideoComment,
  apiSaveChallengeVideoComment,
} from '../../../api/RestAPI';
import { SPSvgs } from '../../../assets/svg';
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
import CommentInputSection from './CommentInputSection';
import CommentSectionItem from './CommentSectionItem';
import { COLORS } from '../../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';
import { store } from '../../../redux/store';
import { moreChallengeVideoListAction } from '../../../redux/reducers/list/moreChallengeVideoListSlice';
import { moreChallengeCommentListAction } from '../../../redux/reducers/list/moreChallengeCommentListSlice';
import { challengeDetailAction } from '../../../redux/reducers/list/challengeDetailSlice';

const ChallengeCommentSection = forwardRef(
  (
    {
      videoIdx = '',
      onSubmit = () => null,
      onModify = () => null,
      onEndReached = () => null,
      ListFooterComponent = () => null,
      refreshControl = () => null,
      commentList = [],
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const isLogin = useSelector(selector => selector.auth)?.isLogin;
    const [chatModalShow, setChatModalShow] = useState(false);

    const commentListRef = useRef();
    const bottomSheetRef = useRef();
    const insets = useSafeAreaInsets();
    const statusBarHeight = StatusBar.currentHeight;
    const screenWidth = useWindowDimensions()?.width;
    let imageHeight;

    if (screenWidth <= 480) {
      imageHeight = 202;
    } else {
      const aspectRatio = 16 / 9;
      imageHeight = screenWidth / aspectRatio;
    }

    const show = () => {
      setChatModalShow(true);
    };

    const hide = () => {
      setChatModalShow(false);
    };

    useImperativeHandle(ref, () => ({ show, hide }), []);

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
    const saveChallengeVideoComment = async () => {
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

        const { data } = await apiSaveChallengeVideoComment({
          videoIdx,
          comment: commentInput,
        });

        if (data) {
          onSubmit();
          trlRef.current.disabled = false;
          setCommentInput('');
          // commentListRef.current.scrollToOffset({
          //   animated: false,
          //   offset: 0,
          // });
          const findVideo = store
            .getState()
            .moreChallengeVideoList.list.find(
              item => Number(item.videoIdx) === Number(videoIdx),
            );
          if (findVideo) {
            findVideo.cntComment += 1;
            dispatch(
              moreChallengeVideoListAction.modifyItem({
                idxName: 'videoIdx',
                idx: videoIdx,
                item: findVideo,
              }),
            );
          }
          dispatch(moreChallengeCommentListAction.refresh());
          dispatch(
            challengeDetailAction.plusCommentCnt({
              idx: videoIdx,
              idxName: 'videoIdx',
            }),
          );
        }
      } catch (error) {
        handleError(error);
        trlRef.current.disabled = false;
      }
    };

    // [ api ] 트레이닝 마스터 영상 댓글 '수정'
    const modifyChallengeVideoComment = async () => {
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

        const { data } = await apiModifyChallengeVideoComment({
          videoIdx,
          commentIdx: targetComment.idx,
          comment: editCommentInput,
        });

        if (data) {
          Keyboard.dismiss();
          closeModifyCommentModal();

          onSubmit();
          trlRef.current.disabled = false;
          // commentListRef.current.scrollToOffset({
          //   animated: false,
          //   offset: 0,
          // });

          targetComment.comment = editCommentInput;
          dispatch(
            moreChallengeCommentListAction.modifyItem({
              idxName: 'commentIdx',
              idx: targetComment.idx,
              item: targetComment,
            }),
          );
          if (onModify) onModify(targetComment.idx, targetComment);
          SPToast.show({ text: '댓글을 수정했어요' });
        }
      } catch (error) {
        handleError(error);
        trlRef.current.disabled = false;
      }
    };

    // [ api ] 트레이닝 마스터 영상 댓글 '삭제'
    const removeChallengeVideoComment = async () => {
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

        const { data } = await apiRemoveChallengeVideoComment(
          targetComment.idx,
        );

        if (data) {
          Utils.openModal({
            title: '성공',
            body: '삭제되었습니다.',
          });
          const findVideo = store
            .getState()
            .moreChallengeVideoList.list.find(
              item => Number(item.videoIdx) === Number(videoIdx),
            );
          if (findVideo) {
            findVideo.cntComment -= 1;
            dispatch(
              moreChallengeVideoListAction.modifyItem({
                idxName: 'videoIdx',
                idx: videoIdx,
                item: findVideo,
              }),
            );
          }
          dispatch(moreChallengeCommentListAction.refresh());

          dispatch(
            challengeDetailAction.minusCommentCnt({
              idx: videoIdx,
              idxName: 'videoIdx',
            }),
          );
        }
        trlRef.current.disabled = false;
      } catch (error) {
        handleError(error);
        trlRef.current.disabled = false;
      }
    };

    // [ return ]
    return (
      <View>
        <Modal
          transparent={true}
          visible={chatModalShow}
          onRequestClose={() => {
            hide();
          }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={hide}
          />
          <View
            style={{
              position: 'absolute',
              backgroundColor: COLORS.background,
              height: '60%',
              width: '100%',
              bottom: 0,
              shadowColor: COLORS.black,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
            }}>
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
                keyExtractor={item => item?.commentIdx}
              />

              <CommentInputSection
                onChangeText={text => setCommentInput(text)}
                onSubmit={saveChallengeVideoComment}
                maxLength={1000}
                userInfo={userInfo}
              />
            </View>

            {/* 모달 > 댓글 더보기 */}
            <SPMoreModal
              transparent={true}
              visible={showCommentMore}
              onClose={closeCommentModal}
              onReport={hide}
              type={MODAL_MORE_TYPE.CHALLENGE_VIDEO_COMMENT}
              idx={targetComment.idx}
              targetUserIdx={targetComment.memberIdx}
              onDelete={removeChallengeVideoComment}
              onModify={openModifyCommentModal}
              onConfirm={onSubmit}
              memberButtons={
                targetComment.isMine
                  ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
                  : [MODAL_MORE_BUTTONS.REPORT]
              }
            />
          </View>
        </Modal>
        {/* 모달 > 댓글 수정 */}
        <Modal
          animationType="fade"
          transparent={false}
          visible={showCommentModify}
          onRequestClose={closeModifyCommentModal}>
          <SafeAreaView style={{ flex: 1, paddingBottom: 24 }}>
            <SPHeader
              noBackHandlerEvent
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
              onPressRightText={modifyChallengeVideoComment}
            />
            <View style={{ flex: 1, padding: 16 }}>
              <TextInput
                style={styles.textInput}
                value={editCommentInput}
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
            <Text
              style={{
                ...fontStyles.fontSize14_Regular,
                textAlign: 'right',
                padding: 16,
              }}>
              {Utils.changeNumberComma(editCommentInput.length)}/1,000
            </Text>
          </SafeAreaView>
        </Modal>
      </View>
    );
  },
);

export default memo(ChallengeCommentSection);

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
