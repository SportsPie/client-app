/* eslint-disable react/no-array-index-key */
import { StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Avatar from '../Avatar';

const ListPlayer = memo(({ teamName, players }) => {
  return (
    <View style={styles.contentItemWrapper}>
      <Text
        style={[
          fontStyles.fontSize14_Semibold,
          {
            color: COLORS.labelNormal,
            letterSpacing: 0.2,
          },
        ]}>
        {teamName}
      </Text>

      <View style={{ marginTop: 'auto', rowGap: 16 }}>
        {players?.map((player, index) => {
          return (
            <View style={styles.playerWrapper} key={index}>
              <Avatar
                imageURL={player.profilePath}
                disableEditMode
                imageSize={24}
              />
              <View style={styles.scoreWrapper}>
                <Text
                  style={[
                    fontStyles.fontSize11_Medium,
                    {
                      color: COLORS.white,
                    },
                  ]}>
                  {player?.backNo}
                </Text>
              </View>
              <Text
                style={[
                  fontStyles.fontSize13_Semibold,
                  {
                    color: COLORS.labelNormal,
                    letterSpacing: 0.25,
                    flexShrink: 1,
                  },
                ]}>
                {player?.playerName}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

function ParticipatingPayer({ matchInfo, soccerPlayer }) {
  return (
    <View style={styles.container}>
      <Text style={fontStyles.fontSize20_Semibold}>출전선수</Text>

      <View style={styles.content}>
        <ListPlayer
          teamName={matchInfo?.academyName}
          players={soccerPlayer?.homePlayers}
        />
        <ListPlayer
          teamName={matchInfo?.awayAcademyName}
          players={soccerPlayer?.awayPlayers}
        />
      </View>
    </View>
  );
}

export default memo(ParticipatingPayer);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    rowGap: 16,
  },
  content: {
    flexDirection: 'row',
    columnGap: 8,
  },
  contentItemWrapper: {
    flex: 1,
    backgroundColor: '#F1F5FF',
    padding: 16,
    borderRadius: 16,
    rowGap: 16,
  },
  playerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  scoreWrapper: {
    backgroundColor: COLORS.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 5,
    minWidth: 16,
    marginLeft: 4,
  },
});
