import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/ko';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { navName } from '../../common/constants/navName';
import SPHeader from '../../components/SPHeader';
import Loading from '../../components/SPLoading';
import NavigationService from '../../navigation/NavigationService';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import { handleError } from '../../utils/HandleError';
import chatMapper from '../../utils/chat/ChatMapper';
import ChatUtils from '../../utils/chat/ChatUtils';

function ChatRoomListScreen({ ...props }) {
  /*
  방 생성(1:1, 단체) :: 이미 해당 방 있음 알림도 확인
  방 진짜 없는지 DB에서 확인하는 것 테스트
   */
  /**
   * state
   */
  const authState = useSelector(selector => selector.auth);
  const chatState = useSelector(selector => selector.chat);

  // chat list
  const chatListRef = useRef();
  // console.log('chatState', chatState);
  const { chatRoomList } = chatState;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageOut, setPageOut] = useState(false);

  /**
   * access sql lite
   */
  const getChatRoomList = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const params = {
        userIdx: authState.userIdx,
        userType: authState.userType,
        // paging: true,
        paging: false,
      };
      const data = await chatMapper.selectChatRoomList(params);
      dispatch(chatSliceActions.setChatRoomList(data));
    } catch (error) {
      handleError(error);
    }
    setRefreshing(false);
    setLoading(false);
  };

  /**
   * help function
   */

  const moveChatPage = async roomId => {
    try {
      NavigationService.navigate(navName.chatRoom, {
        roomId,
      });
    } catch (error) {
      handleError(error);
    }
  };

  // 오늘 이전 날짜는
  const dateFormat = date => {
    // if (!date) return '';
    // const nowDate = moment(new Date()).format('YYYY-MM-DD');
    // const regDate = moment(date).format('YYYY-MM-DD');
    // if (nowDate === regDate) {
    //   return moment(date).format('HH:mm');
    // }
    // return regDate;

    const now = moment();
    const inputDate = moment(date);

    if (now.isSame(inputDate, 'day')) {
      // 오늘일 경우
      return inputDate.locale('ko').format('A h:mm');
    }
    if (now.subtract(1, 'days').isSame(inputDate, 'day')) {
      // 어제일 경우
      return '어제';
    }
    if (now.isSame(inputDate, 'year')) {
      // 이번 년도인 경우
      return inputDate.locale('ko').format('M월 D일');
    }
    // 그 외 (지난 년도)
    return inputDate.format('YYYY.MM.DD');
  };

  const onRefresh = useCallback(async () => {
    chatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    setRefreshing(true);
  }, []);

  /**
   * useEffect
   */

  useFocusEffect(
    useCallback(() => {
      ChatUtils.enterChatRoomList();
      setPageOut(false);
      return () => {
        ChatUtils.outChatRoomList();
        setPageOut(true);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      getChatRoomList();
    }, [refreshing]),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SPHeader title="chatRoomList" leftButtonMoveName={navName.chatTest} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          // backgroundColor: '#FBFBFB',
          paddingTop: 16,
        }}>
        {chatRoomList && chatRoomList.length > 0 ? (
          <FlatList
            ref={chatListRef}
            data={chatRoomList}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            style={{
              flex: 1,
              width: '100%',
              paddingBottom: 16,
              paddingHorizontal: 16,
              margin: 0,
            }}
            // onEndReached={() => {
            //   setTimeout(() => {
            //     if (!isLast) setPage(prev => prev + 1);
            //   }, 0);
            // }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  key={index}
                  onPress={() => {
                    moveChatPage(item.roomId);
                  }}
                  style={{
                    width: '100%', // TouchableOpacity의 너비를 화면에 꽉 차도록 설정
                    // paddingHorizontal: 16, // 좌우 여백 설정
                  }}>
                  <View style={styles.ChatListBox}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.title}>
                        {item.roomNm}
                      </Text>
                      <Text style={styles.time}>
                        {dateFormat(item.updDate || item.regDate)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        marginTop: 8,
                      }}>
                      <Text
                        style={[
                          styles.description,
                          !item.message && { textAlign: 'center' },
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail">
                        {item.lastChat || '메시지가 없습니다.'}
                      </Text>
                      {item.notReadChatCnt > 0 && (
                        <Text
                          style={
                            styles.chatCount
                          }>{`${item.notReadChatCnt}`}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : loading ? (
          <Loading />
        ) : (
          !pageOut && (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text>채팅 내역이 없습니다.</Text>
            </View>
          )
        )}
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          onPress={() => {
            NavigationService.navigate(navName.chatCreateRoom);
          }}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 80,
            height: 80,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'lightgrey',
            borderRadius: 40, // Should be half of width and height
            borderWidth: 1,
            borderColor: 'black',
          }}>
          <Text
            style={{
              marginTop: -5,
              fontSize: 50, // Adjust font size according to your preference
              textAlign: 'center',
              textAlignVertical: 'center',
            }}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default memo(ChatRoomListScreen);

const styles = StyleSheet.create({
  ChatListBox: {
    marginBottom: 16,
    height: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    // minWidth: 328,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
        marginHorizontal: 5,
        marginTop: 0,
      },
    }),
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#525252',
    flexShrink: 1,
  },
  description: {
    fontSize: 12,
    color: '#6F6F6F',
    fontWeight: '500',
    flex: 1,
  },
  time: {
    fontSize: 10,
    fontWeight: '500',
    color: '#A8A8A8',
  },
  chatCount: {
    overflow: 'hidden',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 6,
    paddingRight: 6,
    backgroundColor: '#FA4D56',
    color: '#FFFFFF',
    borderRadius: 8,
    fontSize: 8,
    fontWeight: '500',
  },
});
