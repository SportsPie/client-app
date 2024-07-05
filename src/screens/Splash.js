import React, { memo } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import SPImages from '../assets/images';
import { SPSvgs } from '../assets/svg';
import { COLORS } from '../styles/colors';

function Splash() {
  return (
    <View style={styles.container}>
      <SPSvgs.LargeLogoWithText />
    </View>
  );
}

export default memo(Splash);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
