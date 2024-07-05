import React, { memo, useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { isIphoneX } from '../common/constants/constants';
import Checkbox from '../components/Checkbox';
import { PrimaryButton } from '../components/PrimaryButton';
import Header from '../components/header';
import BoxItem from '../components/unsubscribe/BoxItem';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import WalletUtils from '../utils/WalletUtils';
import {
  apiGetMyInfo,
  apiGetTokenBalance,
  apiRemoveMember,
} from '../api/RestAPI';
import { handleError } from '../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import NavigationService from '../navigation/NavigationService';
import Utils from '../utils/Utils';

function Unsubscribe() {
  /**
   * state
   */
  const trlRef = useRef({ current: { disabled: false } });

  const [isCreator, setIsCreator] = useState(false);
  const [point, setPoint] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isAgree, setIsAgree] = useState(false);

  /**
   * api
   */
  const getUserInfo = async () => {
    try {
      const { data } = await apiGetMyInfo();
      setIsCreator(data.data.academyCreator);
    } catch (error) {
      handleError(error);
    }
  };

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

  const leaveService = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      if (isCreator) {
        Utils.openModal({
          title: '알림',
          body: '아카데미 관리자는 회원탈퇴가 불가능합니다. \n아카데미 삭제 후 재시도 해주시기 바랍니다.',
        });
        return;
      }
      const { data } = await apiRemoveMember();
      Utils.logout(false, true);
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      const focus = async () => {
        await getUserInfo();
        await getSocialTokenBalance();
      };
      focus();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header closeIcon />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerTextWrapper}>
          <View>
            <Text style={styles.headerText}>탈퇴를 결정해서 아쉬워요</Text>
            <Text
              style={[
                styles.headerText,
                {
                  color: COLORS.orange,
                },
              ]}>
              혜택이 영구적으로 사라져요
            </Text>
          </View>
          <Text style={styles.subHeaderText}>
            {
              '탈퇴하시면 지금껏 모으신 소셜토큰과 코인이\n사라져 복구가 불가해요'
            }
          </Text>
        </View>

        <View style={styles.boxWrapper}>
          <BoxItem
            title="즉시 소멸"
            label="잔여 소셜토큰"
            value={`${point} P`}
          />
          <BoxItem
            title="즉시 소멸"
            label="잔여 코인"
            value={`${balance} PIE`}
          />
        </View>

        <View style={styles.termWrapper}>
          <Text style={styles.termText}>
            • 앱에서 등록한 지갑은 다시 등록할 수 없어요.
          </Text>
          <Text style={styles.termText}>
            • 계정 정보, 서비스 이용정보는 복구가 불가해요.
          </Text>
          <Text style={styles.termText}>
            • 등록된 커뮤니티 게시글 또는 댓글은 자동으로 삭제되지 않아요. 탈퇴
            전 개별적으로 삭제해 주세요.
          </Text>
        </View>

        <Checkbox
          label="위 주의사항을 모두 숙지했고, 탈퇴에 동의합니다."
          labelStyle={styles.labelStyle}
          selected={isAgree}
          onPress={() => setIsAgree(!isAgree)}
        />
      </ScrollView>

      <View
        style={[
          styles.buttonSWrapper,
          {
            marginBottom: isIphoneX() ? 0 : 24,
          },
        ]}>
        <PrimaryButton
          text="취소"
          outlineButton
          buttonStyle={styles.buttonStyle}
          onPress={() => {
            NavigationService.goBack();
          }}
        />
        <PrimaryButton
          disabled={!isAgree}
          text="회원탈퇴"
          buttonStyle={styles.buttonStyle}
          onPress={() => {
            leaveService();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(Unsubscribe);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonSWrapper: {
    flexDirection: 'row',
    columnGap: 8,
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  buttonStyle: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    rowGap: 24,
  },
  headerTextWrapper: {
    rowGap: 8,
    alignItems: 'center',
  },
  headerText: {
    ...fontStyles.fontSize20_Bold,
    textAlign: 'center',
    letterSpacing: -0.24,
    color: COLORS.labelNormal,
  },
  subHeaderText: {
    ...fontStyles.fontSize16_Medium,
    color: COLORS.labelNeutral,
    textAlign: 'center',
    letterSpacing: 0.091,
  },
  boxWrapper: {
    rowGap: 16,
    marginBottom: 24,
  },
  termWrapper: {
    top: -24,
    rowGap: 8,
  },
  termText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  labelStyle: {
    ...fontStyles.fontSize16_Regular,
    color: COLORS.labelNormal,
    letterSpacing: 0.091,
  },
});
