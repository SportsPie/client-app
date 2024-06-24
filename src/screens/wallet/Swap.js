import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SPSvgs } from '../../assets/svg';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SwapConfirmModal from '../../components/swap/SwapConfirmModal';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import WalletUtils from '../../utils/WalletUtils';
import {
  apiGetMoreWalletSwapRate,
  apiGetTokenBalance,
  apiPostMoreWalletMoreWalletSwap,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import Utils from '../../utils/Utils';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

const SWAP_TYPE = {
  WALLET: 'WALLET',
  TOKEN: 'TOKEN',
};

function Swap() {
  /**
   * state
   */
  const confirmModalRef = useRef();
  const [swapTo, setSwapTo] = useState(SWAP_TYPE.WALLET);
  const [swapValue, setSwapValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [point, setPoint] = useState(0);
  const [balance, setBalance] = useState(0);
  const [swapRate, setSwapRate] = useState(0);
  const trlRef = useRef({ current: { disabled: false } });

  const getReturnedSwapValue = useMemo(() => {
    if (swapTo === SWAP_TYPE.WALLET && swapValue) {
      return `${Number(swapValue ?? '0') * swapRate}`;
    }

    if (swapTo === SWAP_TYPE.TOKEN && swapValue) {
      return `${Number(swapValue ?? 0) / swapRate}`;
    }

    return '';
  }, [swapTo, swapValue, swapRate]);

  /**
   * api
   */
  const getSocialTokenBalance = async () => {
    try {
      const walletAddr = await WalletUtils.getWalletAddress();
      const { data } = await apiGetTokenBalance(
        walletAddr ? walletAddr : 'entity',
      );
      const { point: pointDetail, wallet: walletDetail } = data?.data || {};
      setPoint(pointDetail?.pointBalance || 0);
      setBalance(walletDetail?.balance || 0);
    } catch (error) {
      handleError(error);
    }
  };

  const getSwapRate = async () => {
    try {
      const { data } = await apiGetMoreWalletSwapRate();
      setSwapRate(Math.abs(data.message));
    } catch (error) {
      handleError(error);
    }
  };

  const swap = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const walletAddr = await WalletUtils.getWalletAddress();
      const params = {
        walletAddr,
        swapAmount: Number(swapValue),
      };
      const { data } = await apiPostMoreWalletMoreWalletSwap(params);
      NavigationService.replace(navName.swapTranfer);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getSocialTokenBalance();
      getSwapRate();
    }, []),
  );

  useEffect(() => {
    if (swapTo === SWAP_TYPE.WALLET) {
      if (Number(getReturnedSwapValue || 0) > Number(point)) {
        setErrorMessage('보유 소셜토큰 자금이 부족합니다.');
      } else {
        setErrorMessage('');
      }
    }

    if (swapTo === SWAP_TYPE.TOKEN) {
      if (Number(getReturnedSwapValue || 0) > Number(balance)) {
        setErrorMessage('보유 PIE 자금이 부족합니다.');
      } else {
        setErrorMessage('');
      }
    }
  }, [swapValue, swapTo, point, balance]);

  /**
   * render
   */
  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="스왑" />

        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.tokenWrapper}>
              <View style={styles.tokenHeader}>
                {swapTo === SWAP_TYPE.WALLET ? (
                  <SPSvgs.SocialToken />
                ) : (
                  <SPSvgs.WalletToken />
                )}
                <Text style={styles.tokenName}>
                  {swapTo === SWAP_TYPE.WALLET ? '보낼 수량' : '받을 수량'}
                </Text>
                <Text style={[styles.currentTokenValue]}>
                  {swapTo === SWAP_TYPE.WALLET
                    ? `보유 소셜토큰 : ${Utils.changeNumberComma(point)}P`
                    : `보유 PIE : ${Utils.changeNumberComma(balance)} PIE`}
                </Text>
              </View>

              <TextInput
                placeholder="0"
                placeholderTextColor={COLORS.black}
                style={[
                  styles.input,
                  {
                    backgroundColor: 'rgba(135, 141, 150, 0.08)',
                    borderColor: 'transparent',
                  },
                ]}
                keyboardType="decimal-pad"
                textAlign="right"
                editable={false}
                value={getReturnedSwapValue}
              />
            </View>

            <View style={styles.dividerWrapper}>
              <Pressable
                disabled
                onPress={() => {
                  setSwapValue('');
                  if (swapTo === SWAP_TYPE.WALLET) {
                    setSwapTo(SWAP_TYPE.TOKEN);
                  } else {
                    setSwapTo(SWAP_TYPE.WALLET);
                  }
                }}
                style={styles.swapButton}>
                <SPSvgs.Swap fill={COLORS.white} />
              </Pressable>
              <View style={styles.divider} />
            </View>

            <View style={styles.tokenWrapper}>
              <View style={styles.tokenHeader}>
                {swapTo === SWAP_TYPE.WALLET ? (
                  <SPSvgs.WalletToken />
                ) : (
                  <SPSvgs.SocialToken />
                )}
                <Text style={styles.tokenName}>
                  {swapTo === SWAP_TYPE.WALLET ? '받을 수량' : '보낼 수량'}
                </Text>
                <Text style={[styles.currentTokenValue]}>
                  {swapTo === SWAP_TYPE.WALLET
                    ? `보유 PIE : ${Utils.changeNumberComma(balance)} PIE`
                    : `보유 소셜토큰 : ${Utils.changeNumberComma(point)}P`}
                </Text>
              </View>

              <TextInput
                placeholder="0"
                placeholderTextColor={COLORS.labelAlternative}
                style={styles.input}
                keyboardType="decimal-pad"
                textAlign="right"
                value={swapValue}
                onChangeText={text => {
                  setSwapValue(Utils.changeIntegerForInput(text));
                }}
                maxLength={10}
              />
            </View>

            <View style={styles.unitWrapper}>
              <Text style={styles.unitText}>
                1 PIE ≈ {Utils.changeNumberComma(swapRate)} P
              </Text>
            </View>
          </View>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <PrimaryButton
            text="스왑"
            buttonStyle={styles.submit}
            disabled={!swapValue || errorMessage?.length > 0}
            onPress={() => {
              confirmModalRef?.current?.show();
            }}
          />
        </View>
      </SafeAreaView>

      <SwapConfirmModal
        ref={confirmModalRef}
        sendAmount={getReturnedSwapValue}
        receiveAmount={swapValue}
        remainAmount={point - Number(getReturnedSwapValue || 0)}
        onConfirm={swap}
      />
    </DismissKeyboard>
  );
}

export default memo(Swap);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  submit: {
    marginTop: 'auto',
  },
  content: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 16,
    borderRadius: 16,
    rowGap: 24,
  },
  tokenWrapper: {
    rowGap: 16,
    alignItems: 'center',
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    width: '100%',
  },
  currentTokenValue: {
    ...fontStyles.fontSize12_Semibold,
    marginLeft: 'auto',
    color: COLORS.labelAlternative,
  },
  tokenName: {
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.203,
    color: COLORS.labelNormal,
  },
  input: {
    ...fontStyles.fontSize20_Semibold,
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: COLORS.lineBorder,
    paddingHorizontal: 16,
    letterSpacing: -0.24,
    height: 48,
  },
  unitText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  unitWrapper: {
    backgroundColor: COLORS.fillNormal,
    alignSelf: 'center',
    padding: 8,
    borderRadius: 999,
  },
  swapButton: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  dividerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lineBorder,
    width: '100%',
    position: 'absolute',
  },
  errorText: {
    ...fontStyles.fontSize12_Regular,
    color: COLORS.statusNegative,
    marginTop: 16,
    letterSpacing: 0.302,
  },
});
