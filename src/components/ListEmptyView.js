import { StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';

function ListEmptyView({ text }) {
  return (
    <View style={styles.container}>
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
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
