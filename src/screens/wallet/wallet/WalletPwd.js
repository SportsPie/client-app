import React, { memo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { setStorage } from 'utils/AsyncStorageUtils';
import { CONSTANTS } from '../../../common/constants/constants';
import { WALLET_PWD_PAGE_TYPE } from '../../../common/constants/walletPwdPageType';
import NavigationService from '../../../navigation/NavigationService';
import { CustomException } from '../../../common/exceptions';
import { SPToast } from '../../../components/SPToast';
import { handleError } from '../../../utils/HandleError';
import fontStyles from '../../../styles/fontStyles';
import SPPinCodeInput from '../../../components/SPPinCodeInput';
import { COLORS } from '../../../styles/colors';
import { navName } from '../../../common/constants/navName';
import WalletUtils from '../../../utils/WalletUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';

function WalletPwd({ route, sendPage, onSuccess }) {
  const params = route?.params;
  const pageType = sendPage ? WALLET_PWD_PAGE_TYPE.SEND : params?.type;

  const [pwd1, setPwd1] = useState();
  const pinCodeRef = useRef();

  const onCheckPwd = async text => {
    try {
      if (pageType === WALLET_PWD_PAGE_TYPE.SEND) {
        const pinCode = await WalletUtils.getWalletPinCode();
        if (pinCode !== text) {
          throw new CustomException('입력하신 비밀번호와 일치하지 않습니다.');
        }
      } else if (pwd1 !== text) {
        throw new CustomException('입력하신 비밀번호와 일치하지 않습니다.');
      }
      await WalletUtils.saveWalletPinCode(text);
      switch (pageType) {
        case WALLET_PWD_PAGE_TYPE.CREATE:
          NavigationService.replace(navName.walletBackupCheck);
          break;
        case WALLET_PWD_PAGE_TYPE.RESTORE:
          NavigationService.replace(navName.restoreWallet);
          break;
        case WALLET_PWD_PAGE_TYPE.SEND:
          if (onSuccess) onSuccess(true);
          break;
        // case WALLET_PWD_PAGE_TYPE.UPDATE:
        //   NavigationService.replace('WalletSetting');
        // break;
        default:
          break;
      }
    } catch (error) {
      switch (true) {
        case error instanceof CustomException:
          Keyboard.dismiss();
          SPToast.show({ text: error.message });
          clearPinCode();
          setPwd1();
          if (onSuccess) onSuccess(false);
          break;
        default:
          handleError(error);
      }
    }
  };
  const clearPinCode = () => {
    pinCodeRef.current.clear();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="지갑 만들기" />

      <View style={styles.container}>
        <View style={{ marginTop: 24, alignItems: 'center', rowGap: 18 }}>
          {pageType !== WALLET_PWD_PAGE_TYPE.SEND ? (
            <Text
              style={{
                ...fontStyles.fontSize18_Semibold,
                textAlign: 'center',
              }}>
              {pwd1
                ? '비밀번호를 다시 \n입력해주세요.'
                : '새로운 비밀번호를 \n입력해주세요.'}
            </Text>
          ) : (
            <Text
              style={{
                ...fontStyles.fontSize18_Semibold,
                textAlign: 'center',
              }}>
              비밀번호를 입력해주세요.
            </Text>
          )}
        </View>

        <View style={{ marginTop: 32, flex: 1 }}>
          <SPPinCodeInput
            ref={pinCodeRef}
            onComplete={e => {
              if (pageType !== WALLET_PWD_PAGE_TYPE.SEND) {
                if (!pwd1) {
                  setPwd1(e);
                  clearPinCode();
                } else {
                  onCheckPwd(e);
                }
              } else {
                onCheckPwd(e);
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(WalletPwd);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
  },
  headerView: { paddingVertical: 24, height: 76 },
  headerText: { ...fontStyles.fontSize20_Bold },
});
