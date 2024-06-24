import React, { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPGifs } from '../../assets/gif';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';

function MoreCouponComplete({ route }) {
  // 가정: 소셜 토큰 데이터를 socialToken 변수에 저장한다고 가정합니다.
  const couponValue = route.params?.couponValue;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header closeIcon />

      <View style={styles.container}>
        <Image
          source={SPGifs.couponSuccess}
          style={styles.couponSuccessImage}
        />

        <Text style={styles.headerText}>{'쿠폰 등록이\n완료되었어요!'}</Text>

        <View style={styles.couponWrapper}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color: COLORS.labelAlternative,
                letterSpacing: 0.23,
              },
            ]}>
            소셜토큰
          </Text>
          <Text
            style={[
              fontStyles.fontSize16_Semibold,
              {
                color: COLORS.labelNormal,
              },
            ]}>
            {Utils.changeNumberComma(couponValue)}P
          </Text>
        </View>

        <PrimaryButton
          text="내 소셜토큰 보러가기"
          buttonStyle={styles.submitButton}
          onPress={() => {
            NavigationService.navigate(navName.socialTokenDetail);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(MoreCouponComplete);

const styles = StyleSheet.create({
  container: {
    rowGap: 16,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  couponSuccessImage: {
    width: 242,
    height: 148,
    alignSelf: 'center',
  },
  submitButton: {
    marginTop: 'auto',
  },
  headerText: {
    textAlign: 'center',
    ...fontStyles.fontSize18_Semibold,
    color: '#121212',
  },
  couponWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.peach,
  },
});
