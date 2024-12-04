import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Utils from '../../utils/Utils';
import Divider from '../Divider';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import moment from 'moment';

const tempAmountData = [
  { id: 1, name: 'U-12', amount: 100000 },
  { id: 2, name: '천막 1번\n3개', amount: 49400 },
];

export default function TournamentAmountInfo({
  totalAmount,
  targetName,
  sumOption = true,
  optionList = [],
  isTotalAltColor = false,
  isTotalFontSize18 = false,
  confirmDate,
}) {
  const targetPrice = () => {
    if (totalAmount > 0) {
      return Utils.changeNumberComma(totalAmount - sumOptionPrice());
    }
    return 0;
  };
  const sumOptionPrice = () => {
    let sum = 0;
    if (optionList?.length > 0) {
      optionList.forEach(data => {
        sum += data.optionPrice * data.opCnt;
      });
    }
    return sum;
  };
  return (
    <>
      <View style={{ rowGap: 8 }}>
        <View style={styles.totalAmountLineWrapper}>
          <Text style={styles.totalAmountText}>총 금액</Text>
          <Text
            style={[
              styles[
                isTotalFontSize18 ? 'totalAmountText18' : 'totalAmountText'
              ],
              { color: COLORS[isTotalAltColor ? 'darkBlue' : 'primaryStrong'] },
            ]}>
            {`${Utils.changeNumberComma(totalAmount)}원`}
          </Text>
        </View>
        <View style={styles.listWrapper}>
          {!sumOption && (
            <View style={[styles.listLineWrapper, { paddingVertical: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listLabel}>{targetName}</Text>
              </View>
              <Text style={styles.listContent}>{`${targetPrice()}원`}</Text>
            </View>
          )}
          {!sumOption &&
            optionList?.map((data, index) => {
              return (
                <View
                  key={`tournament_amount_info_${data.opdIdx}`}
                  style={[styles.listLineWrapper]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listLabel}>{data.optionName}</Text>
                    <Text style={styles.listLabel}>
                      {Utils.changeNumberComma(data.opCnt)}개
                    </Text>
                  </View>
                  <Text style={styles.listContent}>{`${Utils.changeNumberComma(
                    data.optionPrice * data.opCnt,
                  )}원`}</Text>
                </View>
              );
            })}
          {sumOption && (
            <View style={[styles.listLineWrapper]}>
              <Text style={styles.listLabel}>{targetName}</Text>
              <Text style={styles.listContent}>{`${targetPrice()}원`}</Text>
            </View>
          )}
          {sumOption && optionList?.length > 0 && (
            <View style={[styles.listLineWrapper]}>
              <Text style={styles.listLabel}>추가 옵션</Text>
              <Text style={styles.listContent}>
                {`${Utils.changeNumberComma(sumOptionPrice())}원`}
              </Text>
            </View>
          )}
        </View>
      </View>
      {!!confirmDate && (
        <>
          <Divider lineColor={COLORS.border0} lineHeight={1} />
          <View style={styles.listLineWrapper}>
            <Text style={styles.listLabel}>입금 확인일</Text>
            <Text style={styles.listContent}>
              {confirmDate && moment(confirmDate).format('YYYY.MM.DD')}
            </Text>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  totalAmountLineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalAmountText: {
    ...fontStyles.fontSize16_Semibold,
    letterSpacing: 0.091,
  },
  totalAmountText18: {
    ...fontStyles.fontSize18_Semibold,
    letterSpacing: -0.004,
  },
  listWrapper: {
    rowGap: 8,
    paddingLeft: 16,
  },
  listLineWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listLabel: {
    flex: 1,
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  listContent: {
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.203,
  },
});
