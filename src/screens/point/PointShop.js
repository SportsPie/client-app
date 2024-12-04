import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { SPSvgs } from '../../assets/svg';
import Header from '../../components/header';
import SPImages from '../../assets/images';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import {
  apiGetGiftShopInit,
  apiGetGiftShopItemList,
  apiPatchGiftShopClickAds,
  apiPatchGiftShopShowAds,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import SPLoading from '../../components/SPLoading';
import ListEmptyView from '../../components/ListEmptyView';
import { ITEM_ORDER_TYPE } from '../../common/constants/ItemOrderType';
import { useFocusEffect } from '@react-navigation/native';

// 포인트샵 메인 페이지
function PointShop() {
  /**
   * state
   */
  const { width, height } = useWindowDimensions();
  const imageHeight = Math.max((width * 10) / 16, 225);
  const [methodModalVisible, setMethodModalVisible] = useState(false);
  const [point, setPoint] = useState(0);
  const [hasNew, setHasNew] = useState(false); // 신큐 쿠폰 (당일만 표시)
  const [hasExpiration, setHasExpiration] = useState(false); // 만료 예정 쿠폰 (10일 이내 표시)
  const [bannerList, setBannerList] = useState([]);

  //   정렬 순서
  const sortOptions = Object.values(ITEM_ORDER_TYPE).map(item => {
    return { value: item.code, label: item.desc };
  });
  const [selectedOrderType, setSelectedOrderType] = useState(sortOptions[0]); // 기본 디폴트값 설정

  const [detailApiCalled, setDetailApiCalled] = useState(false);
  const [listApiCalled, setListApiCalled] = useState(false);
  const [bannerListUpdate, setBannerListUpdate] = useState(true);

  /**
   * api
   */
  const getPointShopMainInfo = async () => {
    try {
      const { data } = await apiGetGiftShopInit();
      setPoint(data.data?.balance || 0);
      setHasNew(data.data?.hasNew || false);
      setHasExpiration(data.data?.hasExpiration || false);
      if (bannerListUpdate) {
        setBannerList(data.data?.bannerList || []);
      }
    } catch (error) {
      handleError(error);
    }
    setDetailApiCalled(true);
  };

  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCnt, setTotalCnt] = useState(0);

  const getProductList = async () => {
    try {
      const params = {
        page,
        orderType: selectedOrderType?.value,
      };
      const { data } = await apiGetGiftShopItemList(params);
      if (
        data.data?.itemList?.list &&
        Array.isArray(data.data?.itemList?.list)
      ) {
        setIsLast(data.data?.itemList?.isLast);
        setTotalCnt(data.data?.itemList?.totalCnt);

        if (page === 1) {
          const itemList = [...data.data.itemList.list];
          if (data.data?.advertisement) {
            itemList.push({ advertisement: true, ...data.data.advertisement });
          }
          setList(itemList);
        } else {
          setList(prev => {
            const itemList = [...prev, ...data.data.itemList.list];
            if (data.data?.advertisement) {
              itemList.push({
                advertisement: true,
                ...data.data.advertisement,
              });
            }
            return itemList;
          });
        }
      }
    } catch (error) {
      handleError(error);
    }
    setRefreshing(false);
    setLoading(false);
    setListApiCalled(true);
  };

  const exposeAd = async adsIdx => {
    try {
      const { data } = await apiPatchGiftShopShowAds(adsIdx);
    } catch (error) {
      handleError(error);
    }
  };

  const clickAds = async adsIdx => {
    try {
      const { data } = await apiPatchGiftShopClickAds(adsIdx);
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * function
   */

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

  const handleSortSelect = type => {
    setSelectedOrderType(type);
    setMethodModalVisible(false); // 모달 닫기
  };

  const handleBannerClick = link => {
    Utils.openOrMoveUrl(link);
  };

  // 특정 항목이 화면에 보일 때 호출될 함수
  const exposeIdx = useRef();
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems, changed }) => {
      viewableItems.forEach(item => {
        if (item.item.advertisement && item.item.adsIdx !== exposeIdx.current) {
          exposeIdx.current = item.item.adsIdx;
          exposeAd(item.item.adsIdx);
        }
      });
    },
    [],
  );

  // onViewableItemsChanged의 속성 설정
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // 항목이 50% 이상 보일 때 콜백 실행
  });

  const handleAdClick = (link, idx) => {
    if (link) Utils.openOrMoveUrl(link);
    clickAds(idx);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getPointShopMainInfo();
      return () => {
        setBannerListUpdate(false);
      };
    }, [bannerListUpdate]),
  );

  useEffect(() => {
    onRefresh();
  }, [selectedOrderType]);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getProductList();
    }
  }, [page, refreshing]);

  /**
   * render
   */
  const renderHeader = useMemo(() => {
    return <Header title="포인트샵" closeIcon />;
  }, []);

  const renderListHeader = () => {
    return (
      <View showsVerticalScrollIndicator={false}>
        {/* 메인 이미지 */}
        <View style={styles.swiperBox}>
          <View style={{ height: imageHeight }}>
            {bannerList && bannerList.length > 0 ? (
              <Swiper
                style={{ height: imageHeight }}
                showsButtons={false}
                autoplay
                autoplayTimeout={5}
                scrollEventThrottle={16} // 스크롤 이벤트를 16ms 마다 처리
                decelerationRate="fast" // 스크롤 감속률을 빠르게 설정
                removeClippedSubviews={false}
                paginationStyle={{
                  justifyContent: 'flex-start',
                  position: 'absolute',
                  left: 16,
                  bottom: 36,
                  paddingVertical: 8,
                }}
                dotStyle={{
                  backgroundColor: '#FFF',
                  opacity: 0.4,
                  width: 12,
                  height: 3,
                  marginHorizontal: 2,
                  marginVertical: 2.5,
                }}
                activeDotStyle={{
                  backgroundColor: '#FFF',
                  width: 24,
                  height: 3,
                }}>
                {bannerList.map((img, index) => (
                  <Pressable
                    onPress={() => {
                      handleBannerClick(img.linkUrl);
                    }}
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={index}
                    style={[styles.slide, { height: imageHeight }]}>
                    <Image
                      source={{ uri: img.filePath }}
                      style={styles.image}
                    />
                  </Pressable>
                ))}
              </Swiper>
            ) : (
              <View style={[styles.slide, { height: imageHeight }]}>
                <Image source={SPImages.defaultPointImg} style={styles.image} />
              </View>
            )}
          </View>
        </View>

        {/* 사용 가능 포인트 */}
        <View style={styles.cardBox}>
          <View style={styles.card}>
            <View style={styles.topBox}>
              <Text style={styles.topTitle}>사용 가능 포인트</Text>
              <View style={styles.topRow}>
                <SPSvgs.SocialToken width={28} height={28} />
                <Text style={styles.topText}>
                  {point && Utils.changeNumberComma(point)}
                </Text>
              </View>
            </View>
            <View style={styles.bottomBox}>
              <View style={styles.bottomRow}>
                <Pressable
                  style={styles.bottomBtn}
                  onPress={() => {
                    NavigationService.navigate(navName.pointExchange);
                  }}>
                  <SPSvgs.Exchange />
                  <Text style={styles.bottomText}>교환 내역</Text>
                </Pressable>

                <View style={styles.centerLine} />

                <Pressable
                  style={styles.bottomBtn}
                  onPress={() => {
                    NavigationService.navigate(navName.pointMyCoupon);
                  }}>
                  <SPSvgs.Coupon />
                  <View style={styles.bottomIconBox}>
                    <Text style={styles.bottomText}>내 쿠폰함</Text>
                    {/* 신규 아이콘 */}
                    {hasNew && <SPSvgs.Created />}
                    {/* 만료예정 아이콘 */}
                    {hasExpiration && <SPSvgs.Expired />}
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* 전체 상품 리스트 */}
        <View style={styles.contentsContainer}>
          <View style={styles.contentsTop}>
            <Text style={styles.contentsText}>
              총 상품 {Utils.changeNumberComma(totalCnt)}개
            </Text>
            <Pressable
              hitSlop={{
                top: 12,
                bottom: 12,
                left: 12,
                right: 12,
              }}
              activeOpacity={ACTIVE_OPACITY}
              style={styles.contentsBtn}
              onPress={() => setMethodModalVisible(true)}>
              <Text style={styles.contentsText}>
                {selectedOrderType?.label}
              </Text>
              <SPSvgs.ArrowDown />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const needPlaceholder =
      isLast && list.length === index + 1 && list.length % 2 === 1;
    if (item.advertisement) {
      // 광고 항목 렌더링
      return (
        <>
          <Pressable
            style={[styles.productItem, { marginBottom: 16 }]}
            onPress={() => {
              handleAdClick(item.adsLink, item.adsIdx);
            }}>
            <View style={styles.productImageBox}>
              {item.imagePath && (
                <Image source={{ uri: item.imagePath }} style={styles.image} />
              )}
            </View>
            <View style={styles.productTextBox}>
              <View style={styles.adTitle}>
                <Text style={styles.productCompanyText}>
                  {item.companyName}
                </Text>
                <View style={styles.adBox}>
                  <Text style={styles.adText}>AD</Text>
                </View>
              </View>
              <Text
                style={styles.productPriceText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.adsContent}
              </Text>
              <Text style={styles.productPointText}>광고</Text>
            </View>
          </Pressable>
          {needPlaceholder && (
            <View style={[styles.productItem, { marginBottom: 16 }]} />
          )}
        </>
      );
    }

    const isBestItem = item.bestYn === 'Y';
    const { isNew } = item;

    // 그라디언트 색상 및 라벨 설정
    const gradientColors = isNew
      ? ['#FF7C10', '#F96C14'] // NEW 그라디언트 색상
      : ['#FD4545', '#F33131']; // 기본 색상 (BEST와 NEW 외의 일반 색상)

    const label = isNew ? 'NEW' : isBestItem ? 'BEST' : ''; // NEW와 BEST 라벨은 각각 그라디언트에 맞게 적용, 아니면 빈 문자열로 설정

    return (
      <>
        <Pressable
          style={[
            styles.productItem,
            {
              marginBottom: 16, // 아래쪽 여백
            },
          ]}
          onPress={() => {
            NavigationService.navigate(navName.pointProductDetail, {
              itemIdx: item.itemIdx,
            });
          }}>
          <View style={styles.productImageBox}>
            {(isBestItem || isNew) && (
              <View style={styles.productOrder}>
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.gradientBackground}>
                  <Text style={styles.productOrderText}>{label}</Text>
                </LinearGradient>
              </View>
            )}
            {item?.imagePath && (
              <Image
                source={{
                  uri: item?.imagePath,
                }}
                resizeMode="contain"
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            )}
          </View>
          <View style={styles.productTextBox}>
            <Text style={styles.productCompanyText}>{item.brandName}</Text>
            <Text
              style={styles.productPriceText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.itemName}
            </Text>
            <View style={styles.productPoint}>
              <SPSvgs.SocialToken width={20} height={20} />
              <Text style={styles.productPointText}>
                {Utils.changeNumberComma(item.itemPrice || 0)}
              </Text>
            </View>
          </View>
        </Pressable>
        {needPlaceholder && (
          <View style={[styles.productItem, { marginBottom: 16 }]} />
        )}
      </>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {renderHeader}
      {detailApiCalled && listApiCalled ? (
        <View style={{ flex: 1 }}>
          <FlatList
            key={loading ? 'loading' : 'loaded'}
            data={list}
            renderItem={renderItem}
            initialNumToRender={7}
            maxToRenderPerBatch={14}
            windowSize={14}
            numColumns={2} // 한 줄에 2개의 아이템
            columnWrapperStyle={{ gap: 16, paddingHorizontal: 16 }} // 열 스타일
            contentContainerStyle={[
              { rowGap: 16 },
              list?.length === 0 && { flex: 1 },
            ]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderListHeader}
            onEndReached={loadMoreProjects}
            onEndReachedThreshold={0.5}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig.current}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={onRefresh} />
            }
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
                  text="상품이 없습니다"
                />
              )
            }
          />
        </View>
      ) : (
        <SPLoading />
      )}

      {/* 정렬 옵션 모달 */}
      <Modal
        animationType="fade"
        transparent
        visible={methodModalVisible}
        onRequestClose={() => setMethodModalVisible(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 16,
          }}
          onPress={() => setMethodModalVisible(false)}>
          <View
            style={{
              width: '100%',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 16,
            }}>
            {sortOptions.map((option, index) => (
              <TouchableOpacity
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                style={styles.modalOption}
                onPress={() => handleSortSelect(option)}>
                <Text style={styles.modalText}>{option?.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default memo(PointShop);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperBox: {
    marginBottom: 0,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBox: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.16)',
  },
  topTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
    marginBottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  topText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#000',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  bottomBox: {
    paddingVertical: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 8,
  },
  bottomText: {
    fontSize: 14,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  bottomIconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 2,
  },
  centerLine: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
    marginHorizontal: 8,
  },
  contentsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  contentsText: {
    fontSize: 13,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  contentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productList: {
    padding: 16,
  },
  productItem: {
    flex: 1,
  },
  productImageBox: {
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 1, // 1:1 비율 유지
  },
  productOrder: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  gradientBackground: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  productOrderText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  productTextBox: {
    paddingTop: 8,
    marginBottom: 16,
    flexDirection: 'column',
    rowGap: 4,
  },
  productCompanyText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  productPriceText: {
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
  adTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adBox: {
    borderWidth: 1,
    borderColor: '#546EA1',
    backgroundColor: 'rgba(135, 141, 150, 0.05)',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  adText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#546EA1',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  modalOption: {
    paddingVertical: 16,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
});
