import React, { memo, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { SPSvgs } from '../../assets/svg';
import Header from '../../components/header';
import SPLoading from '../../components/SPLoading';
import { useDispatch, useSelector } from 'react-redux';
import { couponListAction } from '../../redux/reducers/list/couponListSlice';
import { handleError } from '../../utils/HandleError';
import { apiGetGiftShopExchanges } from '../../api/RestAPI';
import { store } from '../../redux/store';

// 내 쿠폰함 페이지
function PointMyCoupon({ text, style }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const listName = 'couponList';
  const {
    page,
    list: couponList,
    refreshing,
    loading,
    isLast,
    totalCnt,
  } = useSelector(selector => selector[listName]);
  const [size, setSize] = useState(100);
  const action = couponListAction;

  /**
   * api
   */
  const getMyCouponList = async () => {
    try {
      const params = {
        page,
        size,
        sortType: 'EXP_DATE',
      };
      const { data } = await apiGetGiftShopExchanges(params);
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

  /**
   * function
   */
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

  /**
   * useEffect
   */
  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getMyCouponList();
    }
  }, [page, refreshing]);

  /**
   * render
   */
  // 데이터를 평탄화

  // 내 쿠폰함 리스트
  const renderItem = ({ item, index }) => {
    const isUsed = item.useYn === 'Y'; // 사용자가 사용 완료로 표시한 경우
    const { isExpiration, isExpirationSoon, isNew } = item;

    return (
      <TouchableOpacity
        style={[styles.productBox, index > 0 && styles.productBoxWithBorder]}
        onPress={() => {
          // 클릭시 해당 상품 상세로 이동
          NavigationService.navigate(navName.pointCouponDetail, {
            excIdx: item.excIdx,
          });
        }}>
        <View style={styles.imageBox}>
          {/* 이미지 위에 덮을 배경 */}
          {(isExpiration || isUsed) && <View style={styles.imageOverlay} />}
          {item.imagePath && (
            <Image
              source={{ uri: item.imagePath }}
              resizeMode="contain"
              style={styles.image}
            />
          )}
        </View>
        <View style={styles.productDetailBox}>
          <View style={styles.productTop}>
            <Text style={styles.productCompany}>{item.brandName}</Text>
            {/* 남은 기간 표시 */}
            <View
              style={[
                styles.productCount,
                isExpiration || isUsed ? styles.productCountExpired : null,
              ]}>
              <Text
                style={[
                  styles.productCountText,
                  isExpiration || isUsed
                    ? styles.productCountTextExpired
                    : null,
                ]}>
                {isUsed
                  ? '사용 완료'
                  : isExpiration
                  ? '만료'
                  : `D-${item.dday}`}
              </Text>
            </View>
          </View>
          <Text style={styles.productTitle}>{item.itemName}</Text>
          <View style={styles.productDateBox}>
            <Text style={styles.productDateText}>
              ~{moment(item.expDate).format('YYYY.MM.DD')}
            </Text>
            <View style={styles.productDateSub}>
              {isNew && (
                <>
                  <SPSvgs.Created width={20} height={20} />
                  <Text
                    style={(styles.productDateSubText, { color: '#FF7C10' })}>
                    신규 교환
                  </Text>
                </>
              )}
              {/* 만료되었거나 사용 완료된 쿠폰은 "만료예정"이나 "신규 교환" 표시 안됨 */}
              {!isUsed && isExpirationSoon && (
                <>
                  <SPSvgs.Expired width={20} height={20} />
                  <Text style={(styles.productDateSubText, { color: '#F33' })}>
                    만료예정
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="내 쿠폰함" />
      {couponList.length > 0 ? (
        <View style={{ flex: 1 }}>
          <FlatList
            key={loading ? 'loading' : 'loaded'}
            data={couponList}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={() => {
              loadMoreProjects();
            }}
            onEndReachedThreshold={0.5}
          />
        </View>
      ) : loading ? (
        <SPLoading />
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>보유 중인 쿠폰이 없습니다.</Text>
          <Text style={styles.emptyText}>포인트로 쿠폰을 교환해보세요!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

export default memo(PointMyCoupon);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productGroup: {
    paddingHorizontal: 16,
  },
  productBox: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingVertical: 8,
  },
  productBoxWithBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(135, 141, 150, 0.22)',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject, // 부모 뷰를 채우는 절대 위치 설정
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 검정색 배경, 투명도 30%
    zIndex: 1,
  },
  imageBox: {
    position: 'relative',
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
    flex: 1,
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
    paddingTop: 6,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCount: {
    minWidth: 58,
    backgroundColor: '#aaa',
    borderRadius: 8,
    // paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productCountText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
  productCountExpired: {
    borderWidth: 1,
    borderColor: 'rgba(115, 115, 115, 0.50)',
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
  },
  productCountTextExpired: {
    color: 'rgba(46, 49, 53, 0.80)',
  },
  productDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  productDateText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  productDateSub: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  productDateSubText: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 18,
    letterSpacing: 0.252,
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
});
