import { StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';

function ListEmptyView({ text, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.textStyle}>{text ?? ''}</Text>
    </View>
  );
}

export default memo(ListEmptyView);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  textStyle: {
    ...fontStyles.fontSize16_Medium,
    // color: COLORS.labelAlternative,
    color: 'rgba(46, 49, 53, 0.60)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
