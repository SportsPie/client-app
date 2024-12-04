/* eslint-disable react/no-array-index-key */
import React, { memo, useCallback } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
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

function TournamentMVP({ tournamentDetail }) {
  const renderScorers = useCallback(data => {
    return (
      <View style={{ alignItems: 'center', gap: 16 }}>
        {data?.map((scorer, index) => {
          return (
            <View style={styles.scorerWrapper} key={index}>
              <Avatar
                imageURL={scorer?.profilePath}
                disableEditMode
                imageSize={24}
              />
              {scorer?.playerBackNo && (
                <View style={styles.scoreWrapper}>
                  <Text
                    style={[
                      fontStyles.fontSize11_Medium,
                      {
                        color: COLORS.white,
                      },
                    ]}>
                    {scorer?.playerBackNo}
                  </Text>
                </View>
              )}

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
    (tournamentDetail?.firstMvpList?.length > 0 ||
      tournamentDetail?.secondMvpList?.length > 0) && (
      <View style={styles.container}>
        <Text style={fontStyles.fontSize20_Semibold}>MVP</Text>

        {tournamentDetail?.firstMvpList?.length > 0 && (
          <View style={styles.contentWrapper}>
            <View style={styles.teamNameWrapper}>
              <TeamImageWidthBadge
                imageURL={tournamentDetail?.firstAcademyLogoPath}
              />
              <Text style={styles.teamNameText}>
                {tournamentDetail?.firstAcademyName}
              </Text>
            </View>

            {renderScorers(tournamentDetail?.firstMvpList)}
          </View>
        )}

        {tournamentDetail?.secondMvpList?.length > 0 && (
          <View style={styles.contentWrapper}>
            <View style={styles.teamNameWrapper}>
              <TeamImageWidthBadge
                imageURL={tournamentDetail?.secondAcademyLogoPath}
              />
              <Text style={styles.teamNameText}>
                {tournamentDetail?.secondAcademyName}
              </Text>
            </View>

            {renderScorers(tournamentDetail?.secondMvpList)}
          </View>
        )}
      </View>
    )
  );
}

export default memo(TournamentMVP);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    rowGap: 8,
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
    borderRadius: 6,
    backgroundColor: 'transparent',
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
