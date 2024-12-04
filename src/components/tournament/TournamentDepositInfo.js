import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';

export default function TournamentDepositInfo({ depositData }) {
  return (
    <View style={{ rowGap: 8 }}>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>입금 기한</Text>
        <Text style={styles.content}>{`${
          depositData?.regDate && Utils.depositExceedDate(depositData?.regDate)
        }까지`}</Text>
      </View>
      <View style={styles.lineWrapper}>
        <Text style={styles.label}>입금 계좌</Text>
        <Text style={[styles.content, { textAlign: 'right', flex: 1 }]}>
          {`${depositData?.payBankName} ${depositData?.payAccountNo}\n(예금주 : ${depositData?.payDepositName})`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lineWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    width: 70,
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  content: {
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.203,
  },
});
