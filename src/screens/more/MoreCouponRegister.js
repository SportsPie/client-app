import React, { memo, useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPInput from '../../components/SPInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { apiPostCoupon, apiPutModifyChallengeVideo } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MoreCouponRegister() {
  const [couponNumber, setCouponNumber] = useState('');
  const trlRef = useRef({ current: { disabled: false } });

  const couponRegister = async () => {
    const data = {
      couponCode: couponNumber,
    };
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const response = await apiPostCoupon(data);

      NavigationService.navigate(navName.moreCouponComplete, {
        couponValue: response.data.data,
      });
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="쿠폰 등록" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.inputWrapper}>
          <SPInput
            title="쿠폰번호"
            placeholder="쿠폰번호를 입력하세요"
            onChangeText={setCouponNumber}
            value={couponNumber}
          />

          <PrimaryButton
            text="쿠폰등록"
            disabled={!couponNumber}
            onPress={couponRegister}
          />
        </View>

        <View style={styles.termWrapper}>
          <Text
            style={[
              fontStyles.fontSize14_Semibold,
              {
                color: COLORS.labelNeutral,
                letterSpacing: 0.2,
              },
            ]}>
            쿠폰 유의사항
          </Text>
          <Text style={styles.termText}>
            • 쿠폰 등록 내역은{' '}
            <Text style={fontStyles.fontSize12_Bold}>
              {'더보기 > 소셜토큰'}
            </Text>{' '}
            내역에서 확인할 수 있어요.
          </Text>
          <Text style={styles.termText}>
            • 쿠폰은 환불 및 교환이 불가능하며, 개인의 부주의로 인해 발생되는
            문제에 대해서는 해결을 해 드릴 수가 없어요.
          </Text>
          <Text style={styles.termText}>
            • 통신 연결 상태에 따라 지급이 일부 지연이 되거나 안될 수도 있으니,
            통신 연결 상태를 항상 확인하시고 등록을 해주세요.
          </Text>
          <Text style={styles.termText}>
            • 부당한 방법으로 참여 시 쿠폰 등록이 취소될 수 있으며, 쿠폰에 대한
            운영은 스포츠파이의 서비스 정책에 따라 변경될 수 있으니 유의해
            주세요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MoreCouponRegister);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
    paddingVertical: 24,
    rowGap: 48,
  },
  inputWrapper: {
    rowGap: 8,
  },
  termWrapper: {
    rowGap: 8,
  },
  termText: {
    ...fontStyles.fontSize12_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.3,
  },
});
