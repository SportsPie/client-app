import React, { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { navName } from '../../../common/constants/navName';
import { WALLET_PWD_PAGE_TYPE } from '../../../common/constants/walletPwdPageType';
import { PrimaryButton } from '../../../components/PrimaryButton';
import NavigationService from '../../../navigation/NavigationService';
import fontStyles from '../../../styles/fontStyles';
import { SPGifs } from '../../../assets/gif';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';

function CreateWallet() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="지갑" />

      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headerText}>
            {'스포츠파이 지갑을\n만들어보세요'}
          </Text>

          <Image
            source={SPGifs.wallet}
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_WIDTH,
            }}
          />
        </View>

        <View style={styles.buttonGroup}>
          <PrimaryButton
            text="새로운 지갑 만들기"
            onPress={() => {
              NavigationService.navigate(navName.walletPwd, {
                type: WALLET_PWD_PAGE_TYPE.CREATE,
              });
            }}
          />
          <PrimaryButton
            text="기존 지갑 불러오기"
            outlineButton
            onPress={() => {
              NavigationService.navigate(navName.walletPwd, {
                type: WALLET_PWD_PAGE_TYPE.RESTORE,
              });
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(CreateWallet);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    rowGap: 24,
  },
  headerText: {
    ...fontStyles.fontSize24_Bold,
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: 'auto',
    rowGap: 8,
  },
});
