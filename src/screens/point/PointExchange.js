import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Image,
  Modal,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import moment from 'moment';
import { addMonths, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar } from 'react-native-calendars/src/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { SPSvgs } from '../../assets/svg';
import Header from '../../components/header';
import SPImages from '../../assets/images';
import SPIcons from '../../assets/icon';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { handleError } from '../../utils/HandleError';
import { apiGetGiftShopExchanges } from '../../api/RestAPI';
import SPLoading from '../../components/SPLoading';
import ListEmptyView from '../../components/ListEmptyView';
import Utils from '../../utils/Utils';

// 교환 내역 페이지
function PointExchange() {
  /**
   * state
   */
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStartDate, setIsStartDate] = useState(true); // 시작일과 마감일을 구분하는 상태
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().toDate());
  const [startDate, setStartDate] = useState(moment().format('YYYY.MM.DD')); // Start date state
  const [endDate, setEndDate] = useState(moment().format('YYYY.MM.DD')); // End date state

  //   정렬 순서
  const sortOptions = [
    { value: 'aDay', label: '1일' },
    { value: 'aWeek', label: '1주일' },
    { value: 'aMonth', label: '1개월' },
    { value: 'threeMonth', label: '3개월' },
    { value: 'sixMonth', label: '6개월' },
    { value: 'self', label: '직접설정' },
  ];
  const [selectedOption, setSelectedOption] = useState(sortOptions[3]); // 기본 디폴트값 설정
  const [selectedStartDate, setSelectedStartDate] = useState(
    moment().subtract(3, 'months').format('YYYY.MM.DD'),
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    moment().format('YYYY.MM.DD'),
  );
  const [selectedDateOption, setSelectedDateOption] = useState(sortOptions[3]);

  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(100);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCnt, setTotalCnt] = useState(0);

  /**
   * api
   */

  const getExchangeHistory = async () => {
    try {
      const params = {
        page,
        size,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
      };
      const { data } = await apiGetGiftShopExchanges(params);
      if (data.data?.list && Array.isArray(data.data?.list)) {
        setIsLast(data.data?.isLast);
        setTotalCnt(data.data?.totalCnt);
        if (page === 1) {
          setList(data.data.list);
        } else {
          setList(prev => [...prev, ...data.data.list]);
        }
      }
    } catch (error) {
      handleError(error);
    }
    setRefreshing(false);
    setLoading(false);
  };

  /**
   * function
   */
  const openModal = () => {
    setSelectedOption(selectedDateOption);
    if (selectedDateOption.value === 'self') {
      setStartDate(selectedStartDate);
      setEndDate(selectedEndDate);
    }
    setIsModalVisible(true);
  };
  const handleSelectDateOption = () => {
    switch (selectedOption.value) {
      case 'aDay': {
        setSelectedStartDate(moment().format('YYYY.MM.DD'));
        setSelectedEndDate(moment().format('YYYY.MM.DD'));
        break;
      }
      case 'aWeek': {
        setSelectedStartDate(moment().subtract(6, 'days').format('YYYY.MM.DD'));
        setSelectedEndDate(moment().format('YYYY.MM.DD'));
        break;
      }
      case 'aMonth': {
        setSelectedStartDate(
          moment().subtract(1, 'months').format('YYYY.MM.DD'),
        );
        setSelectedEndDate(moment().format('YYYY.MM.DD'));
        break;
      }
      case 'threeMonth': {
        setSelectedStartDate(
          moment().subtract(3, 'months').format('YYYY.MM.DD'),
        );
        setSelectedEndDate(moment().format('YYYY.MM.DD'));
        break;
      }
      case 'sixMonth': {
        setSelectedStartDate(
          moment().subtract(6, 'months').format('YYYY.MM.DD'),
        );
        setSelectedEndDate(moment().format('YYYY.MM.DD'));
        break;
      }
      default: {
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
      }
    }
    setSelectedDateOption(selectedOption);
    setIsModalVisible(false);
  };

  const handleSelectOption = option => {
    if (option.value === 'self') {
      setStartDate(moment().format('YYYY.MM.DD'));
      setEndDate(moment().format('YYYY.MM.DD'));
    }
    setSelectedOption(option);
    setIsModalVisible(true);
  };

  const handleSelectDate = date => {
    if (isStartDate) {
      setStartDate(moment(date).format('YYYY.MM.DD'));
    } else {
      setEndDate(moment(date).format('YYYY.MM.DD'));
    }
    setShowFullCalendar(false);
  };

  const handleArrowPress = direction => {
    const currentSelectedDate = new Date(selectedDate);
    const newDate =
      direction === 'left'
        ? format(addMonths(currentSelectedDate, -1), 'yyyy-MM-dd')
        : format(addMonths(currentSelectedDate, 1), 'yyyy-MM-dd');
    setSelectedDate(newDate);
  };

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setIsLast(false);
    setPage(1);
    setList([]);
    setRefreshing(true);
  }, []);

  const loadMoreProjects = () => {
    if (!isLast && list.length > 0) {
      setTimeout(() => {
        setPage(prevPage => prevPage + 1);
      }, 0);
    }
  };

  /**
   * useEffect
   */
  useEffect(() => {
    onRefresh();
  }, [selectedDateOption]);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getExchangeHistory();
    }
  }, [page, refreshing]);
  /**
   * render
   */
  const renderCustomHeader = () => {
    const header = format(new Date(selectedDate), 'yyyy.MM', { locale: ko });

    return (
      <View style={styles.customHeaderContainer}>
        <TouchableOpacity onPress={() => handleArrowPress('left')}>
          <Image source={SPIcons.icArrowLeft} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.customHeaderText}>{header}</Text>
        <TouchableOpacity onPress={() => handleArrowPress('right')}>
          <Image source={SPIcons.icArrowRight} style={styles.icon} />
        </TouchableOpacity>
      </View>
    );
  };

  // 교환 내역 리스트
  const renderItem = ({ item, index }) => {
    const showDate =
      index > 0
        ? moment(item.regDate).format('YYYY.MM.DD(ddd)') !==
          moment(list[index - 1].regDate).format('YYYY.MM.DD(ddd)')
        : true;
    return (
      <View>
        {showDate && (
          <View style={styles.mainDate}>
            <Text style={styles.mainDateText}>
              {moment(item.regDate).format('YYYY.MM.DD(ddd)')}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.productBox, !showDate && styles.productBoxWithBorder]}
          onPress={() => {
            if (item.itemShowYn === 'N' || item.itemDelDate !== null) {
              Utils.openModal({
                body: '이 상품은 현재 존재하지 않습니다.',
              });
              return; // 클릭 이벤트 더 이상 처리하지 않음
            }

            NavigationService.navigate(navName.pointProductDetail, {
              fromHistory: true,
              itemIdx: item.itemIdx,
            });
          }}>
          <View style={styles.imageBox}>
            {item.imagePath && (
              <Image source={{ uri: item.imagePath }} style={styles.image} />
            )}
          </View>
          <View style={styles.productDetailBox}>
            <Text style={styles.productCompany}>{item.brandName}</Text>
            <Text style={styles.productTitle}>{item.itemName}</Text>
            <View style={styles.productPoint}>
              <SPSvgs.SocialToken width={20} height={20} />
              <Text style={styles.productPointText}>
                {Utils.changeNumberComma(item.itemPrice || 0)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="교환 내역" />

      <View style={styles.selectBox}>
        <Pressable
          hitSlop={{
            top: 12,
            bottom: 12,
            left: 12,
            right: 12,
          }}
          activeOpacity={ACTIVE_OPACITY}
          style={styles.contentsBtn}
          onPress={openModal}>
          <Text style={styles.contentsText}>
            {selectedDateOption.value === 'self'
              ? `${startDate} ~ ${endDate}`
              : selectedDateOption.label}
          </Text>
          <SPSvgs.ArrowDown />
        </Pressable>
      </View>

      {/* 교환 내역이 없을 경우 */}
      {list.length > 0 ? (
        <View style={{ flex: 1 }}>
          <FlatList
            key={loading ? 'loading' : 'loaded'}
            showsVerticalScrollIndicator={false}
            data={list}
            renderItem={renderItem}
            contentContainerStyle={[list?.length === 0 && { flex: 1 }]}
            onEndReached={loadMoreProjects}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      ) : loading ? (
        <SPLoading />
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>교환 내역이 없습니다.</Text>
          <Text style={styles.emptyText}>
            포인트로 원하는 쿠폰을 교환해 보세요!
          </Text>
        </View>
      )}

      {/* 날짜선택 모달 */}
      <Modal
        animationType="fade"
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
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => {
              e.stopPropagation();
            }}>
            <View
              style={{
                width: '100%',
                minHeight: '40%',
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 16,
              }}>
              {/* 날짜 선택 모달 */}
              <View style={styles.modalTitleBox}>
                <Text style={styles.modalTitle}>날짜 선택</Text>
                <Pressable onPress={() => setIsModalVisible(false)}>
                  <SPSvgs.Close width={24} height={24} />
                </Pressable>
              </View>

              <Text style={(styles.modalText, { paddingVertical: 8 })}>
                기간 선택
              </Text>

              {/* 정렬 옵션 버튼들 */}
              <View style={styles.monthList}>
                {sortOptions.map((option, index) => (
                  <TouchableOpacity
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={index}
                    style={[
                      styles.monthItem,
                      selectedOption.value === option.value &&
                        styles.selectedMonth,
                    ]}
                    onPress={() => {
                      handleSelectOption(option);
                    }}>
                    <Text
                      style={[
                        styles.monthText,
                        selectedOption.value === option.value &&
                          styles.selectedMonthText,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 날짜 선택 부분, '직접설정'일 때만 보이게 설정 */}
              {selectedOption.value === 'self' && (
                <View style={styles.dateBox}>
                  <TouchableOpacity
                    style={styles.dateBtn}
                    onPress={() => {
                      setIsStartDate(true); // 시작일 버튼 클릭 시
                      setShowFullCalendar(true); // 달력 모달 열기
                    }}>
                    <Text style={styles.contentBtnText}>{startDate}</Text>
                    <SPSvgs.Calendar width={20} height={20} />
                  </TouchableOpacity>

                  <Text>-</Text>

                  {/* 마감일 버튼 */}
                  <TouchableOpacity
                    style={
                      (styles.dateBtn,
                      {
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        columnGap: 24,
                      })
                    }
                    onPress={() => {
                      setIsStartDate(false); // 마감일 버튼 클릭 시
                      setShowFullCalendar(true); // 달력 모달 열기
                    }}>
                    <Text style={styles.contentBtnText}>{endDate}</Text>
                    <SPSvgs.Calendar width={20} height={20} />
                  </TouchableOpacity>
                </View>
              )}

              {/* 달력 모달 */}
              {showFullCalendar && (
                <Modal
                  transparent={true}
                  visible={showFullCalendar}
                  onRequestClose={() => setShowFullCalendar(false)}>
                  <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setShowFullCalendar(false)}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalTitle}>
                        <Text style={styles.modalTitleText}>
                          날짜를 선택해주세요.
                        </Text>
                      </View>
                      {renderCustomHeader()}
                      <View style={styles.calendar}>
                        <Calendar
                          key={selectedDate}
                          current={moment(selectedDate).format('YYYY-MM-DD')}
                          onDayPress={day => handleSelectDate(day.dateString)}
                          markedDates={{
                            [selectedDate]: { selected: true },
                          }}
                          hideArrows={true}
                          renderHeader={() => null}
                          // minDate={moment().toDate()}
                          theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            selectedDayTextColor: '#ffffff',
                            selectedDayBackgroundColor: '#FF7C10',
                            todayTextColor: '#FF7C10',
                            arrowColor: 'black',
                            dayTextColor: '#1A1C1E',
                            textDisabledColor: 'rgba(46, 49, 53, 0.16)',
                            textDayFontWeight: '500',
                          }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}

              <View style={styles.appealBox}>
                <TouchableOpacity
                  style={styles.appealBtn}
                  onPress={handleSelectDateOption}>
                  <Text style={styles.appealBtnText}>조회</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default memo(PointExchange);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentsText: {
    fontSize: 13,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  mainDate: {
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mainDateText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  productGroup: {
    paddingHorizontal: 16,
  },
  productBox: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    padding: 16,
  },
  productBoxWithBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(135, 141, 150, 0.22)',
  },
  imageBox: {
    width: 76,
    height: 76,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  productDetailBox: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    rowGap: 4,
  },
  productCompany: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  productPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  productPointText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#000',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  modalTitleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  monthList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -10,
    marginVertical: -8,
    columnGap: 8,
    paddingBottom: 16,
  },
  monthItem: {
    borderWidth: 1,
    borderColor: '#878D9638',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 0,
    // marginHorizontal: 4,
    marginVertical: 8,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMonth: {
    backgroundColor: '#FF7C10',
  },
  selectedMonthText: {
    color: '#fff',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  dateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 24,
  },
  contentBtnText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#4C4A4F',
    lineHeight: 20,
    letterSpacing: 0.203,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    textAlign: 'left',
  },
  calendar: {
    width: '100%',
  },
  customHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingTop: 32,
    marginBottom: 9,
  },
  customHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
});
