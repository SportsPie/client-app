import React, { memo, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import TournamentBasicInfo from '../../components/tournament/TournamentBasicInfo';
import TournamentApplyInfo from '../../components/tournament/TournamentApplyInfo';
import TournamentDepositInfo from '../../components/tournament/TournamentDepositInfo';
import TournamentAmountInfo from '../../components/tournament/TournamentAmountInfo';
import TournamentRefundInfo from '../../components/tournament/TournamentRefundInfo';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import { apiGetTournamentMngSubmissionDetail } from '../../api/RestAPI';
import { useFocusEffect } from '@react-navigation/native';
import { PARTICIPATION_STATE } from '../../common/constants/ParticipationState';
import Utils from '../../utils/Utils';
import { academyMatchingRegistrationListAction } from '../../redux/reducers/list/academyMatchingRegistrationListSlice';
import { useDispatch } from 'react-redux';
import { store } from '../../redux/store';

function TournamentApplyDetail({ route }) {
  /**
   * state
   */
  const prtIdx = route?.params?.prtIdx;
  const dispatch = useDispatch();
  const [fstCall, setFstCall] = useState(false);
  const [participationDetail, setParticipationDetail] = useState({});
  const [optionList, setOptionList] = useState([]);
  const [playerList, setPlayerList] = useState([]);

  const participationState = participationDetail?.prtState;
  const isWaiting = participationState === PARTICIPATION_STATE.WAITING.value;
  const isPaypending =
    participationState === PARTICIPATION_STATE.PAY_PENDING.value;
  const isConfimed = participationState === PARTICIPATION_STATE.CONFIRMED.value;
  const isCancel = participationState === PARTICIPATION_STATE.CANCEL.value;
  const isRefundRequest =
    participationState === PARTICIPATION_STATE.REFUND_REQUEST.value;
  const isRefundcomplete =
    participationState === PARTICIPATION_STATE.REFUND_COMPLETE.value;

  const applyInfoProps = {
    applyStatusProps: {
      statusText: isWaiting
        ? `대기 ${Utils.changeNumberComma(participationDetail?.waitNo)}번`
        : isPaypending
        ? PARTICIPATION_STATE.PAY_PENDING.desc
        : isConfimed
        ? PARTICIPATION_STATE.CONFIRMED.desc
        : isCancel
        ? PARTICIPATION_STATE.CANCEL.desc
        : isRefundRequest
        ? PARTICIPATION_STATE.REFUND_REQUEST.desc
        : isRefundcomplete
        ? PARTICIPATION_STATE.REFUND_COMPLETE.desc
        : '-',
      color: isWaiting
        ? COLORS.darkBlue
        : isPaypending
        ? COLORS.orange
        : isConfimed
        ? COLORS.white
        : COLORS.statusNegative,
      backgroundColor: isWaiting
        ? '#E6E9F1'
        : isPaypending
        ? 'rgba(255, 124, 16, 0.15)'
        : isConfimed
        ? COLORS.orange
        : 'rgba(255, 66, 66, 0.15)',
      targetName: participationDetail?.targetName,
    },
    applyDate: participationDetail?.regDate,
    cancelDate: isCancel ? participationDetail?.cancelDate : undefined,
  };

  const amountInfoTitle =
    isWaiting || isCancel
      ? '예정 금액'
      : isConfimed
      ? '결제 정보'
      : '결제 금액';

  const amountInfoConfirmDate =
    isConfimed || isRefundRequest || isRefundcomplete
      ? participationDetail?.depositDate
      : undefined;

  /**
   * api
   */
  const getParticipationDetail = async () => {
    try {
      const { data } = await apiGetTournamentMngSubmissionDetail(prtIdx);
      setParticipationDetail(data.data.participation);
      setOptionList(data.data.optionList);
      setPlayerList(data.data.playerList);
      const stateList = store.getState()?.academyMatchingRegistrationList?.list;
      const prt = stateList.find(
        item => item.prtIdx === data.data.participation.prtIdx,
      );
      if (data.data.participation.trnState !== prt?.trnState) {
        dispatch(academyMatchingRegistrationListAction.refreshAndTypeReset());
      } else {
        dispatch(
          academyMatchingRegistrationListAction.modifyItemForApply({
            idxName: 'prtIdx',
            idx: data.data?.participation?.prtIdx,
            item: data.data.participation,
          }),
        );
      }
    } catch (error) {
      handleError(error);
    }
    setFstCall(true);
  };

  /**
   * useEffect
   */

  useFocusEffect(
    useCallback(() => {
      getParticipationDetail();
    }, []),
  );

  /**
   * render
   */

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="접수 상세" closeIcon />
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
              {...applyInfoProps}
              playerListData={playerList}
            />
          </View>
          <Divider lineHeight={8} lineColor={COLORS.indigo90} />
          {isPaypending && (
            <>
              <View style={styles.contentsWrapper}>
                <Text style={styles.contentsTitle}>입금 정보</Text>
                <TournamentDepositInfo depositData={participationDetail} />
              </View>
              <Divider lineHeight={8} lineColor={COLORS.indigo90} />
            </>
          )}
          <View style={styles.contentsWrapper}>
            <Text style={styles.contentsTitle}>{amountInfoTitle}</Text>
            <TournamentAmountInfo
              isTotalFontSize18
              targetName={participationDetail?.targetName}
              totalAmount={participationDetail?.prtPrice}
              optionList={optionList}
              confirmDate={amountInfoConfirmDate}
              sumOption={true}
            />
          </View>
          {(isRefundRequest || isRefundcomplete) && (
            <>
              <Divider lineHeight={8} lineColor={COLORS.indigo90} />
              <View style={styles.contentsWrapper}>
                <Text style={styles.contentsTitle}>환불 정보</Text>
                <TournamentRefundInfo refundData={participationDetail} />
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
export default memo(TournamentApplyDetail);

const styles = StyleSheet.create({
  contentsWrapper: { rowGap: 16, paddingVertical: 24, paddingHorizontal: 16 },
  contentsTitle: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
});
