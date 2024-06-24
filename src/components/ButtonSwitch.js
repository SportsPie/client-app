import { StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import CustomSwitch from './CustomSwitch';
import SPSwitch from './SPSwitch';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';
import moment from 'moment';

function ButtonSwitch({ title, subTitle, subTitle2, onPress, isActive }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Text
          style={[
            fontStyles.fontSize16_Semibold,
            {
              color: !isActive ? `${COLORS.labelNormal}80` : COLORS.labelNormal,
            },
          ]}>
          {title ?? ''}
        </Text>
        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: !isActive
                ? `${COLORS.labelNormal}80`
                : COLORS.labelNeutral,
            },
          ]}
          numberOfLines={1}>
          {subTitle ?? ''}
        </Text>
      </View>

      <Text
        style={[
          fontStyles.fontSize11_Medium,
          {
            color: !isActive
              ? `${COLORS.labelNormal}80`
              : COLORS.labelAlternative,
          },
        ]}
        numberOfLines={1}>
        {subTitle2 ? moment(subTitle2).format('YYYY.MM.DD') : ''}
      </Text>

      <SPSwitch switchOn={isActive} onChange={onPress} />
    </View>
  );
}

export default memo(ButtonSwitch);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  titleWrapper: {
    flex: 1,
    rowGap: 2,
  },
});
