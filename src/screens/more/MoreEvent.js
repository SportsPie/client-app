import React, { useEffect, useRef } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Header from '../../components/header';
import { COLORS } from '../../styles/colors';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '../../components/Avatar';
import fontStyles from '../../styles/fontStyles';
import { useAppState } from '../../utils/AppStateContext';
import { navName } from '../../common/constants/navName';
import TopEventTabLabel from '../../components/TopEventTabLabel';
import MoreEventParticipantInfo from './MoreEventParticipantInfo';
import MoreEventParticipantSoccerbee from './MoreEventParticipantSoccerbee';
import MoreEventParticipantVideoList from './MoreEventParticipantVideoList';
import MoreEventParticipantComment from './MoreEventParticipantComment';
import { POSITION_DETAIL_TYPE } from '../../common/constants/positionDetailType';
import { DEPOSIT_STATE } from '../../common/constants/DepositState';
import { SPSvgs } from '../../assets/svg';
import Utils from '../../utils/Utils';
import { handleError } from '../../utils/HandleError';
import { apiPatchEventLike, apiPatchEventUnLike } from '../../api/RestAPI';
import { moreEventVideoListAction } from '../../redux/reducers/list/moreEventVideoListSlice';
import { eventParticipantCommentListAction } from '../../redux/reducers/list/eventParticipantCommentListSlice';

const Tab = createMaterialTopTabNavigator();

function MoreEvent() {
  const trlRef = useRef({ current: { disabled: false } });
  const { participantInfo, setParticipantInfo } = useAppState();
  const insets = useSafeAreaInsets();

  const changeLike = async () => {
    if (!participantInfo?.participationIdx) return;
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      if (participantInfo?.isLike) {
        await apiPatchEventLike(participantInfo.participationIdx);
        setParticipantInfo({
          ...participantInfo,
          isLike: false,
          cntLike: participantInfo.cntLike - 1,
        });
      } else {
        await apiPatchEventUnLike(participantInfo.participationIdx);
        setParticipantInfo({
          ...participantInfo,
          isLike: true,
          // eslint-disable-next-line no-unsafe-optional-chaining
          cntLike: participantInfo?.cntLike + 1,
        });
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  useEffect(() => {
    moreEventVideoListAction.reset();
    eventParticipantCommentListAction.reset();
  }, []);

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
          title={participantInfo?.eventName}
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

      <View style={styles.tabDetailBox}>
        <View style={styles.topBox}>
          {participantInfo?.participationIdx && (
            <View>
              {participantInfo?.depositState ===
                DEPOSIT_STATE.DEPOSIT_WAIT.code && (
                <Text style={styles.topMsg}>
                  {'오늘 23:59까지\n입금되지 않으면 접수가 취소됩니다.'}
                </Text>
              )}
              <View style={styles.topInfoContainer}>
                <View style={styles.avatar}>
                  <Avatar
                    imageSize={90}
                    imageURL={participantInfo?.profilePath ?? ''}
                    disableEditMode
                  />
                </View>
                <View style={styles.topInfoBox}>
                  <View style={styles.topInfo}>
                    <View style={styles.topEvnetInfoBox}>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventInfoText}>
                          {participantInfo?.targetName}
                        </Text>
                      </View>
                      <Text style={styles.nameText} textAlign="center">
                        {participantInfo?.participationName}
                      </Text>
                    </View>
                    <Text style={styles.eventTypeText}>
                      {participantInfo?.position
                        ? POSITION_DETAIL_TYPE[participantInfo?.position].enDesc
                        : '-'}
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
                        {participantInfo?.acdmyName}
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
                        {Utils.changeNumberComma(participantInfo?.cntLike)}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>

        <Tab.Navigator
          screenOptions={{
            lazy: true,
          }}
          sceneContainerStyle={{ backgroundColor: COLORS.white }}
          tabBar={props => <TopEventTabLabel {...props} />}>
          <Tab.Screen
            name={navName.eventMyInfo}
            component={MoreEventParticipantInfo}
          />
          {/* 사커비 임시 주석 */}
          {/* <Tab.Screen
            name={navName.eventSoccerBee}
            component={MoreEventParticipantSoccerbee}
          /> */}
          <Tab.Screen
            name={navName.eventVideoList}
            component={MoreEventParticipantVideoList}
          />
          <Tab.Screen
            name={navName.eventComment}
            component={MoreEventParticipantComment}
          />
        </Tab.Navigator>
      </View>

      {/* 기존 코드 주석처리 */}
      {/* <Header title="메가 이벤트" closeIcon /> */}

      {/* <View style={{ flex: 1 }}>
        <PrimaryButton
          onPress={() => {
            NavigationService.navigate(navName.eventParticipantVideoReels);
          }}
          buttonStyle={styles.button}
          text="영상 목록의 영상 클릭시"
        />
        <Text>tab1</Text>
        <MoreEventParticipantInfo />
        <Text>tab2</Text>
        <MoreEventParticipantVideoList />
        <Text>tab3</Text>
        <MoreEventParticipantSoccerbee />
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabDetailBox: {
    flex: 1,
    position: 'relative',
    top: -28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFF',
    marginBottom: -28,
    overflow: 'hidden',
  },
  topBox: {
    paddingTop: 24,
    minHeight: 150,
  },
  topMsg: {
    fontSize: 14,
    fontWeight: 500,
    color: '#FF4242',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
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
  tabButtonBox: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabButton: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(167, 172, 179, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF854C',
  },
  activeTabText: {
    color: '#FF854C',
  },
  inactiveTab: {
    borderBottomWidth: 0,
  },
  emptyBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
    textAlign: 'center',
  },
  basicInfoWrapper: {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  basicInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    backgroundColor: '#F1F5FF',
    padding: 16,
  },
  basicInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  basicMainText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#002672',
    lineHeight: 32,
    letterSpacing: -0.552,
  },
  basicNormalText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  contentsDatailText: {
    fontSize: 13,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  basicInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  basicSoccerBee: {
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
  },
  tabItem: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tabTitle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBox: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  outLineBtn: {
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    borderRadius: 10,
    padding: 12,
  },
  outLineBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
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
});

export default MoreEvent;
