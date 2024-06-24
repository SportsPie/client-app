import { useRoute } from '@react-navigation/native';
import React, { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MVP from '../../components/match-details/MVP';
import MatchInfo from '../../components/match-details/MatchInfo';
import ParticipatingPayer from '../../components/match-details/ParticipatingPayer';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MoreMatchDetail() {
  const route = useRoute();
  const { matchDetail, soccerPlayer } = route.params;
  const matchInfo = matchDetail?.data?.matchInfo;

  const renderMatchInfo = useMemo(() => {
    return <MatchInfo matchInfo={matchInfo} soccerPlayer={soccerPlayer} />;
  }, [matchInfo]);

  const renderMVP = useMemo(() => {
    return <MVP matchInfo={matchInfo} soccerPlayer={soccerPlayer} />;
  }, [matchInfo]);

  const renderParticipatingPayer = useMemo(() => {
    return (
      <ParticipatingPayer matchInfo={matchInfo} soccerPlayer={soccerPlayer} />
    );
  }, [matchInfo, soccerPlayer]);

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
