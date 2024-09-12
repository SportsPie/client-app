import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
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
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import Loading from '../../components/SPLoading';
import {
  apiDeleteEventComment,
  apiGetUserEventCommentList,
  apiPostEventComment,
  apiPutEventComment,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { store } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import ListEmptyView from '../../components/ListEmptyView';
import { eventParticipantCommentListAction } from '../../redux/reducers/list/eventParticipantCommentListSlice';
import SPIcons from '../../assets/icon';
import moment from 'moment/moment';
import { SPSvgs } from '../../assets/svg';
import Utils from '../../utils/Utils';
import Avatar from '../../components/Avatar';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import { useAppState } from '../../utils/AppStateContext';
import Divider from '../../components/Divider';
import SPHeader, { headerProps } from '../../components/SPHeader';
import { SPToast } from '../../components/SPToast';
import BackHandlerUtils from '../../utils/BackHandlerUtils';
import NavigationService from '../../navigation/NavigationService';
import { PARTICIPATION_STATE } from '../../common/constants/ParticipationState';

function MoreEventParticipantComment() {
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const listName = 'eventParticipantCommentList';
  const {
    page,
    list: commentList,
    refreshing,
    loading,
    isLast,
    totalCnt,
  } = useSelector(selector => selector[listName]);
  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const pageSize = 30;

  const { participantInfo, setParticipantInfo } = useAppState();

  const [comment, setComment] = useState('');
  const action = eventParticipantCommentListAction;

  const trlRef = useRef({ current: { disabled: false } });
  const [keyboardAvoidingViewRefresh, setKeyboardAvoidingViewRefresh] =
    useState(false);
  const [commentRegist, setCommentRegist] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isMyFeed, setIsMyFeed] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [modifyCommentModalVisible, setModifyCommentModalVisible] =
    useState(false);
  const [modifyComment, setModifyComment] = useState('');
  /**
   * api
   */

  const getUserCommentList = async () => {
    const params = {
      size: pageSize,
      page,
      participationIdx: participantInfo?.participationIdx,
    };
    try {
      const { data } = await apiGetUserEventCommentList(params);
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    } finally {
      dispatch(action.setRefreshing(false));
      dispatch(action.setLoading(false));
    }
  };

  const registComment = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const params = {
        participationIdx: participantInfo?.participationIdx,
        comment,
      };
      const { data } = await apiPostEventComment(params);
      Keyboard.dismiss();
      dispatch(action.refresh());
      setCommentRegist(true);
    } catch (error) {
      handleError(error);
    } finally {
      setComment('');
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
      setModifyCommentModalVisible(false);
      SPToast.show({ text: '댓글을 수정했어요' });
    } catch (error) {
      handleError(error);
    } finally {
      setComment('');
      trlRef.current.disabled = false;
    }
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

  const openModifyCommentModal = () => {
    setModifyComment(selectedItem.comment);
    setModifyCommentModalVisible(true);
  };

  const openModal = comment => {
    setIsMyFeed(comment.isMine);
    setSelectedItem(comment);
    setModalVisible(true);
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
        getUserCommentList();
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
    return <ListEmptyView text="댓글이 존재하지 않습니다." />;
  }, []);

  const renderInputSection = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
        <Divider />
        <View style={styles.inputSection}>
          <Avatar
            disableEditMode
            imageURL={participantInfo?.userProfilePath}
            imageSize={24}
          />
          <TextInput
            placeholder="댓글을 남겨보세요(최대 1000자)"
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <DismissKeyboard>
      <SafeAreaView
        style={styles.container}
        edges={['left', 'right', 'bottom']}>
        {participantInfo?.prtState === PARTICIPATION_STATE.COMPLETE.value ? (
          <SPKeyboardAvoidingView
            key={loading ? 'loading' : 'loaded'}
            behavior="padding"
            isResize
            keyboardVerticalOffset={0}>
            {commentList && commentList.length > 0 ? (
              <View style={{ flex: 1, paddingTop: 16 }}>
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                  <View>
                    <Text
                      style={{
                        ...fontStyles.fontSize18_Semibold,
                        color: '#1A1C1E',
                      }}>
                      나를 위한 응원 댓글
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        ...fontStyles.fontSize16_Medium,
                        color: 'rgba(46, 49, 53, 0.80)',
                      }}>
                      {`${Utils.changeNumberComma(totalCnt)}개`}
                    </Text>
                  </View>
                </View>
                <FlatList
                  ref={flatListRef}
                  data={commentList}
                  numColumns={1}
                  renderItem={renderParticipantItem}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  onEndReached={handleEndReached}
                  onEndReachedThreshold={0.5}
                  ListEmptyComponent={renderEmptyList}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  onContentSizeChange={() => {
                    if (page === 1 && commentRegist && commentList.length > 0) {
                      flatListRef.current.scrollToIndex({
                        animated: false,
                        index: 0,
                      });
                      setCommentRegist(false);
                    }
                  }}
                />
                {renderInputSection()}
              </View>
            ) : loading ? (
              <Loading />
            ) : (
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 16,
                  }}>
                  <Text
                    style={{
                      ...fontStyles.fontSize18_Semibold,
                      color: '#121212',
                    }}>
                    아직 댓글이 없습니다
                  </Text>
                  <Text
                    style={{
                      ...fontStyles.fontSize12_Medium,
                      color: 'rgba(46, 49, 53, 0.60)',
                    }}>
                    댓글을 기다리고 있어요!
                  </Text>
                </View>
                {renderInputSection()}
              </View>
            )}

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
                <StatusBar
                  backgroundColor={COLORS.white}
                  barStyle="dark-content"
                />
                <SPHeader
                  title="댓글 수정"
                  onPressLeftBtn={() => {
                    BackHandlerUtils.remove();
                    BackHandlerUtils.add(() => {
                      NavigationService.goBack();
                      return true; // 뒤로가기 이벤트 실행
                    });
                    setModifyCommentModalVisible(false);
                  }}
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
                <View style={{ flex: 1, padding: 16 }}>
                  <TextInput
                    // style={styles.textInput}
                    // defaultValue={modifyComment}
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
          </SPKeyboardAvoidingView>
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text
              style={{
                ...fontStyles.fontSize12_Medium,
                textAlign: 'center',
                color: 'rgba(46, 49, 53, 0.60)',
              }}>
              신청이 확정되면 이 페이지를 자유롭게 이용하실 수 있어요. {`\n`}
              조금만 기다려 주세요!
            </Text>
          </View>
        )}
      </SafeAreaView>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    // gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.08)',
  },

  userDetailsWrapper: {
    flex: 1,
    rowGap: 6,
    marginRight: 'auto',
  },
  userNameWrapper: {
    width: '100%',
    justifyContent: 'space-between',
    rowGap: 2,
    marginRight: 'auto',
    flexShrink: 1,
    flexDirection: 'row',
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
  dateText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  button: {},
  commentText: {
    ...fontStyles.fontSize14_Regular,
    color: '#1A1C1E',
  },
});

export default MoreEventParticipantComment;
