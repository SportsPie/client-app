import { StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';

function BoxItem({ title, label, value }) {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.textStyle,
          {
            color: COLORS.orange,
          },
        ]}>
        {title ?? ''}
      </Text>
      <View style={styles.valueWrapper}>
        <Text style={styles.textStyle}>{label ?? ''}</Text>
        <Text
          style={[
            styles.textStyle,
            {
              color: COLORS.orange,
              flex: 1,
              textAlign: 'right',
            },
          ]}>
          {value ?? ''}
        </Text>
      </View>
    </View>
  );
}

export default memo(BoxItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    elevation: 5,
    borderRadius: 16,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    rowGap: 8,
  },
  textStyle: {
    ...fontStyles.fontSize16_Medium,
    letterSpacing: 0.091,
    color: COLORS.labelNormal,
  },
  valueWrapper: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
});
