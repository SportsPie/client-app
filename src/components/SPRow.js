import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

function SPRow({ children, containerStyles }) {
  return <View style={[styles.container, containerStyles]}>{children}</View>;
}

export default memo(SPRow);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
