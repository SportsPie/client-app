import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import moment from 'moment';
import Avatar from '../Avatar';

export default function TournamentApplyInfo({
  applyStatusProps,
  playerListData,
  numColumns = 3,
  wrapperPaddingHorizontal = 32,
  gridGap = 8,
  applyDate,
  cancelDate,
}) {
  const gridWidth = Math.floor(
    (Dimensions.get('window').width -
      wrapperPaddingHorizontal -
      gridGap * (numColumns - 1)) /
      numColumns,
  );

  return (
    <>
      <View style={{ rowGap: 8 }}>
        {!!applyStatusProps && applyStatusProps?.statusText && (
          <Text
            style={[
              styles.applyStatusChip,
              {
                color: applyStatusProps?.color,
                backgroundColor: applyStatusProps?.backgroundColor,
              },
            ]}>
            {applyStatusProps?.statusText}
          </Text>
        )}
        <View style={{ rowGap: 12 }}>
          <View style={styles.teamNameWrapper}>
            <Text style={[styles.teamNameText, { flex: 1 }]}>
              {applyStatusProps?.targetName}
            </Text>
            <Text style={[styles.teamNameText, { color: COLORS.darkBlue }]}>
              {`${Utils.changeNumberComma(playerListData?.length)}명`}
            </Text>
          </View>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: gridGap }}>
            {playerListData?.map((player, index) => (
              <View
                /* eslint-disable-next-line react/no-array-index-key */
                key={`player_list_grid_${index}`}
                style={[{ width: gridWidth }, styles.playerGrid]}>
                <View style={styles.playerAvatarView}>
                  <Avatar
                    imageURL={player?.profilePath}
                    disableEditMode
                    imageSize={32}
                  />
                </View>
                <Text style={styles.playerName}>{player?.playerName}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {!!applyDate && (
        <View style={{ rowGap: 8 }}>
          <View style={styles.dateLineWrapper}>
            <Text style={styles.dateLabel}>접수일</Text>
            <Text style={styles.dateContent}>
              {applyDate && moment(applyDate).format('YYYY.MM.DD')}
            </Text>
          </View>
          {!!cancelDate && (
            <View style={styles.dateLineWrapper}>
              <Text style={styles.dateLabel}>취소일</Text>
              <Text style={styles.dateContent}>
                {cancelDate && moment(cancelDate).format('YYYY.MM.DD')}
              </Text>
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  applyStatusChip: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.203,
    overflow: 'hidden',
  },
  teamNameWrapper: {
    flexDirection: 'row',
    columnGap: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: '#D6D3D7',
  },
  teamNameText: {
    ...fontStyles.fontSize18_Semibold,
    letterSpacing: -0.004,
  },
  playerGrid: {
    alignItems: 'center',
    rowGap: 4,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border0,
  },
  playerAvatarView: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  playerName: {
    ...fontStyles.fontSize13_Semibold,
    letterSpacing: 0.252,
  },
  dateLineWrapper: {
    flexDirection: 'row',
    columnGap: 8,
  },
  dateLabel: {
    width: 70,
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  dateContent: {
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.203,
  },
});
