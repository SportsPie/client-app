import { useFocusEffect } from '@react-navigation/native';
import Decimal from 'decimal.js';
import React, { memo, useCallback, useMemo, useState, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiGetMoreWalletCheckFee,
  apiGetMoreWalletMinWithdrawAmount,
  apiGetTokenBalance,
} from '../../../api/RestAPI';
import { SPSvgs } from '../../../assets/svg';
import { navName } from '../../../common/constants/navName';
import { PrimaryButton } from '../../../components/PrimaryButton';
import SPInput from '../../../components/SPInput';
import SPLoading from '../../../components/SPLoading';
import SPModal from '../../../components/SPModal';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import { handleError } from '../../../utils/HandleError';
import Utils from '../../../utils/Utils';
import WalletUtils from '../../../utils/WalletUtils';
import Web3Utils from '../../../utils/Web3Utils';
import WalletPwd from './WalletPwd';

function WalletSend() {
  /**
   * state
   */
  const [isFocus, setIsFocus] = useState(true);
  const [address, setAddress] = useState('');
  const [receiveAddress, setReceiveAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [showCheckSendPwdModal, setShowCheckSendPwdModal] = useState(false);
  const [checkSendPwd, setCheckSendPwd] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [wdReqAmount, setWdReqAmount] = useState();
  const [wdReqAmountErrorMessage, setWdReqAmountErrorMessage] = useState();
  const [isValidReceiveAddress, setIsValidReceiveAddress] = useState(false);
  const [addressErrorMessage, setAddressErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [point, setPoint] = useState(0);
  const [minWidrawAmount, setMinWidrawAmount] = useState(0);
  const [fee, setFee] = useState(0);

  /**
   * api
   */
  const getBalanceAndFee = async () => {
    try {
      const walletAddr = await WalletUtils.getWalletAddress();
      setAddress(walletAddr);

      const balanceResponse = await apiGetTokenBalance(
        walletAddr ? walletAddr : 'entity',
      );
      const feeResponse = await apiGetMoreWalletCheckFee();
      const minAmountResponse = await apiGetMoreWalletMinWithdrawAmount();

      const { point: pointDetail, wallet: walletDetail } =
        balanceResponse?.data?.data || {};
      setPoint(pointDetail?.pointBalance || 0);
      setFee(feeResponse?.data?.data || 0);
      setBalance(walletDetail?.balance || 0);
      setMinWidrawAmount(minAmountResponse?.data?.message || 0);
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  const moveSending = async () => {
    try {
      if (!checkAmount()) return;
      if (!checkWalletAddr()) return;
      NavigationService.replace(navName.walletSending, {
        from: address,
        to: receiveAddress,
        amount: wdReqAmount,
      });
    } catch (error) {
      handleError(error);
    }
  };

  // const send = async () => {
  //   try {
  //     if (trlRef.current.disabled) return;
  //     trlRef.current.disabled = true;
  //     setShowSendModal(false);
  //
  //     const params = {
  //       from: address,
  //       to: receiveAddress,
  //       amount: wdReqAmount,
  //     };
  //     const { data } = await apiPostSendFee(params);
  //     Web3Utils.sendToken(receiveAddress, wdReqAmount);
  //     NavigationService.goBack();
  //     SPToast.show({ text: '송금이 완료되었습니다.' });
  //   } catch (error) {
  //     handleError(error);
  //   }
  //   trlRef.current.disabled = false;
  // };

  const setWdReqAmountToMax = async () => {
    setWdReqAmountErrorMessage('');
    setWdReqAmount(balance);
  };

  const checkAmount = value => {
    if (value) {
      const max = new Decimal(balance);
      const min = new Decimal(minWidrawAmount);
      const userInputValue = new Decimal(value);

      // 최대치를 넘지 않은 경우
      if (!max.greaterThanOrEqualTo(userInputValue)) {
        setWdReqAmountErrorMessage('자금이 부족합니다.');
        return false;
      }
      // 최소 출금 수량을 넘지 않은 경우
      if (userInputValue.lessThan(min)) {
        setWdReqAmountErrorMessage(`최소 수량 ${min} PIE 이상 입력하세요.`);
        return false;
      }
      setWdReqAmountErrorMessage('');
      return true;
    }
    setWdReqAmountErrorMessage('');
    return true;
  };

  const checkWalletAddr = () => {
    const isValidAddr = Web3Utils.isValidAddress(receiveAddress);
    if (!isValidAddr) {
      setAddressErrorMessage('유효하지 않은 지갑주소입니다.');
      setIsValidReceiveAddress(false);
      return false;
    }
    if (address === receiveAddress) {
      setAddressErrorMessage('본인에게 송금할 수 없습니다.');
      setIsValidReceiveAddress(false);
      return false;
    }
    setIsValidReceiveAddress(true);
    setAddressErrorMessage('');
    return true;
  };

  const onFocus = async () => {
    await getBalanceAndFee();
  };

  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  const renderTokenView = useMemo(() => {
    if (Utils.changeNumberComma(balance, true) === '0') {
      return <Text style={styles.emptyText}>보유한 토큰이 없어요</Text>;
    }

    return (
      <View style={{ rowGap: 48 }}>
        <View style={{ rowGap: 16 }}>
          <SPInput
            title="수량"
            placeholder={`최소 ${minWidrawAmount} PIE`}
            keyboardType="decimal-pad"
            value={Utils.changeNumberComma(wdReqAmount, true)}
            onChangeText={e => {
              const text = Utils.changeDecimalForInput(e, 16);
              checkAmount(text);
              setWdReqAmount(text);
            }}
            bottomText={wdReqAmountErrorMessage}
            error={wdReqAmountErrorMessage}
            rightButton={
              <PrimaryButton
                text="최대"
                outlineButton
                buttonStyle={{
                  height: 31,
                  width: 51,
                }}
                buttonTextStyle={{
                  ...fontStyles.fontSize13_Medium,
                }}
                onPress={setWdReqAmountToMax}
              />
            }
          />
          <SPInput
            title="지갑주소"
            placeholder="지갑주소를 입력해주세요"
            value={receiveAddress}
            onChangeText={setReceiveAddress}
            noEditable={isValidReceiveAddress}
            checkImage={isValidReceiveAddress}
            rightButton={
              <PrimaryButton
                text="확인"
                outlineButton
                buttonStyle={{
                  height: 31,
                  width: 51,
                }}
                buttonTextStyle={{
                  ...fontStyles.fontSize13_Medium,
                }}
                onPress={checkWalletAddr}
              />
            }
            bottomText={addressErrorMessage}
            error={addressErrorMessage}
          />

          <Pressable
            onPress={() => {
              setShowCheckSendPwdModal(true);
            }}
            disabled={checkSendPwd}>
            <SPInput
              title="송금 비밀번호"
              placeholder="송금 비밀번호를 입력해주세요"
              value={password}
              onChangeText={setPassword}
              editable={false}
              inputBoxStyle={{
                backgroundColor: checkSendPwd
                  ? COLORS.fillNormal
                  : COLORS.white,
              }}
            />
          </Pressable>
        </View>

        <View
          style={{
            rowGap: 16,
          }}>
          <Text style={fontStyles.fontSize14_Medium}>전송수량</Text>

          <View style={styles.tranferQuantityWrapper}>
            <SPSvgs.WalletToken />
            <Text style={fontStyles.fontSize16_Bold}>PIE</Text>
            <Text
              style={[
                fontStyles.fontSize16_Bold,
                {
                  marginLeft: 'auto',
                },
              ]}>
              {Utils.changeNumberComma(balance, true)} PIE
            </Text>
          </View>

          <View style={styles.menuWrapper}>
            <Text style={styles.menuText}>수수료</Text>
            <Text style={styles.menuValueText}>
              {Utils.changeNumberComma(fee)}{' '}
              <Text
                style={{
                  color: COLORS.labelNeutral,
                }}>
                P
              </Text>
            </Text>
          </View>

          <View style={styles.menuWrapper}>
            <Text style={styles.menuText}>남은 소셜토큰</Text>
            <Text style={styles.menuValueText}>
              {Utils.changeNumberComma(
                Number(point) - Number(fee) ?? '0',
                true,
              )}{' '}
              <Text
                style={{
                  color: COLORS.labelNeutral,
                }}>
                P
              </Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }, [
    wdReqAmount,
    wdReqAmountErrorMessage,
    receiveAddress,
    balance,
    checkSendPwd,
    addressErrorMessage,
    isValidReceiveAddress,
    minWidrawAmount,
  ]);

  if (!address) {
    return <SPLoading />;
  }

  return !isFocus ? (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={0}
      behavior="padding">
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="보내기" />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.headerText}>얼마나 보낼까요?</Text>

          <View style={styles.walletWrapper}>
            <SPSvgs.WalletToken />
            <Text style={fontStyles.fontSize20_Semibold}>
              {Utils.changeNumberComma(balance, true)} PIE
            </Text>
          </View>

          {!isFocus && renderTokenView}
        </ScrollView>

        {Utils.changeNumberComma(balance, true) !== '0' && (
          <PrimaryButton
            disabled={
              !(
                isValidReceiveAddress &&
                !wdReqAmountErrorMessage &&
                checkSendPwd
              )
            }
            onPress={() => {
              setShowSendModal(true);
            }}
            text="보내기"
            buttonStyle={styles.submitButton}
          />
        )}

        <Modal
          animationType="slide"
          visible={showCheckSendPwdModal}
          onRequestClose={() => setShowCheckSendPwdModal(false)}>
          <WalletPwd
            sendPage
            onSuccess={e => {
              setCheckSendPwd(e);
              setShowCheckSendPwdModal(false);
            }}
          />
        </Modal>

        <SPModal
          visible={showSendModal}
          title="확인"
          contents="PIE를 전송하시겠습니까?"
          onConfirm={moveSending}
          onCancel={() => {
            setShowSendModal(false);
          }}
          onClose={() => {
            setShowSendModal(false);
          }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  ) : (
    <SPLoading />
  );
}

export default memo(WalletSend);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    rowGap: 48,
  },
  submitButton: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  headerText: {
    ...fontStyles.fontSize20_Semibold,
    textAlign: 'center',
  },
  walletWrapper: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyText: {
    ...fontStyles.fontSize14_Medium,
    textAlign: 'center',
    marginTop: 24,
    color: COLORS.red,
  },
  tranferQuantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  menuWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuText: {
    ...fontStyles.fontSize11_Medium,
    color: COLORS.labelAlternative,
  },
  menuValueText: {
    ...fontStyles.fontSize13_Semibold,
    color: COLORS.darkBlue,
  },
});
