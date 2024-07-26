import { Image, StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import moment from 'moment';
import fontStyles, { FONTS } from '../../styles/fontStyles';
import SPIcons from '../../assets/icon';

function MatchInfo({ matchInfo, soccerPlayer }) {
  return (
    <View
      style={[
        styles.contentItemWrapper,
        {
          rowGap: 16,
        },
      ]}>
      <View
        style={[
          styles.contentItemWrapper,
          styles.matchInfoWrapper,
          {
            backgroundColor: '#F1F5FF',
          },
        ]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.teamWrapper}>
            <Image
              source={{
                uri: matchInfo?.homeLogoPath,
              }}
              style={styles.teamImage}
              resizeMode="contain"
            />

            <Text style={styles.teamNameText}>{matchInfo?.academyName}</Text>
          </View>
          <View style={styles.teamValueWrapper}>
            <Text
              style={[
                styles.valueText,
                {
                  color:
                    matchInfo?.hostScore > matchInfo?.participantScore
                      ? COLORS.textDefault
                      : COLORS.labelAssistive,
                  fontFamily: FONTS.RobotoCondensedBold,
                },
              ]}>
              {matchInfo?.hostScore}
            </Text>
          </View>

          {/* away */}
          <View style={styles.teamValueWrapper}>
            <Text style={styles.valueText}>:</Text>
          </View>
          <View style={styles.teamValueWrapper}>
            <Text
              style={[
                styles.valueText,
                {
                  color:
                    matchInfo?.hostScore < matchInfo?.participantScore
                      ? COLORS.textDefault
                      : COLORS.labelAssistive,
                  fontFamily: FONTS.RobotoCondensedBold,
                },
              ]}>
              {matchInfo?.participantScore}
            </Text>
          </View>
          <View style={styles.teamWrapper}>
            <Image
              source={{
                uri: matchInfo?.awayLogoPath,
              }}
              style={styles.teamImage}
              resizeMode="contain"
            />

            <Text style={styles.teamNameText}>
              {matchInfo?.awayAcademyName}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}>
            {soccerPlayer?.homePlayers
              ?.filter(player => player.score !== 0)
              .map(player => (
                <View key={player.playerIdx}>
                  <Text>
                    {player.playerName} {player.score}
                  </Text>
                </View>
              ))}
            {!soccerPlayer?.homePlayers?.some(player => player.score !== 0) && (
              <View style={{ width: 50 }} />
            )}
          </View>
          <View style={{ marginHorizontal: 8, justifyContent: 'center' }}>
            <Image
              source={SPIcons.icSoccerBall}
              style={{ width: 16, height: 16 }}
            />
          </View>
          <View
            style={{ flex: 1, alignItems: 'flex-start', flexDirection: 'row' }}>
            {soccerPlayer?.awayPlayers
              ?.filter(player => player.score !== 0)
              .map(player => (
                <View key={player.playerIdx} style={{ textAlign: 'center' }}>
                  <Text>
                    {player.score} {player.playerName}
                  </Text>
                </View>
              ))}
            {!soccerPlayer?.awayPlayers?.some(player => player.score !== 0) && (
              <View style={{ width: 50 }} />
            )}
          </View>
        </View>
      </View>

      <View style={{ rowGap: 8 }}>
        <View style={styles.dateWrapper}>
          <SPSvgs.Calendar width={18} height={18} fill={COLORS.darkBlue} />
          <Text style={styles.dateTextValue}>
            {moment(`${matchInfo?.matchDate} ${matchInfo?.matchTime}`).format(
              'YYYY년MM월DD일 A hh:mm',
            )}
          </Text>
        </View>

        <View style={styles.dateWrapper}>
          <SPSvgs.Location width={18} height={18} fill={COLORS.darkBlue} />
          <Text style={styles.dateTextValue}>{matchInfo?.matchPlace}</Text>
        </View>
      </View>
    </View>
  );
}

export default memo(MatchInfo);

const styles = StyleSheet.create({
  contentItemWrapper: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
  },
  matchInfoWrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    columnGap: 8,
  },
  teamWrapper: {
    flex: 4,
    rowGap: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  teamValueWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  valueText: {
    ...fontStyles.fontSize28_Bold,
    lineHeight: 38,
  },
  teamNameText: {
    ...fontStyles.fontSize11_Medium,
    color: COLORS.labelAlternative,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  teamImage: {
    width: 32,
    height: 32,
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 8,
  },
  dateTextValue: {
    ...fontStyles.fontSize13_Regular,
    flex: 1,
    color: COLORS.labelAlternative,
    letterSpacing: 0.25,
  },
});
