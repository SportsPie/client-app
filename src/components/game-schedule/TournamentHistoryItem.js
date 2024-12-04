import moment from 'moment';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';

function TournamentHistoryItem({ item }) {
  let scoreBackgroundColor;

  const detailPage = async () => {
    try {
      NavigationService.navigate(navName.moreTournamentHistoryDetail, {
        trIdx: item.trnResultIdx,
      });
    } catch (error) {
      handleError(error);
    }
  };

  if (item?.hostScore > item?.awayScore) {
    scoreBackgroundColor = COLORS.statusPositive;
  } else if (item?.hostScore < item?.awayScore) {
    scoreBackgroundColor = 'rgba(255, 66, 66, 0.10)';
  } else {
    scoreBackgroundColor = COLORS.darkBlue;
  }

  return (
    <Pressable onPress={detailPage} style={styles.container}>
      <View style={styles.leftContent}>
        <Text
          style={{
            ...fontStyles.fontSize14_Regular,
            color: 'rgba(46, 49, 53, 0.60)',
          }}>
          {item.matchName}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={
              fontStyles.fontSize16_Medium
            }>{`제 ${item.tournamentCnt}회 ${item.tournamentName}`}</Text>
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
                    item?.hostScore < item?.awayScore
                      ? COLORS.red
                      : COLORS.white,
                },
              ]}>
              {item?.hostScore} - {item?.awayScore}
            </Text>
          </View>
        </View>
        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelAlternative,
            },
          ]}>
          {moment(item?.matchDate).format('YYYY.MM.DD')}
        </Text>
      </View>
    </Pressable>
  );
}

export default memo(TournamentHistoryItem);

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
