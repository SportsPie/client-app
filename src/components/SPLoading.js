import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../styles/colors';

function SPLoading() {
  return (
    <View style={styles.loadingView}>
      <ActivityIndicator size="small" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingView: {
    backgroundColor: COLORS.white,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SPLoading;
