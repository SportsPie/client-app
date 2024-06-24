import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { apiGetAcademyDetail } from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { IS_YN } from '../../common/constants/isYN';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function AcademyCompanyManagement({ route }) {
  /**
   * state
   */
  const academyIdx = route?.params?.academyIdx;
  const [academyDetail, setAcademyDetail] = useState({});
  console.log('AcademyCompanyManagement : academyIdx : ', academyIdx);

  /**
   * api
   */
  const getAcademyDetailInfo = async () => {
    try {
      const { data } = await apiGetAcademyDetail(academyIdx);
      setAcademyDetail(data.data.academy);
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getAcademyDetailInfo();
    }, []),
  );

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Header title="기업 인증 관리" />
      <View
        style={{
          borderWidth: 1,
          borderColor: 'rgba(135, 141, 150, 0.16)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
        <LinearGradient
          colors={['#FF854C', '#FF671F']} // 그라데이션 색상 설정
          useAngle={true}
          angle={94}
          style={{ width: 240 }}>
          <View
            style={{
              padding: 16,
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
            }}>
            {academyDetail.certYn === IS_YN.Y && (
              <View>
                <Image
                  source={SPIcons.icCheckBadgeReverse}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            )}
            <Text
              style={{
                ...fontStyles.fontSize18_Semibold,
                color: 'rgba(255, 225, 210, 1)',
              }}>
              기업인증
            </Text>
          </View>
          <View
            style={{
              height: 154,
              gap: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                height: 48,
                width: 48,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              {academyDetail.logoPath ? (
                <Image
                  source={{ uri: academyDetail.logoPath }}
                  style={{ height: 48, width: 48 }}
                />
              ) : (
                <Image
                  source={SPIcons.icDefaultAcademy}
                  style={{ width: 48, height: 48 }}
                />
              )}
            </View>
            <View>
              <Text
                style={{
                  ...fontStyles.fontSize20_Semibold,
                  color: COLORS.white,
                }}>
                {academyDetail.academyName}
              </Text>
            </View>
          </View>
          <View style={{ padding: 16, gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  ...fontStyles.fontSize13_Regular,
                  color: COLORS.white,
                }}>
                대표자명
              </Text>
              <Text
                style={{
                  ...fontStyles.fontSize13_Semibold,
                  color: COLORS.white,
                }}>
                {academyDetail.ceoName}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  ...fontStyles.fontSize13_Regular,
                  color: COLORS.white,
                }}>
                사업자 등록번호
              </Text>
              <Text
                style={{
                  ...fontStyles.fontSize13_Semibold,
                  color: COLORS.white,
                }}>
                {Utils.addHypenToBusinessNumber(academyDetail.businessNo)}
              </Text>
            </View>
          </View>
        </LinearGradient>
        <View style={{ backgroundColor: COLORS.background, padding: 16 }}>
          <TouchableOpacity
            onPress={() => {
              NavigationService.navigate(navName.academyCompany, {
                academyIdx,
                recert: true,
              });
            }}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 9,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(135, 141, 150, 0.22)',
              borderRadius: 8,
            }}>
            <Text style={{ ...fontStyles.fontSize15_Medium }}>재인증</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(AcademyCompanyManagement);
