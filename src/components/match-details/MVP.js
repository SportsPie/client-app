/* eslint-disable react/no-array-index-key */
import React, { memo, useCallback } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SPSvgs } from '../../assets/svg';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Avatar from '../Avatar';
import SPIcons from '../../assets/icon';

const TeamImageWidthBadge = memo(({ imageURL }) => {
  return (
    <View style={styles.imageWrapper}>
      {imageURL ? (
        <Image
          source={{
            uri: imageURL,
          }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <Image
          style={styles.image}
          source={SPIcons.icDefaultAcademy}
          resizeMode="contain"
        />
      )}
      <SPSvgs.CheckBadge style={styles.badgeStyle} width={10} height={10} />
    </View>
  );
});

function MVP({ matchInfo, soccerPlayer }) {
  const renderScorers = useCallback(data => {
    return (
      <View style={{ alignItems: 'center' }}>
        {data?.map((scorer, index) => {
          return (
            <View style={styles.scorerWrapper} key={index}>
              <Avatar
                imageURL={scorer?.profilePath}
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
                  {scorer?.backNo}
                </Text>
              </View>

              <Text
                style={[
                  fontStyles.fontSize13_Semibold,
                  {
                    color: COLORS.labelNormal,
                    letterSpacing: 0.2,
                  },
                ]}>
                {scorer?.playerName}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text style={fontStyles.fontSize20_Semibold}>MVP</Text>

      <View style={styles.contentWrapper}>
        <View style={styles.teamNameWrapper}>
          <TeamImageWidthBadge imageURL={matchInfo?.homeLogoPath} />
          <Text style={styles.teamNameText}>{matchInfo?.academyName}</Text>
        </View>

        {renderScorers(
          soccerPlayer?.homePlayers?.filter(
            item =>
              item?.acdmyIdx === matchInfo?.homeAcademyIdx &&
              item?.mvpYn === 'Y',
          ),
        )}
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.teamNameWrapper}>
          <TeamImageWidthBadge imageURL={matchInfo?.awayLogoPath} />
          <Text style={styles.teamNameText}>{matchInfo?.awayAcademyName}</Text>
        </View>

        {renderScorers(
          soccerPlayer?.awayPlayers?.filter(
            item =>
              item?.acdmyIdx === matchInfo?.awayAcademyIdx &&
              item?.mvpYn === 'Y',
          ),
        )}
      </View>
    </View>
  );
}

export default memo(MVP);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    rowGap: 8,
  },
  contentWrapper: {
    backgroundColor: '#F1F5FF',
    padding: 16,
    borderRadius: 16,
    rowGap: 16,
  },
  image: {
    width: 20,
    height: 20,
    borderRadius: 999,
  },
  imageWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lineBorder,
  },
  badgeStyle: {
    position: 'absolute',
    right: -4,
    bottom: 0,
  },
  teamNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  teamNameText: {
    ...fontStyles.fontSize12_Semibold,
    color: COLORS.labelNeutral,
    flex: 1,
    letterSpacing: 0.3,
  },
  scorerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    backgroundColor: COLORS.fillStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  scoreWrapper: {
    marginLeft: 4,
    backgroundColor: COLORS.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 5,
    minWidth: 16,
  },
});
