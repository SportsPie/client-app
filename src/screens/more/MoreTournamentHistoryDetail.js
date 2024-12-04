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
import {
  apiGetMatchesDetail,
  apiGetMngPlayers,
  apiGetTournamentApplyHistoryDetail,
} from '../../api/RestAPI';
import { useDispatch } from 'react-redux';
import { moreGameScheduleListAction } from '../../redux/reducers/list/moreGameScheduleListSlice';
import SPLoading from '../../components/SPLoading';
import TournamentInfo from '../../components/match-details/TournamentInfo';
import TournamentMVP from '../../components/match-details/TournamentMVP';

function MoreTournamentHistoryDetail() {
  const route = useRoute();
  const [tournamentDetail, setTournamentDetail] = useState({});
  const [matchInfo, setMatchInfo] = useState({});
  const trIdx = route.params?.trIdx;
  const [loading, setLoading] = useState(true);

  const getMatchDetail = async () => {
    try {
      const { data } = await apiGetTournamentApplyHistoryDetail(trIdx);
      setTournamentDetail(data.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const renderMatchInfo = useMemo(() => {
    return <TournamentInfo tournamentDetail={tournamentDetail} />;
  }, [tournamentDetail]);

  const renderMVP = useMemo(() => {
    return <TournamentMVP tournamentDetail={tournamentDetail} />;
  }, [tournamentDetail]);

  useFocusEffect(
    useCallback(() => {
      getMatchDetail();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />

      <View style={styles.container}>
        {loading ? (
          <SPLoading />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            {renderMatchInfo}
            {renderMVP}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

export default memo(MoreTournamentHistoryDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    marginHorizontal: 16,
    paddingVertical: 16,
    rowGap: 24,
  },
});
