import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { memo, useMemo, useCallback, useState } from 'react';
import { SPGifs } from '../../assets/gif';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import Divider from '../../components/Divider';
import { apiGetTournamentDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import Utils from '../../utils/Utils';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function TournamentApplyComplete({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  const [tournamentInfo, setTournamentInfo] = useState({});

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getTournamentDetail = async () => {
    try {
      const { data } = await apiGetTournamentDetail(tournamentIdx);

      if (data) {
        setTournamentInfo(data.data);
        console.log(data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      getTournamentDetail();
    }, []),
  );

  const renderHeader = useMemo(() => {
    return (
      <View style={styles.headerWrapper}>
        <Image source={SPGifs.handClap} style={styles.image} />
        <Text style={styles.headerText}>{`대회 접수가\n신청되었어요!`}</Text>
        <Text
          style={
            styles.subheaderText
          }>{`참가비를 아래 계좌로 이체하면 접수가 완료됩니다.\n입금 순으로 참가가 확정되며 입금기한 내 이체하지 않으면\n접수 신청이 취소됩니다.`}</Text>
      </View>
    );
  }, []);

  const renderInformation = useMemo(() => {
    return (
      <View style={styles.contentWrapper}>
        <Text style={styles.headlineText}>이체 정보</Text>

        <View style={{ rowGap: 8 }}>
          <View style={styles.labelContentWrapper}>
            <Text style={styles.labelText}>이체금액</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.entryFee ? tournamentInfo.entryFee : '-'}
            </Text>
          </View>
          <View style={styles.labelContentWrapper}>
            <Text style={styles.labelText}>입금정보</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.depositInfo ? tournamentInfo.depositInfo : '-'}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [tournamentInfo]);

  const renderApplicationContestInfo = useMemo(() => {
    return (
      <View style={styles.contentWrapper}>
        <Text style={styles.headlineText}>신청 대회 정보</Text>

        <View style={{ rowGap: 16 }}>
          <View style={styles.labelContentWrapper}>
            <Text style={styles.labelText}>대회명</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.trnNm ? tournamentInfo.trnNm : '-'}
            </Text>
          </View>
          <View style={styles.labelContentWrapper}>
            <Text style={styles.labelText}>대회일</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.startDate && tournamentInfo.endDate
                ? `${Utils.convertMillisecondsToFormattedDate(
                    tournamentInfo.startDate,
                  )} ~ \n${Utils.convertMillisecondsToFormattedDate(
                    tournamentInfo.endDate,
                  )}`
                : '-'}
            </Text>
          </View>
          <View style={styles.labelContentWrapper}>
            <Text style={styles.labelText}>장소</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.trnAddr ? tournamentInfo.trnAddr : '-'}
            </Text>
          </View>
          <View style={styles.labelContentWrapper}>
            <Text style={styles.labelText}>시상</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.award ? tournamentInfo.award : '-'}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [tournamentInfo]);

  return (
    <SafeAreaView style={styles.container}>
      <Header closeIcon />
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader}
        <Divider lineColor={COLORS.indigo90} lineHeight={8} />
        {renderInformation}
        <Divider lineColor={COLORS.indigo90} lineHeight={8} />
        {renderApplicationContestInfo}
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(TournamentApplyComplete);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: (SCREEN_WIDTH * 178) / 480,
    height: (SCREEN_WIDTH * 178) / 480,
  },
  headerWrapper: {
    paddingVertical: 64,
    paddingHorizontal: 16,
    alignItems: 'center',
    rowGap: 16,
  },
  headerText: {
    ...fontStyles.fontSize18_Semibold,
    color: '#121212',
    textAlign: 'center',
    letterSpacing: -0.004,
  },
  subheaderText: {
    ...fontStyles.fontSize12_Medium,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.203,
    color: COLORS.labelAlternative,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  headlineText: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  labelContentWrapper: {
    flexDirection: 'row',
    columnGap: 8,
  },
  labelText: {
    ...fontStyles.fontSize14_Regular,
    minWidth: 70,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  valueText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.203,
    flex: 1,
  },
});
