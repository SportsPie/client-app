import React, { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiPostWallet } from '../../../api/RestAPI';
import { navName } from '../../../common/constants/navName';
import { PrimaryButton } from '../../../components/PrimaryButton';
import SPLoading from '../../../components/SPLoading';
import PrivateKeyTab from '../../../components/wallet-backup/PrivateKeyTab';
import RecoverySeedTab from '../../../components/wallet-backup/RecoverySeedTab';
import NavigationService from '../../../navigation/NavigationService';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import { handleError } from '../../../utils/HandleError';
import Utils from '../../../utils/Utils';
import WalletUtils from '../../../utils/WalletUtils';
import Header from '../../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

function WalletBackUp() {
  const navigation = useNavigation();
  // const { setActiveTab } = useAppState();
  const tabKeys = { restoreSeed: 'restoreSeed', privateKey: 'privateKey' };
  const [mnemonicTextList, setMnemonicTextList] = useState([]);
  const [pk, setPk] = useState('');
  const [tabKey, setTabKey] = useState(tabKeys.restoreSeed);

  const [isLoading, setIsLoading] = useState(false);
  const createWallet = () => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        // mnemonic 생성
        const mnemonic = WalletUtils.getMnemonic();

        // 지갑 생성
        const wallet = await WalletUtils.getWalletByMnemonnic(mnemonic);

        const { address, privateKey } = wallet;

        // api 호출
        const params = {
          walletAddr: address,
        };
        // 지갑 등록
        const { data } = await apiPostWallet(params);
        const { auth } = await Utils.getUserInfo();
        // 지갑주소, 개인키를 localStorage에 저장
        WalletUtils.saveWalletAddress(auth, address);
        WalletUtils.saveWalletPrivateKey(auth, privateKey);
        WalletUtils.saveWalletMnemonnic(auth, mnemonic);
        setMnemonicTextList(mnemonic?.split(' ') || []);
        setPk(privateKey);
        let walletCreated = false;
        while (walletCreated) {
          // eslint-disable-next-line no-await-in-loop
          walletCreated = await WalletUtils.getWalletAddress();
        }
      } catch (error) {
        if (error?.code === 5103) {
          handleError(error);
        } else {
          Utils.openModal({
            title: '실패',
            body: '지갑생성에 실패하였습니다. \n 잠시 후 다시 시도해주시기 바랍니다.',
          });
        }
        NavigationService.goBack(2);
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  useEffect(() => {
    createWallet();
  }, []);

  const renderHeader = useMemo(() => {
    return (
      <View style={{ rowGap: 16 }}>
        <Text
          style={[
            fontStyles.fontSize20_Semibold,
            {
              textAlign: 'center',
            },
          ]}>
          {'새로운 지갑을 만들었어요!\n이제 지갑을 안전하게 백업하세요'}
        </Text>
        <Text
          style={[
            fontStyles.fontSize12_Medium,
            { color: COLORS.labelNeutral, textAlign: 'center' },
          ]}>
          {
            '복구시드와 프라이빗키를 종이에 적거나 안전한 곳에 보관하세요.\n해당 정보를 이용하면 언제든 지갑을 복구할 수 있어요.'
          }
        </Text>
      </View>
    );
  }, []);

  const renderTabBar = useMemo(() => {
    return (
      <View style={styles.tabBarContainer}>
        <Pressable
          style={[
            styles.tabBar,
            {
              backgroundColor:
                tabKey === tabKeys.restoreSeed ? COLORS.white : 'transparent',
            },
          ]}
          onPress={() => {
            setTabKey(tabKeys.restoreSeed);
          }}>
          <Text
            style={[
              styles.tabBarText,
              {
                color:
                  tabKey === tabKeys.restoreSeed
                    ? COLORS.orange
                    : COLORS.labelAssistive,
              },
            ]}>
            복구시드
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabBar,
            {
              backgroundColor:
                tabKey === tabKeys.privateKey ? COLORS.white : 'transparent',
            },
          ]}
          onPress={() => {
            setTabKey(tabKeys.privateKey);
          }}>
          <Text
            style={[
              styles.tabBarText,
              {
                color:
                  tabKey === tabKeys.privateKey
                    ? COLORS.orange
                    : COLORS.labelAssistive,
              },
            ]}>
            프라이빗키
          </Text>
        </Pressable>
      </View>
    );
  }, [tabKey]);

  const renderTab = useMemo(() => {
    switch (tabKey) {
      case tabKeys.restoreSeed:
        return <RecoverySeedTab data={mnemonicTextList} />;
      default:
        return <PrivateKeyTab keyValue={pk} />;
    }
  }, [tabKey, pk, mnemonicTextList]);

  if (isLoading) {
    return <SPLoading />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        title=""
        closeIcon
        onLeftIconPress={() => {
          NavigationService.navigate(navName.socialToken);
        }}
      />

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          {renderHeader}

          {renderTabBar}

          <View
            style={{
              marginTop: -8,
            }}>
            {renderTab}
          </View>
        </ScrollView>

        <PrimaryButton
          text="완료"
          onPress={() => {
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
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(WalletBackUp);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  content: {
    paddingTop: 24,
    rowGap: 24,
    paddingBottom: 24,
  },
  tabBarContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    backgroundColor: COLORS.peach,
    marginTop: 24,
  },
  tabBarText: {
    ...fontStyles.fontSize14_Semibold,
  },
  tabBar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
    borderRadius: 8,
    padding: 8,
  },
});
