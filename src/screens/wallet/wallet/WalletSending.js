import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiPostMoreWalletWithdrawComplete,
  apiPostSendFee,
} from '../../../api/RestAPI';
import { SPGifs } from '../../../assets/gif';
import { MODAL_CLOSE_EVENT } from '../../../common/constants/modalCloseEvent';
import { navName } from '../../../common/constants/navName';
import NavigationService from '../../../navigation/NavigationService';
import backHandlerUtils from '../../../utils/BackHandlerUtils';
import Utils from '../../../utils/Utils';
import Web3Utils from '../../../utils/Web3Utils';

// 지갑 보내기중
function WalletSending({ route }) {
  const { width } = useWindowDimensions();
  const { from, to, amount } = route.params;
  console.log({ from, to, amount });

  const send = async () => {
    try {
      // 트랜잭션을 위한 가스비 받기
      const params = {
        from,
        to,
        amount,
      };
      const { data } = await apiPostSendFee(params);
      const receipt = await Web3Utils.sendToken(to, amount);
      const completeParams = {
        walletAddr: receipt.from,
        amount,
        blockNumber: Number(receipt.blockNumber),
        txid: receipt.transactionHash,
        toAddress: to,
        fee: receipt.totalGasFeeInBnb,
      };
      await apiPostMoreWalletWithdrawComplete(completeParams);
      NavigationService.replace(navName.walletSendClear);
    } catch (error) {
      // handleError(error);
      Utils.openModal({
        title: '실패',
        body: 'PIE 전송에 실패하였습니다. \n잠시 후 다시 시도해주시기 바랍니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      backHandlerUtils.remove();
      backHandlerUtils.add(() => {
        return true; // 뒤로가기 이벤트 막기
      });
      send();
    }, []),
  );

  let imageHeight;
  if (width <= 480) {
    imageHeight = 203;
  } else {
    const aspectRatio = 360 / 203;
    imageHeight = width / aspectRatio;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentBox}>
        <Image
          source={SPGifs.sending}
          style={{ width: 200, height: 200, marginBottom: 16 }}
        />
        <Text style={styles.mainText}>보내기 진행 중</Text>
        <View>
          <Text style={styles.subText}>보내기 진행 중이에요.</Text>
          <Text style={styles.subText}>
            최대 2분 정도 걸릴 수 있으니 잠시만 기다려 주세요.
          </Text>
          <Text style={styles.subText}>
            완료되면 거래내역에서 확인하실 수 있어요!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(WalletSending);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  contentBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  mainText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 16,
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
    textAlign: 'center',
  },
});
