import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import Utils from '../../../utils/Utils';
import WalletUtils from '../../../utils/WalletUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';

function PrivateKeyConfirm() {
  const [pk, setPk] = useState('');

  const onFocus = async () => {
    const key = await WalletUtils.getWalletPrivateKey();
    setPk(key);
  };

  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header closeIcon />

      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <Text style={styles.headerText}>
            {'프라이빗키를\n안전하게 확인하세요'}
          </Text>
          <Text style={styles.subheaderText}>
            {
              '종이에 적거나 안전한 곳에 보관하세요.\n해당 정보를 이용하면 언제든 지갑을 복구할 수 있어요.'
            }
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.contentValueWrapper}>
            <Text style={fontStyles.fontSize14_Medium}>{pk}</Text>
          </View>

          <PrimaryButton
            buttonStyle={styles.button}
            text="복사하기"
            outlineButton
            onPress={() => {
              Utils.copyToClipboard(pk);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(PrivateKeyConfirm);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    rowGap: 48,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerWrapper: {
    alignItems: 'center',
    rowGap: 16,
  },
  headerText: {
    ...fontStyles.fontSize20_Semibold,
    textAlign: 'center',
  },
  subheaderText: {
    ...fontStyles.fontSize12_Medium,
    textAlign: 'center',
    color: COLORS.labelNeutral,
  },
  content: {
    rowGap: 16,
    alignItems: 'flex-start',
  },
  button: {
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  contentValueWrapper: {
    backgroundColor: COLORS.fillNormal,
    borderRadius: 8,
    padding: 8,
  },
});
