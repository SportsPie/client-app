import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { apiGetTokenBalance } from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import SocialTokenBalance from '../../components/wallet/SocialTokenBalance';
import WalletBalance from '../../components/wallet/WalletBalance';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import { handleError } from '../../utils/HandleError';
import WalletUtils from '../../utils/WalletUtils';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function SocialToken() {
  /**
   * state
   */

  const [createdWallet, setCreatedWallet] = useState(false);
  const [point, setPoint] = useState(0);
  const [balance, setBalance] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * api
   */
  const getSocialTokenBalance = async () => {
    try {
      const walletAddr = await WalletUtils.getWalletAddress();
      setCreatedWallet(!!walletAddr);

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

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getSocialTokenBalance();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="소셜토큰" />

      <View>
        <ScrollView
          contentContainerStyle={{
            alignSelf: 'flex-start',
            paddingTop: 16,
          }}
          onScroll={e => {
            setCurrentIndex(
              Math.floor(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32)),
            );
          }}
          scrollEventThrottle={16}
          pagingEnabled
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <SocialTokenBalance value={point} />
          {createdWallet && <WalletBalance value={balance} />}
        </ScrollView>
      </View>

      {createdWallet && (
        <View style={styles.indicatorWrapper}>
          <View
            style={[
              styles.indicator,
              {
                width: currentIndex === 0 ? 24 : 12,
                backgroundColor:
                  currentIndex === 0 ? COLORS.darkBlue : `${COLORS.darkBlue}50`,
              },
            ]}
          />
          <View
            style={[
              styles.indicator,
              {
                width: currentIndex === 1 ? 24 : 12,
                backgroundColor:
                  currentIndex === 1 ? COLORS.darkBlue : `${COLORS.darkBlue}50`,
              },
            ]}
          />
        </View>
      )}
      {!createdWallet && (
        <PrimaryButton
          onPress={() => NavigationService.navigate(navName.createWallet)}
          icon={
            <SPSvgs.Wallet stroke={COLORS.darkBlue} width={20} height={20} />
          }
          text="지갑을 만들어보세요"
          outlineButton
          buttonStyle={{
            marginHorizontal: 16,
            marginVertical: 24,
            marginTop: 'auto',
          }}
        />
      )}
    </SafeAreaView>
  );
}

export default memo(SocialToken);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicator: {
    height: 4,
    borderRadius: 99,
  },
  indicatorWrapper: {
    flexDirection: 'row',
    columnGap: 4,
    marginTop: 13,
    alignSelf: 'center',
  },
});
