import React, { memo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import NavigationService from '../../navigation/NavigationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navName } from '../../common/constants/navName';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import { PrimaryButton } from '../../components/PrimaryButton';
import TournamentApplyInfo from '../../components/tournament/TournamentApplyInfo';
import TournamentBasicInfo from '../../components/tournament/TournamentBasicInfo';
import TournamentAmountInfo from '../../components/tournament/TournamentAmountInfo';
import SPModal from '../../components/SPModal';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import {
  apiGetTournamentMngCheckApply,
  apiPostTournamentMngApply,
} from '../../api/RestAPI';
import { useAppState } from '../../utils/AppStateContext';
import {
  tournamentOngoingListAction,
  tournamentOngoingListSlice,
} from '../../redux/reducers/list/tournamentOngoingListSlice';
import { useDispatch } from 'react-redux';
import { tournamentInProgressListAction } from '../../redux/reducers/list/tournamentInProgressListSlice';
import { tournamentFinishedListAction } from '../../redux/reducers/list/tournamentFinishedListSlice';

function TournamentApplyWaitOrPay({ route }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const { setTournamentApplyModalReset } = useAppState();
  const params = route?.params;
  const targetIdx = route?.params?.targetIdx;
  const targetName = route?.params?.targetName;
  const totalPrice = route?.params?.totalPrice || 0;
  const tournamentInfo = route?.params?.tournamentInfo;
  const playerList = route?.params?.playerList;
  const selectedOptionList = route?.params?.selectedOption;
  const [showWaitingNoticeModal, setShowWaitingNoticeModal] = useState(false);

  const trlRef = useRef({ current: { disabled: false } });

  /**
   * api
   */
  const applyCheck = async () => {
    try {
      const { data } = await apiGetTournamentMngCheckApply(targetIdx);
      if (!data.intended) {
        setShowWaitingNoticeModal(true);
      } else {
        apply();
      }
    } catch (error) {
      handleError(error);
    }
  };
  const apply = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiPostTournamentMngApply(params);
      NavigationService.navigate(navName.tournamentApplyComplete, {
        prtIdx: data.data.prtIdx,
        prtState: data.data.prtState,
      });
    } catch (error) {
      if (error.code === 7299) {
        dispatch(tournamentOngoingListAction.refresh());
        dispatch(tournamentInProgressListAction.refresh());
        dispatch(tournamentFinishedListAction.refresh());
        NavigationService.goBack(3);
      } else if (error.code === 7301) {
        NavigationService.goBack(2);
      }
      setTimeout(() => {
        handleError(error);
      }, 0);
    }
    trlRef.current.disabled = false;
  };

  /**
   * render
   */
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="결제" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.contentsWrapper}>
          <Text style={styles.contentsTitle}>대회 정보</Text>
          <TournamentBasicInfo
            trnData={{
              ...tournamentInfo,
              trnStartDate: tournamentInfo.startDate,
              trnEndDate: tournamentInfo.endDate,
            }}
          />
        </View>
        <Divider lineHeight={8} lineColor={COLORS.indigo90} />
        <View style={styles.contentsWrapper}>
          <Text style={styles.contentsTitle}>출전 선수 정보</Text>
          <TournamentApplyInfo
            applyStatusProps={{
              targetName,
            }}
            playerListData={playerList}
          />
        </View>
        <Divider lineHeight={8} lineColor={COLORS.indigo90} />
        <View style={styles.contentsWrapper}>
          <Text style={styles.contentsTitle}>결제 금액</Text>
          <TournamentAmountInfo
            targetName={targetName}
            totalAmount={totalPrice}
            optionList={selectedOptionList}
            sumOption={false}
          />
        </View>
      </ScrollView>
      <View style={styles.bottomButtonWrapper}>
        <PrimaryButton
          text="선수 변경"
          onPress={() => {
            NavigationService.goBack();
          }}
          outlineButton
          buttonStyle={[
            styles.bottomButton,
            { borderColor: 'rgba(135, 141, 150, 0.32)' },
          ]}
          buttonTextStyle={{ letterSpacing: 0.091 }}
        />
        <PrimaryButton
          text="접수 신청"
          onPress={() => {
            applyCheck();
          }}
          buttonStyle={[styles.bottomButton, { flex: 1 }]}
        />
      </View>
      <SPModal
        title="안내"
        contents={`현재는 대기 신청만 가능한 상태입니다.\n대기할 경우 대기번호 순으로 안내드립니다.\n접수 대기 신청 하시겠습니까?`}
        confirmButtonText="접수 대기 신청"
        onConfirm={() => {
          apply();
        }}
        onCancel={() => {
          setTournamentApplyModalReset(prev => !prev);
          NavigationService.goBack(2);
        }}
        visible={showWaitingNoticeModal}
        onClose={setShowWaitingNoticeModal}
      />
    </SafeAreaView>
  );
}
export default memo(TournamentApplyWaitOrPay);

const styles = StyleSheet.create({
  contentsWrapper: { rowGap: 16, paddingVertical: 24, paddingHorizontal: 16 },
  contentsTitle: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  bottomButtonWrapper: {
    flexDirection: 'row',
    padding: 16,
    columnGap: 8,
  },
  bottomButton: {
    padding: 12,
  },
});
