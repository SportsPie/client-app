import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Vibration,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import 'moment/locale/ko';
import chatMapper, { ROOM_TYPE, USER_TYPE } from '../../utils/chat/ChatMapper';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import Loading from '../../components/SPLoading';
import { handleError } from '../../utils/HandleError';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import ChatUtils from '../../utils/chat/ChatUtils';
import SPIcons from '../../assets/icon';
import {
  apiGetChatAcademy,
  apiGetChatMatch,
  apiGetChatUser,
} from '../../api/RestAPI';
import { IS_YN } from '../../common/constants/isYN';
import SPModal from '../../components/SPModal';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import Utils from '../../utils/Utils';
import { store } from '../../redux/store';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MatchingChatRoomListScreen({ route }) {
  /**
   * state
   */
  const authState = useSelector(selector => selector.auth);
  const chatState = useSelector(selector => selector.chat);
  const [fstcall, setFstcall] = useState(false);

  // chat list
  const chatListRef = useRef();
  const { chatRoomList } = chatState;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(true);

  // modal
  const [selectedRoomId, setSelectedRoomId] = useState();
  const [checkModalShow, setCheckModalShow] = useState(false);

  /**
   * access sql lite
   */
  const getChatRoomList = async () => {
    try {
      const params = {
        userIdx: authState.userIdx,
        userType: authState.userType,
        paging: false,
      };
      let data = [];
      data = await chatMapper.selectChatRoomList(params);
      // 아카데미 정보가 없는 경우 아카데미 정보를 가져온다.
      const academyIdxList = data
        .filter(item => !item.academyName)
        .map(item => item.targetAcademyIdx);
      const matchIdxList = data
        .filter(item => !item.homeAcademyIdx)
        .map(item => item.matchIdx);
      const userIdxList = data
        .filter(item => !item.loginType)
        .map(item => item.targetUserIdx);

      if (academyIdxList.length > 0) {
        // 아카데미 정보를 가져온다.
        const academyResponse = await apiGetChatAcademy(academyIdxList);
        const academyList = academyResponse.data.data;
        await chatMapper.insertAcademyList(academyList);
      }
      if (matchIdxList.length > 0) {
        // 매치 정보를 가져온다.
        const matchResponse = await apiGetChatMatch(matchIdxList);
        const matchList = matchResponse.data.data;
        await chatMapper.insertMatchList(matchList);
      }
      if (userIdxList.length > 0) {
        // 유저 정보를 가져온다.
        const userResponse = await apiGetChatUser(userIdxList);
        const userList = userResponse.data.data;
        await chatMapper.insertMemberList(userList);
      }
      if (
        academyIdxList.length > 0 ||
        matchIdxList.length > 0 ||
        userIdxList.length > 0
      ) {
        data = await chatMapper.selectChatRoomList(params);
      }
      dispatch(chatSliceActions.setChatRoomList(data));
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
    setRefreshing(false);
    setFstcall(true);
  };

  const trlRef = useRef({ current: { disabled: false } });
  const removeRoom = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      await ChatUtils.leave(selectedRoomId);
      const isRemoved = await ChatUtils.waitLeave(selectedRoomId);
      if (isRemoved) {
        Utils.openModal({
          title: '완료',
          body: '해당 대화방을 삭제하였습니다.',
        });
        onRefresh();
      } else {
        Utils.openModal({
          title: '실패',
          body: '해당 대화방을 삭제하는데 실패하였습니다. 잠시 후 다시 시도해주시기 바랍니다.',
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  /**
   * help function
   */

  const moveChatPage = async roomId => {
    try {
      NavigationService.navigate(navName.matchingChatRoomScreen, { roomId });
    } catch (error) {
      handleError(error);
    }
  };

  // 날짜 형식 변환
  const dateFormat = date => {
    const now = moment();
    const inputDate = moment(date);

    if (now.isSame(inputDate, 'day')) {
      return inputDate.locale('ko').format('A h:mm');
    }
    if (now.subtract(1, 'days').isSame(inputDate, 'day')) {
      return '어제';
    }
    if (now.isSame(inputDate, 'year')) {
      return inputDate.locale('ko').format('M월 D일');
    }
    return inputDate.format('YYYY.MM.DD');
  };

  const openModal = item => {
    setSelectedRoomId(item.roomId);
    setCheckModalShow(true);
  };

  const onRefresh = useCallback(async () => {
    chatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    dispatch(chatSliceActions.resetChatRoomList());
    setLoading(true);
    setRefreshing(true);
  }, []);

  /**
   * useEffect
   */

  useFocusEffect(
    useCallback(() => {
      ChatUtils.enterChatRoomList();
      return () => {
        ChatUtils.outChatRoomList();
        setRefreshing(true);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (refreshing) {
        setRefreshing(false);
        getChatRoomList();
      }
    }, [refreshing]),
  );

  /**
   * render
   */
  const renderUserImage = item => {
    if (item.userProfilePath) {
      return (
        <Image
          source={{ uri: item.userProfilePath }}
          style={styles.mainImage}
        />
      );
    }
    if (item.logoPath) {
      return <Image source={{ uri: item.logoPath }} style={styles.mainImage} />;
    }
    return <Image source={SPIcons.icDefaultAcademy} style={styles.mainImage} />;
  };

  return fstcall ? (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <Header title="채팅" />

      {chatRoomList && chatRoomList.length > 0 ? (
        <FlatList
          ref={chatListRef}
          data={chatRoomList}
          initialNumToRender={30}
          maxToRenderPerBatch={30}
          windowSize={30}
          style={{
            flex: 1,
            width: '100%',
            paddingBottom: 16,
            margin: 0,
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  moveChatPage(item.roomId); // roomId를 사용하여 이동
                }}
                onLongPress={() => {
                  Vibration.vibrate(70);
                  openModal(item);
                }}
                style={{
                  width: '100%',
                }}>
                <View style={styles.chatListBox}>
                  <View style={styles.chatListDetail}>
                    <View style={styles.imageBox}>
                      {renderUserImage(item)}
                      {item.certYn === IS_YN.Y && (
                        <Image
                          source={SPIcons.icCheckBadge}
                          style={styles.checkImage}
                        />
                      )}
                    </View>
                    <View style={styles.detailBox}>
                      <View style={styles.nameBox}>
                        <Text
                          style={styles.nameText}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {item.userName}
                        </Text>
                        <Text
                          style={styles.academyNameText}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {item.academyName}
                        </Text>
                        <Text style={styles.timeText}>
                          {dateFormat(item.updDate || item.regDate)}
                        </Text>
                      </View>
                      <Text
                        style={styles.titleText}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.title}
                      </Text>
                      <View>
                        <Text
                          style={[styles.chatText]}
                          numberOfLines={2}
                          ellipsizeMode="tail">
                          {item.lastChat || '메시지가 없습니다.'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {item.notReadChatCnt > 0 && <View style={styles.chatCount} />}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : loading ? (
        <Loading />
      ) : (
        <View
          style={{
            flex: 1,
            paddingVertical: 99.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={styles.noneText}>아직 경기 매칭을 한적이 없어요.</Text>
          <Text style={styles.noneText}>매칭을 신청하고 대화해보세요.</Text>
        </View>
      )}
      <SPModal
        title="확인"
        contents="해당 대화방을 삭제하시겠습니까?"
        visible={checkModalShow}
        onConfirm={() => {
          removeRoom();
        }}
        onCancel={() => {
          setCheckModalShow(false);
        }}
        onClose={() => {
          setCheckModalShow(false);
        }}
      />
    </SafeAreaView>
  ) : (
    <Loading />
  );
}

export default memo(MatchingChatRoomListScreen);

const styles = StyleSheet.create({
  chatListBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  chatListDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageBox: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  mainImage: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    overflow: 'hidden',
  },
  checkImage: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  detailBox: {
    flex: 1,
  },
  nameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  academyNameText: {
    fontSize: 11,
    fontWeight: 500,
    color: COLORS.orange,
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  timeText: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  titleText: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
    marginBottom: 8,
  },
  chatText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  chatCount: {
    width: 10,
    height: 10,
    backgroundColor: '#FF671F',
    borderRadius: 5,
  },
  noneChatText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
});
