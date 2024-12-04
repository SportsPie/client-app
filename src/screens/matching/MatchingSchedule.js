import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LocaleConfig } from 'react-native-calendars/src/index';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { apiCityList, apiGetMyInfo } from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { navName } from '../../common/constants/navName';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import { COLORS } from '../../styles/colors';
import GeoLocationUtils from '../../utils/GeoLocationUtils';
import { handleError } from '../../utils/HandleError';
import chatMapper, { USER_TYPE } from '../../utils/chat/ChatMapper';
import SPLoading from '../../components/SPLoading';
import { matchingScheduleListAction } from '../../redux/reducers/list/matchingScheduleListSlice';
import MatchingComponent from './MatchingComponent';
import Tournament from '../tournament/Tournament';
import Playground from './playground/Playground';
import TournamentInfo from '../tournament/TournamentInfo';

LocaleConfig.locales.fr = {
  monthNames: [
    '01월',
    '02월',
    '03월',
    '04월',
    '05월',
    '06월',
    '07월',
    '08월',
    '09월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '01월',
    '02월',
    '03월',
    '04월',
    '05월',
    '06월',
    '07월',
    '08월',
    '09월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'fr';
function MatchingSchedule({ route }) {
  const insets = useSafeAreaInsets();
  const paramReset = route.params?.paramReset;
  const authState = useSelector(selector => selector.auth);
  const chatState = useSelector(selector => selector.chat);
  const notReadChatIsExists = chatState?.notReadChatIsExists;
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const [activeTab, setActiveTab] = useState('매칭'); // 매칭 , 대회 , 구장
  const dispatch = useDispatch();
  const [isGetAddr, setIsGetAddr] = useState(false);
  const [lat, setLat] = useState();
  const [lng, setlng] = useState();
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityList, setCityList] = useState([{ id: 0, label: '전체' }]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [init, setInit] = useState(false);

  const getMyInfo = async () => {
    if (!isLogin) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data } = await apiGetMyInfo();
      if (data.data.academyAdmin || data.data.academyCreator) {
        setIsAdmin(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getUserAddr = async () => {
    if (isGetAddr) return;
    try {
      const { latitude, longitude } = await GeoLocationUtils.getLocation(false);
      setLat(latitude);
      setlng(longitude);

      const resultAddr = await GeoLocationUtils.getAddress({
        latitude,
        longitude,
      });

      if (resultAddr) {
        const { city, gu } = resultAddr;
        setSelectedCity(city);
        // setSelectedGu(gu);
      }
    } catch (error) {
      console.log('[LOG ::: 위치정보를 허용하지 않았음.]');
    } finally {
      setIsGetAddr(true);
    }
  };

  const getCityList = async () => {
    try {
      const { data } = await apiCityList();
      if (data) {
        const transformedData = [
          { id: 0, code: '', label: '전체' },
          ...data.data.map((city, index) => ({
            id: index + 1,
            code: city,
            label: city,
          })),
        ];
        setCityList(transformedData);
        // setSelectedGu(data.data[0] ? data.data[0] : '');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const checkNotReadChat = async () => {
    if (!isLogin) {
      return;
    }
    try {
      const isExistsNotReadChat = await chatMapper.isNotReadChatExists({
        userIdx: authState.userIdx,
        userType: USER_TYPE.MEMBER,
      });
      dispatch(chatSliceActions.notReadChatIsExists(isExistsNotReadChat));
    } catch (error) {
      handleError(error);
    }
  };

  const handleActiveTab = tab => {
    setActiveTab(tab);
    // NavigationService.navigate(navName.matchingSchedule, { activeTab: tab });
  };

  const onInit = async () => {
    if (paramReset) {
      setInit(false);
      dispatch(matchingScheduleListAction.reset());
      setCityList([]);
      setSelectedCity('');
      setIsGetAddr(false);
      setActiveTab(route?.params?.activeTab || '매칭');
      NavigationService.navigate(navName.matchingSchedule);
    } else {
      getMyInfo();
      getCityList();
      getUserAddr();
    }
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      checkNotReadChat();
    }, []),
  );

  useEffect(() => {
    onInit();
  }, [paramReset]);

  useEffect(() => {
    if (cityList && cityList?.length > 0 && isGetAddr) setInit(true);
  }, [cityList, isGetAddr]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title={activeTab}
        hideLeftIcon
        rightContent={() => {}}
        {...(activeTab === '매칭'
          ? {
              rightContent: isAdmin ? (
                <Pressable
                  style={{ padding: 10 }}
                  onPress={() =>
                    NavigationService.navigate(
                      navName.matchingChatRoomListScreen,
                    )
                  }>
                  {/* 채팅이 오면 아래 빨간 점 표시된 아이콘으로 변경 */}
                  {notReadChatIsExists ? (
                    <SPSvgs.MessageRedDot />
                  ) : (
                    <SPSvgs.Message />
                  )}
                </Pressable>
              ) : (
                <View style={{ padding: 10 }}>
                  <View style={{ width: 28, height: 28 }} />
                </View>
              ),
            }
          : activeTab === '대회'
          ? {
              rightContent: isAdmin ? (
                <Pressable
                  style={{ padding: 10 }}
                  onPress={() =>
                    NavigationService.navigate(
                      navName.academyMatchingRegistration,
                    )
                  }>
                  <SPSvgs.Record />
                </Pressable>
              ) : (
                <View style={{ padding: 10 }}>
                  <View style={{ width: 28, height: 28 }} />
                </View>
              ),
            }
          : activeTab === '대회 정보'
          ? {
              rightContent: (
                <View style={{ padding: 10 }}>
                  <View style={{ width: 28, height: 28 }} />
                </View>
              ),
            }
          : activeTab === '구장'
          ? {
              rightContent: (
                <View style={{ padding: 10 }}>
                  <View style={{ width: 28, height: 28 }} />
                </View>
              ),
            }
          : {})}
        headerContainerStyle={{
          backgroundColor: COLORS.darkBlue,
          paddingTop: insets.top,
          paddingLeft: 10,
        }}
        headerTextStyle={{
          color: COLORS.white,
        }}
      />
      {/* 경기매칭 Tab Group */}
      <View style={styles.tabButtonBox}>
        <TabButton
          title="매칭"
          activeTab={activeTab}
          setActiveTab={handleActiveTab}
        />
        <TabButton
          title="대회"
          activeTab={activeTab}
          setActiveTab={handleActiveTab}
        />
        <TabButton
          title="대회 정보"
          activeTab={activeTab}
          setActiveTab={handleActiveTab}
        />
        <TabButton
          title="구장"
          activeTab={activeTab}
          setActiveTab={handleActiveTab}
        />
      </View>
      <View style={styles.tabDetailBox}>
        {!init ? (
          <View style={{ flex: 1 }}>
            <SPLoading />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {/* 매칭 Tab */}
            <View
              style={[
                styles.tabStyle,
                activeTab === '매칭' ? styles.tabActive : styles.tabInActive,
              ]}>
              <MatchingComponent
                lat={lat}
                lng={lng}
                initCity={selectedCity}
                cityList={cityList}
              />
            </View>
            {/* 대회 Tab */}
            <View
              style={[
                styles.tabStyle,
                activeTab === '대회' ? styles.tabActive : styles.tabInActive,
              ]}>
              <Tournament
                lat={lat}
                lng={lng}
                initCity={selectedCity}
                cityList={cityList}
              />
            </View>
            {/* 구장 Tab */}
            <View
              style={[
                styles.tabStyle,
                activeTab === '구장' ? styles.tabActive : styles.tabInActive,
              ]}>
              <Playground
                lat={lat}
                lng={lng}
                initCity={selectedCity}
                cityList={cityList}
              />
            </View>
            {/* 대회 Tab */}
            <View
              style={[
                styles.tabStyle,
                activeTab === '대회 정보'
                  ? styles.tabActive
                  : styles.tabInActive,
              ]}>
              <TournamentInfo
                lat={lat}
                lng={lng}
                initCity={selectedCity}
                cityList={cityList}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export default memo(MatchingSchedule);

// --------------------------------------------------
// [ Component ]
// --------------------------------------------------
// 탭 컴포넌트 (매칭, 대회, 구장)
function TabButton({ title, activeTab, setActiveTab }) {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === title ? styles.activeTab : styles.inactiveTab,
      ]}
      onPress={() => setActiveTab(title)}>
      <Text
        style={[
          styles.tabText,
          activeTab === title ? styles.activeTabText : null,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tabButtonBox: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 48,
    backgroundColor: COLORS.darkBlue,
  },
  tabButton: {
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(167, 172, 179, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
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
  tabCommon: {},
  tabTopBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  monthButtonTopBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthButtonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  monthText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  switch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFE1D2',
    gap: 4,
    borderRadius: 8,
    padding: 4,
  },
  toggle: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
  },
  activeToggle: {
    backgroundColor: '#FFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.28)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  activeToggleText: {
    color: '#FF7C10',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  dayBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    padding: 4,
  },
  selectedDayBox: {
    backgroundColor: '#FF7C10',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dayText: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFF',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  dropdown: {
    width: '100%',
    backgroundColor: 'white',
    maxHeight: 200,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  matching: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 0,
    flex: 1,
  },
  matchingTopBox: {
    marginBottom: 4,
  },
  matchingBox: {
    position: 'relative',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  matchingPersonnel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchingPersonnelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchingGender: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(49, 55, 121, 0.43)',
  },
  matchingGenderText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingNumber: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 38, 114, 0.10)',
  },
  matchingNumberText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingStatus: {
    backgroundColor: 'rgba(255, 103, 31, 0.16)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchingStatusText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FF7C10',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  playgroundAddr: {
    backgroundColor: '#FF7C10',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  playgroundAddrText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  playgroundCountBox: {
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  playgroundCount: {
    fontSize: 17,
    fontWeight: 600,
    color: '#FF7C10',
  },
  playgroundCountText: {
    fontSize: 17,
    fontWeight: 600,
    color: '#1A1C1E',
  },
  playgroundTitle: {
    fontSize: 21,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 12,
  },
  playgroundText: {
    fontSize: 15,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  playgroundPhoneNo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  playgroundTelIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchingTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 8,
  },
  matchingDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchingDayIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchingDayText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingMoreBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  matchList: {
    paddingHorizontal: 16,
    paddingTop: 24,
    marginBottom: 89,
  },
  contentsBox: {
    flex: 1,
  },
  contentsText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#171719',
    lineHeight: 22,
    letterSpacing: 0.144,
    marginBottom: 8,
  },
  gradient: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  matchImageBox: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  matchTypeBox: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    backgroundColor: '#FF7C10',
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 16,
  },
  matchType: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchTextBox: {
    flexDirection: 'column',
    gap: 4,
    paddingTop: 8,
    marginBottom: 24,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  matchTextDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  verticalLine: {
    color: 'rgba(135, 141, 150, 0.22)',
  },
  comingSoonBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 37,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: 500,
    color: '#FFF',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  // writeBtn: {
  //   position: 'absolute',
  //   right: 16,
  //   bottom: 16,
  //   backgroundColor: 'white',
  //   borderRadius: 50,
  //   ...Platform.select({
  //     ios: {
  //       shadowColor: '#000',
  //       shadowOffset: { width: 0, height: 2 },
  //       shadowOpacity: 0.3,
  //       shadowRadius: 4,
  //     },
  //     android: {
  //       elevation: 4,
  //     },
  //   }),
  // },
  writeBtn: {
    position: 'absolute',
    zIndex: 999,
    bottom: 16,
    right: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
    paddingVertical: 16,
  },
  modalMonthButtonBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalMonthText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  monthList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
  },
  monthContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '33.33%',
    minHeight: 52,
    borderRadius: 8,
  },
  selectedMonth: {
    backgroundColor: '#FF7C10',
  },
  monthTextStyle: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  disabledMonthText: {
    color: '#D6D3D7',
  },
  selectedMonthText: {
    color: '#FFF',
  },
  appealBox: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 32,
  },
  appealBtn: {
    flex: 1,
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  appealBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  appealOutlineBtn: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    backgroundColor: '#FFF',
  },
  appealOutlineBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  tabStyle: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabActive: {
    zIndex: 1,
  },
  tabInActive: {
    zIndex: 0,
    opacity: 0,
  },
});
