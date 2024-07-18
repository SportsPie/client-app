/* eslint-disable no-unsafe-optional-chaining */
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

function MoreStat() {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const [player, setPlayer] = useState({});
  const [stats, setStats] = useState({});
  const [career, setCareer] = useState(CAREER_TYPE.NONE.value);
  const [selectedTab, setSelectedTab] = useState('1');

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
        <View style={{ rowGap: 8 }}>
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
                      <Text style={[fontStyles.fontSize20_Semibold]}>
                        {CAREER_TYPE[item]?.desc}
                      </Text>
                    );
                  }
                  return (
                    <>
                      <Text style={[fontStyles.fontSize20_Semibold]}>
                        {CAREER_TYPE[item]?.desc}
                      </Text>
                      <SPSvgs.Ellipse width={6} height={6} />
                    </>
                  );
                })}
              </View>
            ) : (
              <Text style={[fontStyles.fontSize20_Semibold]}>-</Text>
            )}
          </View>
        </View>

        <View style={{ rowGap: 16 }}>
          <Text style={fontStyles.fontSize20_Semibold}>경기 참가이력</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}>
            <MenuTile
              title="출전경기수"
              containerStyle={styles.participantHistoryItem}
              value={player?.totalMatch ? player.totalMatch : '0'}
            />
            <MenuTile
              title="득점"
              containerStyle={styles.participantHistoryItem}
              value={player?.totalScore ? player.totalScore : '0'}
            />
            <MenuTile
              title="MVP"
              containerStyle={styles.participantHistoryItem}
              value={player?.totalMvp ? player.totalMvp : '0'}
            />
            <MenuTile
              title="도움"
              containerStyle={styles.participantHistoryItem}
              value={player?.totalAssistance ? player.totalAssistance : '0'}
            />
            <MenuTile
              title="경고"
              containerStyle={styles.participantHistoryItem}
              value={player?.totalYellowCard ? player.totalYellowCard : '0'}
            />
            <MenuTile
              title="퇴장"
              containerStyle={styles.participantHistoryItem}
              value={player?.totalRedCard ? player.totalRedCard : '0'}
            />
          </View>
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
    paddingVertical: 24,
    paddingHorizontal: 16,
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
});
