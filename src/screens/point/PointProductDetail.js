import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fontStyles from '../../styles/fontStyles';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import PointProductIntro from '../../components/point/PointProductIntro';
import PointProductNote from '../../components/point/PointProductNote';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import SPModal from '../../components/SPModal';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { handleError } from '../../utils/HandleError';
import {
  apiGetGiftShopInit,
  apiGetItemDetail,
  apiPostGiftShopBuyCoupon,
} from '../../api/RestAPI';
import { useFocusEffect } from '@react-navigation/native';
import Utils from '../../utils/Utils';
import SPLoading from '../../components/SPLoading';

// 상품 상세 페이지
function PointProductDetail({ route }) {
  /**
   * state
   */
  const itemIdx = route.params?.itemIdx;
  const fromHistory = route.params?.fromHistory;

  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [point, setPoint] = useState(0);
  const [productDetail, setProductDetail] = useState({});
  const [apiCalled, setApiCalled] = useState(false);
  const [detailApiCalled, setDetailApiCalled] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // 컨테이너의 너비와 높이 계산
  const containerWidth = screenWidth - 32; // 양 옆 16px씩 여백
  const containerHeight = containerWidth; // 1:1 비율을 유지 (높이 = 너비)

  /**
   * api
   */
  const getPointShopMainInfo = async () => {
    try {
      const { data } = await apiGetGiftShopInit();
      setPoint(data.data?.balance || 0);
    } catch (error) {
      handleError(error);
    }
    setDetailApiCalled(true);
  };

  const getProductDetail = async () => {
    try {
      const { data } = await apiGetItemDetail(itemIdx); // TOOD :: api 변경 필요
      setProductDetail(data.data);
    } catch (error) {
      handleError(error);
    }
    setApiCalled(true);
  };

  /**
   * function
   */

  const handleExcahngeButtonClick = () => {
    setShowExchangeModal(true);
  };

  const apply = async () => {
    setShowExchangeModal(false);
    setIsLoading(true);
    startRotation();
    try {
      const { data } = await apiPostGiftShopBuyCoupon({ itemIdx });
      setIsLoading(false);
      NavigationService.navigate(navName.pointCouponDetail, {
        excIdx: data.data,
      });
    } catch (error) {
      handleError(error);
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setShowExchangeModal(false);
  };

  // 회전 애니메이션을 위한 설정
  const rotateAnim = useState(new Animated.Value(0))[0];

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1, // 회전 완료 시 1
        duration: 1500, // 1.5초 동안 회전
        useNativeDriver: true,
        easing: Easing.linear, // 선형으로 회전하도록 설정
      }),
    ).start();
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getPointShopMainInfo();
      getProductDetail();
    }, []),
  );

  /**
   * render
   */
  const isDisabled = point < productDetail?.itemPrice;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="상품 상세" />

      {apiCalled ? (
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.contentsContainer}>
              <View
                style={[
                  styles.imageWrapper,
                  { width: containerWidth, height: containerHeight },
                ]}>
                {productDetail?.imagePath && (
                  <ImageBackground
                    source={{ uri: productDetail?.imagePath }}
                    style={styles.imageBackground}
                    resizeMode="contain"
                  />
                )}
              </View>
              <View style={styles.productTop}>
                <View style={styles.productTextBox}>
                  <Text style={styles.productCompany}>
                    {productDetail?.brandName}
                  </Text>
                  <Text style={styles.productTitle}>
                    {productDetail?.itemName}
                  </Text>
                </View>

                <View style={styles.productPoint}>
                  <SPSvgs.SocialToken width={20} height={20} />
                  <Text style={styles.productPointText}>
                    {Utils.changeNumberComma(productDetail?.itemPrice || 0)}
                  </Text>
                </View>
              </View>
            </View>

            <Divider lineHeight={8} lineColor={COLORS.indigo90} />

            {/* 상품 소개 */}
            <View style={styles.contentsWrapper}>
              <Text style={styles.contentsTitle}>상품 소개</Text>
              <PointProductIntro introData={productDetail} />
            </View>

            <Divider lineHeight={8} lineColor={COLORS.indigo90} />

            {/* 유의사항 */}
            <View style={styles.contentsWrapper}>
              <Text style={styles.contentsTitle}>유의사항</Text>
              <PointProductNote noteData={productDetail} />
            </View>
          </ScrollView>
          {!fromHistory && detailApiCalled && (
            <TouchableOpacity
              style={[
                styles.clearBtn,
                isDisabled ? styles.disabledClearBtn : styles.enabledClearBtn,
              ]}
              activeOpacity={ACTIVE_OPACITY}
              disabled={isDisabled}
              onPress={handleExcahngeButtonClick}>
              <Text
                style={[
                  styles.clearBtnText,
                  isDisabled
                    ? styles.disabledClearBtnText
                    : styles.enabledClearBtnText,
                ]}>
                {isDisabled ? '포인트 부족' : '교환하기'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <SPLoading />
      )}

      {/* 로딩 중 모달 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}>
            <SPSvgs.Loding />
          </Animated.View>
        </View>
      )}

      {/* 포인트 교환 모달 */}
      <SPModal
        title="포인트 교환"
        contents={
          <Text>
            <Text style={styles.modalTextBold}>
              {productDetail?.itemName}
              <Text style={styles.modalText}>을</Text>
            </Text>
            <Text style={styles.modalTextBold}>
              {'\n'}
              {Utils.changeNumberComma(productDetail?.itemPrice || 0)} 포인트
              <Text style={styles.modalText}>로{'\n'}</Text>
            </Text>

            <Text>교환하시겠습니까?</Text>
          </Text>
        }
        // 교환 성공시 알람이 뜨고 쿠폰 상세로 이동
        confirmButtonText="교환"
        onConfirm={apply}
        onCancel={handleCancel}
        visible={showExchangeModal}
        onClose={setShowExchangeModal}
      />
    </SafeAreaView>
  );
}

export default memo(PointProductDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentsContainer: {
    // flex: 1,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    // iOS 그림자
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      // Android 그림자
      android: {
        elevation: 3,
      },
    }),
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  productTop: {
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 8,
  },
  productTextBox: {
    paddingTop: 8,
  },
  productCompany: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  contentsWrapper: {
    rowGap: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  contentsTitle: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  productPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginBottom: 16,
  },
  productPointText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#000',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  clearBtn: {
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  enabledClearBtn: {
    backgroundColor: '#FF7C10',
  },
  disabledClearBtn: {
    backgroundColor: '#E3E2E1',
  },
  enabledClearBtnText: {
    color: '#FFF',
  },
  disabledClearBtnText: {
    color: 'rgba(46, 49, 53, 0.28)',
  },
  modalText: {
    fontWeight: 400,
  },
  modalTextBold: {
    fontWeight: 600,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
