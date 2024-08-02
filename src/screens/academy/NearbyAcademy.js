/* eslint-disable react/no-unstable-nested-components */
import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { apiGetAcademyNearby, apiGetAcdmyFilters } from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { IS_YN } from '../../common/constants/isYN';
import { navName } from '../../common/constants/navName';
import { ORDER_TYPE } from '../../common/constants/orderType';
import SPHeader from '../../components/SPHeader';
import SPLoading from '../../components/SPLoading';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import GeoLocationUtils from '../../utils/GeoLocationUtils';
import { handleError } from '../../utils/HandleError';
import { useDispatch, useSelector } from 'react-redux';
import { communityListAction } from '../../redux/reducers/list/communityListSlice';
import { store } from '../../redux/store';
import { nearbyAcademyListAction } from '../../redux/reducers/list/nearbyAcademyListSlice';

function NearbyAcademy({ route }) {
  const dispatch = useDispatch();
  /**
   * state
   */
  const {
    page,
    list: academyList,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector.nearbyAcademyList);
  const action = nearbyAcademyListAction;
  const noParamReset = route?.params?.noParamReset;
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();
  const [orderType, setOrderType] = useState(ORDER_TYPE.RATING_DESC);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();

  // 클래스
  const [classTypeList, setClassTypeList] = useState([]);
  const [selectedClassType, setSelectedClassType] = useState({});
  // 수업방식
  const [teachingTypeList, setTeachingTypeList] = useState([]);
  const [selectedTeachingType, setSelectedTeachingType] = useState({});
  // 서비스
  const [serviceTypeList, setServiceTypeList] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState({});

  // searched
  const [searchedClassType, setSearchedClassType] = useState({});
  const [searchedTeachingType, setSearchedTeachingType] = useState({});
  const [searchedServiceType, setSearchedServiceType] = useState({});
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState([]);

  // list
  const [size, setSize] = useState(30);
  const [isFocus, setIsFocus] = useState(true);

  // 필터 모달
  const [showModal, setShowModal] = useState(false);

  /**
   * api
   */
  const getAcademyFilterList = async () => {
    try {
      const { data } = await apiGetAcdmyFilters();
      if (data.data) {
        const { CLASS, METHOD, SERVICE } = data.data;
        if (CLASS && CLASS.length > 0) {
          const list = CLASS.filter(v => !v.codeSub.includes('ETC')).map(v => {
            return { label: v.codeName, value: v.codeSub };
          });
          setClassTypeList(list.reverse());
        }
        if (METHOD && METHOD.length > 0) {
          const list = METHOD.filter(v => !v.codeSub.includes('ETC')).map(v => {
            return { label: v.codeName, value: v.codeSub };
          });
          setTeachingTypeList(list.reverse());
        }
        if (SERVICE && SERVICE.length > 0) {
          const list = SERVICE.filter(v => !v.codeSub.includes('ETC')).map(
            v => {
              return { label: v.codeName, value: v.codeSub };
            },
          );
          setServiceTypeList(list.reverse());
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getNearbyAcademy = async () => {
    try {
      const resultAddr = await GeoLocationUtils.getAddress({
        latitude,
        longitude,
      });
      if (resultAddr) {
        const { city, gu, dong } = resultAddr;
        setAddress(`${city} ${gu}`);
      }

      const params = {
        page,
        size,
        latitude,
        longitude,
        orderType,
        filters,
      };
      const { data } = await apiGetAcademyNearby(params);
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState().nearbyAcademyList.list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  /**
   * function
   */
  const openFileterModal = () => {
    setSelectedClassType(searchedClassType);
    setSelectedTeachingType(searchedTeachingType);
    setSelectedServiceType(searchedServiceType);
    setShowModal(true);
  };
  const filterReset = () => {
    setSelectedClassType({});
    setSelectedTeachingType({});
    setSelectedServiceType({});
  };

  const setFilterList = () => {
    const selectedClass = [];
    const selectedTeaching = [];
    const selectedService = [];
    Object.keys(searchedClassType).forEach(key => {
      if (searchedClassType[key]) {
        selectedClass.push(key);
      }
    });
    Object.keys(searchedTeachingType).forEach(key => {
      if (searchedTeachingType[key]) {
        selectedTeaching.push(key);
      }
    });
    Object.keys(searchedServiceType).forEach(key => {
      if (searchedServiceType[key]) {
        selectedService.push(key);
      }
    });
    setFilters([...selectedClass, ...selectedTeaching, ...selectedService]);
  };

  const searching = () => {
    setSearchedClassType(selectedClassType);
    setSearchedTeachingType(selectedTeachingType);
    setSearchedServiceType(selectedServiceType);
    setSearched(prev => !prev);
    modalHide();
  };

  const modalHide = () => {
    setShowModal(false);
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState().nearbyAcademyList.page;
        dispatch(action.setPage(prevPage + 1));
      }
    }, 0);
  };

  const onRefresh = async () => {
    // if (flatListRef.current) {
    //   flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    // }
    dispatch(action.refresh());
  };

  const onFocus = async () => {
    try {
      if (!noParamReset) {
        dispatch(action.reset());
        setLatitude();
        setLongitude();
        setIsFocus(true);
        NavigationService.replace(navName.nearbyAcademy, {
          noParamReset: true,
        });
        return;
      }
      const { latitude: lat, longitude: lng } =
        await GeoLocationUtils.getLocation();
      setLatitude(lat); // 35.179805
      setLongitude(lng); // 129.083557
      await getAcademyFilterList();
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      onFocus();
      return () => {};
    }, [noParamReset]),
  );

  useEffect(() => {
    if (!isFocus && noParamReset) {
      setFilterList();
      onRefresh();
    }
  }, [searched, orderType, isFocus]);

  useEffect(() => {
    if (noParamReset) {
      if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
        getNearbyAcademy();
      }
    }
  }, [page, isFocus, refreshing, noParamReset]);

  return (
    <SafeAreaView style={styles.container}>
      <SPHeader
        title="주변 아카데미"
        noLeftLogo
        rightBasicAddButton={SPIcons.icSearch}
        onPressAddRightIcon={() =>
          NavigationService.navigate(navName.searchAcademy)
        }
      />
      <View style={styles.contentsContainer}>
        <View style={[styles.topBox, { paddingVertical: 15 }]}>
          <Text style={styles.topText}>현재 지도 중심</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Image
              source={SPIcons.icMyLocation}
              style={{ height: 18, width: 18 }}
            />
            <Text style={[styles.topText, { color: 'rgba(46, 49, 53, 0.80)' }]}>
              {address}
            </Text>
          </View>
        </View>
        <View>
          <View style={styles.topBox}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
              <TouchableOpacity
                style={{ paddingVertical: 10, paddingHorizontal: 6 }}
                onPress={() => {
                  setTimeout(() => {
                    setOrderType(ORDER_TYPE.RATING_DESC);
                  }, 0);
                }}>
                <Text
                  style={[
                    styles.typeText,
                    {
                      color:
                        orderType === ORDER_TYPE.RATING_DESC
                          ? '#313779'
                          : 'rgba(46, 49, 53, 0.16)',
                    },
                  ]}>
                  평점순
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingVertical: 10, paddingHorizontal: 6 }}
                onPress={() => {
                  setTimeout(() => {
                    setOrderType(ORDER_TYPE.REVIEW_CNT_DESC);
                  }, 0);
                }}>
                <Text
                  style={[
                    styles.typeText,
                    {
                      color:
                        orderType === ORDER_TYPE.REVIEW_CNT_DESC
                          ? '#313779'
                          : 'rgba(46, 49, 53, 0.16)',
                    },
                  ]}>
                  리뷰순
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              hitSlop={12}
              onPress={() => {
                openFileterModal();
              }}>
              <Image
                source={SPIcons.icFilter}
                style={{ height: 24, width: 24 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        {academyList && academyList.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={academyList}
            contentContainerStyle={{ gap: 24 }}
            ListFooterComponent={
              loading
                ? () => {
                    return (
                      <ActivityIndicator
                        size="small"
                        style={{ marginVertical: 20 }}
                      />
                    );
                  }
                : null
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={() => {
              loadMoreProjects();
            }}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    NavigationService.navigate(navName.academyDetail, {
                      academyIdx: item.academyIdx,
                    });
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  <View
                    style={{
                      height: 40,
                      width: 40,
                      backgroundColor: COLORS.gray,
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}>
                    {item.logoPath ? (
                      <Image
                        source={{ uri: item.logoPath }}
                        style={{ height: 40, width: 40 }}
                      />
                    ) : (
                      <Image
                        source={SPIcons.icMyAcademy}
                        style={{ height: 40, width: 40 }}
                      />
                    )}
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <View style={styles.contentsTop}>
                      <Text style={styles.contentsTopText}>
                        {item.academyName}
                      </Text>
                      {item.certYn === IS_YN.Y && (
                        <View>
                          <Image source={SPIcons.icCheckBadge} />
                        </View>
                      )}
                    </View>
                    <View style={styles.contentsBottom}>
                      <Text style={styles.contentsBottomText}>
                        {item.addrCity} · {item.addrGu}
                      </Text>
                      <View style={styles.verticalLine} />
                      {item.rating !== null && (
                        <View style={styles.contentsBottomSub}>
                          <Image source={SPIcons.icStar} />
                          <Text style={styles.contentsBottomText}>
                            {parseFloat(item.rating).toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : loading ? (
          <SPLoading />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(46, 49, 53, 0.60)',
                lineHeight: 18,
                letterSpacing: 0.252,
                textAlign: 'center',
              }}>
              주변 아카데미가 없습니다.
            </Text>
          </View>
        )}
        <Modal
          style={{ flex: 1 }}
          transparent={false}
          animationType="slide"
          visible={showModal}
          onRequestClose={modalHide}>
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.background,
              paddingTop: insets.top,
            }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={modalHide}
                style={{
                  width: '100%',
                  height: 60,
                  paddingHorizontal: 14,
                  paddingVertical: 16,
                }}>
                <Image
                  source={SPIcons.icNavCancle}
                  style={[{ height: 28, width: 28 }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.subContainer}>
                <View style={{ gap: 4 }}>
                  <Text style={styles.subTitle}>클래스</Text>
                  <View
                    style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {classTypeList &&
                      classTypeList.length > 0 &&
                      classTypeList.map((item, index) => {
                        return (
                          <Pressable
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            key={index}
                            onPress={() => {
                              setSelectedClassType(prev => {
                                return {
                                  ...prev,
                                  [item.value]: !prev[item.value],
                                };
                              });
                            }}
                            style={[
                              styles.classTypeBtn,
                              {
                                backgroundColor: selectedClassType?.[item.value]
                                  ? '#FF671F'
                                  : 'rgba(135, 141, 150, 0.16)',
                                borderColor: selectedClassType?.[item.value]
                                  ? '#FF671F'
                                  : 'rgba(135, 141, 150, 0.16)',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.classTypeText,
                                {
                                  color: selectedClassType?.[item.value]
                                    ? COLORS.white
                                    : 'rgba(46, 49, 53, 0.60)',
                                },
                              ]}>
                              {item?.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.subTitle}>수업방식</Text>
                  <View
                    style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {teachingTypeList &&
                      teachingTypeList.length > 0 &&
                      teachingTypeList.map((item, index) => {
                        return (
                          <Pressable
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            key={index}
                            onPress={() => {
                              setSelectedTeachingType(prev => {
                                return {
                                  ...prev,
                                  [item.value]: !prev[item.value],
                                };
                              });
                            }}
                            style={[
                              styles.classTypeBtn,
                              {
                                backgroundColor: selectedTeachingType?.[
                                  item.value
                                ]
                                  ? '#FF671F'
                                  : 'rgba(135, 141, 150, 0.16)',
                                borderColor: selectedTeachingType?.[item.value]
                                  ? '#FF671F'
                                  : 'rgba(135, 141, 150, 0.16)',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.classTypeText,
                                {
                                  color: selectedTeachingType?.[item.value]
                                    ? COLORS.white
                                    : 'rgba(46, 49, 53, 0.60)',
                                },
                              ]}>
                              {item?.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.subTitle}>서비스</Text>
                  <View
                    style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {serviceTypeList &&
                      serviceTypeList.length > 0 &&
                      serviceTypeList.map((item, index) => {
                        return (
                          <Pressable
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            key={index}
                            onPress={() => {
                              setSelectedServiceType(prev => {
                                return {
                                  ...prev,
                                  [item.value]: !prev[item.value],
                                };
                              });
                            }}
                            style={[
                              styles.classTypeBtn,
                              {
                                backgroundColor: selectedServiceType?.[
                                  item.value
                                ]
                                  ? '#FF671F'
                                  : 'rgba(135, 141, 150, 0.16)',
                                borderColor: selectedServiceType?.[item.value]
                                  ? '#FF671F'
                                  : 'rgba(135, 141, 150, 0.16)',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.classTypeText,
                                {
                                  color: selectedServiceType?.[item.value]
                                    ? COLORS.white
                                    : 'rgba(46, 49, 53, 0.60)',
                                },
                              ]}>
                              {item?.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.subBtnBox}>
              <TouchableOpacity
                onPress={filterReset}
                style={styles.subResetBtn}>
                <Text style={styles.subResetText}>재설정</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={searching} style={styles.subResultBtn}>
                <Text style={styles.subResultText}>결과보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

export default memo(NearbyAcademy);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  topText: {
    fontSize: 12,
    fontWeight: 400,
    color: '#000',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contentsTopText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  contentsBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentsBottomText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  verticalLine: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
  },
  contentsBottomSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subContainer: {
    gap: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 4,
  },
  classTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  classTypeText: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  subBtnBox: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    gap: 8,
  },
  subResetBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  subResetText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  subResultBtn: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF671F',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  subResultText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
});
