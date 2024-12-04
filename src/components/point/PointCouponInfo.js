import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';

// 쿠폰 상세 > 상품 정보
export default function PointCouponInfo({ infoData }) {
  return (
    <View style={{ rowGap: 16 }}>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>유효기간</Text>
        {/* ppiData.validityEndDate 밀리초 값이 있을 때만 날짜 변환 */}
        <Text style={styles.content}>
          {infoData?.expDate &&
            Utils.convertMillisecondsToFormattedDateNoTimeWithoutDay(
              infoData?.expDate,
            )}
        </Text>
      </View>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>교환일</Text>
        {/* ppiData.exchangeDate 밀리초 값이 있을 때만 날짜 변환 */}
        <Text style={styles.content}>
          {infoData?.regDate &&
            Utils.convertMillisecondsToFormattedDateNoTimeWithoutDay(
              infoData?.regDate,
            )}
        </Text>
      </View>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>교환 포인트</Text>
        {/* 교환 포인트는 그냥 텍스트로 표시 */}
        <Text style={styles.content}>
          {Utils.changeNumberComma(infoData?.itemPrice || 0)}p
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lineWrapper: {
    flexDirection: 'row',
    columnGap: 8,
  },
  label: {
    width: 70,
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  content: {
    flex: 1,
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.203,
    textAlign: 'right',
  },
});
