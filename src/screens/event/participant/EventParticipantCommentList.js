import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { COLORS } from '../../../styles/colors';
import DismissKeyboard from '../../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../../components/SPKeyboardAvoidingView';
import Loading from '../../../components/SPLoading';
import {
  apiDeleteEventComment,
  apiGetEventCommentList,
  apiGetUserEventCommentList,
  apiPostEventComment,
  apiPutCommunityComment,
  apiPutEventComment,
} from '../../../api/RestAPI';
import { handleError } from '../../../utils/HandleError';
import { store } from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import ArticleItem from '../../../components/article/ArticleItem';
import ListEmptyView from '../../../components/ListEmptyView';
import { eventParticipantCommentListAction } from '../../../redux/reducers/list/eventParticipantCommentListSlice';
import SPIcons from '../../../assets/icon';
import moment from 'moment/moment';
import { IS_YN } from '../../../common/constants/isYN';
import { SPSvgs } from '../../../assets/svg';
import Utils from '../../../utils/Utils';
import Avatar from '../../../components/Avatar';
import { MODAL_CLOSE_EVENT } from '../../../common/constants/modalCloseEvent';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../../components/SPMoreModal';
import SPHeader from '../../../components/SPHeader';
import { SPToast } from '../../../components/SPToast';
import { useAppState } from '../../../utils/AppStateContext';
import BackHandlerUtils from '../../../utils/BackHandlerUtils';

function EventParticipantCommentList() {
  const dispatch = useDispatch();
  const listName = 'eventParticipantCommentList';
  const {
    page,
    list: commentList,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const isLogin = useSelector(selector => selector.auth)?.isLogin;

  const [isFocus, setIsFocus] = useState(true);
  const pageSize = 30;

  const [comment, setComment] = useState('');
  const action = eventParticipantCommentListAction;

  const trlRef = useRef({ current: { disabled: false } });
  const [keyboardAvoidingViewRefresh, setKeyboardAvoidingViewRefresh] =
    useState(false);
  const [commentRegist, setCommentRegist] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isMyFeed, setIsMyFeed] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const insets = useSafeAreaInsets();
  const [selectedComment, setSelectedComment] = useState({});
  const [modifyComment, setModifyComment] = useState('');
  const [modifyCommentModalVisible, setModifyCommentModalVisible] =
    useState(false);
  const { participantInfo, setParticipantInfo } = useAppState();
  const getUserCommentInfo = async () => {
    const params = {
      size: pageSize,
      page,
      participationIdx: participantInfo?.participationIdx,
    };
    try {
      const { data } = isLogin
        ? await apiGetUserEventCommentList(params)
        : await apiGetEventCommentList(params);
      if (Array.isArray(data.data.list)) {
        dispatch(action.setTotalCnt(data.data.totalCnt));
        dispatch(action.setIsLast(data.data.isLast));
        if (page === 1) {
          dispatch(action.setList(data.data.list));
        } else {
          const prevList = store.getState()[listName].list;
          dispatch(action.setList([...prevList, ...data.data.list]));
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      dispatch(action.setRefreshing(false));
      dispatch(action.setLoading(false));
    }
  };

  const registComment = async () => {
    setComment('');
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      if (!isLogin) {
        Utils.openModal({
          title: '로그인 필요',
          body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
          confirmEvent: MODAL_CLOSE_EVENT.login,
          cancelEvent: MODAL_CLOSE_EVENT.nothing,
        });
        return;
      }
      const params = {
        participationIdx: participantInfo.participationIdx,
        comment,
      };
      const { data } = await apiPostEventComment(params);
      Keyboard.dismiss();
      dispatch(action.refresh());
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  const editComment = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const params = {
        commentIdx: selectedItem.commentIdx,
        comment: modifyComment,
      };
      const { data } = await apiPutEventComment(params);
      selectedItem.comment = modifyComment;
      dispatch(
        action.modifyItem({
          idxName: 'commentIdx',
          idx: selectedItem.commentIdx,
          item: { ...selectedItem },
        }),
      );
      Keyboard.dismiss();
      closeModifyCommentModal();
      SPToast.show({ text: '댓글을 수정했어요' });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const deleteComment = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const { data } = await apiDeleteEventComment(selectedItem.commentIdx);
      dispatch(action.refresh());
      SPToast.show({ text: '댓글을 삭제했어요.' });
    } catch (error) {
      handleError(error);
    } finally {
      closeModal();
      trlRef.current.disabled = false;
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const handleEndReached = () => {
    if (!isLast) {
      setTimeout(() => {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
  }, []);

  const closeModal = () => setModalVisible(false);

  const showJoinModal = () => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
      });
    }
  };

  const openModal = feed => {
    if (!isLogin) {
      showJoinModal();
      return;
    }
    setIsMyFeed(feed.isMine);
    setSelectedItem(feed);
    setModalVisible(true);
  };

  const openModifyCommentModal = () => {
    setSelectedItem(selectedItem);
    setModifyComment(selectedItem.comment);
    setModifyCommentModalVisible(true);
  };

  const closeModifyCommentModal = () => {
    setModifyCommentModalVisible(false);
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------

  useEffect(() => {
    if (participantInfo?.eventIdx && participantInfo?.participationIdx) {
      onRefresh();
    }
  }, [participantInfo?.eventIdx, participantInfo?.participationIdx]);

  useEffect(() => {
    if (participantInfo?.eventIdx && participantInfo?.participationIdx) {
      if (refreshing || (!refreshing && page > 1)) {
        getUserCommentInfo();
      }
    }
  }, [page, refreshing]);

  const renderParticipantItem = ({ item }) => (
    <View style={styles.userInfoContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          height: '100%',
        }}>
        <Avatar disableEditMode imageSize={40} imageURL={item.profilePath} />
      </View>

      <View style={styles.userDetailsWrapper}>
        <View style={styles.userNameWrapper}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.userNameText}>{item?.memberName}</Text>
            <Text style={styles.dateText}>
              {moment(item?.regDate).format('YYYY.MM.DD')}
            </Text>
          </View>
          <Pressable
            hitSlop={12}
            onPress={() => {
              openModal(item);
            }}>
            <SPSvgs.EllipsesVertical width={24} height={24} />
          </Pressable>
        </View>
        <View>
          <Text style={styles.commentText}>{item?.comment}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = useCallback(() => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}>
        <Text style={styles.contentsTitle}>아직 댓글이 없습니다.</Text>
        <ListEmptyView
          text="가장 먼저 응원 댓글을 남겨보세요!"
          style={{ paddingVertical: 0 }}
        />
      </View>
    );
  }, []);

  return (
    <DismissKeyboard>
      <SafeAreaView style={styles.container}>
        <SPKeyboardAvoidingView
          key={keyboardAvoidingViewRefresh ? 'key1' : 'key2'}
          behavior="padding"
          isResize
          keyboardVerticalOffset={0}>
          {commentList && commentList.length > 0 ? (
            <FlatList
              data={commentList}
              numColumns={1}
              renderItem={renderParticipantItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={renderEmptyList}
              contentContainerStyle={styles.content}
            />
          ) : loading ? (
            <Loading />
          ) : (
            renderEmptyList()
          )}

          <View style={styles.inputSection}>
            <Avatar
              disableEditMode
              imageURL={commentList?.userProfilePath}
              imageSize={24}
            />
            <TextInput
              placeholder="응원 댓글을 남겨보세요(최대 1000자)"
              style={styles.input}
              value={comment}
              onChangeText={e => {
                if (e?.length > 1000) return;
                setComment(e);
              }}
              autoCorrect={false}
              autoCapitalize="none"
              placeholderTextColor="rgba(46, 49, 53, 0.60)"
              multiline
              textAlignVertical="center"
              retrunKeyType="next"
            />
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity disabled={!comment} onPress={registComment}>
                  <Image
                    source={SPIcons.icSend}
                    style={{ width: 40, height: 28 }}
                  />
                </TouchableOpacity>
                {/* <Text
                  style={{
                    ...fontStyles.fontSize11_Regular,
                    height: 14,
                    marginTop: 5,
                    width: 57.1,
                    textAlign: 'center',
                  }}>
                  {Utils.changeNumberComma(comment.length)}/1,000
                </Text> */}
              </View>
              <SPMoreModal
                visible={modalVisible}
                onClose={closeModal}
                isAdmin={false}
                type={MODAL_MORE_TYPE.EVENT_COMMENT}
                idx={selectedItem?.commentIdx}
                targetUserIdx={selectedItem?.memberIdx}
                onDelete={deleteComment}
                onModify={openModifyCommentModal}
                memberButtons={
                  isMyFeed
                    ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
                    : [MODAL_MORE_BUTTONS.REPORT]
                }
              />
              <Modal
                animationType="fade"
                transparent={false}
                visible={modifyCommentModalVisible}
                onRequestClose={() => {
                  BackHandlerUtils.remove();
                  BackHandlerUtils.add(() => {
                    NavigationService.goBack();
                    return true; // 뒤로가기 이벤트 실행
                  });
                  setModifyCommentModalVisible(false);
                }}>
                <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
                  <SPHeader
                    title="댓글 수정"
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
                    onPressRightText={() => {
                      if (modifyComment) {
                        editComment();
                      } else {
                        Utils.openModal({
                          title: '확인 요청',
                          content: '댓글을 입력해주세요.',
                        });
                      }
                    }}
                  />
                  {/* 댓글창부분 */}

                  <View style={{ flex: 1, padding: 16 }}>
                    <TextInput
                      style={styles.textInput}
                      value={modifyComment}
                      onChangeText={e => {
                        if (e?.length > 1000) return;
                        setModifyComment(e);
                      }}
                      multiline={true}
                      placeholder="댓글을 남겨보세요.(최대 1000자)"
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
                    {Utils.changeNumberComma(modifyComment.length)}/1,000
                  </Text>
                </SafeAreaView>
              </Modal>
            </View>
          </View>
        </SPKeyboardAvoidingView>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingHorizontal: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingVertical: 16,
  },
  userNameWrapper: {
    width: '100%',
    justifyContent: 'space-between',
    rowGap: 2,
    marginRight: 'auto',
    flexShrink: 1,
    flexDirection: 'row',
  },
  userDetailsWrapper: {
    flex: 1,
    rowGap: 6,
    marginRight: 'auto',
  },
  userNameText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
    marginRight: 8,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
  },
  input: {
    padding: 0,
    margin: 0,
    ...fontStyles.fontSize14_Medium,
    flex: 1,
    letterSpacing: 0.2,
    color: COLORS.labelNormal,
    maxHeight: 20 * 4,
    lineHeight: 14,
  },
  contentsTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  commentText: {
    fontSize: 14,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  button: {},
});

export default EventParticipantCommentList;
