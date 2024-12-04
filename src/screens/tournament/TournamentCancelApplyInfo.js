import React, { memo, useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import TournamentBasicInfo from '../../components/tournament/TournamentBasicInfo';
import TournamentAmountInfo from '../../components/tournament/TournamentAmountInfo';
import TournamentApplyInfo from '../../components/tournament/TournamentApplyInfo';
import Checkbox from '../../components/Checkbox';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { useFocusEffect } from '@react-navigation/native';
import {
  apiGetTournamentMngSubmissionDetail,
  apiPatchTournamentMngApply,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';

function TournamentCancelTournamentApplyInfo({ route }) {
  /**
   * state
   */
  const prtIdx = route?.params?.prtIdx;
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

  const cancelApply = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiPatchTournamentMngApply(prtIdx);
      NavigationService.navigate(navName.tournamentCancelApplyComplete, {
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
      <Header title="접수 취소" />
      {fstCall && (
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.contentsWrapper}>
              <Text style={styles.contentsTitle}>대회 정보</Text>
              <TournamentBasicInfo trnData={participationDetail} />
            </View>
            <Divider lineHeight={8} lineColor={COLORS.indigo90} />
            <View style={styles.contentsWrapper}>
              <Text style={styles.contentsTitle}>접수 정보</Text>
              <TournamentApplyInfo
                applyStatusProps={{
                  statusText: `대기 ${Utils.changeNumberComma(
                    participationDetail?.waitNo,
                  )}번`,
                  color: COLORS.darkBlue,
                  backgroundColor: '#E6E9F1',
                  targetName: participationDetail?.targetName,
                }}
                playerListData={playerList}
              />
            </View>
            <Divider lineHeight={8} lineColor={COLORS.indigo90} />
            <View style={styles.contentsWrapper}>
              <Text style={styles.contentsTitle}>예정 금액</Text>
              <TournamentAmountInfo
                isTotalAltColor
                targetName={participationDetail?.targetName}
                totalAmount={participationDetail?.prtPrice}
                optionList={optionList}
                confirmDate={participationDetail?.depositDate}
                sumOption={true}
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
          </ScrollView>
          <View style={{ padding: 16 }}>
            <PrimaryButton
              disabled={!isCancelAgree}
              text="접수 취소하기"
              onPress={() => {
                cancelApply();
              }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
export default memo(TournamentCancelTournamentApplyInfo);

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
