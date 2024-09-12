import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { COLORS } from '../../../styles/colors';
import TopEventTabLabel from '../../../components/TopEventTabLabel';
import EventParticipantInfo from './EventParticipantInfo';
import EventParticipantVideoList from './EventParticipantVideoList';
import EventParticipantCommentList from './EventParticipantCommentList';
import {
  apiGetEventOpenApplicantList,
  apiGetEventUserApplicantList,
  apiPatchEventLike,
  apiPatchEventUnLike,
} from '../../../api/RestAPI';
import { handleError } from '../../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import Avatar from '../../../components/Avatar';
import { SPSvgs } from '../../../assets/svg';
import { useAppState } from '../../../utils/AppStateContext';
import Utils from '../../../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../../../common/constants/modalCloseEvent';
import { useSelector } from 'react-redux';
import { eventParticipantCommentListAction } from '../../../redux/reducers/list/eventParticipantCommentListSlice';
import { eventParticipantVideoListAction } from '../../../redux/reducers/list/eventParticipantVideoListSlice';

const Tab = createMaterialTopTabNavigator();

function EventParticipantDetail({ route }) {
  const [selectedTab, setSelectedTab] = useState(
    route.params?.selectedTab || 'info',
  );
  const participantIdx = route.params?.participantIdx;
  const insets = useSafeAreaInsets();

  const { participantInfo, setParticipantInfo } = useAppState();
  const [userInfo, setUserInfo] = useState([]);
  const isLogin = useSelector(selector => selector.auth)?.isLogin;

  const getUserInfo = async () => {
    try {
      const { data } = isLogin
        ? await apiGetEventUserApplicantList(participantIdx)
        : await apiGetEventOpenApplicantList(participantIdx);
      setParticipantInfo(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserInfo();
    }, []),
  );

  useEffect(() => {
    eventParticipantVideoListAction.reset();
    eventParticipantCommentListAction.reset();
  }, []);

  const changeLike = async () => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
      });
      return;
    }
    if (participantInfo.isLike) {
      await apiPatchEventUnLike(participantInfo.participationIdx);

      participantInfo.cntLike -= 1;
    } else {
      await apiPatchEventLike(participantInfo.participationIdx);

      participantInfo.cntLike += 1;
    }

    participantInfo.isLike = !participantInfo.isLike;
    setParticipantInfo(prev => {
      return { ...prev };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1955CE', '#003090']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + StatusBar.currentHeight, // 안전영역에 맞게 패딩 적용
        }}>
        <Header
          title="메가이벤트"
          closeIcon
          leftIconColor={COLORS.white}
          headerContainerStyle={{
            backgroundColor: 'transparent',
            marginBottom: 28,
          }}
          headerTextStyle={{
            color: COLORS.white,
          }}
        />
      </LinearGradient>
      <View
        key={setParticipantInfo.participationIdx}
        style={styles.participantContain}>
        <View style={styles.topBox}>
          <View style={styles.topInfoContainer}>
            <View style={styles.avatar}>
              <Avatar imageSize={90} disableEditMode imageURL="" />
            </View>
            <View style={styles.topInfoBox}>
              <View style={styles.topInfo}>
                <View style={styles.topEvnetInfoBox}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventInfoText}>
                      {participantInfo.targetName}
                    </Text>
                  </View>
                  <Text style={styles.nameText}>
                    {participantInfo.participationName}
                  </Text>
                </View>
                <Text style={styles.eventTypeText}>
                  {participantInfo.position}
                </Text>

                <View
                  style={{
                    backgroundColor: 'rgba(255, 124, 16, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    alignSelf: 'flex-start',
                  }}>
                  <Text
                    style={[
                      fontStyles.fontSize12_Semibold,
                      { color: '#FF7C10' },
                    ]}>
                    {participantInfo.acdmyName}
                  </Text>
                </View>
              </View>

              {/* 좋아요 */}
              <Pressable
                hitSlop={{
                  top: 10,
                  bottom: 10,
                }}
                style={styles.wrapper}
                onPress={() => {
                  changeLike();
                }}>
                <View style={styles.heartContainer}>
                  {participantInfo?.isLike ? (
                    <SPSvgs.Heart />
                  ) : (
                    <SPSvgs.HeartOutline />
                  )}
                  <Text style={styles.text}>
                    {' '}
                    {Utils.changeNumberComma(participantInfo?.cntLike)}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Tab */}
        <Tab.Navigator
          screenOptions={{
            lazy: true,
          }}
          sceneContainerStyle={{ backgroundColor: COLORS.white }}
          tabBar={props => <TopEventTabLabel {...props} />}>
          <Tab.Screen
            name={navName.eventParticipantInfo}
            component={EventParticipantInfo}
          />
          <Tab.Screen
            name={navName.eventVideoList}
            component={EventParticipantVideoList}
          />
          <Tab.Screen
            name={navName.eventComment}
            component={EventParticipantCommentList}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
  },
  topInfoBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    alignSelf: 'center',
  },
  topEvnetInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eventInfo: {
    borderWidth: 1,
    borderColor: 'rgba(0, 38, 114, 0.43)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventInfoText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#121212',
    lineHeight: 20,
    letterSpacing: 0.203,
    marginBottom: 12,
  },
  heartContainer: {
    width: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderColor: COLORS.lineBorder,
  },
  text: {
    ...fontStyles.fontSize12_Semibold,
    color: COLORS.labelNeutral,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tabButton: {
    padding: 10,
  },
  tabText: {
    color: '#555',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  participantContain: {
    flex: 1,
    position: 'relative',
    top: -28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFF',
    marginBottom: -28,
    overflow: 'hidden',
  },
  infoContain: {
    flex: 1,
    marginLeft: 16,
    width: '100%',
  },
  infoContainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  nameInfo: {
    ...fontStyles.fontSize16_Medium,
  },
  targetInfo: {
    borderWidth: 1,
    borderColor: 'gray',
    width: 44,
    height: 24,
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginRight: 4,
    color: '#002672',
  },
  acdmyInfo: {
    marginTop: 10,
    width: 80,
    height: 24,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 124, 16, 0.15)',
  },
});

export default EventParticipantDetail;
