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
import NavigationService from '../../navigation/NavigationService';
import { SPGifs } from '../../assets/gif';
import SPIcons from '../../assets/icon';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import { PrimaryButton } from '../../components/PrimaryButton';
import TournamentBasicInfo from '../../components/tournament/TournamentBasicInfo';
import TournamentApplyInfo from '../../components/tournament/TournamentApplyInfo';
import TournamentAmountInfo from '../../components/tournament/TournamentAmountInfo';
import TournamentRefundInfo from '../../components/tournament/TournamentRefundInfo';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { useDispatch } from 'react-redux';
import { apiGetTournamentMngSubmissionDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { academyMatchingRegistrationListAction } from '../../redux/reducers/list/academyMatchingRegistrationListSlice';
import { useFocusEffect } from '@react-navigation/native';

function TournamentRefundRequestComplete({ route }) {
  /**
   * state
   */
  const prtIdx = route?.params?.prtIdx;
  const dispatch = useDispatch();
  const [fstCall, setFstCall] = useState(false);
  const [participationDetail, setParticipationDetail] = useState({});
  const [optionList, setOptionList] = useState([]);
  const [playerList, setPlayerList] = useState([]);

  const [isTournamentInfoCollapsed, setIsTournamentInfoCollapsed] =
    useState(false);
  const [isPlayerListCollapsed, setIsPlayerListCollapsed] = useState(false);
  const [isRefundInfoCollapsed, setIsRefundInfoCollapsed] = useState(false);

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

  const refreshApplyHistoryList = () => {
    dispatch(academyMatchingRegistrationListAction.refreshAndTypeReset());
  };

  /**
   * render
   */

  useFocusEffect(
    useCallback(() => {
      refreshApplyHistoryList();
      getParticipationDetail();
    }, []),
  );

  /**
   * render
   */
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        closeIcon
        title="환불 신청 완료"
        onLeftIconPress={() => {
          NavigationService.goBack(3);
        }}
      />
      {fstCall && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.cancelResultWrapper}>
            <Image source={SPGifs.done} style={styles.cancelResultGif} />
            <View style={{ rowGap: 4 }}>
              <Text style={styles.cancelResultText}>
                접수가 취소되었습니다.
              </Text>
              <Text style={styles.cancelResultSubText}>
                {
                  '환불 신청이 완료되었습니다.\n환불 완료까지 며칠 소요될 수 있습니다.'
                }
              </Text>
            </View>
            <View style={{ paddingVertical: 4 }}>
              <PrimaryButton
                text="접수 취소 확인"
                onPress={() => {
                  NavigationService.goBack(3);
                }}
                buttonStyle={styles.cancelConfirmButton}
                buttonTextStyle={styles.cancelConfirmButtonText}
              />
            </View>
          </View>
          <Divider lineColor={COLORS.indigo90} lineHeight={8} />
          <View style={styles.contentsWrapper}>
            <View style={styles.contentsTitleWrapper}>
              <Text style={styles.contentsTitleText}>취소 대회 정보</Text>
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
          <Divider lineColor={COLORS.indigo90} lineHeight={8} />
          <View style={styles.contentsWrapper}>
            <View style={styles.contentsTitleWrapper}>
              <Text style={styles.contentsTitleText}>취소 팀 정보</Text>
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
                  color: COLORS.white,
                  backgroundColor: COLORS.orange,
                  targetName: participationDetail?.targetName,
                }}
                playerListData={playerList}
              />
            </Collapsible>
          </View>
          <Divider lineColor={COLORS.indigo90} lineHeight={8} />
          <View style={styles.contentsWrapper}>
            <View style={styles.contentsTitleWrapper}>
              <Text style={styles.contentsTitleText}>환불 정보</Text>
              <Pressable
                hitSlop={10}
                onPress={() => setIsRefundInfoCollapsed(prev => !prev)}>
                <Image
                  source={
                    isRefundInfoCollapsed
                      ? SPIcons.icArrowDownBlack
                      : SPIcons.icArrowUpBlack
                  }
                  style={styles.collapseIcon}
                />
              </Pressable>
            </View>
            <Collapsible
              collapsed={isRefundInfoCollapsed}
              duration={500}
              style={styles.collapsibleWrapper}>
              <View style={{ rowGap: 16 }}>
                <TournamentAmountInfo
                  targetName={participationDetail?.targetName}
                  totalAmount={participationDetail?.prtPrice}
                  optionList={optionList}
                  confirmDate={participationDetail?.depositDate}
                  sumOption={true}
                />
                <View style={styles.refundInfoDivider}>
                  <TournamentRefundInfo
                    refundData={{
                      refundBankName: participationDetail?.refundBankName,
                      refundAccountNo: participationDetail?.refundAccountNo,
                      refundDepositName: participationDetail?.refundDepositName,
                    }}
                  />
                </View>
              </View>
            </Collapsible>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
export default memo(TournamentRefundRequestComplete);

const styles = StyleSheet.create({
  cancelResultWrapper: {
    alignItems: 'center',
    rowGap: 16,
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  cancelResultGif: {
    width: 170,
    height: 170,
  },
  cancelResultText: {
    ...fontStyles.fontSize18_Semibold,
    color: '#121212',
    letterSpacing: -0.004,
    textAlign: 'center',
  },
  cancelResultSubText: {
    ...fontStyles.fontSize14_Regular,
    color: 'rgba(46, 49, 53, 0.60)',
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  cancelConfirmButton: {
    height: 40,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  cancelConfirmButtonText: {
    ...fontStyles.fontSize15_Semibold,
    color: COLORS.white,
    letterSpacing: 0.144,
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
  refundInfoDivider: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border0,
  },
});
