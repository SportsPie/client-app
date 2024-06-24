import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { navName } from '../../../common/constants/navName';
import NavigationService from '../../../navigation/NavigationService';
import fontStyles from '../../../styles/fontStyles';
import WalletUtils from '../../../utils/WalletUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';

function WalletSetting() {
  const [isExistsMnemonic, setIsExistsMnemonic] = useState(false);

  const onFocus = async () => {
    const mnemonic = await WalletUtils.getWalletMnemonnic();
    setIsExistsMnemonic(mnemonic !== 'null' && mnemonic);
  };

  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="설정" />

      <View style={styles.container}>
        {isExistsMnemonic && (
          <Pressable
            onPress={() => {
              NavigationService.navigate(navName.restoreSeedConfirm);
            }}
            style={styles.button}>
            <Text style={fontStyles.fontSize16_Medium}>복구시드 확인</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            NavigationService.navigate(navName.privateKeyConfirm);
          }}
          style={styles.button}>
          <Text style={fontStyles.fontSize16_Medium}>프라이빗 키 확인</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default memo(WalletSetting);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 16,
  },
});
