import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { apiGetSearchOpenAcademy } from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { ORDER_TYPE } from '../../common/constants/orderType';
import BoxSelect from '../../components/BoxSelect';
import Divider from '../../components/Divider';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPMap from '../../components/SPMap';
import { SPToast } from '../../components/SPToast';
import Header from '../../components/header';
import AcademyFilter from '../../components/search-academy/AcademyFilter';
import AcademyItem from '../../components/search-academy/AcademyItem';
import AddressFilter from '../../components/search-academy/AddressFilter';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import GeoLocationUtils from '../../utils/GeoLocationUtils';
import { handleError } from '../../utils/HandleError';
import { uniqBy } from 'lodash';
import { useFocusEffect } from '@react-navigation/native';
import SPLoading from '../../components/SPLoading';
import { SafeAreaView } from 'react-native-safe-area-context';

function SearchAcademy() {
  const flatListRef = useRef();
  const addressFilterRef = useRef();
  const academyFilterRef = useRef();

  const [mapSearch, setMapSearch] = useState(true);
  const [orderType, setOrderType] = useState(ORDER_TYPE.RATING_DESC);
  const [keyword, setKeyword] = useState('');
  const [center, setCenter] = useState(null);
  const [searchedCity, setSearchedCity] = useState('');
  const [searchedGu, setSearchedGu] = useState('');
  const [searchedDong, setSearchedDong] = useState('');
  const [searchedClassType, setSearchedClassType] = useState([]);
  const [searchedTeachingType, setSearchedTeachingType] = useState([]);
  const [searchedServiceType, setSearchedServiceType] = useState([]);
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [isLast, setIsLast] = useState(false);
  const [academyList, setAcademyList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAcademyList = async () => {
    try {
      const params = {
        page: mapSearch ? 1 : page,
        size: mapSearch ? 10000 : 30,
        addrCity: searchedCity,
        addrGu: searchedGu,
        addrDong: searchedDong,
        keyword: searchedKeyword,
        filters: [
          ...searchedClassType,
          ...searchedTeachingType,
          ...searchedServiceType,
        ],
        orderType,
      };

      const { data } = await apiGetSearchOpenAcademy(params);

      setIsLast(data.data.isLast);
      if (page === 1) {
        setAcademyList(data.data.list);
      } else {
        setAcademyList(prev =>
          uniqBy([...prev, ...data.data.list], 'academyIdx'),
        );
      }
      if (mapSearch) {
        if (data.data.list?.length > 0) {
          setCenter({
            latitude: data.data.list[0].latitude,
            longitude: data.data.list[0].longitude,
          });
        } else {
          SPToast.show({ text: '검색된 아카데미가 존재하지 않습니다.' });
        }
      }
    } catch (error) {
      handleError(error);
      setAcademyList([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onLoadMore = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const onRefresh = async () => {
    if (!mapSearch && flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    setPage(1);
    setAcademyList([]);
    setLoading(true);
    setIsLast(false);
    setRefreshing(true);
  };

  const onFocus = async () => {
    try {
      const { latitude, longitude } = await GeoLocationUtils.getLocation();
      setCenter({ latitude, longitude });
      const resultAddr = await GeoLocationUtils.getAddress({
        latitude,
        longitude,
      });

      if (resultAddr) {
        const { city: addrCity, gu: addrGu, dong: addrDong } = resultAddr;
        setSearchedCity(addrCity ?? '');
        setSearchedGu(addrGu ?? '');
        // setSearchedDong(addrDong ?? '');
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  useEffect(() => {
    onFocus();
    return () => {
      setIsFocus(true);
    };
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     return () => {
  //       setIsFocus(true);
  //     };
  //   }, []),
  // );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus) {
        onRefresh();
      }
    }, [searched, orderType, isFocus, mapSearch]),
  );

  useEffect(() => {
    if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
      getAcademyList();
    }
  }, [page, isFocus, refreshing]);

  const renderMapView = useMemo(() => {
    return (
      center && <SPMap hideMyLocation data={academyList} center={center} />
    );
  }, [academyList, center]);

  const renderAcademyItem = useCallback(({ item }) => {
    return <AcademyItem item={item} />;
  }, []);

  const renderListView = useMemo(() => {
    return (
      <View style={styles.container}>
        <View style={styles.sortWrapper}>
          <Pressable
            onPress={async () => {
              setOrderType(ORDER_TYPE.RATING_DESC);
            }}>
            <Text
              style={[
                styles.sortText,
                orderType === ORDER_TYPE.RATING_DESC && {
                  color: COLORS.darkBlue,
                },
              ]}>
              평점순
            </Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              setOrderType(ORDER_TYPE.REVIEW_CNT_DESC);
            }}>
            <Text
              style={[
                styles.sortText,
                orderType === ORDER_TYPE.REVIEW_CNT_DESC && {
                  color: COLORS.darkBlue,
                },
              ]}>
              리뷰순
            </Text>
          </Pressable>
        </View>

        {academyList && academyList.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={academyList}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            onRefresh={onRefresh}
            refreshing={refreshing}
            renderItem={renderAcademyItem}
            keyExtractor={item => item?.academyIdx}
            contentContainerStyle={styles.listContent}
          />
        ) : loading ? (
          <SPLoading />
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>내역이 존재하지 않습니다.</Text>
          </View>
        )}
      </View>
    );
  }, [academyList, orderType, onLoadMore, onRefresh, refreshing, loading]);

  const renderContent = useMemo(() => {
    if (mapSearch) {
      return renderMapView;
    }
    return renderListView;
  }, [mapSearch, renderMapView, renderListView]);

  const renderFilter = useMemo(() => {
    return (
      <View>
        <View style={styles.filterWrapper}>
          <BoxSelect
            containerStyle={styles.filterButton}
            boxStyle={{
              height: 32,
              paddingHorizontal: 6,
            }}
            placeholder={
              searchedCity
                ? `${searchedCity}${searchedGu ? ` ${searchedGu}` : ''}${
                    searchedDong ? ` ${searchedDong}` : ''
                  }`
                : '위치 검색'
            }
            onPressBox={() => {
              addressFilterRef?.current?.show();
            }}
          />

          <Pressable
            hitSlop={{
              top: 8,
              bottom: 8,
              left: 7,
              right: 7,
            }}
            onPress={() => {
              academyFilterRef?.current?.show();
            }}
            style={styles.rightFilterButton}>
            <SPSvgs.Filter />
          </Pressable>
        </View>

        <Divider />
      </View>
    );
  }, [searchedCity, searchedGu, searchedDong]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header
        headerType="SEARCH"
        placeholder="아카데미를 검색하세요"
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={() => {
          setSearchedKeyword(keyword);
          setSearched(prev => !prev);
        }}
      />

      {renderFilter}

      {renderContent}

      {/* Change map/list */}
      <PrimaryButton
        onPress={async () => {
          setMapSearch(!mapSearch);
        }}
        text={mapSearch ? '목록보기' : '지도보기'}
        buttonStyle={styles.changeModeButton}
      />

      {/* Address Filter */}
      <AddressFilter
        ref={addressFilterRef}
        city={searchedCity}
        gu={searchedGu}
        dong={searchedDong}
        onAddressFilterSubmit={async values => {
          setSearchedCity(values?.city ?? '');
          setSearchedGu(values?.gu ?? '');
          setSearchedDong(values?.dong ?? '');
          setSearched(prev => !prev);
        }}
      />

      {/* Academy Filter */}
      <AcademyFilter
        ref={academyFilterRef}
        classType={searchedClassType}
        teachingType={searchedTeachingType}
        serviceType={searchedServiceType}
        onAcademyFilterSubmit={async values => {
          setSearchedClassType(values?.classType ?? []);
          setSearchedTeachingType(values?.teachingType ?? []);
          setSearchedServiceType(values?.serviceType ?? []);
          setSearched(prev => !prev);
        }}
      />
    </SafeAreaView>
  );
}

export default memo(SearchAcademy);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 16,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  filterButton: {
    maxWidth: 300,
    flexGrow: 0,
    paddingVertical: 8,
  },
  rightFilterButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.lineBorder,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 7,
    marginVertical: 8,
  },
  changeModeButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 93,
    bottom: 24,
  },
  listContent: {
    rowGap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  sortWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sortText: {
    ...fontStyles.fontSize14_Semibold,
    lineHeight: 20,
    letterSpacing: 0.203,
    color: COLORS.labelDisable,
  },
});
