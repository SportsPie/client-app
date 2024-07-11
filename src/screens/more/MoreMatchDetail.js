import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MVP from '../../components/match-details/MVP';
import MatchInfo from '../../components/match-details/MatchInfo';
import ParticipatingPayer from '../../components/match-details/ParticipatingPayer';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { handleError } from '../../utils/HandleError';
import { apiGetMatchesDetail, apiGetMngPlayers } from '../../api/RestAPI';

function MoreMatchDetail() {
  const route = useRoute();
  const [matchDetail, setMatchDetail] = useState({});
  const [matchInfo, setMatchInfo] = useState({});
  const matchIdx = route.params?.matchIdx;

  const getMatchDetail = async () => {
    try {
      const matchResponse = await apiGetMatchesDetail(matchIdx);
      setMatchDetail(matchResponse.data.data);
      setMatchInfo(matchResponse.data.data?.matchInfo);
    } catch (error) {
      handleError(error);
    }
  };

  const renderMatchInfo = useMemo(() => {
    return <MatchInfo matchInfo={matchInfo} soccerPlayer={matchDetail} />;
  }, [matchInfo]);

  const renderMVP = useMemo(() => {
    return <MVP matchInfo={matchInfo} soccerPlayer={matchDetail} />;
  }, [matchInfo]);

  const renderParticipatingPayer = useMemo(() => {
    return (
      <ParticipatingPayer matchInfo={matchInfo} soccerPlayer={matchDetail} />
    );
  }, [matchInfo, matchDetail]);

  useFocusEffect(
    useCallback(() => {
      getMatchDetail();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          {renderMatchInfo}
          {renderMVP}
          {renderParticipatingPayer}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default memo(MoreMatchDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.peach,
  },
  content: {
    marginHorizontal: 16,
    paddingVertical: 16,
    rowGap: 24,
  },
});
