import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import { PrimaryButton } from '../../../components/PrimaryButton';
import SPLoading from '../../../components/SPLoading';
import Utils from '../../../utils/Utils';
import WalletUtils from '../../../utils/WalletUtils';
import fontStyles from '../../../styles/fontStyles';
import { COLORS } from '../../../styles/colors';
import Header from '../../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function WalletReceive() {
  const [address, setAddress] = useState('');
  const trlRef = useRef({ current: { disabled: false } });

  const onFocus = async () => {
    const addr = await WalletUtils.getWalletAddress();
    setAddress(addr);
  };

  const shareAddress = () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    Share.open({ message: address })
      .catch(err => console.log(err))
      // eslint-disable-next-line no-return-assign
      .finally(() => (trlRef.current.disabled = false));
  };

  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  if (!address) {
    return <SPLoading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="받기" />

      <View style={styles.content}>
        <Text style={styles.headerText}>
          {'아래 QR코드로\n자산을 받을 수 있어요'}
        </Text>

        <View style={styles.qrWrapper}>
          <QRCode value={address} size={140} />
          <View style={styles.addressView}>
            <Text
              style={styles.addressText}
              numberOfLines={1}
              ellipsizeMode="middle">
              {address}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <PrimaryButton
          text="주소 공유하기"
          outlineButton
          onPress={shareAddress}
          buttonStyle={styles.buttonStyle}
        />
        <PrimaryButton
          text="주소 복사하기"
          outlineButton
          onPress={() => {
            Utils.copyToClipboard(address);
          }}
          buttonStyle={styles.buttonStyle}
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(WalletReceive);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    rowGap: 48,
    paddingTop: 24,
    alignItems: 'center',
  },
  qrWrapper: {
    alignItems: 'center',
    rowGap: 16,
  },
  buttonWrapper: {
    flexDirection: 'row',
    marginVertical: 24,
    marginHorizontal: 16,
    columnGap: 8,
  },
  buttonStyle: {
    flex: 1,
  },
  headerText: {
    ...fontStyles.fontSize20_Semibold,
    textAlign: 'center',
  },
  addressView: {
    backgroundColor: COLORS.fillNormal,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    width: 140,
  },
  addressText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelNeutral,
  },
});
