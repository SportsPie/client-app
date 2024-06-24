import { useNavigation, CommonActions } from '@react-navigation/native';
import React, { memo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPostWallet } from '../../../api/RestAPI';
import { IS_IOS } from '../../../common/constants/constants';
import { navName } from '../../../common/constants/navName';
import DismissKeyboard from '../../../components/DismissKeyboard';
import { PrimaryButton } from '../../../components/PrimaryButton';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import Utils from '../../../utils/Utils';
import WalletUtils from '../../../utils/WalletUtils';
import { handleError } from '../../../utils/HandleError';

function RestoreWallet() {
  const navigation = useNavigation();
  const [restoreText, setRestoreText] = useState('');
  const trlRef = useRef({ current: { disabled: false } });

  const restoreWallet = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const text = restoreText.trim();
      const isMnemonic = text.includes(' ');
      let wallet = null;
      if (isMnemonic) {
        wallet = await WalletUtils.getWalletByMnemonnic(text);
      } else {
        wallet = await WalletUtils.getWalletByPrivateKey(text);
      }
      if (wallet) {
        // api 호출
        const { address, privateKey } = wallet;
        const params = {
          walletAddr: address,
        };
        // 지갑 등록
        const { data } = await apiPostWallet(params);
        const { auth } = await Utils.getUserInfo();
        // 지갑주소, 개인키를 localStorage에 저장
        WalletUtils.saveWalletAddress(auth, address);
        WalletUtils.saveWalletPrivateKey(auth, privateKey);
        if (isMnemonic) {
          WalletUtils.saveWalletMnemonnic(auth, text);
        } else {
          WalletUtils.saveWalletMnemonnic(auth, null);
        }

        navigation.reset({
          index: 3,
          routes: [
            {
              name: navName.home,
            },
            {
              name: navName.moreMyInfo,
            },
            {
              name: navName.socialToken,
            },
            {
              name: navName.walletDetail,
            },
          ],
        });
      }
    } catch (error) {
      if (error?.code === 5103) {
        handleError(error);
      } else {
        Utils.openModal({
          title: '실패',
          body: '지갑복구에 실패하였습니다. \n 잠시 후 다시 시도해주시기 바랍니다.',
        });
      }
      NavigationService.goBack();
    }
    trlRef.current.disabled = false;
  };

  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="지갑 복구하기" />

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[fontStyles.fontSize20_Semibold]}>
              {'불러올 지갑의 복구시드 또는\n프라이빗키를 입력해주세요'}
            </Text>
            <Text
              style={[
                fontStyles.fontSize12_Medium,
                {
                  color: COLORS.labelNeutral,
                },
              ]}>
              복구시드 입력 시 단어 사이에 띄어쓰기를 사용해주세요.
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholderTextColor={COLORS.labelAlternative}
              placeholder="복구시드 또는 프라이빗키를 입력해주세요"
              multiline
              textAlignVertical="top"
              style={[fontStyles.fontSize14_Regular]}
              value={restoreText}
              onChangeText={setRestoreText}
            />

            <PrimaryButton
              buttonStyle={styles.buttonStyle}
              text="붙여넣기"
              outlineButton
              onPress={async () => {
                const text = await Utils.getTextInClipboard();
                setRestoreText(text);
              }}
            />
          </View>

          <PrimaryButton
            onPress={() => {
              restoreWallet();
            }}
            text="지갑복원"
            buttonStyle={{ marginTop: 'auto' }}
            disabled={!restoreText}
          />
        </View>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(RestoreWallet);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 48,
  },
  header: {
    rowGap: 16,
    alignItems: 'center',
  },
  inputWrapper: {
    rowGap: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: IS_IOS ? 16 : 0,
    borderColor: COLORS.lineBorder,
  },
  buttonStyle: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
  },
});
