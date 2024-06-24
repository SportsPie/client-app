import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useCallback } from 'react';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import fontStyles from '../../styles/fontStyles';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

function WalletBalance({ value }) {
  const handlePressWallet = useCallback(() => {
    NavigationService.navigate(navName.walletDetail);
  }, []);

  return (
    <Pressable onPress={handlePressWallet} style={styles.container}>
      <View style={styles.topContent}>
        <SPSvgs.WalletToken />
        <Text style={fontStyles.fontSize20_Semibold}>지갑</Text>
      </View>
      <View style={styles.bottomContent}>
        <Text style={fontStyles.fontSize28_Bold}>{value}</Text>
        <Text style={fontStyles.fontSize16_Medium}>PIE</Text>
      </View>
    </Pressable>
  );
}

export default memo(WalletBalance);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    width: WINDOW_WIDTH - 32,
    backgroundColor: COLORS.fillNormal,
    padding: 16,
    borderRadius: 16,
    rowGap: 16,
  },
  topContent: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
  bottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
});
