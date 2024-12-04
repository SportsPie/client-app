import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';

export default function TournamentBasicInfo({ trnData }) {
  return (
    <View style={{ rowGap: 8 }}>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>대회명</Text>
        <Text style={styles.content}>
          {trnData?.trnCount &&
            `제${Utils.changeNumberComma(trnData?.trnCount)}회 `}
          {trnData?.trnName}
        </Text>
      </View>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>대회일</Text>
        <Text style={styles.content}>{`${
          trnData?.trnStartDate &&
          Utils.convertMillisecondsToFormattedDateNoTime(trnData?.trnStartDate)
        } - ${
          trnData?.trnEndDate &&
          Utils.convertMillisecondsToFormattedDateNoTime(trnData?.trnEndDate)
        }`}</Text>
      </View>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>장소</Text>
        <Text style={styles.content}>{trnData?.trnPlace}</Text>
      </View>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>시상</Text>
        <Text style={styles.content}>{trnData?.award}</Text>
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
  },
});
