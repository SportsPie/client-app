import React, { memo } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import SPImages from '../assets/images';

function Splash() {
  return (
    <ImageBackground source={SPImages.bgSplash} style={styles.container} />
  );
}

export default memo(Splash);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
});
