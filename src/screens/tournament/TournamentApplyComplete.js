import React, { memo, useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Collapsible from 'react-native-collapsible';
import { useFocusEffect } from '@react-navigation/native';
import NavigationService from '../../navigation/NavigationService';
import { apiGetTournamentMngSubmissionDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { SPGifs } from '../../assets/gif';
import SPIcons from '../../assets/icon';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import SPModal from '../../components/SPModal';
import TournamentDepositInfo from '../../components/tournament/TournamentDepositInfo';
import TournamentAmountInfo from '../../components/tournament/TournamentAmountInfo';
import TournamentBasicInfo from '../../components/tournament/TournamentBasicInfo';
import TournamentApplyInfo from '../../components/tournament/TournamentApplyInfo';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { PARTICIPATION_STATE } from '../../common/constants/ParticipationState';
import { academyMatchingRegistrationListAction } from '../../redux/reducers/list/academyMatchingRegistrationListSlice';
import { useDispatch } from 'react-redux';
import Utils from '../../utils/Utils';
import { useAppState } from '../../utils/AppStateContext';

function TournamentApplyComplete({ route }) {
  const { setTournamentApplyModalReset } = useAppState();
  const dispatch = useDispatch();
  const prtIdx = route?.params?.prtIdx;
  const prtState = route?.params?.prtState;
  const [fstCall, setFstCall] = useState(false);
  const [participationDetail, setParticipationDetail] = useState({});
  const [optionList, setOptionList] = useState([]);
  const [playerList, setPlayerList] = useState([]);
  const [isPaymentAmountCollapsed, setIsPaymentAmountCollapsed] =
    useState(false);
  const [isPlayerListCollapsed, setIsPlayerListCollapsed] = useState(false);
  const [isEstimatedAmountCollapsed, setIsEstimatedAmountCollapsed] =
    useState(false);
  const [isDepositInfoCollapsed, setIsDepositInfoCollapsed] = useState(false);
  const isWaitingApply = prtState === PARTICIPATION_STATE.WAITING.value;

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
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

  // --------------------------------------------------
  // [ Function ]
  // --------------------------------------------------

  const refreshApplyHistoryList = () => {
    dispatch(academyMatchingRegistrationListAction.refreshAndTypeReset());
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      refreshApplyHistoryList();
      getParticipationDetail();
      setTournamentApplyModalReset(prev => !prev);
    }, []),
  );

  // --------------------------------------------------
  // [ Render ]
  // --------------------------------------------------

  const renderApplyResult = () => (
    <View style={styles.applyResultWrapper}>
      <Image
        source={SPGifs[isWaitingApply ? 'success' : 'handClap']}
        style={styles.applyResultGif}
      />
      <View style={{ rowGap: 4 }}>
        <Text style={styles.applyResultText}>
          {isWaitingApply
            ? `접수 대기 신청이 완료되었습니다!\n현재 대기 순서는 ${Utils.changeNumberComma(
                participationDetail.waitNo,
              )}번입니다.`
            : '접수 신청이 되었습니다!\n입금 확인 후 신청이 확정됩니다.'}
        </Text>
        <Text style={styles.applyResultSubText}>
          {isWaitingApply
            ? '신청이 가능해지면 바로 알림을 보내드리겠습니다.\n조금만 기다려주세요!'
            : '미입금시 접수 취소됩니다.\n궁금한 점이 있으시면 문의를 남겨주세요.'}
        </Text>
      </View>
    </View>
  );

  const renderDepositInfo = () => (
    <View style={styles.contentsWrapper}>
      <View style={styles.contentsTitleWrapper}>
        <Text style={styles.contentsTitleText}>입금 정보</Text>
        <Pressable
          hitSlop={10}
          onPress={() => setIsDepositInfoCollapsed(prev => !prev)}>
          <Image
            source={
              isDepositInfoCollapsed
                ? SPIcons.icArrowDownBlack
                : SPIcons.icArrowUpBlack
            }
            style={styles.collapseIcon}
          />
        </Pressable>
      </View>
      <Collapsible
        collapsed={isDepositInfoCollapsed}
        duration={500}
        style={styles.collapsibleWrapper}>
        <TournamentDepositInfo depositData={participationDetail} />
      </Collapsible>
      <SPModal
        title="안내"
        contents={
          <>
            {'접수 신청 후 '}
            <Text style={[styles.depositGuideHighlight, { color: '#DA0B0B' }]}>
              {`${
                participationDetail?.regDate &&
                Utils.depositExceedDate(participationDetail?.regDate)
              }`}
            </Text>
            {' 까지\n'}
            <Text style={styles.depositGuideHighlight}>
              {participationDetail?.payBankName}{' '}
              {participationDetail?.payAccountNo}
              {'\n'}
              {`(예금주명 : ${participationDetail?.payDepositName})`}
            </Text>
            {'(으)로\n'}
            입금 완료 되어야 신청이 확정됩니다.
          </>
        }
      />
    </View>
  );

  const renderPaymentAmount = () => (
    <View style={styles.contentsWrapper}>
      <View style={styles.contentsTitleWrapper}>
        <Text style={styles.contentsTitleText}>결제 금액</Text>
        <Pressable
          hitSlop={10}
          onPress={() => setIsPaymentAmountCollapsed(prev => !prev)}>
          <Image
            source={
              isPaymentAmountCollapsed
                ? SPIcons.icArrowDownBlack
                : SPIcons.icArrowUpBlack
            }
            style={styles.collapseIcon}
          />
        </Pressable>
      </View>
      <Collapsible
        collapsed={isPaymentAmountCollapsed}
        duration={500}
        style={styles.collapsibleWrapper}>
        <TournamentAmountInfo
          targetName={participationDetail?.targetName}
          totalAmount={participationDetail?.prtPrice}
          optionList={optionList}
          sumOption={false}
        />
      </Collapsible>
    </View>
  );

  const [isTournamentInfoCollapsed, setIsTournamentInfoCollapsed] =
    useState(false);
  const renderTournamentInfo = () => (
    <View style={styles.contentsWrapper}>
      <View style={styles.contentsTitleWrapper}>
        <Text style={styles.contentsTitleText}>대회 정보</Text>
        <Pressable
          hitSlop={10}
          onPress={() => setIsTournamentInfoCollapsed(prev => !prev)}>
          <Image
            source={
              isTournamentInfoCollapsed
                ? SPIcons.icArrowDownBlack
                : SPIcons.icArrowUpBlack
            }
            style={styles.collapseIcon}
          />
        </Pressable>
      </View>
      <Collapsible
        collapsed={isTournamentInfoCollapsed}
        duration={500}
        style={styles.collapsibleWrapper}>
        <TournamentBasicInfo trnData={participationDetail} />
      </Collapsible>
    </View>
  );

  const renderPlayerList = () => (
    <View style={styles.contentsWrapper}>
      <View style={styles.contentsTitleWrapper}>
        <Text style={styles.contentsTitleText}>출전 선수 목록</Text>
        <Pressable
          hitSlop={10}
          onPress={() => setIsPlayerListCollapsed(prev => !prev)}>
          <Image
            source={
              isPlayerListCollapsed
                ? SPIcons.icArrowDownBlack
                : SPIcons.icArrowUpBlack
            }
            style={styles.collapseIcon}
          />
        </Pressable>
      </View>
      <Collapsible
        collapsed={isPlayerListCollapsed}
        duration={500}
        style={styles.collapsibleWrapper}>
        <TournamentApplyInfo
          applyStatusProps={{
            targetName: participationDetail?.targetName,
          }}
          playerListData={playerList}
        />
      </Collapsible>
    </View>
  );

  const renderEstimatedAmount = () => (
    <View style={styles.contentsWrapper}>
      <View style={styles.contentsTitleWrapper}>
        <Text style={styles.contentsTitleText}>예정 금액</Text>
        <Pressable
          hitSlop={10}
          onPress={() => setIsEstimatedAmountCollapsed(prev => !prev)}>
          <Image
            source={
              isEstimatedAmountCollapsed
                ? SPIcons.icArrowDownBlack
                : SPIcons.icArrowUpBlack
            }
            style={styles.collapseIcon}
          />
        </Pressable>
      </View>
      <Collapsible
        collapsed={isEstimatedAmountCollapsed}
        duration={500}
        style={styles.collapsibleWrapper}>
        <TournamentAmountInfo
          isTotalAltColor
          targetName={participationDetail?.targetName}
          totalAmount={participationDetail?.prtPrice}
          optionList={optionList}
          sumOption={false}
        />
      </Collapsible>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        title={isWaitingApply ? '대기 신청 완료' : '접수 완료'}
        onLeftIconPress={() => {
          NavigationService.goBack(3);
        }}
      />
      {fstCall && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderApplyResult()}
          <Divider lineColor={COLORS.indigo90} lineHeight={8} />
          {!isWaitingApply && (
            <>
              {renderDepositInfo()}
              <Divider lineColor={COLORS.indigo90} lineHeight={8} />
              {renderPaymentAmount()}
              <Divider lineColor={COLORS.indigo90} lineHeight={8} />
            </>
          )}
          {renderTournamentInfo()}
          <Divider lineColor={COLORS.indigo90} lineHeight={8} />
          {renderPlayerList()}
          {isWaitingApply && (
            <>
              <Divider lineColor={COLORS.indigo90} lineHeight={8} />
              {renderEstimatedAmount()}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default memo(TournamentApplyComplete);

const styles = StyleSheet.create({
  applyResultWrapper: {
    alignItems: 'center',
    rowGap: 16,
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  applyResultGif: {
    width: 170,
    height: 170,
  },
  applyResultText: {
    ...fontStyles.fontSize18_Semibold,
    color: '#121212',
    letterSpacing: -0.004,
    textAlign: 'center',
  },
  applyResultSubText: {
    ...fontStyles.fontSize14_Regular,
    color: 'rgba(46, 49, 53, 0.60)',
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  contentsWrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  contentsTitleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentsTitleText: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  collapseIcon: {
    width: 28,
    height: 28,
  },
  collapsibleWrapper: {
    paddingTop: 16,
  },
  depositGuideHighlight: {
    ...fontStyles.fontSize14_Semibold,
  },
});
