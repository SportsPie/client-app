import { useFocusEffect } from '@react-navigation/native';
import { format, isAfter, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Calendar,
  CalendarProvider,
  LocaleConfig,
  WeekCalendar,
} from 'react-native-calendars/src/index';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  apiCityList,
  apiGetMatchList,
  apiGetMyInfo,
  apiGetPlaygroundList,
  apiGetTournamentList,
  apiGuList,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import SPImages from '../../assets/images';
import { SPSvgs } from '../../assets/svg';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { GENDER } from '../../common/constants/gender';
import { MATCH_STATE } from '../../common/constants/matchState';
import { navName } from '../../common/constants/navName';
import { TOURNAMENT_STATE } from '../../common/constants/tournamentState';
import ListEmptyView from '../../components/ListEmptyView';
import Header from '../../components/header';
import MatchingFilterModal from '../../components/matching/MatchingFilterModal';
import NavigationService from '../../navigation/NavigationService';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import { COLORS } from '../../styles/colors';
import GeoLocationUtils from '../../utils/GeoLocationUtils';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import chatMapper, { USER_TYPE } from '../../utils/chat/ChatMapper';
import SPLoading from '../../components/SPLoading';
import { matchingHistoryListAction } from '../../redux/reducers/list/matchingHistoryListSlice';
import { matchingScheduleListAction } from '../../redux/reducers/list/matchingScheduleListSlice';
import { store } from '../../redux/store';

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
const SEJONG = '세종특별자치시';

const months = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

function MatchingSchedule({ route }) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef();
  const matchingFilterRef = useRef();
  const authState = useSelector(selector => selector.auth);
  const chatState = useSelector(selector => selector.chat);
  const notReadChatIsExists = chatState?.notReadChatIsExists;
  const dispatch = useDispatch();
  const { isLogin, userIdx } = useSelector(selector => selector.auth);

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 2;
  const maxYear = currentYear + 2;
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const listName = 'matchingScheduleList';
  const {
    page,
    list: matchList,
    refreshing,
    loading,
    isLast,
    listParamReset,
  } = useSelector(selector => selector[listName]);

  const action = matchingScheduleListAction;
  const paramReset = route.params?.paramReset;
  const [fstCall, setFstCall] = useState(false);
  // 리스트 관련 State
  const [size] = useState(9999);
  const [lat, setLat] = useState();
  const [lon, setLon] = useState();
  const [init, setInit] = useState(false);
  const [tournamentPage, setTournamentPage] = useState(1);
  const [playgroundPage, setPlaygroundPage] = useState(1);
  const [tournamentIsLast, setTournamentIsLast] = useState(false);
  const [playgroundIsLast, setPlaygroundIsLast] = useState(false);
  const [member, setMember] = useState({});
  const [playgroundTotalCnt, setPlaygroundTotalCnt] = useState();
  const [activeTab, setActiveTab] = useState('매칭'); // 매칭 , 대회 , 구장
  const [filteredMatchList, setFilteredMatchList] = useState([]);
  const [playgroundList, setPlaygroundList] = useState([]);
  const [tournamentList, setTournamentList] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.activeTab) {
        setActiveTab(route.params?.activeTab);
      }
    }, [route.params?.activeTab]),
  );

  // 주, 월간 달력 on/off
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  // 드롭다운 리스트
  const [cityList, setCityList] = useState([{ id: 0, label: '전체' }]);
  const [guList, setGuList] = useState([{ id: 0, label: '전체' }]);
  const [itemsToDisplay, setItemsToDisplay] = useState([]);

  // 드롭다운 on/off
  const [cityListVisible, setCityListVisible] = useState(false);
  const [guListVisible, setGuListVisible] = useState(false);

  // 선택된 값
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedGu, setSelectedGu] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );

  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // 모달 상태 관리
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGetAddr, setIsGetAddr] = useState(false);

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const markedSelectedDates = {
    [selectedDate]: {
      selected: true,
    },
  };

  selectedDates.forEach(date => {
    if (date === selectedDate) {
      markedSelectedDates[date] = {
        marked: true,
        selected: true,
      };
    } else {
      markedSelectedDates[date] = {
        marked: true,
      };
    }
  });

  const formatTournamentDate = dateString => {
    const date = new Date(dateString);
    return format(date, 'MMMM do EEEE', { locale: ko });
  };

  const getTournamentState = item => {
    if (!item.isOpened && !item.isClosed && item.closeYn !== 'Y') {
      return TOURNAMENT_STATE.UPCOMING;
    }
    if ((item.isOpened && item.isClosed) || item.closeYn === 'Y') {
      return TOURNAMENT_STATE.CLOSED;
    }
    return TOURNAMENT_STATE.REGISTERING;
  };

  const handleActiveTab = tab => {
    // setActiveTab(tab);
    NavigationService.navigate(navName.matchingSchedule, { activeTab: tab });
    onRefresh();
  };

  const handleSelectDate = date => {
    // if (showFullCalendar) {
    //   setShowFullCalendar(false);
    // }
    setSelectedDate(date);
    // onRefresh();
  };

  const handleSelectCity = city => {
    setSelectedGu(null);
    setSelectedCity(city);
    setCityListVisible(false);
    onRefresh();
  };

  const handleSelectGu = gu => {
    setSelectedGu(gu);
    setGuListVisible(false);
    onRefresh();
  };

  // /**
  //  * 화살표의 방향과 타입에 따라 selectedDate 를 연산합니다
  //  * @param period (week || month)
  //  * @param direction (prev || next)
  //  */
  // const handleArrow = (period, direction) => {
  //   let interval;
  //   if (period === 'week') {
  //     interval = direction === 'prev' ? -7 : 7;
  //   } else if (period === 'month') {
  //     interval = direction === 'prev' ? -1 : 1;
  //   } else if (period === 'year') {
  //     interval = direction === 'prev' ? -12 : 12; // 12개월을 한 번에 조정
  //   } else {
  //     throw new Error('올바른 기간을 입력해주세요.');
  //   }
  //
  //   const nextDate =
  //     period === 'week'
  //       ? addDays(new Date(selectedDate), interval)
  //       : addMonths(new Date(selectedDate), interval);
  //   setSelectedDate(format(nextDate, 'yyyy-MM-dd'));
  //   setRefreshing(true);
  // };

  // const loadMoreList = () => {
  //   setTimeout(() => {
  //     if (!isLast) {
  //       setPage(prevPage => prevPage + 1);
  //       setRefreshing(true);
  //     }
  //   }, 0);
  // };

  const onRefresh = async () => {
    setTournamentIsLast(false);
    setPlaygroundIsLast(false);
    setPlaygroundTotalCnt();
    setTournamentPage(1);
    setPlaygroundPage(1);
    dispatch(action.refresh());
  };

  const onInit = async () => {
    if (paramReset || listParamReset) {
      setTimeout(() => {
        dispatch(action.reset());
        setInit(false);
      }, 500);
      setSelectedCity('');
      setSelectedGu('');
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      setSelectedMonth(new Date().getMonth() + 1);
      setSelectedYear(new Date().getFullYear());
      setSelectedGender(null);
      setSelectedMethod(null);
      matchingFilterRef?.current?.reset();
      setIsGetAddr(false);
      setFstCall(false);
      if (!listParamReset) {
        NavigationService.navigate(navName.matchingSchedule, {
          activeTab: route?.params.activeTab || '매칭',
        });
      }
    } else {
      setTimeout(() => {
        setInit(true);
      }, 500);
    }
  };

  const getUserAddr = async () => {
    if (isGetAddr) return;
    try {
      const { latitude, longitude } = await GeoLocationUtils.getLocation(false);
      setLat(latitude);
      setLon(longitude);

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

  const handleMonthPress = month => {
    setSelectedMonth(month);
  };

  const handleYearPress = year => {
    if (year >= minYear && year <= maxYear) {
      setSelectedYear(year);
    }
  };

  const handleMonthModalConfirm = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedMonth - 1);
    newDate.setFullYear(selectedYear);

    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    setIsModalVisible(false);
    dispatch(action.refresh());
  };

  // --------------------------------------------------
  // [ Apis ]
  // --------------------------------------------------
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

  const getGuList = async city => {
    try {
      if (!city) {
        return false;
      }
      const { data } = await apiGuList(city);
      if (data) {
        const transformedData = [
          { id: 0, code: '', label: '전체' },
          ...data.data.map((gu, index) => ({
            id: index + 1,
            code: gu,
            label: gu,
          })),
        ];
        setGuList(transformedData);
        // setSelectedGu(data.data[0] ? data.data[0] : '');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getMatchList = async () => {
    try {
      const param = {
        size,
        page,
        // matchDate: selectedDate,
        addrCity: selectedCity,
        addrGu: selectedGu,
        yearMonth: selectedDate.slice(0, 7),
        gender: selectedGender,
        matchMethod: selectedMethod,
      };

      const { data } = await apiGetMatchList(param);

      if (data) {
        dispatch(action.setTotalCnt(data.data.totalCnt));
        dispatch(action.setIsLast(data.data.isLast));
        setSelectedDates(
          data.data.list ? data.data.list.map(item => item.matchDate) : [],
        );
        dispatch(action.setList(data.data.list));
      }
    } catch (error) {
      handleError(error);
    }

    setTimeout(() => {
      setFstCall(true);
    }, 400);

    setTimeout(() => {
      dispatch(action.setRefreshing(false));
      setInit(false);
    }, 300);
  };

  const getTournamentList = async () => {
    try {
      const param = {
        size: 30,
        page: tournamentPage,
        searchDate: selectedDate,
      };

      const { data } = await apiGetTournamentList(param);

      if (data) {
        // setTotalCnt(data.data.totalCnt);
        setTournamentIsLast(data.data.isLast);

        // 날짜 포맷팅
        const formattedList = data.data.list.map(item => ({
          ...item,
          formattedOpenDate: formatTournamentDate(item.openDate),
          formattedStartDate: formatTournamentDate(item.startDate),
          formattedEndDate: formatTournamentDate(item.endDate),
          state: getTournamentState(item),
        }));

        if (tournamentPage === 1) {
          setTournamentList(formattedList);
        } else {
          setTournamentList(prev => [...prev, ...formattedList]);
        }
      }
    } catch (error) {
      handleError(error);
    }

    setTimeout(() => {
      setFstCall(true);
    }, 500);

    setTimeout(() => {
      dispatch(action.setRefreshing(false));
      setInit(false);
    }, 500);
  };

  const getPlaygroundList = async () => {
    try {
      const param = {
        size: 30,
        page: playgroundPage,
        addrCity: selectedCity,
        addrGu: selectedGu,
        latitude: lat,
        longitude: lon,
      };

      const { data } = await apiGetPlaygroundList(param);

      if (data) {
        setPlaygroundTotalCnt(data.data.totalCnt);
        setPlaygroundIsLast(data.data.isLast);
        if (playgroundPage === 1) {
          setPlaygroundList(data.data.list);
        } else {
          setPlaygroundList(prev => [...prev, ...data.data.list]);
        }
      }
    } catch (error) {
      handleError(error);
    }
    setTimeout(() => {
      dispatch(action.setRefreshing(false));
      setInit(false);
    }, 300);
  };

  const getMyInfo = async () => {
    if (!isLogin) {
      return;
    }
    try {
      const { data } = await apiGetMyInfo();
      if (data) {
        setMember(data.data);
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

  const handleFilterSubmit = selectedValues => {
    // eslint-disable-next-line no-shadow
    const { selectedGender, selectedMethod } = selectedValues;
    setSelectedGender(selectedGender);
    setSelectedMethod(selectedMethod);
    onRefresh();
  };

  const handleFilterMatchList = () => {
    const filteredData = matchList.filter(
      item => item.matchDate === selectedDate,
    );
    setFilteredMatchList(filteredData);
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      switch (activeTab) {
        case '매칭':
          if (!isLast) {
            const prevPage = store.getState().communityList.page;
            dispatch(action.setPage(prevPage + 1));
          }
          break;
        case '대회':
          if (!tournamentIsLast) {
            setTournamentPage(prevPage => prevPage + 1);
          }
          break;
        case '구장':
          if (!playgroundIsLast) {
            setPlaygroundPage(prevPage => prevPage + 1);
          }
          break;
        default:
          break;
      }
    }, 0);
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      checkNotReadChat();
      getMyInfo();
    }, []),
  );

  useEffect(() => {
    onInit();
  }, [paramReset, listParamReset]);

  useEffect(() => {
    if (paramReset || listParamReset) getCityList();
  }, [paramReset, listParamReset]);

  useEffect(() => {
    getUserAddr();
  }, [isGetAddr]);

  useEffect(() => {
    if (
      isGetAddr &&
      activeTab === '매칭' &&
      selectedDate &&
      (refreshing || init)
    ) {
      if (!paramReset && !listParamReset) getMatchList();
    }
  }, [
    selectedCity,
    selectedGu,
    selectedDate,
    activeTab,
    refreshing,
    isGetAddr,
    init,
    matchList,
    paramReset,
    listParamReset,
  ]);

  useEffect(() => {
    if (paramReset || listParamReset) return;
    if (
      activeTab === '구장' &&
      (refreshing || init || (!refreshing && playgroundPage > 1))
    ) {
      getPlaygroundList();
    }
  }, [playgroundPage, activeTab, refreshing, init, paramReset, listParamReset]);

  useEffect(() => {
    if (paramReset || listParamReset) return;
    if (
      activeTab === '대회' &&
      selectedDate &&
      (refreshing || init || (!refreshing && tournamentPage > 1))
    ) {
      getTournamentList();
    }
  }, [tournamentPage, activeTab, refreshing, init, paramReset, listParamReset]);

  useEffect(() => {
    if (paramReset || listParamReset) return;
    if (selectedCity) {
      getGuList(selectedCity);
    }
  }, [selectedCity, paramReset, listParamReset]);

  useEffect(() => {
    if (paramReset || listParamReset) return;
    handleFilterMatchList();
  }, [matchList, selectedDate, paramReset, listParamReset]);

  useEffect(() => {
    if (paramReset || listParamReset) return;
    onRefresh();
  }, [selectedDate, selectedCity, selectedGu, paramReset, listParamReset]);

  const listCalendarHeader = () => {
    const calendarTheme = {
      backgroundColor: '#ffffff',
      calendarBackground: '#ffffff',
      selectedDayTextColor: '#ffffff',
      selectedDayBackgroundColor: '#FF7C10',
      todayTextColor: '#FF7C10',
      dayTextColor: '#1A1C1E',
      textDisabledColor: 'rgba(46, 49, 53, 0.16)',
      textDayFontWeight: '700',
      textSectionTitleColor: 'rgba(46, 49, 53, 0.60)',
      textDayFontSize: 14,
      dotColor: '#FF7C10',
      selectedDotColor: '#FF7C10',
    };

    return (
      <View>
        <View style={styles.tabCommon}>
          <View style={styles.tabTopBox}>
            <Pressable
              hitSlop={{
                top: 12,
                bottom: 12,
                left: 12,
                right: 12,
              }}
              activeOpacity={ACTIVE_OPACITY}
              style={styles.monthButtonTopBox}
              onPress={() => setIsModalVisible(true)}>
              <Text style={[styles.monthText, { fontWeight: 600 }]}>{`${format(
                selectedDate,
                'yyyy년 M월',
              )}`}</Text>
              <Image source={SPIcons.icArrowDownBlack} />
            </Pressable>
            <View style={styles.switch}>
              {/* 주 버튼 */}
              <TouchableOpacity
                style={[
                  styles.toggle,
                  !showFullCalendar && styles.activeToggle,
                ]}
                onPress={() => setShowFullCalendar(false)}>
                <Text
                  style={[
                    styles.toggleText,
                    !showFullCalendar && styles.activeToggleText,
                  ]}>
                  주
                </Text>
              </TouchableOpacity>
              {/* 월 버튼 */}
              <TouchableOpacity
                style={[styles.toggle, showFullCalendar && styles.activeToggle]}
                onPress={() => setShowFullCalendar(true)}>
                <Text
                  style={[
                    styles.toggleText,
                    showFullCalendar && styles.activeToggleText,
                  ]}>
                  월
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {!showFullCalendar ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <CalendarProvider
                date={selectedDate}
                key={selectedDate}
                style={{
                  minHeight: 1,
                  flex: 1,
                  zIndex: 1,
                }}>
                <WeekCalendar
                  firstDay={1}
                  onDayPress={day => handleSelectDate(day.dateString)}
                  allowShadow={false}
                  markedDates={markedSelectedDates}
                  scrollEnabled={false}
                  theme={calendarTheme}
                />
              </CalendarProvider>
            </View>
          ) : (
            <Calendar
              key={selectedDate}
              current={selectedDate}
              renderHeader={() => null}
              hideArrows
              firstDay={1}
              onDayPress={day => handleSelectDate(day.dateString)}
              markedDates={markedSelectedDates}
              theme={calendarTheme}
            />
          )}
        </View>
        <View style={{ flexDirection: 'column' }}>
          <View>
            <View style={styles.dropdownBtn}>
              <Pressable
                hitSlop={{
                  top: 16,
                  bottom: 16,
                }}
                style={styles.button}
                onPress={() => {
                  setItemsToDisplay(cityList);
                  setCityListVisible(true);
                }}>
                <Text style={styles.dropdownTitle}>
                  {selectedCity ? selectedCity : '전체'}
                </Text>
                <Image
                  source={SPIcons.icArrowDown}
                  style={styles.dropdownIcon}
                />
              </Pressable>
              {selectedCity !== SEJONG && selectedCity && (
                <Pressable
                  hitSlop={{
                    top: 16,
                    bottom: 16,
                  }}
                  style={styles.button}
                  onPress={() => {
                    setItemsToDisplay(guList);
                    setGuListVisible(true);
                  }}>
                  <Text style={styles.dropdownTitle}>
                    {selectedGu ? selectedGu : '전체'}
                  </Text>
                  <Image
                    source={SPIcons.icArrowDown}
                    style={styles.dropdownIcon}
                  />
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  matchingFilterRef?.current?.show();
                }}
                style={{ marginLeft: 'auto' }}
                hitSlop={12}>
                <SPSvgs.Filter />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="경기매칭"
        hideLeftIcon
        rightContent={
          <Pressable
            style={{ padding: 10 }}
            onPress={() =>
              NavigationService.navigate(navName.matchingChatRoomListScreen)
            }>
            {/* 채팅이 오면 아래 빨간 점 표시된 아이콘으로 변경 */}
            {notReadChatIsExists ? (
              <SPSvgs.MessageRedDot />
            ) : (
              <SPSvgs.Message />
            )}
          </Pressable>
        }
        headerContainerStyle={{
          backgroundColor: COLORS.darkBlue,
          paddingTop: insets.top,
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
          title="구장"
          activeTab={activeTab}
          setActiveTab={handleActiveTab}
        />
      </View>
      {!fstCall || refreshing ? (
        <View style={styles.tabDetailBox}>
          <SPLoading />
        </View>
      ) : (
        <View style={styles.tabDetailBox}>
          {/* 매칭 Tab */}
          {activeTab === '매칭' && (
            <View style={{ flex: 1 }}>
              <FlatList
                style={{ flex: 1 }}
                ref={flatListRef}
                ListHeaderComponent={listCalendarHeader}
                data={filteredMatchList}
                contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  return <MatchingBox key={item.key} item={item} />;
                }}
                ListEmptyComponent={<ListEmptyView text="매치가 없습니다." />}
              />
            </View>
          )}
          {/* 대회 Tab */}
          {activeTab === '대회' && (
            <View style={{ flex: 1 }}>
              <View style={styles.tabTopBox}>
                <View style={styles.monthButton}>
                  <Pressable
                    hitSlop={{
                      top: 12,
                      bottom: 12,
                      left: 12,
                      right: 12,
                    }}
                    style={styles.monthButtonTopBox}
                    onPress={() => setIsModalVisible(true)}>
                    <Text
                      style={[
                        styles.monthText,
                        { fontWeight: 600 },
                      ]}>{`${format(selectedDate, 'yyyy년 M월')}`}</Text>
                    <Image source={SPIcons.icArrowDownBlack} />
                  </Pressable>
                </View>
              </View>
              <View style={styles.matching}>
                <FlatList
                  data={tournamentList}
                  ref={flatListRef}
                  contentContainerStyle={{ gap: 12 }}
                  showsVerticalScrollIndicator={false}
                  onEndReached={loadMoreProjects}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  renderItem={({ item, index }) => {
                    return <TournamentBox item={item} />;
                  }}
                  ListEmptyComponent={
                    <ListEmptyView text="이번달은 대회가 없어요." />
                  }
                />
              </View>
            </View>
          )}
          {/* 구장 Tab */}
          {activeTab === '구장' && (
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'column' }}>
                <View>
                  <View style={styles.dropdownBtn}>
                    <Pressable
                      hitSlop={{
                        top: 16,
                        bottom: 16,
                        left: 2,
                        right: 2,
                      }}
                      style={styles.button}
                      onPress={() => {
                        setItemsToDisplay(cityList);
                        setCityListVisible(true);
                      }}>
                      <Text style={styles.dropdownTitle}>
                        {selectedCity ? selectedCity : '전체'}
                      </Text>
                      <Image
                        source={SPIcons.icArrowDown}
                        style={styles.dropdownIcon}
                      />
                    </Pressable>
                    {selectedCity !== SEJONG && selectedCity && (
                      <Pressable
                        hitSlop={{
                          top: 16,
                          bottom: 16,
                          left: 2,
                          right: 2,
                        }}
                        style={styles.button}
                        onPress={() => {
                          setItemsToDisplay(guList);
                          setGuListVisible(true);
                        }}>
                        <Text style={styles.dropdownTitle}>
                          {selectedGu ? selectedGu : '전체'}
                        </Text>
                        <Image
                          source={SPIcons.icArrowDown}
                          style={styles.dropdownIcon}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
              {/* 구장 리스트 */}
              <View style={styles.playgroundCountBox}>
                <Text style={styles.playgroundCount}>{playgroundTotalCnt}</Text>
                <Text style={styles.playgroundCountText}>
                  개의 구장이 있어요
                </Text>
              </View>
              <View style={styles.matching}>
                <FlatList
                  ref={flatListRef}
                  data={playgroundList}
                  contentContainerStyle={{ gap: 12 }}
                  showsVerticalScrollIndicator={false}
                  onEndReached={loadMoreProjects}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  renderItem={({ item }) => {
                    return <PlaygroundBox item={item} />;
                  }}
                  ListEmptyComponent={<ListEmptyView text="구장이 없습니다" />}
                />
              </View>
            </View>
          )}
        </View>
      )}
      <Modal
        animationType="slide"
        transparent
        visible={cityListVisible}
        onRequestClose={() => setCityListVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 16,
          }}
          onPress={() => setCityListVisible(false)}>
          <View
            style={{
              width: '100%',
              height: '50%',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 16,
            }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {itemsToDisplay.map((item, index) => (
                <TouchableOpacity
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  onPress={() => handleSelectCity(item.code)}>
                  <Text style={styles.modalText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* 구 선택 드롭다운 */}
      <Modal
        animationType="slide"
        transparent
        visible={guListVisible}
        onRequestClose={() => setGuListVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 16,
          }}
          onPress={() => setGuListVisible(false)}>
          <View
            style={{
              width: '100%',
              height: '50%',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 16,
            }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {itemsToDisplay.map((item, index) => (
                <TouchableOpacity
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  onPress={() => handleSelectGu(item.code)}>
                  <Text style={styles.modalText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 16,
          }}
          activeOpacity={1}>
          <View
            style={{
              width: '100%',
              minHeight: '40%',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 16,
            }}>
            {/* 년도 선택 */}
            <View style={styles.modalMonthButtonBox}>
              <Pressable
                hitSlop={12}
                accessibilityLabel="Go to previous month"
                onPress={() => handleYearPress(selectedYear - 1)}
                disabled={selectedYear <= minYear}>
                <Image
                  source={SPIcons.icArrowLeftNoraml}
                  style={{
                    width: 24,
                    height: 24,
                    opacity: selectedYear <= minYear ? 0.1 : 1,
                  }}
                />
              </Pressable>
              <Text style={styles.modalMonthText}>{`${selectedYear}년`}</Text>
              <Pressable
                hitSlop={12}
                accessibilityLabel="Go to next month"
                onPress={() => handleYearPress(selectedYear + 1)}
                disabled={selectedYear >= maxYear}>
                <Image
                  source={SPIcons.icArrowRightNoraml}
                  style={{
                    width: 24,
                    height: 24,
                    opacity: selectedYear >= maxYear ? 0.1 : 1,
                  }}
                />
              </Pressable>
            </View>
            {/* 월 */}
            <View style={styles.monthList}>
              {months.map((month, index) => {
                const monthIndex = index + 1;
                const isSelectedMonth = monthIndex === selectedMonth;

                return (
                  <TouchableOpacity
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    onPress={() => handleMonthPress(monthIndex)}
                    style={[
                      styles.monthContainer,
                      isSelectedMonth && styles.selectedMonth,
                    ]}>
                    <View style={[styles.monthItem]}>
                      <Text
                        style={[
                          styles.monthTextStyle,
                          isSelectedMonth && styles.selectedMonthText,
                        ]}>
                        {month}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.appealBox}>
              <TouchableOpacity
                style={styles.appealOutlineBtn}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.appealOutlineBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.appealBtn}
                onPress={() => handleMonthModalConfirm()}>
                <Text style={styles.appealBtnText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* 경기개설 글쓰기 화면으로 이동 */}
      {activeTab === '매칭' && member.academyAdmin && (
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => {
            NavigationService.navigate(navName.matchingRegist);
          }}>
          <Image source={SPIcons.icCommunityWrite} />
        </TouchableOpacity>
      )}
      <MatchingFilterModal
        ref={matchingFilterRef}
        onSubmitPress={handleFilterSubmit}
      />
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

// 매칭 > 경기일정 컴포넌트
function MatchingBox({ item }) {
  const currentDate = new Date();
  const isMatchClose = isBefore(new Date(item.closeDate), currentDate);

  const matchingBoxStyle =
    item.matchState === MATCH_STATE.APPLY.code && isMatchClose
      ? { ...styles.matchingBox, backgroundColor: 'rgba(0, 38, 114, 0.05)' }
      : item.matchState === MATCH_STATE.APPLY.code
      ? styles.matchingBox
      : { ...styles.matchingBox, backgroundColor: 'rgba(0, 38, 114, 0.05)' }; // 상태에 따라 변경된 스타일 적용

  const genderStyle =
    item.matchState === MATCH_STATE.APPLY.code && isMatchClose
      ? {
          ...styles.matchingGender,
          backgroundColor: 'rgba(0, 38, 114, 0.10)',
          borderWidth: 0,
        }
      : item.matchState === MATCH_STATE.APPLY.code
      ? styles.matchingGender
      : {
          ...styles.matchingGender,
          backgroundColor: 'rgba(0, 38, 114, 0.10)',
          borderWidth: 0,
        };

  const numberStyle =
    item.matchState === MATCH_STATE.APPLY.code && isMatchClose
      ? {
          ...styles.matchingNumber,
          backgroundColor: 'rgba(0, 38, 114, 0.10)',
          borderWidth: 0,
        }
      : item.matchState === MATCH_STATE.APPLY.code
      ? styles.matchingNumber
      : {
          ...styles.matchingNumber,
          backgroundColor: 'rgba(0, 38, 114, 0.10)',
          borderWidth: 0,
        };

  const statusStyle =
    item.matchState === MATCH_STATE.APPLY.code && isMatchClose
      ? {
          ...styles.matchingStatus,
          backgroundColor: 'rgba(135, 141, 150, 0.16)',
        }
      : item.matchState === MATCH_STATE.APPLY.code
      ? styles.matchingStatus
      : {
          ...styles.matchingStatus,
          backgroundColor: 'rgba(135, 141, 150, 0.16)',
        };

  const statusTextStyle =
    item.matchState === MATCH_STATE.APPLY.code && isMatchClose
      ? { ...styles.matchingStatusText, color: 'rgba(46, 49, 53, 0.80)' }
      : item.matchState === MATCH_STATE.APPLY.code
      ? styles.matchingStatusText
      : { ...styles.matchingStatusText, color: 'rgba(46, 49, 53, 0.80)' };

  const getStatusStyle = matchInfo => {
    switch (matchInfo.matchState) {
      case MATCH_STATE.APPLY.code:
        if (isMatchClose) {
          return {
            backgroundColor: 'rgba(255, 66, 66, 0.16)',
            color: '#FF4242',
            desc: '경기취소',
          };
        }
        return {
          backgroundColor: 'rgba(255, 124, 16, 0.15)',
          color: '#FF7C10',
          desc: '경기예정',
        };
      case MATCH_STATE.REVIEW.code:
      case MATCH_STATE.CONFIRM.code:
        return {
          backgroundColor: 'rgba(135, 141, 150, 0.16)',
          color: 'rgba(46, 49, 53, 0.80)',
          desc: '경기완료',
        };
      case MATCH_STATE.READY.code:
        if (isMatchClose) {
          return {
            backgroundColor: 'rgba(50, 83, 255, 0.16)',
            color: '#3253FF',
            desc: '경기중',
          };
        }
        return {
          backgroundColor: 'rgba(36, 161, 71, 0.16)',
          color: '#24A147',
          desc: '경기대기',
        };
      case MATCH_STATE.FINISH.code:
      case MATCH_STATE.REJECT.code:
        return {
          backgroundColor: 'rgba(50, 83, 255, 0.16)',
          color: '#3253FF',
          desc: '경기중',
        };
      case MATCH_STATE.EXPIRE.code:
      case MATCH_STATE.CANCEL.code:
        return {
          backgroundColor: 'rgba(255, 66, 66, 0.16)',
          color: '#FF4242',
          desc: '경기취소',
        };
      default:
        return {};
    }
  };

  return (
    <Pressable
      style={{
        marginHorizontal: 16,
      }}
      onPress={() =>
        NavigationService.navigate(navName.matchingDetail, {
          matchIdx: item.matchIdx,
        })
      }>
      <View style={matchingBoxStyle}>
        <View style={styles.matchingPersonnel}>
          <View style={styles.matchingPersonnelBox}>
            <View style={genderStyle}>
              <Text style={styles.matchingGenderText}>
                {item.genderCode ? GENDER[item.genderCode].desc : ''}
              </Text>
            </View>
            <View style={numberStyle}>
              <Text style={styles.matchingNumberText}>
                {item.matchMethod == null
                  ? '-'
                  : item.matchMethod === 0
                  ? '협의 후 결정'
                  : `${item.matchMethod} : ${item.matchMethod}`}
              </Text>
            </View>
          </View>
          <View style={statusStyle}>
            <Text style={statusTextStyle}>
              {item.matchState ? getStatusStyle(item).desc : '-'}
            </Text>
          </View>
        </View>
        <Text
          style={styles.matchingTitle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.title}
        </Text>
        <View style={[styles.matchingDay, { marginBottom: 5 }]}>
          <Image source={SPIcons.icDate} style={styles.matchingDayIcon} />
          <Text
            style={
              styles.matchingDayText
            }>{`${item.matchDate} ${item.matchTime}`}</Text>
        </View>
        <View style={styles.matchingDay}>
          <Image source={SPIcons.icMarker} style={styles.matchingDayIcon} />
          <Text style={styles.matchingDayText}>{item.matchPlace}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// 대회 컴포넌트
function TournamentBox({ item }) {
  const { titleBoxStyle, titleTextStyle } = getStylesForTitle(
    item?.state?.code,
  );
  const gradientColors =
    item?.state?.code === TOURNAMENT_STATE.REGISTERING.code ||
    item?.state?.code === TOURNAMENT_STATE.CLOSED.code
      ? ['transparent', 'rgba(0,0,0,0.35)']
      : ['transparent', 'rgba(0,0,0,1)']; // 조건에 따라 그라디언트 색상 변경
  const { width, height } = useWindowDimensions();
  const aspectRatio = 16 / 9; // 이미지의 원본 비율
  const matchHeight = width <= 480 ? 246 : width / aspectRatio;

  return (
    <View style={[styles.contentsBox]}>
      <Pressable
        onPress={() =>
          NavigationService.navigate(navName.tournamentDetail, {
            tournamentIdx: item.trnIdx,
          })
        }>
        <View style={[styles.contentsImage, { height: matchHeight }]}>
          <ImageBackground
            source={
              item.thumbUrl ? { uri: item.thumbUrl } : SPImages.magazineImages
            }
            style={[styles.image, styles.matchImageBox]}>
            <LinearGradient colors={gradientColors} style={styles.gradient}>
              <View style={[styles.matchTypeBox, titleBoxStyle]}>
                <Text style={[styles.matchType, titleTextStyle]}>
                  {item?.state?.code === TOURNAMENT_STATE.UPCOMING.code
                    ? `${item.formattedOpenDate} 접수`
                    : item?.state?.desc}
                </Text>
              </View>
              {!(
                item?.state?.code === TOURNAMENT_STATE.REGISTERING.code ||
                item?.state?.code === TOURNAMENT_STATE.CLOSED.code
              ) && (
                <View style={styles.comingSoonBox}>
                  <Image source={SPIcons.icClock} />
                  <Text style={styles.comingSoonText}>Coming Soon!</Text>
                </View>
              )}
            </LinearGradient>
          </ImageBackground>
        </View>
        <View style={styles.matchTextBox}>
          <Text
            style={styles.matchTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.trnNm}
          </Text>
          <View style={styles.matchTextDetail}>
            <Text style={styles.detailText}>
              {item.formattedStartDate} - {item.formattedEndDate}
            </Text>
            <Text style={styles.verticalLine}>|</Text>
            <Text style={styles.detailText}>{item.trnAddr}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

// 구장 컴포넌트
function PlaygroundBox({ item }) {
  return (
    <Pressable
      onPress={() => {
        NavigationService.navigate(navName.playgroundDetail, {
          groundIdx: item.groundIdx,
        });
      }}>
      <View style={styles.matchingBox}>
        <View style={styles.matchingPersonnel}>
          <View style={styles.matchingPersonnelBox}>
            <View style={styles.playgroundAddr}>
              <Text style={styles.playgroundAddrText}>
                {item.groundCity} {item.groundGu}
              </Text>
            </View>
          </View>
        </View>
        <Text
          style={styles.playgroundTitle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.groundNm}
        </Text>
        <Text style={styles.playgroundText}>{item.groundAddr}</Text>
        {item.phoneNo ? (
          <View style={[styles.playgroundPhoneNo, { marginBottom: 5 }]}>
            <Image source={SPIcons.icCall} style={styles.playgroundTelIcon} />
            <Text style={styles.playgroundText}>{item.phoneNo}</Text>
          </View>
        ) : (
          ''
        )}
      </View>
    </Pressable>
  );
}

// 대회 > 접수중, 접수마감, 그 외 스타일
const getStylesForTitle = type => {
  switch (type) {
    case TOURNAMENT_STATE.REGISTERING.code:
      return {
        titleBoxStyle: { backgroundColor: '#FF7C10' },
        titleTextStyle: { color: '#FFF' },
      };
    case TOURNAMENT_STATE.CLOSED.code:
      return {
        titleBoxStyle: { backgroundColor: '#D6D7E4' },
        titleTextStyle: { color: '#313779' },
      };
    default:
      return {
        titleBoxStyle: { backgroundColor: '#FFF' },
        titleTextStyle: { color: '#000' },
      };
  }
};

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
    paddingHorizontal: 12,
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
});
