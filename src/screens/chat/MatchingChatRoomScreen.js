import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { FlatList } from '@stream-io/flat-list-mvcp';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import ChatMapper, { MESSAGE_TYPE } from '../../utils/chat/ChatMapper';
import Loading from '../../components/SPLoading';
import { handleError } from '../../utils/HandleError';
import ChatUtils from '../../utils/chat/ChatUtils';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import {
  apiCancelApplyMatch,
  apiGetChatChatRoomExtraData,
  apiGetChatMessage,
  apiSelectAcademy4Match,
} from '../../api/RestAPI';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPIcons from '../../assets/icon';
import SPHeader from '../../components/SPHeader';
import { IS_YN } from '../../common/constants/isYN';
import Utils from '../../utils/Utils';
import { JOIN_TYPE } from '../../common/constants/joinType';
import { MATCH_STATE } from '../../common/constants/matchState';
import SPModal from '../../components/SPModal';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import SPImages from '../../assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { SPSvgs } from '../../assets/svg';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';

function MatchingChatRoomScreen({ navigation }) {
  /**
   * state
   */
  const chatListRef = useRef();
  const trlRef = useRef({ current: { disabled: false } });
  const [fstCall, setFstCall] = useState(false);
  const { roomId } = useRoute().params;
  const chatState = useSelector(state => state.chat);
  const authState = useSelector(state => state.auth);
  const { chatList, newMessageTimeId, participantList, notiYn } = chatState;
  const dispatch = useDispatch();

  const [targetAcademyDetail, setTargetAcademyDetail] = useState({});
  const [matchDetail, setMatchDetail] = useState({});
  const [targetUserDetail, setTargetUserDetail] = useState({});

  const [timeId, setTimeId] = useState(new Date().getTime()); // 방 접근 시간
  const [chatRoom, setChatRoom] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFirstItemVisible, setIsFirstItemVisible] = useState(false);
  const [showNewMessageBox, setShowNewMessageBox] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isHomeAdmin, setIsHomeAdmin] = useState(false);
  const [showMatchButton, setShowMatchButton] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);

  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);

  /**
   * api
   */
  const updateAcademyAndMatchAndCheckAdmin = async () => {
    try {
      const room = await ChatMapper.selectChatRoomById(roomId);
      setChatRoom(room);
      const params = {
        userIdx: room.targetUserIdx,
        academyIdx: room.targetAcademyIdx,
        matchIdx: room.matchIdx,
      };
      const { data } = await apiGetChatChatRoomExtraData(params);
      const { academy, match, member, matchRequested } = data.data;
      const currentDate = new Date();
      const classEndDate = new Date(match.closeDate);

      if (academy) {
        setTargetAcademyDetail(academy);
      }
      if (match) {
        setMatchDetail(match);
      }
      if (member) {
        setTargetUserDetail(member);
      }

      // 해당 경기 개최 아카데미 운영자인지 확인
      if (match) {
        const joinType = await Utils.getUserJoinType(match.homeAcademyIdx);
        if (joinType === JOIN_TYPE.ACADEMY_ADMIN) {
          setIsHomeAdmin(true);
        } else if (joinType === JOIN_TYPE.ADMIN) {
          setIsHomeAdmin(false);
        }

        // 경기 상태에 따른 버튼 활성화
        if (match.matchState === MATCH_STATE.APPLY.code) {
          if (joinType === JOIN_TYPE.ADMIN) {
            if (!matchRequested) {
              setShowMatchButton(false);
            } else {
              setShowMatchButton(true);
            }
          } else {
            setShowMatchButton(true);
          }
        } else {
          setShowMatchButton(false);
        }

        if (match.closeDate) {
          if (classEndDate < currentDate) {
            setShowMatchButton(false);
          }
        }
      }
      updateData(academy, match, member);
    } catch (error) {
      handleError(error);
    }
    setFstCall(true);
  };

  const updateData = async (academy, match, member) => {
    try {
      if (academy) {
        await ChatMapper.updateAcademyList([academy]);
      }
      if (match) {
        await ChatMapper.updateMatchList([match]);
      }
      if (member) {
        await ChatMapper.updateMemberList([member]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  /**
   *  sql lite
   */

  const send = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      await ChatUtils.sendMessage(roomId, inputValue);
      setInputValue('');
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const getChatList = async (pageNum, roomIdStr) => {
    try {
      if (loading) return;
      setLoading(true);
      const params = {
        roomId: roomIdStr,
        paging: true,
        page: pageNum,
        size,
        timeId,
      };
      let data = await ChatMapper.selectChatMessageList(params);
      if (data.length < size) {
        const { data: serverData } = await apiGetChatMessage(params);
        setIsLast(serverData.data.isLast);
        const serverList = serverData.data.list;
        const slicedList = serverList.slice(data.length);
        if (slicedList.length > 0) {
          await ChatMapper.insertChatMessageList(slicedList);
        }
        data = data.concat(slicedList);
      }
      if (pageNum === 1) {
        dispatch(chatSliceActions.setChatList(data));
      } else {
        dispatch(
          chatSliceActions.setChatList([...chatState.chatList, ...data]),
        );
      }
    } catch (error) {
      handleError(error);
    }
    setRefreshing(false);
    setLoading(false);
  };

  const confirmMatching = async () => {
    setShowCheckModal(false);
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const params = {
        matchIdx: matchDetail.matchIdx,
        academyIdx: targetAcademyDetail.academyIdx,
      };
      const { data } = await apiSelectAcademy4Match(params);
      setShowMatchButton(false);
      Utils.openModal({
        title: '완료',
        body: '경기 진행을 확정되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.movePage,
        pageName: navName.matchingDetail,
        data: { matchIdx: matchDetail.matchIdx },
      });
    } catch (error) {
      handleError(error);
      if (error.code === 3004) {
        setShowMatchButton(false);
      }
    } finally {
      trlRef.current.disabled = false;
    }
  };

  const cancelMatching = async () => {
    setShowCheckModal(false);
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const { data } = await apiCancelApplyMatch(matchDetail.matchIdx);
      setShowMatchButton(false);
      Utils.openModal({
        title: '완료',
        body: '매칭신청이 취소되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.movePage,
        pageName: navName.matchingDetail,
        data: { matchIdx: matchDetail.matchIdx },
      });
    } catch (error) {
      if (error.code === 3009) {
        setShowMatchButton(false);
        Utils.openModal({
          title: '실패',
          body: '이미 경기가 확정된 매칭은 취소할 수 없습니다.',
        });
      } else {
        handleError(error);
      }
    } finally {
      trlRef.current.disabled = false;
    }
  };

  /**
   * function
   */
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const openCheckModal = () => {
    setShowCheckModal(true);
  };

  const scrollToTop = () => {
    chatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    setShowNewMessageBox(false);
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index === 0) {
      setIsFirstItemVisible(true);
    } else {
      setIsFirstItemVisible(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setPage(1);
    setRefreshing(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      updateAcademyAndMatchAndCheckAdmin();
      ChatUtils.enterChatRoom(roomId);
      return () => {
        setPage(1);
        ChatUtils.outChatRoom();
      };
    }, [roomId]),
  );

  useFocusEffect(
    useCallback(() => {
      getChatList(page, roomId);
    }, [page, refreshing, roomId]),
  );

  useFocusEffect(
    useCallback(() => {
      if (newMessageTimeId) {
        if (!isFirstItemVisible) setShowNewMessageBox(true);
      } else {
        setShowNewMessageBox(false);
      }
    }, [newMessageTimeId, roomId]),
  );

  /**
   * render
   */
  const renderUserImagePath = () => {
    if (targetUserDetail.userProfilePath)
      return targetUserDetail.userProfilePath;
    if (targetAcademyDetail.logoPath) return targetAcademyDetail.logoPath;
    return null;
  };

  return fstCall ? (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        title={
          targetUserDetail.userNickName &&
          targetAcademyDetail.academyName &&
          `${targetUserDetail.userNickName}(${targetAcademyDetail.academyName})`
        }
        rightContent={
          <Pressable onPress={openModal} style={{ padding: 10 }}>
            <Image
              source={SPIcons.icOptionsVertical}
              style={{ height: 28, width: 28 }}
            />
          </Pressable>
        }
      />
      <SPKeyboardAvoidingView
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* 상단 헤더 */}
        <View style={styles.topBox}>
          <Text style={styles.topTitle}>{matchDetail.title}</Text>
          <Text style={styles.topDate}>
            예정 ∙{' '}
            {matchDetail.matchDate &&
              moment(
                `${matchDetail.matchDate} ${matchDetail.matchTime}`,
              ).format('YYYY년 MM월 DD일 dddd A hh:mm')}
          </Text>

          {/* 경기 매칭완료 화면으로 이동 */}
          {showMatchButton && (
            <TouchableOpacity
              style={styles.topBtn}
              onPress={() => {
                openCheckModal();
              }}>
              <Text style={styles.topBtnText}>
                {isHomeAdmin ? '경기진행 확정' : '매칭신청 취소'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          {chatList && chatList.length > 0 ? (
            <View style={{ flex: 1, width: '100%' }}>
              <Chat
                chatListRef={chatListRef}
                data={chatList}
                participantList={participantList}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                isLast={isLast}
                setPage={setPage}
                setIsFirstItemVisible={setIsFirstItemVisible}
                targetImagePath={renderUserImagePath()}
                certYn={targetAcademyDetail.certYn}
              />
            </View>
          ) : loading ? (
            <Loading />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF',
              }}
            />
          )}
          {authState &&
            chatList &&
            chatList.length > 0 &&
            showNewMessageBox &&
            !isFirstItemVisible && (
              <View style={styles.supListbox}>
                <TouchableOpacity style={styles.supBox} onPress={scrollToTop}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 16,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#525252',
                        fontWeight: '500',
                      }}>
                      {chatList[0].sendUserNm}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#000000',
                        fontWeight: '500',
                      }}>
                      {chatList[0].msg}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
        </View>
        <View
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            // gap: 8,
            padding: 16,
            margin: 0,
            position: 'relative',
          }}>
          <View style={styles.inputBox}>
            <TextInput
              value={inputValue}
              onChange={e => {
                setInputValue(e.nativeEvent.text);
              }}
              onContentSizeChange={event => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
              placeholder="메시지 보내기"
              multiline
              numberOfLines={3}
              autoCorrect={false}
              autoComplete="off"
              autoCapitalize="none"
              style={[styles.input, { height: inputHeight }]}
            />
            {inputValue !== '' && (
              <TouchableOpacity style={styles.sendButton} onPress={send}>
                <Image
                  source={SPIcons.icSend}
                  style={{ width: 40, height: 28 }}
                />
              </TouchableOpacity>
            )}
          </View>
          <SPModal
            title="확인"
            contents={
              isHomeAdmin
                ? '경기진행을 확정하시겠습니까?'
                : '매칭신청을 취소하시겠습니까?'
            }
            visible={showCheckModal}
            onConfirm={() => {
              if (isHomeAdmin) {
                confirmMatching();
              } else {
                cancelMatching();
              }
            }}
            onCancel={() => {
              setShowCheckModal(false);
            }}
            onClose={() => {
              setShowCheckModal(false);
            }}
          />
        </View>
      </SPKeyboardAvoidingView>
      <SPMoreModal
        visible={modalVisible}
        onClose={closeModal}
        type={MODAL_MORE_TYPE.CHAT}
        idx={chatRoom?.targetAcademyIdx}
        targetUserIdx={chatRoom?.targetUserIdx}
        memberButtons={[MODAL_MORE_BUTTONS.REPORT]}
      />
    </SafeAreaView>
  ) : (
    <Loading />
  );
}

function Chat({
  chatListRef,
  participantList,
  data,
  onViewableItemsChanged,
  viewabilityConfig,
  isLast = false,
  setPage,
  setIsFirstItemVisible,
  setContentHeight,
  setScrollOffset,
  targetImagePath,
  certYn,
}) {
  const screenHeight = Dimensions.get('window').height;
  const authState = useSelector(state => state.auth);
  const chatState = useSelector(state => state.chat);
  const { roomId } = chatState;

  const checkMyMessage = message => {
    const myMessage =
      `${message.sendUserIdx}` === `${authState.userIdx}` &&
      `${message.sendUserType}` === `${authState.userType}`;
    return myMessage;
  };

  const getNotReadCnt = messageTimeId => {
    const notReadCnt = participantList.filter(v => {
      return Number(v.readTimeId) < Number(messageTimeId);
    }).length;
    return notReadCnt;
  };

  const dateFormat = date => {
    if (!date) return '';
    return moment(date).format('HH:mm');
  };

  const checkShowDate = (list, index) => {
    if (list && list.length > 0) {
      if (list.length > 1) {
        if (index + 1 < list.length) {
          const item = list[index];
          const prevItem = list[index + 1];
          const date = moment(item.regDate).format('YYYY-MM-DD');
          const prevItemDate = moment(prevItem.regDate).format('YYYY-MM-DD');
          return date !== prevItemDate;
        }
        return false;
      }
      if (list.length === 1) {
        const item = list[index];
        return moment(item.regDate).format('YYYY-MM-DD');
      }
    }
    return false;
  };

  const handleContentSizeChange = (width, height) => {
    if (setContentHeight) setContentHeight(height);
  };

  /**
   * render
   */

  return (
    <FlatList
      inverted
      initialNumToRender={10}
      maxToRenderPerBatch={30}
      windowSize={10}
      ref={chatListRef}
      extraData={participantList}
      data={data}
      keyExtractor={item => item?.msgIdx?.toString()}
      style={{
        flex: 1,
        width: '100%',
        backgroundColor: '#FFF',
        paddingBottom: 24,
      }}
      {...(onViewableItemsChanged ? { onViewableItemsChanged } : {})}
      {...(viewabilityConfig ? { viewabilityConfig } : {})}
      onEndReached={() => {
        setTimeout(() => {
          if (!isLast && setPage) setPage(prev => prev + 1);
        }, 0);
      }}
      onEndReachedThreshold={0.5}
      onContentSizeChange={handleContentSizeChange}
      onScroll={event => {
        if (setScrollOffset) setScrollOffset(event.nativeEvent.contentOffset.y);
      }}
      maintainVisibleContentPosition={{
        autoscrollToTopThreshold: 10,
        minIndexForVisible: 0,
      }}
      renderItem={({ item, index }) => {
        return (
          <>
            <View style={styles.chatBox}>
              {item.msgType === MESSAGE_TYPE.CHAT ? (
                checkMyMessage(item) ? (
                  <View
                    onLayout={() => {
                      if (index === 0) {
                        if (setIsFirstItemVisible) setIsFirstItemVisible(true);
                      }
                    }}
                    style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                    }}>
                    <View
                      style={[
                        styles.chatSubBox,
                        { justifyContent: 'flex-end' },
                      ]}>
                      <View style={styles.timeBox}>
                        {getNotReadCnt(item.timeId) > 0 && (
                          <Text style={styles.msgTimeText}>
                            {getNotReadCnt(item.timeId)}
                          </Text>
                        )}
                        <Text style={styles.timeText}>
                          {dateFormat(item.regDate)}
                        </Text>
                      </View>
                      <View
                        style={[styles.msgBox, { backgroundColor: '#FF671F' }]}>
                        <Text style={[styles.msgText, { color: '#FFF' }]}>
                          {item.msg}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View
                    onLayout={() => {
                      if (index === 0) {
                        if (setIsFirstItemVisible) setIsFirstItemVisible(true);
                      }
                    }}
                    style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                    }}>
                    {/* <Text
                      style={{
                        color: '#525252',
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginBottom: 4,
                      }}>
                      {item.sendUserNm}
                    </Text> */}
                    <View style={styles.chatSubBox}>
                      <View style={styles.iconContainer}>
                        {targetImagePath ? (
                          <Image
                            source={{ uri: targetImagePath }}
                            style={styles.mainImage}
                          />
                        ) : (
                          <Image
                            source={SPIcons.icDefaultAcademy}
                            style={styles.mainImage}
                          />
                        )}
                        {certYn === IS_YN.Y && (
                          <Image
                            source={SPIcons.icCheckBadge}
                            style={styles.checkBadge}
                          />
                        )}
                      </View>
                      <View style={styles.msgBox}>
                        <Text style={styles.msgText}>{item.msg}</Text>
                      </View>
                      <View style={styles.timeBox}>
                        <Text style={styles.timeText}>
                          {dateFormat(item.regDate)}
                        </Text>
                      </View>
                      {getNotReadCnt(item.timeId) > 0 && (
                        <Text
                          style={{
                            color: 'yellow',
                            fontSize: 10,
                            marginLeft: 10,
                          }}>
                          {getNotReadCnt(item.timeId)}
                        </Text>
                      )}
                    </View>
                  </View>
                )
              ) : (
                <View style={{ flexDirection: 'column' }}>
                  {(item.msgType === MESSAGE_TYPE.CREATE_ROOM ||
                    item.msgType === MESSAGE_TYPE.GROUP_FST_MSG ||
                    item.msgType === MESSAGE_TYPE.INVITE) && (
                    <View>
                      <Text
                        style={{
                          flexDirection: 'row',
                          textAlign: 'center',
                        }}>
                        {item.msg}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            {checkShowDate(data, index) && (
              <Text
                style={{
                  paddingTop: 100,
                  flexDirection: 'row',
                  textAlign: 'center',
                }}>
                {moment(item.regDate).format('YYYY-MM-DD')}
              </Text>
            )}
          </>
        );
      }}
    />
  );
}

export default memo(MatchingChatRoomScreen);

const styles = StyleSheet.create({
  inputBox: {
    // minHeight: 44,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E1E3E6',
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    paddingTop: 0,
    padding: 0,
    margin: 0,
    height: 40,
  },
  sendButton: {
    // alignItems: 'center',
    // position: 'absolute',
    // justifyContent: 'center',
    // right: 24,
  },
  //   sendButtonText: {
  //     color: '#387FFF',
  //     fontWeight: '600',
  //     fontSize: 16,
  //   },
  micButton: {
    borderWidth: 1,
    borderColor: '#387FFF',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginLeft: 8,
  },
  supListbox: {
    position: 'absolute',
    bottom: 5,
    width: '100%',
  },
  supBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
        marginHorizontal: 5,
        marginTop: 0,
      },
    }),
  },
  topBox: {
    width: '100%',
    flexDirection: 'column',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.22)',
  },
  topTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  topDate: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  topBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  topBtnText: {
    fontSize: 13,
    fontWeight: 500,
    color: '#313779',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  chatBox: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chatSubBox: {
    flexDirection: 'row',
    gap: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  mainImage: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 16,
  },
  checkBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 13.3,
    height: 13.3,
  },
  msgBox: {
    flexShrink: 1,
    backgroundColor: '#FFE1D2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  msgText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: 0.091,
  },
  timeBox: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  timeText: {
    fontSize: 11,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  msgTimeText: {
    fontSize: 11,
    fontWeight: 500,
    color: '#FF671F',
    lineHeight: 14,
    letterSpacing: 0.342,
    textAlign: 'right',
  },
});
