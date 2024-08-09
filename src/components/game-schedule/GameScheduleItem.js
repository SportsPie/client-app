import moment from 'moment';
import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
