import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import moment from 'moment';
import fontStyles, { FONTS } from '../../styles/fontStyles';
import SPIcons from '../../assets/icon';

function TournamentInfo({ tournamentDetail }) {
  let firstScoreList =
    tournamentDetail?.firstScoreList?.filter(
      item => item.detailType !== 'OWN_GOAL',
    ) || [];
  let secondScoreList =
    tournamentDetail?.secondScoreList?.filter(
      item => item.detailType !== 'OWN_GOAL',
    ) || [];
  const firstScoreOwnGoalList =
    tournamentDetail?.firstScoreList?.filter(
      item => item.detailType === 'OWN_GOAL',
    ) || [];
  const secondScoreOwnGoalList =
    tournamentDetail?.secondScoreList?.filter(
      item => item.detailType === 'OWN_GOAL',
    ) || [];
  firstScoreList = firstScoreList.concat(secondScoreOwnGoalList);
  secondScoreList = secondScoreList.concat(firstScoreOwnGoalList);
  firstScoreList.sort((a, b) => a.trdIdx - b.trdIdx);
  secondScoreList.sort((a, b) => a.trdIdx - b.trdIdx);

  return (
    <View
      style={[
        styles.contentItemWrapper,
        {
          rowGap: 16,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 3,
            },
            // Android 그림자
            android: {
              elevation: 3,
            },
          }),
        },
      ]}>
      <View
        style={[
          styles.contentItemWrapper,
          styles.matchInfoWrapper,
          {
            flex: 1,
            backgroundColor: '#F1F5FF',
          },
        ]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.teamWrapper}>
            {tournamentDetail?.firstAcademyLogoPath ? (
              <Image
                source={{
                  uri: tournamentDetail.firstAcademyLogoPath,
                }}
                style={styles.teamImage}
                resizeMode="contain"
              />
            ) : (
              <Image
                style={styles.teamImage}
                source={SPIcons.icDefaultAcademy}
              />
            )}

            <Text style={styles.teamNameText}>
              {tournamentDetail?.firstAcademyName}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              minWidth: 80,
            }}>
            <View style={styles.teamValueWrapper}>
              <Text
                style={[
                  styles.valueText,
                  {
                    color:
                      tournamentDetail?.hostScore > tournamentDetail?.awayScore
                        ? COLORS.textDefault
                        : COLORS.labelAssistive,
                    fontFamily: FONTS.RobotoCondensedBold,
                    // width: 30,
                  },
                ]}>
                {tournamentDetail?.hostScore}
              </Text>
            </View>

            {/* away */}
            <View>
              <Text style={styles.valueText}>:</Text>
            </View>
            <View style={styles.teamValueWrapper}>
              <Text
                style={[
                  styles.valueText,
                  {
                    color:
                      tournamentDetail?.hostScore < tournamentDetail?.awayScore
                        ? COLORS.textDefault
                        : COLORS.labelAssistive,
                    fontFamily: FONTS.RobotoCondensedBold,
                    // width: 30,
                  },
                ]}>
                {tournamentDetail?.awayScore}
              </Text>
            </View>
          </View>
          <View style={styles.teamWrapper}>
            {tournamentDetail?.secondAcademyLogoPath ? (
              <Image
                source={{
                  uri: tournamentDetail.secondAcademyLogoPath,
                }}
                style={styles.teamImage}
                resizeMode="contain"
              />
            ) : (
              <Image
                style={styles.teamImage}
                source={SPIcons.icDefaultAcademy}
              />
            )}
            <Text style={styles.teamNameText}>
              {tournamentDetail?.secondAcademyName}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            width: '100%',
            gap: 8,
          }}>
          {Array.from({
            length: Math.max(
              firstScoreList?.length || 0,
              secondScoreList?.length || 0,
            ),
          })?.map((item, index) => {
            const firstPlayer = firstScoreList?.[index];
            const secondPlayer = secondScoreList?.[index];
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 16,
                }}>
                {firstPlayer ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      gap: 4,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        justifyContent: 'flex-end',
                        flexWrap: 'wrap',
                      }}>
                      <Text style={styles.scoreText}>
                        {firstPlayer.playerName}
                      </Text>
                      <Text style={styles.scorePlusText}>
                        {firstPlayer.detailType === 'OWN_GOAL' && '(자책골)'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      {Array(Math.min(firstPlayer.score, 3)) // 최대 3개까지만 반복
                        .fill()
                        .map((_, idx) => (
                          <Image
                            key={idx}
                            source={
                              firstPlayer.detailType === 'OWN_GOAL'
                                ? SPIcons.icSoccerBallRed
                                : SPIcons.icSoccerBallBlue
                            }
                            style={{
                              width: 12,
                              height: 12,
                              borderColor: 'black',
                            }}
                          />
                        ))}
                      {firstPlayer.score > 3 && (
                        <Text
                          style={[
                            styles.scoreText,
                            {
                              color:
                                firstPlayer.detailType === 'OWN_GOAL'
                                  ? COLORS.red2
                                  : '#002672',
                            },
                          ]}>
                          +{firstPlayer.score - 3}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={{ flex: 1 }} />
                )}
                {secondPlayer ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      gap: 4,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      {Array(Math.min(secondPlayer.score, 3))
                        .fill()
                        .map((_, idx) => (
                          <Image
                            key={idx}
                            source={
                              secondPlayer.detailType === 'OWN_GOAL'
                                ? SPIcons.icSoccerBallRed
                                : SPIcons.icSoccerBallBlue
                            }
                            style={{
                              width: 12,
                              height: 12,
                              borderColor: 'black',
                            }}
                          />
                        ))}
                      {secondPlayer.score > 3 && (
                        <Text
                          style={[
                            styles.scoreText,
                            {
                              color:
                                secondPlayer.detailType === 'OWN_GOAL'
                                  ? COLORS.red2
                                  : '#002672',
                            },
                          ]}>
                          +{secondPlayer.score - 3}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        flexWrap: 'wrap',
                      }}>
                      <Text style={styles.scoreText}>
                        {secondPlayer.playerName}
                      </Text>
                      <Text style={styles.scorePlusText}>
                        {secondPlayer.detailType === 'OWN_GOAL' && '(자책골)'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ rowGap: 8 }}>
        <View style={styles.dateWrapper}>
          <SPSvgs.Calendar width={18} height={18} fill={COLORS.darkBlue} />
          <Text style={styles.dateTextValue}>
            {tournamentDetail?.matchDate &&
              moment(tournamentDetail?.matchDate).format('MM월 DD일 dddd')}
          </Text>
        </View>

        <View style={styles.dateWrapper}>
          <SPSvgs.Location width={18} height={18} fill={COLORS.darkBlue} />
          <Text style={styles.dateTextValue}>
            {tournamentDetail?.matchSpot}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default memo(TournamentInfo);

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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
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
  scoreText: {
    ...fontStyles.fontSize13_Regular,
    lineHeight: 14,
  },
  scorePlusText: {
    ...fontStyles.fontSize13_Regular,
    lineHeight: 14,
  },
});
