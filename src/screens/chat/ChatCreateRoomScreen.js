import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import ChatUtils from '../../utils/chat/ChatUtils';
import { handleError } from '../../utils/HandleError';
import ChatMapper, { ROOM_TYPE, USER_TYPE } from '../../utils/chat/ChatMapper';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { CustomException } from '../../common/exceptions';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatCreateRoomScreen({ navigation }) {
  /**
   * state
   */
  const authState = useSelector(selector => selector.auth);
  const chatState = useSelector(selector => selector.chat);

  // create room
  const [participantList, setParticipantList] = useState([]);
  const [showExistsRoomModal, setShowCreateRoomModal] = useState(false);
  const [existsRoomId, setExistsRoomId] = useState(null);
  const [existsRoomType, setExistsRoomType] = useState(null);
  const [selectedParticipantList, setSelectedParticipantList] = useState([]);
  const [showRoomNmInput, setShowRoomNmInput] = useState(false);
  const [roomNm, setRoomNm] = useState('');

  const trlRef = useRef({ current: { disabled: false } });
  const createRoom = async forceCreate => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const participants = [
        {
          userIdx: authState.userIdx,
          userType: authState.userType,
          userNm: authState.userName,
        },
        ...selectedParticipantList,
      ];
      const result = await ChatUtils.createRoom(
        participants,
        roomNm || getRoomNm(),
        forceCreate,
      );

      if (result) {
        if (result?.created) {
          setShowCreateRoomModal(false);
          let tryCount = 5;
          let createSuccess = false;
          while (tryCount > 0) {
            tryCount -= 1;
            // eslint-disable-next-line no-await-in-loop
            const room = await ChatMapper.selectChatRoomById(
              result.room.roomId,
            );
            if (room) {
              createSuccess = true;
              break;
            }
            // eslint-disable-next-line no-await-in-loop
            await new Promise(resolve => {
              setTimeout(resolve, 300);
            });
          }
          if (createSuccess) {
            NavigationService.replace(navName.chatRoom, {
              roomId: result.room?.roomId,
            });
          } else {
            throw new CustomException('채팅방 생성에 실패했습니다.');
          }
        } else {
          setShowCreateRoomModal(true);
          setExistsRoomId(result?.room?.roomId);
          setExistsRoomType(result?.room?.roomType);
        }
      }
    } catch (error) {
      handleError(error);
    }
    if (forceCreate) {
      setExistsRoomId(null);
      setExistsRoomType(null);
    }
    trlRef.current.disabled = false;
  };

  const getRoomNm = () => {
    console.log('authState', authState);
    if (participantList) {
      if (selectedParticipantList.length > 1) {
        const roomName = `${selectedParticipantList
          .map(({ userNm }) => userNm)
          .join(', ')}`;
        return `${authState.userName},${roomName}`;
      }
      return `${selectedParticipantList[0].userNm}`;
    }
    return '';
  };

  useEffect(() => {
    if (selectedParticipantList && selectedParticipantList.length > 1) {
      setShowRoomNmInput(true);
    } else {
      setShowRoomNmInput(false);
      setRoomNm('');
    }
  }, [selectedParticipantList]);

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
      const userListExceptMe = userList.filter(
        v =>
          !(
            v.userIdx === authState.userIdx && v.userType === authState.userType
          ),
      );
      setParticipantList(userListExceptMe);
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}>
          {showRoomNmInput && (
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
                placeholder={getRoomNm()}
              />
            </View>
          )}
          <FlatList
            style={{
              width: '100%',
            }}
            data={participantList}
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
                      !!selectedParticipantList.find(
                        v =>
                          v.userIdx === item.userIdx &&
                          v.userType === item.userType,
                      )
                    }
                    onValueChange={checked => {
                      if (checked) {
                        setSelectedParticipantList(prev => [...prev, item]);
                      } else {
                        setSelectedParticipantList(prev =>
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
                      setSelectedParticipantList(prev => [...prev, item]);
                    }}>
                    <Text>userIdx : {item.userIdx}</Text>
                    <Text>:: name : {item.userNm}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <TouchableOpacity
            onPress={() => {
              createRoom();
            }}
            disabled={selectedParticipantList.length === 0}
            style={{
              marginLeft: 'auto',
              marginTop: 'auto',
              marginBottom: 10,
              marginRight: 10,
              borderWidth: 1,
              borderColor: 'black',
              height: 30,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor:
                selectedParticipantList.length === 0 ? 'gray' : 'blue',
            }}>
            <Text style={{ color: 'white' }}>방 만들기</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        transparent
        animationType="slide"
        visible={showExistsRoomModal}
        onRequestClose={() => setShowCreateRoomModal(false)}>
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
              onPress={() => {
                setShowCreateRoomModal(false);
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
              <Text>채팅 방이 이미 있습니다.</Text>
            </View>
            <View
              style={{
                width: '100%',
                marginTop: 'auto',
                flexDirection: 'row',
                gap: 10,
                marginBottom: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  NavigationService.replace(navName.chatRoom, {
                    roomId: existsRoomId,
                  });
                }}
                style={{
                  backgroundColor: 'blue',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 30,
                }}>
                <Text style={{ color: 'white' }}>채팅방으로 이동하기</Text>
              </TouchableOpacity>
              {existsRoomType !== ROOM_TYPE.DIRECT && (
                <TouchableOpacity
                  onPress={() => {
                    createRoom(true);
                  }}
                  style={{
                    backgroundColor: 'blue',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 30,
                  }}>
                  <Text style={{ color: 'white' }}>채팅방 만들기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
