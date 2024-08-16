import moment from 'moment';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiCityList,
  apiGetAcademyConfigMngRecruits,
  apiGuList,
  apiPostAcademyOpenRecruit,
} from '../../api/RestAPI';
import { MATCH_GENDER } from '../../common/constants/matchGender';
import { navName } from '../../common/constants/navName';
import { RECRUIT_PAGE_TYPE } from '../../common/constants/recruitPageType';
import SPLoading from '../../components/SPLoading';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import { IS_YN } from '../../common/constants/isYN';
import fontStyles from '../../styles/fontStyles';
import SPIcons from '../../assets/icon';
import GeoLocationUtils from '../../utils/GeoLocationUtils';
import { useDispatch, useSelector } from 'react-redux';
import { academyRecruitmentListAction } from '../../redux/reducers/list/academyRecruitmentListSlice';
import { store } from '../../redux/store';

function AcademyRecruitment({ route }) {
  const dispatch = useDispatch();
  /**
   * state
   */
  const listName = 'academyRecruitmentList';
  const {
    page,
    list: academyRecruitList,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const action = academyRecruitmentListAction;
  const noParamReset = route?.params?.noParamReset;

  const pageType = route.params?.pageType; // ALL, ACADEMY, MANAGEMENT
  const academyIdx = route.params?.academyIdx;

  // modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedJoinIdx, setSelectedJoinIdx] = useState();
  const [cityListVisible, setCityListVisible] = useState(false);
  const [guListVisible, setGuListVisible] = useState(false);

  const [cityList, setCityList] = useState([{ id: 0, label: '전체' }]);
  const [guList, setGuList] = useState([{ id: 0, label: '전체' }]);
  const [itemsToDisplay, setItemsToDisplay] = useState([]);

  const flatListRef = useRef();
  const [size, setSize] = useState(30);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedGu, setSelectedGu] = useState(null);

  // 'N' 항목들을 먼저 정렬
  const closeYNItemsN = academyRecruitList.filter(item => item.closeYn === 'N');

  // 'Y' 항목들을 그 다음에 정렬
  const closeYNItemsY = academyRecruitList.filter(item => item.closeYn === 'Y');

  // 'N' 항목들을 먼저, 그 다음에 'Y' 항목들을 추가하여 순서를 조정
  const sortedAcademyRecruitList = [...closeYNItemsN, ...closeYNItemsY];
  // 가입신청 회원 임시
  const openRejectModal = idx => {
    setSelectedJoinIdx(idx);
    setRejectModalVisible(true);
  };

  const openConfirmModal = idx => {
    setSelectedJoinIdx(idx);
    setConfirmModalVisible(true);
  };

  /**
   * api
   */
  const getRecruitList = async () => {
    try {
      const params = {
        page,
        size,
      };
      let data = null;
      switch (pageType) {
        case RECRUIT_PAGE_TYPE.ALL: {
          params.addrCity = selectedCity;
          params.addrGu = selectedGu;
          const response = await apiPostAcademyOpenRecruit(params);
          data = response.data;
          break;
        }
        case RECRUIT_PAGE_TYPE.ACADEMY: {
          params.academyIdx = academyIdx;
          const response = await apiPostAcademyOpenRecruit(params);
          data = response.data;
          break;
        }
        case RECRUIT_PAGE_TYPE.MANAGEMENT: {
          const response = await apiGetAcademyConfigMngRecruits(params);
          data = response.data;
          break;
        }
        default:
          break;
      }
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    }
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
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
      }
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * function
   */
  const checkRecruitEndRender = item => {
    if (item.closeYn === IS_YN.Y || item.dday < 0) {
      return (
        <View style={[styles.recruitEndBox, { alignSelf: 'flex-start' }]}>
          <Text style={styles.recruitEndText}>모집종료</Text>
        </View>
      );
    }
    return (
      <View style={[styles.recruitingBox, { alignSelf: 'flex-start' }]}>
        <Text style={styles.recruitingText}>모집중</Text>
      </View>
    );
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

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[listName].page;
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

  const getLocation = async () => {
    try {
      const { latitude, longitude } = await GeoLocationUtils.getLocation(false);
      const resultAddr = await GeoLocationUtils.getAddress({
        latitude,
        longitude,
      });

      if (resultAddr) {
        const { city: addrCity, gu: addrGu } = resultAddr;
        setSelectedCity(addrCity ?? '');
        setSelectedGu(addrGu ?? '');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const onFocus = async () => {
    try {
      if (!noParamReset) {
        dispatch(action.reset());
        NavigationService.replace(navName.academyRecruitment, {
          ...(route?.params ?? {}),
          noParamReset: true,
        });
      } else {
        if (pageType === RECRUIT_PAGE_TYPE.ALL) {
          await getLocation();
          await getCityList();
        }
        onRefresh();
      }
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * useEffect
   */

  useEffect(() => {
    onFocus();
  }, [noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if (refreshing || (!refreshing && page > 1)) {
        getRecruitList();
      }
    }
  }, [page, refreshing]);

  useEffect(() => {
    if (noParamReset) {
      if (pageType === RECRUIT_PAGE_TYPE.ALL && selectedCity) {
        getGuList(selectedCity);
      }
    }
  }, [selectedCity, noParamReset]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="아카데미 회원 모집" />

      <View style={styles.recruitmentContainer}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
          {pageType === RECRUIT_PAGE_TYPE.ALL && (
            <View style={{ flexDirection: 'column', paddingBottom: 16 }}>
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
                {selectedCity !== '세종특별자치시' && selectedCity && (
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
          )}

          {academyRecruitList && academyRecruitList.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={sortedAcademyRecruitList}
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator
                    size="small"
                    style={{ marginVertical: 20 }}
                  />
                ) : null
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onEndReached={() => {
                loadMoreProjects();
              }}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    NavigationService.navigate(
                      navName.academyRecruitmentDetail,
                      { recruitIdx: item.recruitIdx },
                    );
                  }}>
                  <View
                    style={[
                      styles.recruitmentBox,
                      {
                        borderTopWidth: index > 0 ? 1 : 0,
                        borderTopColor: 'rgba(135, 141, 150, 0.22)',
                        paddingTop:
                          pageType === RECRUIT_PAGE_TYPE.ALL
                            ? index > 0
                              ? 16
                              : 0
                            : 16,
                      },
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={[
                          styles.recruitmentGender,
                          { alignSelf: 'flex-start' },
                        ]}>
                        <Text style={styles.recruitmentGenderText}>
                          {MATCH_GENDER[item?.genderCode]?.desc}
                        </Text>
                      </View>
                      {checkRecruitEndRender(item)}
                    </View>
                    <Text style={styles.recruitmentTitle}>{item.title}</Text>
                    <View style={styles.recruitmentTextBox}>
                      <View>
                        <Text style={styles.recruitmentText}>
                          {item.academyName}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}>
                        <Text style={styles.recruitmentText}>{`${
                          item.addrCity
                        } ${item.addrGu ? '・' : ''} ${item.addrGu}`}</Text>
                        <View style={styles.VerticalLine} />
                        <Text style={styles.recruitmentText}>
                          {moment(item.startDate).format('YYYY.MM.DD')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
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
              <Text style={styles.noneText}>모집 내역이 없습니다.</Text>
            </View>
          )}
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
                  key={index}
                  onPress={() => handleSelectGu(item.code)}>
                  <Text style={styles.modalText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default memo(AcademyRecruitment);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  recruitmentContainer: {
    flex: 1,
    // paddingHorizontal: 16,
    // paddingTop: 24,
    paddingBottom: 8,
  },
  recruitmentBox: {
    flex: 1,
    gap: 8,
    paddingVertical: 16,
  },
  recruitmentGender: {
    backgroundColor: 'rgba(0, 38, 114, 0.10)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitmentGenderText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  recruitmentTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  recruitmentTextBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  recruitmentText: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  VerticalLine: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabButtonBox: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FB8225',
  },
  activeTabText: {
    color: '#FF7C10',
  },
  joinList: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  joinListTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  joinListTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  joinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinDetailTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  recruitEndBox: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitEndText: {
    ...fontStyles.fontSize11_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  recruitingBox: {
    borderWidth: 1,
    backgroundColor: 'rgba(255, 124, 16, 0.15)',
    borderColor: 'transparent',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitingText: {
    ...fontStyles.fontSize11_Semibold,
    color: '#FF7C10',
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  modalText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
    paddingVertical: 16,
  },
};
