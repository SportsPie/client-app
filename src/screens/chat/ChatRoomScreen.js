import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from '@stream-io/flat-list-mvcp';
import moment from 'moment';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { apiGetChatMessage } from '../../api/RestAPI';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { navName } from '../../common/constants/navName';
import SPHeader from '../../components/SPHeader';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import Loading from '../../components/SPLoading';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import { handleError } from '../../utils/HandleError';
import ChatMapper, {
  MESSAGE_TYPE,
  ROOM_TYPE,
  USER_TYPE,
} from '../../utils/chat/ChatMapper';
import ChatUtils from '../../utils/chat/ChatUtils';

function ChatRoomScreen({ navigation, route }) {
  /*
  나가기
  초대
  메시지 보내기 테스트
  DB에서 메시지 가져오는 것 확인
   */
  const chatListRef = useRef();
  /**
   * state
   */
  /* chat */
  const { roomId } = route.params;
  const chatState = useSelector(state => state.chat);
  const authState = useSelector(state => state.auth);
  const { chatList, newMessageTimeId, participantList, notiYn } = chatState;
  const dispatch = useDispatch();

  const [timeId, setTimeId] = useState(new Date().getTime()); // 방 접근 시간
  const [chatRoom, setChatRoom] = useState({});

  const [inputValue, setInputValue] = useState('');

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFirstItemVisible, setIsFirstItemVisible] = useState(false);
  const [showNewMessageBox, setShowNewMessageBox] = useState(false);

  const [canInviteList, setCanInviteList] = useState([]);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedInviteList, setSelectedInviteList] = useState([]);
  const [roomNm, setRoomNm] = useState();

  /**
   * api
   */
  // 메시지 보내기
  const trlRef = useRef({ current: { disabled: false } });
  const send = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      await ChatUtils.sendMessage(roomId, inputValue);
      setInputValue('');
      // console.log('data',data);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * getList
   */
  const getChatList = async pageNum => {
    try {
      if (loading) return;
      setLoading(true);
      const params = {
        roomId,
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

  /**
   * chat help function
   */

  const scrollToTop = () => {
    chatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    setShowNewMessageBox(false);
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // 예를 들어, 50% 이상 보여야 '보이는' 것으로 간주
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index === 0) {
      setIsFirstItemVisible(true);
    } else {
      setIsFirstItemVisible(false);
    }
  }, []);

  const onFocus = useCallback(async () => {
    try {
      console.log('is room page');
      // 현재 들어온 채팅룸의 정보 기억
      const roomData = await ChatMapper.selectChatRoomById(roomId);
      const me =
        await ChatMapper.selectParticipantByRoomIdAndUserTypeAndUserIdx({
          roomId,
          userType: authState.userType,
          userIdx: authState.userIdx,
        });
      setChatRoom(roomData);
      setRoomNm(me.roomNm);
      // TODO :: 프로필 이미지등 추가 정보가 필요할 경우 userIdx모아서 서버로 보내서 상세 정보 받아올 것

      // TODO :: 유저명 백엔드에서 받아와서 유저명 바뀐 부분 UPDATE 해줄 것
    } catch (error) {
      handleError(error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setPage(1);
    setRefreshing(true);
  }, []);

  const invite = async event => {
    Alert.alert(
      '초대하기',
      '해당 인원을 초대하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => console.log('취소됨'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              if (trlRef.current.disabled) return;
              trlRef.current.disabled = true;
              await ChatUtils.invite(roomId, selectedInviteList);
              setShowInviteModal(false);
              setSelectedInviteList([]);
            } catch (error) {
              handleError(error);
            }
            trlRef.current.disabled = false;
          },
        },
      ],
      { cancelable: false },
    );
  };

  const leave = async idx => {
    // 삭제
    try {
      Alert.alert(
        '채팅방 나가기',
        '해당 채팅방에서 나가시겠습니까?',
        [
          {
            text: '취소',
            onPress: () => console.log('취소됨'),
            style: 'cancel',
          },
          {
            text: '확인',
            onPress: async () => {
              await ChatUtils.leave(roomId);
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      handleError(error);
    }
  };

  const changeNotiYn = async () => {
    try {
      await ChatUtils.updateNotiYn(roomId, notiYn === 'Y' ? 'N' : 'Y');
    } catch (error) {
      handleError(error);
    }
  };

  const changeRoomNm = async () => {
    Alert.alert(
      '방 이름 변경',
      '채팅방 이름을 변경하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => console.log('취소됨'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              if (trlRef.current.disabled) return;
              trlRef.current.disabled = true;
              await ChatUtils.updateRoomNm(roomId, roomNm);
              setShowOptionModal(false);
              setRoomNm('');
            } catch (error) {
              handleError(error);
            }
            trlRef.current.disabled = false;
          },
        },
      ],
      { cancelable: false },
    );
  };

  /**
   * useFocusEffect
   */

  useFocusEffect(
    useCallback(() => {
      // TODO :: 친구 목록을 DB에서 가져오도록 수정 필요
      const userList = [];
      for (let i = 1; i < 100; i += 1) {
        userList.push({
          userType: USER_TYPE.MEMBER,
          userIdx: i,
          userNm: `testUser${i}`,
        });
      }
      let userListExceptMeAndParticipant = userList.filter(
        v =>
          !(
            v.userIdx === authState.userIdx && v.userType === authState.userType
          ),
      );
      for (let i = 0; i < participantList.length; i += 1) {
        const participant = participantList[i];
        userListExceptMeAndParticipant = userListExceptMeAndParticipant.filter(
          v =>
            !(
              v.userIdx === participant.userIdx &&
              v.userType === participant.userType
            ),
        );
      }
      setCanInviteList(userListExceptMeAndParticipant);
    }, [participantList]),
  );

  useFocusEffect(
    useCallback(() => {
      // 포커스를 받을 때 실행할 작업
      onFocus();
      ChatUtils.enterChatRoom(roomId);
      return () => {
        // 화면이 포커스를 잃을 때 실행할 작업
        setPage(1);
        ChatUtils.outChatRoom();
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      getChatList(page);
    }, [page, refreshing]),
  );

  useFocusEffect(
    useCallback(() => {
      if (newMessageTimeId) {
        if (!isFirstItemVisible) setShowNewMessageBox(true);
      } else {
        setShowNewMessageBox(false);
      }
    }, [newMessageTimeId]),
  );

  return (
    <SPKeyboardAvoidingView
      behavior="padding"
      isResize
      keyboardVerticalOffset={60}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: '#FBFBFB',
        backgroundColor: 'lightblue',
      }}>
      <View
        style={{
          backgroundColor: 'white',
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 50,
          paddingHorizontal: 20,
        }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Text style={{ flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
            방 이름 : {roomNm}
          </Text>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={{
              width: 50,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'black',
              borderStyle: 'solid',
            }}
            onPress={() => {
              setShowOptionModal(true);
            }}>
            <Text>옵션</Text>
          </TouchableOpacity>
        </View>
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
            />
          </View>
        ) : loading ? (
          <Loading />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: 'lightblue',
            }}
          />
        )}
        {authState &&
          chatList &&
          chatList.length > 0 &&
          showNewMessageBox &&
          !isFirstItemVisible && (
            <View style={styles.supListbox}>
              <TouchableOpacity
                style={styles.supBox}
                onPress={scrollToTop}
                activeOpacity={ACTIVE_OPACITY}>
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
                {/* <Image source={require('../../assets/icon/down_icon.png')} /> */}
              </TouchableOpacity>
            </View>
          )}
      </View>
      <View
        style={{
          minHeight: 70,
          maxHeight: 150,
          width: `100%`,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          margin: 0,
          flexDirection: 'row',
          position: 'relative',
        }}>
        <TextInput
          value={inputValue}
          onChange={e => {
            setInputValue(e.nativeEvent.text);
          }}
          placeholder="메시지를 입력하세요."
          multiline
          scrollEnabled={false}
          numberOfLines={3}
          autoCorrect={false}
          autoComplete="off"
          autoCapitalize="none"
          style={styles.input}
        />
        {inputValue !== '' && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={send}
            activeOpacity={ACTIVE_OPACITY}>
            <Text style={styles.sendButtonText}>보내기</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal
        transparent
        animationType="slide"
        visible={showOptionModal}
        onRequestClose={() => setShowOptionModal(false)}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: '80%',
              height: '50%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
            }}>
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => {
                setShowOptionModal(false);
              }}
              style={{
                marginLeft: 'auto',
                marginRight: 10,
                height: 20,
                width: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'black',
                backgroundColor: 'blue',
              }}>
              <Text style={{ color: 'white' }}>X</Text>
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Text>방 이름 : </Text>
                <TextInput
                  style={{
                    flex: 1,
                    padding: 0,
                    margin: 10,
                    height: 20,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: 'black',
                    color: 'black',
                  }}
                  value={roomNm}
                  onChangeText={text => {
                    setRoomNm(text);
                  }}
                  placeholder="방 이름 입력"
                />
              </View>
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'black',
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderColor: 'black',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text>참가자</Text>
                </View>
                <FlatList
                  style={{
                    width: '100%',
                  }}
                  data={participantList}
                  renderItem={({ item }) => {
                    return (
                      <View
                        style={{
                          paddingHorizontal: 10,
                        }}>
                        <Text>{item.userNm}</Text>
                      </View>
                    );
                  }}
                />
              </View>
            </View>
            <View
              style={{
                width: '100%',
                marginTop: 'auto',
                flexDirection: 'row',
                gap: 10,
                marginBottom: 10,
              }}>
              {chatRoom?.roomType !== ROOM_TYPE.DIRECT && (
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  onPress={e => {
                    setShowOptionModal(false);
                    setShowInviteModal(true);
                  }}
                  style={{
                    backgroundColor: 'blue',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 30,
                  }}>
                  <Text style={{ color: 'white' }}>초대하기</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => {
                  leave();
                }}
                style={{
                  backgroundColor: 'blue',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                }}>
                <Text style={{ color: 'white' }}>나가기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => {
                  changeNotiYn();
                }}
                style={{
                  backgroundColor: 'blue',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                }}>
                <Text style={{ color: 'white' }}>
                  {notiYn === 'Y' ? '알림 받지 않기' : '알림 받기'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => {
                  changeRoomNm();
                }}
                disabled={!roomNm}
                style={{
                  backgroundColor: roomNm ? 'blue' : 'gray',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                }}>
                <Text style={{ color: 'white' }}>방이름 변경</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        animationType="slide"
        visible={showInviteModal}
        onRequestClose={() => setShowInviteModal(false)}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: '80%',
              height: '50%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
            }}>
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => {
                setShowInviteModal(false);
              }}
              style={{
                marginLeft: 'auto',
                marginRight: 10,
                height: 20,
                width: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'black',
                backgroundColor: 'blue',
              }}>
              <Text style={{ color: 'white' }}>X</Text>
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <FlatList
                style={{
                  flex: 1,
                }}
                data={canInviteList}
                renderItem={({ item }) => {
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}>
                      <CheckBox
                        onFillColor="blue"
                        tintColors={{ true: 'blue', false: 'black' }}
                        value={
                          !!selectedInviteList.find(
                            v =>
                              v.userIdx === item.userIdx &&
                              v.userType === item.userType,
                          )
                        }
                        onValueChange={checked => {
                          if (checked) {
                            setSelectedInviteList(prev => [...prev, item]);
                          } else {
                            setSelectedInviteList(prev =>
                              prev.filter(
                                participant =>
                                  !(
                                    participant.userIdx === item.userIdx &&
                                    participant.userType === item.userType
                                  ),
                              ),
                            );
                          }
                        }}
                      />
                      <TouchableOpacity
                        style={{ flexDirection: 'row' }}
                        activeOpacity={1}
                        onPress={() => {
                          setSelectedInviteList(prev => [...prev, item]);
                        }}>
                        <Text>userIdx : {item.userIdx}</Text>
                        <Text>:: name : {item.userNm}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            </View>
            <View
              style={{
                width: '100%',
                marginTop: 'auto',
                flexDirection: 'row',
                gap: 10,
                marginBottom: 10,
              }}>
              {chatRoom?.roomType !== ROOM_TYPE.DIRECT && (
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  onPress={e => {
                    invite(e);
                  }}
                  disabled={selectedInviteList.length === 0}
                  style={{
                    backgroundColor:
                      selectedInviteList.length === 0 ? 'gray' : 'blue',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 30,
                  }}>
                  <Text style={{ color: 'white' }}>초대하기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SPKeyboardAvoidingView>
  );
}

/**
 * Chat component
 */
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
}) {
  const trlRef = useRef({ current: { disabled: false } });
  const screenHeight = Dimensions.get('window').height;
  const authState = useSelector(state => state.auth);
  const chatState = useSelector(state => state.chat);
  const { roomId } = chatState;

  // 내 메시지 인지 확인
  const checkMyMessage = message => {
    const myMessage =
      `${message.sendUserIdx}` === `${authState.userIdx}` &&
      `${message.sendUserType}` === `${authState.userType}`;
    return myMessage;
  };

  // 상대방 안 읽은 수 확인
  const getNotReadCnt = messageTimeId => {
    // 자신을 제외한 참가자 중에 읽은 시간이 현재 메시지 시간보다 작은 것들의 수
    const notReadCnt = participantList.filter(v => {
      return Number(v.readTimeId) < Number(messageTimeId);
    }).length;
    return notReadCnt;
  };

  const dateFormat = date => {
    if (!date) return '';
    return moment(date).format('HH:mm');
  };

  // 날짜 변경점 표시 여부 확인
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
        // return true;
      }
    }
    return false;
  };

  const handleContentSizeChange = (width, height) => {
    if (setContentHeight) setContentHeight(height);
  };

  const reInvite = async message => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      // 이미 참가되어 있는 사람인지 확인
      const participant =
        await ChatMapper.selectParticipantByRoomIdAndUserTypeAndUserIdx({
          roomId,
          userType: message.sendUserType,
          userIdx: message.sendUserIdx,
        });
      if (participant) {
        trlRef.current.disabled = false;
        return;
      }
      await ChatUtils.invite(roomId, [
        {
          userType: message.sendUserType,
          userIdx: message.sendUserIdx,
          userNm: message.sendUserNm,
        },
      ]);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SPHeader title="chatRoom" leftButtonMoveName={navName.chatRoomList} />

      <FlatList
        inverted
        initialNumToRender={10}
        maxToRenderPerBatch={30}
        windowSize={10}
        ref={chatListRef}
        extraData={participantList}
        data={data}
        style={{
          flex: 1,
          width: '100%',
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
          if (setScrollOffset)
            setScrollOffset(event.nativeEvent.contentOffset.y);
        }}
        maintainVisibleContentPosition={{
          autoscrollToTopThreshold: 10,
          minIndexForVisible: 0,
        }}
        renderItem={({ item, index }) => {
          return (
            <>
              <View style={{ width: '100%', padding: 16 }}>
                {item.msgType === MESSAGE_TYPE.CHAT ? (
                  checkMyMessage(item) ? (
                    <View
                      onLayout={() => {
                        if (index === 0) {
                          if (setIsFirstItemVisible)
                            setIsFirstItemVisible(true);
                        }
                      }}
                      style={{
                        marginTop: 10,
                        flex: 1,
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                      }}>
                      <View
                        style={{
                          minHeight: 30,
                          flexDirection: 'row',
                          maxWidth: 250,
                          alignItems: 'flex-end',
                          justifyContent: 'flex-end',
                        }}>
                        {getNotReadCnt(item.timeId) > 0 && (
                          <Text
                            style={{
                              color: 'yellow',
                              fontSize: 10,
                              marginRight: 10,
                            }}>
                            {getNotReadCnt(item.timeId)}
                          </Text>
                        )}
                        <Text
                          style={{
                            color: '#A8A8A8',
                            fontSize: 8,
                            fontWeight: '400',
                            alignSelf: 'flex-end',
                            paddingBottom: 4,
                          }}>
                          {dateFormat(item.regDate)}
                        </Text>
                        <Text
                          style={{
                            overflow: 'hidden',
                            backgroundColor: '#E7EFFF',
                            borderWidth: 1,
                            borderRadius: 14,
                            borderColor: '#E7EFFF',
                            padding: 8,
                            fontWeight: '500',
                            color: '#000000',
                            fontSize: 14,
                          }}>
                          {item.msg}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View
                      onLayout={() => {
                        if (index === 0) {
                          if (setIsFirstItemVisible)
                            setIsFirstItemVisible(true);
                        }
                      }}
                      style={{
                        marginTop: 10,
                        flex: 1,
                        justifyContent: 'flex-end',
                      }}>
                      <Text
                        style={{
                          color: '#525252',
                          fontWeight: 'bold',
                          fontSize: 14,
                          marginBottom: 4,
                        }}>
                        {item.sendUserNm}
                      </Text>
                      <View
                        style={{
                          minHeight: 30,
                          flexDirection: 'row',
                          maxWidth: 250,
                          alignItems: 'flex-end',
                        }}>
                        <Text
                          style={{
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderRadius: 14,
                            borderColor: '#E7EFFF',
                            padding: 8,
                            fontWeight: '500',
                            color: '#000000',
                            fontSize: 14,
                          }}>
                          {item.msg}
                        </Text>
                        <Text
                          style={{
                            color: '#A8A8A8',
                            fontSize: 8,
                            fontWeight: '400',
                            alignSelf: 'flex-end',
                            paddingBottom: 4,
                            paddingLeft: 4,
                          }}>
                          {dateFormat(item.regDate)}
                        </Text>
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
                    {item.msgType === MESSAGE_TYPE.LEAVE && (
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            flexDirection: 'row',
                            textAlign: 'center',
                          }}>
                          {item.msg}
                        </Text>
                        <TouchableOpacity
                          activeOpacity={ACTIVE_OPACITY}
                          onPress={() => {
                            reInvite(item);
                          }}>
                          <Text style={{ textDecorationLine: 'underline' }}>
                            다시 초대하기
                          </Text>
                        </TouchableOpacity>
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
    </SafeAreaView>
  );
}

export default memo(ChatRoomScreen);

const styles = StyleSheet.create({
  input: {
    flex: 1,
    minHeight: 70,
    maxHeight: 150,
    paddingTop: 10,
    paddingLeft: 16,
    paddingRight: 70,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 32,
  },
  sendButton: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    right: 32,
  },
  sendButtonText: {
    color: '#387FFF',
    fontWeight: '600',
    fontSize: 16,
  },
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
});
