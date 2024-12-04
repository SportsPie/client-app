import { format } from 'date-fns';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SPIcons from '../../assets/icon';
import SPImages from '../../assets/images';
import { navName } from '../../common/constants/navName';
import { TOURNAMENT_STATE } from '../../common/constants/tournamentState';
import ListEmptyView from '../../components/ListEmptyView';
import NavigationService from '../../navigation/NavigationService';
import { apiGetTournamentList } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { ko } from 'date-fns/locale/ko';
import SPLoading from '../../components/SPLoading';

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

function TournamentInfo() {
  /**
   * state
   */
  const flatListRef = useRef();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [tournamentList, setTournamentList] = useState([]);
  const [size, setSize] = useState(30);
  const [tournamentPage, setTournamentPage] = useState(1);
  const [tournamentIsLast, setTournamentIsLast] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 선택된 값
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );

  /**
   * api
   */
  const getTournamentList = async () => {
    try {
      const param = {
        size,
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
          formattedOpenDate: formatTournamentDateTime(item.openDate),
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

  const handleYearPress = year => {
    setSelectedYear(year);
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

  const formatTournamentDateTime = dateString => {
    const date = new Date(dateString);
    return format(date, 'MMMM do EEEE HH:mm', { locale: ko });
  };

  const getTournamentState = item => {
    const currentTime = new Date(); // 현재 시간
    const openDate = new Date(item.openDate); // item의 openDate를 Date 객체로 변환
    if (
      currentTime < openDate &&
      !item.isOpened &&
      !item.isClosed &&
      item.closeYn !== 'Y'
    ) {
      return TOURNAMENT_STATE.UPCOMING; // 현재 시간이 openDate 이전일 경우
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
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && (refreshing || (!refreshing && tournamentPage > 1))) {
      getTournamentList();
    }
  }, [tournamentPage, refreshing]);

  return (
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
            <Text style={[styles.monthText, { fontWeight: 600 }]}>{`${format(
              selectedDate,
              'yyyy년 M월',
            )}`}</Text>
            <Image source={SPIcons.icArrowDownBlack} />
          </Pressable>
        </View>
      </View>
      <View style={styles.matching}>
        <FlatList
          key={loading ? 'loading' : 'loaded'}
          data={tournamentList}
          ref={flatListRef}
          contentContainerStyle={[
            { gap: 12 },
            tournamentList?.length === 0 ? { flex: 1 } : {},
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreProjects}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item, index }) => {
            return <TournamentBox item={item} />;
          }}
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
                onPress={() => handleYearPress(selectedYear - 1)}>
                <Image
                  source={SPIcons.icArrowLeftNoraml}
                  style={{
                    width: 24,
                    height: 24,
                  }}
                />
              </Pressable>
              <Text style={styles.modalMonthText}>{`${selectedYear}년`}</Text>
              <Pressable
                hitSlop={12}
                accessibilityLabel="Go to next month"
                onPress={() => handleYearPress(selectedYear + 1)}>
                <Image
                  source={SPIcons.icArrowRightNoraml}
                  style={{
                    width: 24,
                    height: 24,
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

export default memo(TournamentInfo);

// --------------------------------------------------
// [ Component ]
// --------------------------------------------------
// 대회 컴포넌트
function TournamentBox({ item }) {
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
          NavigationService.navigate(navName.tournamentInfoDetail, {
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
            <Text numberOfLines={1} style={styles.detailText}>
              {item.formattedStartDate} - {item.formattedEndDate}
            </Text>
            {/* <Text style={styles.verticalLine}>|</Text> */}
            <Text numberOfLines={1} style={styles.detailText}>
              {item.trnAddr}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

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
    // flexDirection: 'row',
    // alignItems: 'center',
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
});
