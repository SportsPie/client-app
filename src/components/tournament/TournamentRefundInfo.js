import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Utils from '../../utils/Utils';
import Divider from '../Divider';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import moment from 'moment';

export default function TournamentRefundInfo({ refundData }) {
  return (
    <>
      {refundData?.prtPrice !== undefined && (
        <>
          <View style={styles.refundAmountLineWrapper}>
            <Text style={styles.refundAmountLabel}>환불 금액</Text>
            <Text style={styles.refundAmountText}>
              {`${Utils.changeNumberComma(refundData?.prtPrice)}원`}
            </Text>
          </View>
          <Divider lineColor={COLORS.border0} lineHeight={1} />
        </>
      )}
      <View style={{ rowGap: 8 }}>
        <View style={styles.lineWrapper}>
          <Text style={styles.label}>환불 계좌</Text>
          <Text style={styles.content}>
            {`${refundData?.refundBankName ?? ''} ${
              refundData?.refundAccountNo ?? ''
            }\n(예금주 : ${refundData?.refundDepositName ?? ''})`}
          </Text>
        </View>
        {!!refundData?.refundRequestDate && (
          <View style={styles.lineWrapper}>
            <Text style={styles.label}>환불 신청일</Text>
            <Text style={styles.content}>
              {refundData?.refundRequestDate &&
                moment(refundData?.refundRequestDate).format('YYYY.MM.DD')}
            </Text>
          </View>
        )}
        {!!refundData?.refundConfirmDate && (
          <View style={styles.lineWrapper}>
            <Text style={styles.label}>환불 완료일</Text>
            <Text style={styles.content}>
              {refundData?.refundConfirmDate &&
                moment(refundData?.refundConfirmDate).format('YYYY.MM.DD')}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  refundAmountLineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refundAmountLabel: {
    ...fontStyles.fontSize16_Semibold,
    letterSpacing: 0.091,
  },
  refundAmountText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.primaryStrong,
    letterSpacing: -0.004,
  },
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
    flex: 1,
    textAlign: 'right',
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.203,
  },
});
