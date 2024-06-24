import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SPSvgs } from '../assets/svg';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';

function PlayCountNumber({ quantity }) {
  return (
    <View style={styles.container}>
      <SPSvgs.Play />
      <Text style={styles.quantityText}>{quantity ?? ''}</Text>
    </View>
  );
}

export default memo(PlayCountNumber);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 2,
    padding: 2,
    backgroundColor: `${COLORS.black}38`,
    borderRadius: 4,
    alignSelf: 'flex-start',
    paddingRight: 4,
  },
  quantityText: {
    ...fontStyles.fontSize11_Regular,
    color: COLORS.white,
  },
});
