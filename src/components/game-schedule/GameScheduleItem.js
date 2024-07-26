import moment from 'moment';
import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { apiGetMatchesDetail, apiGetMngPlayers } from '../../api/RestAPI';
import { MATCH_STATE } from '../../common/constants/matchState';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';

function GameScheduleItem({ item }) {
  let scoreBackgroundColor;

  const detailPage = async () => {
    try {
      // if (__DEV__) {
      //   NavigationService.navigate(navName.moreMatchDetail, {
      //     matchDetail: {
      //       data: {
      //         matchInfo: {
      //           hostScore: 2,
      //           participantScore: 0,
      //           matchDate: moment().valueOf(),
      //           matchPlace: '사직 아시아드 경기장',
      //           homeAcademyIdx: 1,
      //           awayAcademyIdx: 2,
      //           academyName: 'Defensores de Belgrano de Villa Ramallo',
      //           awayAcademyName: 'FC Dinamo City',
      //           scorers: [
      //             { acdmyIdx: 1, playerName: '김철수', score: 1, mvpYn: 'Y' },
      //             { acdmyIdx: 1, playerName: '이영희', score: 1 },
      //             { acdmyIdx: 1, playerName: '박준영', score: 1 },
      //             { acdmyIdx: 2, playerName: '김영희', score: 1, mvpYn: 'Y' },
      //           ],
      //         },
      //       },
      //     },
      //     soccerPlayer: {
      //       data: {
      //         homePlayers: [
      //           { acdmyIdx: 1, playerName: '김철수', score: 78 },
      //           { acdmyIdx: 1, playerName: '이영희', score: 189 },
      //           { acdmyIdx: 1, playerName: '박준영', score: 12 },
      //           { acdmyIdx: 1, playerName: '최민수', score: 92 },
      //           { acdmyIdx: 1, playerName: '강호준', score: 88 },
      //           { acdmyIdx: 1, playerName: '윤서진', score: 83 },
      //           { acdmyIdx: 1, playerName: '장민호', score: 77 },
      //           { acdmyIdx: 1, playerName: '신수현', score: 95 },
      //           { acdmyIdx: 1, playerName: '한지민', score: 80 },
      //           { acdmyIdx: 1, playerName: '조세호', score: 91 },
      //           { acdmyIdx: 1, playerName: '정유미', score: 87 },
      //           { acdmyIdx: 1, playerName: '이준', score: 84 },
      //         ],
      //         awayPlayers: [
      //           { acdmyIdx: 2, playerName: '김영희', score: 87 },
      //           { acdmyIdx: 2, playerName: '박지성', score: 90 },
      //           { acdmyIdx: 2, playerName: '최지우', score: 85 },
      //           { acdmyIdx: 2, playerName: '이민호', score: 88 },
      //           { acdmyIdx: 2, playerName: '강수지', score: 82 },
      //           { acdmyIdx: 2, playerName: '윤소희', score: 87 },
      //           { acdmyIdx: 2, playerName: '장동건', score: 92 },
      //           { acdmyIdx: 2, playerName: '신하균', score: 81 },
      //           { acdmyIdx: 2, playerName: '한효주', score: 93 },
      //           { acdmyIdx: 2, playerName: '조인성', score: 84 },
      //           { acdmyIdx: 2, playerName: '정우성', score: 90 },
      //           { acdmyIdx: 2, playerName: '이병헌', score: 89 },
      //         ],
      //       },
      //     },
      //   });
      //   return;
      // }
      NavigationService.navigate(navName.moreMatchDetail, {
        matchIdx: item.matchIdx,
      });
    } catch (error) {
      handleError(error);
    }
  };

  if (item?.hostScore > item?.participantScore) {
    scoreBackgroundColor = COLORS.statusPositive; // 호스트 스코어가 더 높으면 분홍색
  } else if (item?.hostScore < item?.participantScore) {
    scoreBackgroundColor = COLORS.peach; // 호스트 스코어가 더 낮으면 파란색
  } else {
    scoreBackgroundColor = COLORS.darkBlue; // 무승부일 경우 그레이색
  }

  const renderMatchStatus = useMemo(() => {
    switch (item.matchState) {
      case MATCH_STATE.APPLY.code:
      case MATCH_STATE.READY.code:
        return (
          <View
            style={[
              styles.statusWrapper,
              {
                backgroundColor: COLORS.orange,
              },
            ]}>
            <Text style={styles.statusText}>경기예정</Text>
          </View>
        );
      case MATCH_STATE.CONFIRM.code:
      case MATCH_STATE.REVIEW.code:
        return (
          <View
            style={[
              styles.statusWrapper,
              {
                backgroundColor: scoreBackgroundColor,
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item?.hostScore < item?.participantScore
                      ? COLORS.red
                      : COLORS.white,
                },
              ]}>
              {item?.hostScore} - {item?.participantScore}
            </Text>
          </View>
        );
      default:
        return null;
    }
  }, [item?.matchState, item?.hostScore, item?.participantScore]);

  return (
    <Pressable onPress={detailPage} style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={fontStyles.fontSize16_Medium}>{item?.title ?? ''}</Text>
        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelAlternative,
            },
          ]}>
          {moment(item?.regDate).format('YYYY.MM.DD')}
        </Text>
      </View>
      <View>{renderMatchStatus}</View>
    </Pressable>
  );
}

export default memo(GameScheduleItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    borderColor: COLORS.lineBorder,
  },
  leftContent: {
    flex: 1,
    rowGap: 8,
  },
  statusWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.white,
    lineHeight: 24,
  },
});
