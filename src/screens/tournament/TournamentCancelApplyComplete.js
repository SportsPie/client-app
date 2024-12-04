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
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { academyMatchingRegistrationListAction } from '../../redux/reducers/list/academyMatchingRegistrationListSlice';
import { apiGetTournamentMngSubmissionDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';

function TournamentCancelApplyComplete({ route }) {
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

  /**
   * function
   */

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
        title="접수 취소 완료"
        onLeftIconPress={() => {
          NavigationService.goBack(2);
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
                  '대회 관련 추가 문의사항이 있으시면,\n언제든지 1:1 문의를 통해 남겨주세요.'
                }
              </Text>
            </View>
            <View style={{ paddingVertical: 4 }}>
              <PrimaryButton
                text="접수 취소 확인"
                onPress={() => {
                  NavigationService.goBack(2);
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
                  color: COLORS.darkBlue,
                  backgroundColor: '#E6E9F1',
                  targetName: participationDetail?.targetName,
                }}
                playerListData={playerList}
              />
            </Collapsible>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
export default memo(TournamentCancelApplyComplete);

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
});
