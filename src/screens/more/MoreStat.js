/* eslint-disable no-unsafe-optional-chaining */
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiGetMyStat } from '../../api/RestAPI';
import { CAREER_TYPE } from '../../common/constants/careerType';
import { MAIN_FOOT } from '../../common/constants/mainFoot';
import { navName } from '../../common/constants/navName';
import Header from '../../components/header';
import MenuTile from '../../components/more-profile/MenuTile';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import { SCHOOL_LEVEL } from '../../common/constants/schoolLevel';
import { useFocusEffect } from '@react-navigation/native';
import { SPSvgs } from '../../assets/svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import Utils from '../../utils/Utils';

function MoreStat() {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const [player, setPlayer] = useState({});
  const [stats, setStats] = useState({});
  const [career, setCareer] = useState(CAREER_TYPE.NONE.value);
  const [selectedTab, setSelectedTab] = useState('matching'); // matching, tournament
  const [tournamentHistory, setTournamentHistory] = useState({});

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------
  const getMyStat = async () => {
    try {
      const { data } = await apiGetMyStat();
      if (data) {
        const info = data.data;

        setPlayer(info.player || {});
        setStats(info.stats || {});
        setTournamentHistory(info.tournamentHistory || {});
        setCareer(
          info.stats?.careerType[0]
            ? info.stats?.careerType[0]
            : CAREER_TYPE.NONE.value,
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getMyStat();
    }, []),
  );

  const renderHeader = useMemo(() => {
    return (
      <Header
        title="내 퍼포먼스"
        rightContent={
          <Pressable
            style={{ padding: 10 }}
            onPress={() => {
              NavigationService.navigate(navName.moreStatModify);
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#313779',
                lineHeight: 24,
                letterSpacing: -0.091,
              }}>
              수정
            </Text>
          </Pressable>
        }
      />
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={{ rowGap: 8, paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}>
            <MenuTile
              title="포지션"
              value={stats.position ? stats.position : '-'}
              containerStyle={styles.statsWrapper}
            />
            <MenuTile
              title="주 발"
              value={stats.mainFoot ? MAIN_FOOT[stats.mainFoot].desc : '-'}
              containerStyle={styles.statsWrapper}
            />
            <MenuTile
              title="키"
              value={stats.height ? `${stats.height}cm` : '-'}
              containerStyle={styles.statsWrapper}
            />
            <MenuTile
              title="발사이즈"
              value={stats.height ? `${stats.shoeSize}mm` : '-'}
              containerStyle={styles.statsWrapper}
            />
            <MenuTile
              title="몸무게"
              value={stats.weight ? `${stats.weight}kg` : '-'}
              containerStyle={styles.statsWrapper}
            />
            <MenuTile
              title="등번호"
              value={stats.backNo ? stats.backNo : '-'}
              containerStyle={styles.statsWrapper}
            />
          </View>
          <View style={[styles.menuTileContainer]}>
            <Text
              style={[
                fontStyles.fontSize14_Medium,
                {
                  color: COLORS.labelNeutral,
                },
              ]}>
              선수경력
            </Text>

            {stats?.careerType?.length > 0 ? (
              <View
                style={{
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: 8,
                }}>
                {stats?.careerType?.map((item, index) => {
                  const lastItem = index === stats?.careerType?.length - 1;
                  if (lastItem) {
                    return (
                      <Text
                        /* eslint-disable-next-line react/no-array-index-key */
                        key={index}
                        style={[fontStyles.fontSize20_Semibold]}>
                        {CAREER_TYPE[item]?.desc}
                      </Text>
                    );
                  }
                  return (
                    /* eslint-disable-next-line react/no-array-index-key */
                    <Fragment key={index}>
                      <Text style={[fontStyles.fontSize20_Semibold]}>
                        {CAREER_TYPE[item]?.desc}
                      </Text>
                      <SPSvgs.Ellipse width={6} height={6} />
                    </Fragment>
                  );
                })}
              </View>
            ) : (
              <Text style={[fontStyles.fontSize20_Semibold]}>-</Text>
            )}
          </View>
        </View>

        <View style={{ rowGap: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: COLORS.lineBorder,
              paddingHorizontal: 16,
              gap: 16,
            }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setSelectedTab('matching')}
              style={[
                styles.tabWrap,
                selectedTab === 'matching' && styles.tabWrapActive,
              ]}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'matching' && styles.tabTextActive,
                ]}>
                경기 참가이력
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setSelectedTab('tournament')}
              style={[
                styles.tabWrap,
                selectedTab === 'tournament' && styles.tabWrapActive,
              ]}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'tournament' && styles.tabTextActive,
                ]}>
                대회 참가이력
              </Text>
            </TouchableOpacity>
          </View>
          {selectedTab === 'matching' ? (
            <View style={{ gap: 8, paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={styles.tournamentItem}>
                  <Text style={styles.scoretitleText}>출전경기수</Text>
                  <Text style={fontStyles.fontSize20_Semibold}>
                    {player?.totalMatch
                      ? Utils.changeNumberComma(player.totalMatch)
                      : '0'}
                  </Text>
                </View>
                <View style={styles.tournamentItem}>
                  <Text style={styles.scoretitleText}>득점</Text>
                  <Text style={fontStyles.fontSize20_Semibold}>
                    {player?.totalScore
                      ? Utils.changeNumberComma(player.totalScore)
                      : '0'}
                  </Text>
                </View>
                <View style={styles.tournamentItem}>
                  <Text style={styles.scoretitleText}>MVP</Text>
                  <Text style={fontStyles.fontSize20_Semibold}>
                    {player?.totalMvp
                      ? Utils.changeNumberComma(player.totalMvp)
                      : '0'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  NavigationService.navigate(navName.moreGameSchedule);
                }}
                style={styles.historyMoveButton}>
                <Text style={styles.historyButtonText}>내 경기 이력 보기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 8, paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={styles.tournamentItem}>
                  <Text style={styles.scoretitleText}>MVP</Text>
                  <Text style={fontStyles.fontSize20_Semibold}>
                    {tournamentHistory?.tournamentMvpCount
                      ? Utils.changeNumberComma(
                          tournamentHistory.tournamentMvpCount,
                        )
                      : '0'}
                  </Text>
                </View>
                <View style={styles.tournamentItem}>
                  <Text style={styles.scoretitleText}>득점</Text>
                  <Text style={fontStyles.fontSize20_Semibold}>
                    {tournamentHistory?.tournamentScoreCount
                      ? Utils.changeNumberComma(
                          tournamentHistory.tournamentScoreCount,
                        )
                      : '0'}
                  </Text>
                </View>
                <View style={styles.tournamentItem}>
                  <Text style={styles.scoretitleText}>경고</Text>
                  <Text style={fontStyles.fontSize20_Semibold}>
                    {tournamentHistory?.tournamentWaringCnt
                      ? Utils.changeNumberComma(
                          tournamentHistory.tournamentWaringCnt,
                        )
                      : '0'}
                  </Text>
                </View>
                <View style={styles.tournamentItem}>
                  <Text style={styles.scoretitleText}>퇴장</Text>
                  <Text style={fontStyles.fontSize20_Semibold}>
                    {tournamentHistory?.tournamentExpulsionCount
                      ? Utils.changeNumberComma(
                          tournamentHistory.tournamentExpulsionCount,
                        )
                      : '0'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  NavigationService.navigate(navName.moreTournamentHistory);
                }}
                style={styles.historyMoveButton}>
                <Text style={styles.historyButtonText}>내 대회 이력 보기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MoreStat);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 24,
    rowGap: 48,
  },
  statsWrapper: {
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
  },
  participantHistoryItem: {
    width: (SCREEN_WIDTH - 49) / 3,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    alignItems: 'center',
  },
  menuTileContainer: {
    // backgroundColor: COLORS.fillNormal,
    backgroundColor: '#F1F5FF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    rowGap: 8,
  },
  tabWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    paddingVertical: 8,
  },
  tabWrapActive: {
    borderBottomColor: '#FF7C10',
  },
  tabText: {
    ...fontStyles.fontSize14_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  tabTextActive: {
    color: '#FB8225',
  },
  historyMoveButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FB8225',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 8,
  },
  historyButtonText: {
    ...fontStyles.fontSize16_Semibold,
    color: '#FB8225',
  },
  tournamentItem: {
    flex: 1,
    // backgroundColor: COLORS.fillNormal,
    backgroundColor: '#F1F5FF',
    paddingVertical: 8,
    borderRadius: 8,
    rowGap: 8,
    alignItems: 'center',
  },
  scoretitleText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
  },
});
