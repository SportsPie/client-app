import React, { memo, useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { useAppState } from '../../utils/AppStateContext';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import TournamentBasicInfo from '../../components/tournament/TournamentBasicInfo';
import TournamentAmountInfo from '../../components/tournament/TournamentAmountInfo';
import TournamentRefundInfo from '../../components/tournament/TournamentRefundInfo';
import TournamentApplyInfo from '../../components/tournament/TournamentApplyInfo';
import Checkbox from '../../components/Checkbox';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import {
  apiGetTournamentMngSubmissionDetail,
  apiPostTournamentMngRefund,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import { PARTICIPATION_STATE } from '../../common/constants/ParticipationState';

function TournamentRefundRequest({ route }) {
  /**
   * state
   */
  const prtIdx = route?.params?.prtIdx;
  const {
    applyData: { refundBank, refundAccount, refundName },
  } = useAppState();
  const refundData = { refundBank, refundAccount, refundName };
  const trlRef = useRef({ current: { disabled: false } });
  const [fstCall, setFstCall] = useState(false);
  const [participationDetail, setParticipationDetail] = useState({});
  const [optionList, setOptionList] = useState([]);
  const [playerList, setPlayerList] = useState([]);
  const [isCancelAgree, setIsCancelAgree] = useState(false);

  /**
   * api
   */
  const getParticipationDetail = async () => {
    try {
      const { data } = await apiGetTournamentMngSubmissionDetail(prtIdx);
      setParticipationDetail(data.data.participation);
      setOptionList(data.data.optionList);
      setPlayerList(data.data.playerList);
    } catch (error) {
      handleError(error);
    }
    setFstCall(true);
  };

  const refundRequest = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const params = {
        prtIdx,
        depositName: refundData.refundName,
        bankName: refundData.refundBank,
        accountNo: refundData.refundAccount,
      };
      const { data } = await apiPostTournamentMngRefund(params);
      NavigationService.navigate(navName.tournamentRefundRequestComplete, {
        prtIdx,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const switchIsCancelAgree = () => setIsCancelAgree(!isCancelAgree);

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getParticipationDetail();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="환불 신청" />
      {fstCall && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.contentsWrapper}>
            <Text style={styles.contentsTitle}>대회 정보</Text>
            <TournamentBasicInfo trnData={participationDetail} />
          </View>
          <Divider lineHeight={8} lineColor={COLORS.indigo90} />
          <View style={styles.contentsWrapper}>
            <Text style={styles.contentsTitle}>접수 정보</Text>
            <TournamentApplyInfo
              applyStatusProps={{
                statusText: PARTICIPATION_STATE.CONFIRMED.desc,
                color: COLORS.white,
                backgroundColor: COLORS.orange,
                targetName: participationDetail?.targetName,
              }}
              playerListData={playerList}
            />
          </View>
          <Divider lineHeight={8} lineColor={COLORS.indigo90} />
          <View style={styles.contentsWrapper}>
            <Text style={styles.contentsTitle}>환불 금액</Text>
            <TournamentAmountInfo
              targetName={participationDetail?.targetName}
              totalAmount={participationDetail?.prtPrice}
              optionList={optionList}
              confirmDate={participationDetail?.depositDate}
              sumOption={true}
            />
          </View>
          <Divider lineHeight={8} lineColor={COLORS.indigo90} />
          <View style={styles.contentsWrapper}>
            <Text style={styles.contentsTitle}>환불 정보</Text>
            <TournamentRefundInfo
              refundData={{
                // prtPrice: participationDetail?.prtPrice,
                refundBankName: refundData.refundBank,
                refundAccountNo: refundData.refundAccount,
                refundDepositName: refundData.refundName,
              }}
            />
          </View>
          <Divider lineHeight={8} lineColor={COLORS.indigo90} />
          <View style={{ padding: 16 }}>
            <Checkbox
              selected={isCancelAgree}
              label={'위 사항을 모두 확인하였으며,\n접수 취소에 동의합니다.'}
              onPress={switchIsCancelAgree}
              checkBoxStyle={{ margin: 3 }}
              labelStyle={styles.cancelAgreeText}
            />
          </View>
          <View style={{ padding: 16 }}>
            <PrimaryButton
              disabled={!isCancelAgree}
              text="접수 취소하기"
              onPress={() => {
                refundRequest();
              }}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
export default memo(TournamentRefundRequest);

const styles = StyleSheet.create({
  contentsWrapper: { rowGap: 16, paddingVertical: 24, paddingHorizontal: 16 },
  contentsTitle: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  cancelAgreeText: {
    ...fontStyles.fontSize16_Regular,
    letterSpacing: 0.091,
  },
});
