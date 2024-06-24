import { StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import { COLORS } from '../styles/colors';

function Divider({ lineColor, lineHeight }) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: lineColor ?? COLORS.lineBorder,
          height: lineHeight ?? 1,
        },
      ]}
    />
  );
}

export default memo(Divider);

const styles = StyleSheet.create({
  container: {
    height: 1,

    flexGrow: 1,
  },
});
