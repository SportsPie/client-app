import React, { useState, useEffect, memo } from 'react';
import { Text, View, Image, TouchableOpacity, Platform } from 'react-native';
import 'moment/locale/ko';
import SPIcons from '../../assets/icon';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { apiGetMatchDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { TEAM_TYPE } from '../../common/constants/teamType';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MatchingScore({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const matchIdx = route?.params?.matchIdx;
  const [matchInfo, setMatchInfo] = useState({});
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getMatchDetail = async () => {
    try {
      const { data } = await apiGetMatchDetail(matchIdx);

      if (data) {
        setMatchInfo(data.data.matchInfo);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const incrementScore = team => {
    switch (team) {
      case TEAM_TYPE.HOME:
        setHomeScore(prevScore => prevScore + 1);
        break;
      case TEAM_TYPE.AWAY:
        setAwayScore(prevScore => prevScore + 1);
        break;
      default:
        break;
    }
  };

  const decrementScore = team => {
    switch (team) {
      case TEAM_TYPE.HOME:
        setHomeScore(prevScore => (prevScore > 0 ? prevScore - 1 : 0));
        break;
      case TEAM_TYPE.AWAY:
        setAwayScore(prevScore => (prevScore > 0 ? prevScore - 1 : 0));
        break;
      default:
        break;
    }
  };

  const moveToSelectScorer = () => {
    NavigationService.navigate(navName.matchingSelectScorer, {
      matchIdx,
      homeScore,
      awayScore,
      team: TEAM_TYPE.HOME,
    });
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useEffect(() => {
    getMatchDetail();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="스코어 입력" />

      <View style={styles.contentContainer}>
        <View style={styles.contentBox}>
          <View style={styles.detail}>
            <View style={styles.iconContainer}>
              {matchInfo.homeLogoPath ? (
                <Image
                  style={styles.icon}
                  source={{ uri: matchInfo.homeLogoPath }}
                />
              ) : (
                <Image source={SPIcons.icDefaultAcademy} style={styles.icon} />
              )}
              {matchInfo.certYn === 'Y' && (
                <Image
                  source={SPIcons.icCheckBadge}
                  style={styles.overlayIcon}
                />
              )}
            </View>
            <Text style={styles.detailText}>{matchInfo.homeAcademyName}</Text>
          </View>
          {/* 스코어 */}
          <View style={styles.scoreContainer}>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => decrementScore(TEAM_TYPE.HOME)}
              style={[
                styles.scoreButton,
                homeScore === 0 && styles.disabledScoreButton,
              ]}
              disabled={homeScore === 0}>
              <Image source={SPIcons.icMinus} />
            </TouchableOpacity>
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreText}>{homeScore}</Text>
            </View>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => incrementScore(TEAM_TYPE.HOME)}
              style={styles.scoreButton}>
              <Image source={SPIcons.icPlus} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentBox}>
          <View style={styles.detail}>
            <View style={styles.iconContainer}>
              {matchInfo.awayLogoPath ? (
                <Image
                  style={styles.icon}
                  source={{ uri: matchInfo.awayLogoPath }}
                />
              ) : (
                <Image source={SPIcons.icDefaultAcademy} style={styles.icon} />
              )}
              {matchInfo.awayCertYn === 'Y' && (
                <Image
                  source={SPIcons.icCheckBadge}
                  style={styles.overlayIcon}
                />
              )}
            </View>
            <Text style={styles.detailText}>{matchInfo.awayAcademyName}</Text>
          </View>
          {/* 스코어 */}
          <View style={styles.scoreContainer}>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => decrementScore(TEAM_TYPE.AWAY)}
              style={[
                styles.scoreButton,
                awayScore === 0 && styles.disabledScoreButton,
              ]}
              disabled={awayScore === 0}>
              <Image source={SPIcons.icMinus} />
            </TouchableOpacity>
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreText}>{awayScore}</Text>
            </View>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => incrementScore(TEAM_TYPE.AWAY)}
              style={styles.scoreButton}>
              <Image source={SPIcons.icPlus} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 출전 선수 선택으로 이동 */}
      <TouchableOpacity
        style={styles.clearBtn}
        onPress={() => moveToSelectScorer()}>
        <Text style={styles.clearBtnText}>다음</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default memo(MatchingScore);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  detail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 16,
    leeterSpacing: 0.302,
  },
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  icon: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  overlayIcon: {
    position: 'absolute',
    width: 13.3,
    height: 13.3,
    bottom: 0,
    right: 0,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreDisplay: {
    minWidth: 42,
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.08)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledScoreButton: {
    opacity: 0.38,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#000',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  clearBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
};
