import { format } from 'date-fns';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SPIcons from '../../assets/icon';
import { TOURNAMENT_STATE } from '../../common/constants/tournamentState';
import ListEmptyView from '../../components/ListEmptyView';
import { apiGetTournamentList, apiGuList } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { ko } from 'date-fns/locale/ko';
import SPLoading from '../../components/SPLoading';
import fontStyles from '../../styles/fontStyles';
import TournamentBox from './TournamentBox';

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

// 대회_대회목록
function TournamentList({ route, lat, lng, initCity, cityList }) {
  /**
   * state
   */
  const flatListRef = useRef();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  let dummyData = [
    {
      ableApply: null,
      admIdx: 3,
      aprvState: null,
      award: '6개 부문U-8 / U-9 / U-10 / U-11 / U-12 / U-15',
      closeDate: '2024-08-30 18:00:00',
      closeYn: 'Y',
      delDate: null,
      depositInfo: '**은행 1234565677',
      description:
        '조별 리그진행4팀 1개조, 팀당 1일 2경기, 각 조 1, 2위 4강진출',
      endDate: '2024-08-30 18:00:00',
      entryAge: '0',
      entryFee: '100000',
      imageNm: null,
      imageUrl: null,
      inquiry: '군산축구협회',
      isApply: null,
      isClosed: true,
      isOpened: true,
      memo: '테스트',
      openDate: '2024-07-30 11:00:00',
      posterNm: null,
      posterUrl: null,
      recruitCnt: '96',
      regDate: '2024-07-03 15:16:09',
      startDate: '2024-07-30 11:00:00',
      thumbNm: 'NISI20220412_0000972545_web_(1).jpg',
      thumbUrl:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      trnAddr: '전라북도 군산',
      trnIdx: 20,
      trnNm: '리틀 k리그 전국대회',
      updDate: '2024-09-07 00:19:59',
      state: TOURNAMENT_STATE.REGISTERING,
    },
  ];
  dummyData = [...dummyData, ...dummyData, ...dummyData, ...dummyData];

  const [tournamentList, setTournamentList] = useState([]);
  const [size, setSize] = useState(30);
  const [tournamentPage, setTournamentPage] = useState(1);
  const [tournamentIsLast, setTournamentIsLast] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 드롭다운 리스트
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

  const [selectedTabKey, setSelectedTabKey] = useState('대회 목록');

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 2;
  const maxYear = currentYear + 2;

  /**
   * api
   */
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
    setRefreshing(false);
    setTimeout(() => {
      setLoading(false);
    }, 0);
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

  /**
   * function
   */

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!tournamentIsLast && tournamentList?.length > 0) {
        setTournamentPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const onRefresh = async () => {
    setLoading(true);
    setTournamentIsLast(false);
    setTournamentPage(1);
    setTournamentList([]);
    setRefreshing(true);
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
    onRefresh();
  };

  const handleMonthPress = month => {
    setSelectedMonth(month);
  };

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

  /**
   * useEffect
   */
  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      getGuList(selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedDate && (refreshing || (!refreshing && tournamentPage > 1))) {
      // getTournamentList();
      setRefreshing(false);
      setLoading(false);
    }
  }, [tournamentPage, refreshing]);

  const returnFlatListHeader = () => {
    return (
      <>
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
              <Text style={[styles.monthText, { fontWeight: 600 }]}>{`${format(
                selectedDate,
                'yyyy년 M월',
              )}`}</Text>
              <Image source={SPIcons.icArrowDownBlack} />
            </Pressable>
          </View>
        </View>
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
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.matching}>
        {returnFlatListHeader()}
        <FlatList
          data={dummyData}
          ref={flatListRef}
          contentContainerStyle={[
            { gap: 12 },
            dummyData?.length === 0 ? { flex: 1 } : {},
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreProjects}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item, index }) => {
            return <TournamentBox item={item} />;
          }}
          // ListHeaderComponent={returnFlatListHeader}
          ListEmptyComponent={
            loading ? (
              <SPLoading />
            ) : (
              <ListEmptyView
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                text="이번달은 대회가 없어요."
              />
            )
          }
        />
      </View>
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
    </View>
  );
}

export default memo(TournamentList);

const styles = StyleSheet.create({
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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  matchImageBox: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
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
  matching: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 0,
    flex: 1,
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
  tabWrap: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabBox: { paddingVertical: 14, paddingHorizontal: 8 },
  tabText: {
    ...fontStyles.fontSize14_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  activeTabBox: { borderBottomWidth: 2, borderBottomColor: '#FB8225' },
  activeTabText: { color: '#FF7C10' },
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
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
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
  modalText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
