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
import SPIcons from '../../../assets/icon';
import { navName } from '../../../common/constants/navName';
import ListEmptyView from '../../../components/ListEmptyView';
import NavigationService from '../../../navigation/NavigationService';
import { apiGetPlaygroundList, apiGuList } from '../../../api/RestAPI';
import { handleError } from '../../../utils/HandleError';
import SPLoading from '../../../components/SPLoading';

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

function Playground({ lat, lng, initCity, cityList }) {
  /**
   * state
   */
  const flatListRef = useRef();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [playgroundTotalCnt, setPlaygroundTotalCnt] = useState();
  const [playgroundIsLast, setPlaygroundIsLast] = useState(false);
  const [playgroundPage, setPlaygroundPage] = useState(1);
  const [playgroundList, setPlaygroundList] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 드롭다운 리스트
  const [guList, setGuList] = useState([{ id: 0, label: '전체' }]);
  const [itemsToDisplay, setItemsToDisplay] = useState([]);

  // 드롭다운 on/off
  const [cityListVisible, setCityListVisible] = useState(false);
  const [guListVisible, setGuListVisible] = useState(false);

  // 선택된 값
  const [selectedCity, setSelectedCity] = useState(initCity || null);
  const [selectedGu, setSelectedGu] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 2;
  const maxYear = currentYear + 2;

  /**
   * api
   */
  const getPlaygroundList = async () => {
    try {
      const param = {
        size: 30,
        page: playgroundPage,
        addrCity: selectedCity,
        addrGu: selectedGu,
        latitude: lat,
        longitude: lng,
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
      if (!playgroundIsLast && playgroundList?.length > 0) {
        setPlaygroundPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const onRefresh = async () => {
    setLoading(true);
    setPlaygroundIsLast(false);
    setPlaygroundPage(1);
    setPlaygroundList([]);
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
    if (selectedDate && (refreshing || (!refreshing && playgroundPage > 1))) {
      getPlaygroundList();
    }
  }, [playgroundPage, refreshing, playgroundPage]);

  return (
    <View style={{ flex: 1 }}>
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
          <Text style={styles.playgroundCountText}>개의 구장이 있어요</Text>
        </View>
        <View style={{ flex: 1 }}>
          <FlatList
            key={loading ? 'loading' : 'loaded'}
            ref={flatListRef}
            data={playgroundList}
            contentContainerStyle={[
              { gap: 12 },
              playgroundList?.length === 0 && { flex: 1 },
            ]}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreProjects}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => {
              return <PlaygroundBox item={item} />;
            }}
            ListEmptyComponent={
              loading ? (
                <View style={{ flex: 1 }}>
                  <SPLoading />
                </View>
              ) : (
                <ListEmptyView
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  text="구장이 없습니다"
                />
              )
            }
          />
        </View>
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

export default memo(Playground);

// --------------------------------------------------
// [ Component ]
// --------------------------------------------------
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
