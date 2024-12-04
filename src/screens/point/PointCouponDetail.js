import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fontStyles from '../../styles/fontStyles';
import Header from '../../components/header';
import { SPToast } from '../../components/SPToast';
import Divider from '../../components/Divider';
import PointCouponInfo from '../../components/point/PointCouponInfo';
import PointCouponIntro from '../../components/point/PointCouponIntro';
import PointCouponNote from '../../components/point/PointCouponNote';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import SPImages from '../../assets/images';
import { ALBUM_PERMISSION_TEXT } from '../../common/constants/constants';
import { apiGetGiftShopExchangesDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Utils from '../../utils/Utils';
import ViewShot from 'react-native-view-shot';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import { couponListAction } from '../../redux/reducers/list/couponListSlice';
import { useDispatch } from 'react-redux';
import SPLoading from '../../components/SPLoading';

// 쿠폰 상세 페이지
function PointCouponDetail({ route }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const viewShotRef = useRef();
  const excIdx = route.params?.excIdx;
  const [couponDetail, setCouponDetail] = useState({});
  const [apiCalled, setApiCalled] = useState(false);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // 컨테이너의 너비와 높이 계산
  const containerWidth = screenWidth - 32; // 양 옆 16px씩 여백
  const containerHeight = containerWidth; // 1:1 비율을 유지 (높이 = 너비)

  /**
   * api
   */
  const getCouponDetail = async () => {
    try {
      const { data } = await apiGetGiftShopExchangesDetail(excIdx); // TOOD :: api 변경 필요
      setCouponDetail(data.data);
      dispatch(
        couponListAction.modifyUseYnAndExpiration({
          idxName: 'excIdx',
          idx: excIdx,
          item: data.data,
        }),
      );
    } catch (error) {
      handleError(error);
    }
    setApiCalled(true);
  };

  /**
   * function
   */

  const saveComponentToGallery = async () => {
    if (viewShotRef.current) {
      viewShotRef.current.capture().then(async uri => {
        try {
          await CameraRoll.save(uri, { type: 'photo', album: '스포츠파이' })
            .then(e => {
              SPToast.show({ text: '이미지가 저장되었습니다.' });
            })
            .catch(e => {
              if (e.message?.includes('Access to photo library was denied')) {
                Utils.alert('', ALBUM_PERMISSION_TEXT);
              } else {
                SPToast.show({ text: '이미지가 저장에 실패했습니다.' });
              }
            });
        } catch (error) {
          handleError(error);
        }
      });
    }
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getCouponDetail();
    }, []),
  );

  /**
   * render
   */
  return (
    <SafeAreaView style={styles.container}>
      <Header title="쿠폰 상세" />

      {apiCalled ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ViewShot
            ref={viewShotRef}
            style={{
              backgroundColor: COLORS.white,
            }}>
            <View style={styles.contentsContainer}>
              <View
                style={[
                  styles.imageWrapper,
                  { width: containerWidth, height: containerHeight },
                ]}>
                {couponDetail?.imagePath && (
                  <ImageBackground
                    source={{ uri: couponDetail?.imagePath }}
                    style={styles.imageBackground}
                    resizeMode="contain">
                    {(couponDetail?.useYn === 'Y' ||
                      couponDetail?.isExpiration) && (
                      <View style={styles.overlay}>
                        <View style={styles.overlayIcon}>
                          {/* 상태에 따라 다른 이미지 표시 */}
                          {couponDetail?.useYn === 'Y' ? (
                            <Image source={SPImages.usedImg} alt="사용완료" />
                          ) : couponDetail?.isExpiration ? (
                            <Image source={SPImages.expiredImg} alt="만료" />
                          ) : null}
                        </View>
                      </View>
                    )}
                  </ImageBackground>
                )}
              </View>
              <View style={styles.productTop}>
                <View style={styles.productTextBox}>
                  <Text style={styles.productCompany}>
                    {couponDetail?.brandName}
                  </Text>
                  <Text style={styles.productTitle}>
                    {couponDetail?.itemName}
                  </Text>
                </View>
                <View style={styles.barcodeBox}>
                  {couponDetail?.epin && (
                    <Barcode
                      value={couponDetail?.epin}
                      text={couponDetail?.epin}
                      textStyle={{ marginTop: 16 }}
                      format="CODE128"
                      width={240}
                      height={80}
                      maxWidth={240}
                      background="white"
                      lineColor="black"
                    />
                  )}
                </View>
              </View>
            </View>
          </ViewShot>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingBottom: 16,
            }}>
            <Pressable style={styles.saveBtn} onPress={saveComponentToGallery}>
              <SPSvgs.Download width={16} height={16} fill="#FF7C10" />
              <Text style={styles.saveBtnText}>이미지 저장</Text>
            </Pressable>
          </View>

          <Divider lineHeight={8} lineColor={COLORS.indigo90} />

          {/* 상품 정보 */}
          <View style={styles.contentsWrapper}>
            <Text style={styles.contentsTitle}>상품 정보</Text>
            <PointCouponInfo infoData={couponDetail} />
          </View>

          <Divider lineHeight={8} lineColor={COLORS.indigo90} />

          {/* 상품 소개 */}
          <View style={styles.contentsWrapper}>
            <Text style={styles.contentsTitle}>상품 소개</Text>
            <PointCouponIntro introData={couponDetail} />
          </View>

          <Divider lineHeight={8} lineColor={COLORS.indigo90} />

          {/* 유의사항 */}
          <View style={styles.contentsWrapper}>
            <Text style={styles.contentsTitle}>유의사항</Text>
            <PointCouponNote noteData={couponDetail} />
          </View>
        </ScrollView>
      ) : (
        <SPLoading />
      )}
    </SafeAreaView>
  );
}

export default memo(PointCouponDetail);

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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlayIcon: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignContent: 'center',
    marginTop: 16,
    marginRight: 16,
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  productTop: {
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 16,
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
  barcodeBox: {
    width: 290,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF7C10',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#FF7C10',
    lineHeight: 18,
    letterSpacing: 0.252,
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
});
