import React, { useState, useEffect, memo, useRef } from 'react';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Pressable,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import 'moment/locale/ko';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import SPIcons from '../../assets/icon';
import {
  apiConfirmResult,
  apiGetAcademyConfigMngPlayers,
  apiGetMatchDetail,
  apiSaveResult,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { TEAM_TYPE } from '../../common/constants/teamType';
import SPModal from '../../components/SPModal';
import { SPToast } from '../../components/SPToast';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function MatchingSelectScorer({ route }) {
  const matchIdx = route?.params?.matchIdx;
  const homeScore = route?.params?.homeScore;
  const awayScore = route?.params?.awayScore;
  const team = route?.params?.team;
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const trlRef = useRef({ current: { disabled: false } });
  const [isCollapsed, setIsCollapsed] = useState({});
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState([]);
  const [homeAcademyIdx, setHomeAcademyIdx] = useState();
  const [awayAcademyIdx, setAwayAcademyIdx] = useState();
  const [playersGroups, setPlayersGroups] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getMatchDetail = async () => {
    try {
      const { data } = await apiGetMatchDetail(matchIdx);
      if (data) {
        setHomeAcademyIdx(data.data.matchInfo.homeAcademyIdx);
        setAwayAcademyIdx(data.data.matchInfo.awayAcademyIdx);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getAcademyConfigMngPlayers = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngPlayers();
      if (data) {
        const obj = { unspecified: [] };
        data.data.forEach(player => {
          if (player.groupIdx) {
            if (obj[player.groupName]) {
              obj[player.groupName].push(player);
            } else {
              obj[player.groupName] = [player];
            }
          } else {
            obj.unspecified.push(player);
          }
        });
        setPlayersGroups(obj);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const selectPlayers = async async => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const param = constructParam();

      switch (team) {
        case TEAM_TYPE.HOME: {
          const { data } = await apiSaveResult(param);
          if (data) {
            handleSubmit();
          }
          break;
        }
        case TEAM_TYPE.AWAY: {
          const { data } = await apiConfirmResult(param);
          if (data) {
            handleSubmit();
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  // --------------------------------------------------
  // [ Util ]
  // --------------------------------------------------
  const incrementScore = userIdx => {
    const score = team === TEAM_TYPE.HOME ? homeScore : awayScore;
    if (score <= totalScore) {
      return false;
    }
    setPlayersGroups(prevGroups => {
      const updatedGroups = { ...prevGroups };
      Object.keys(updatedGroups).forEach(groupKey => {
        updatedGroups[groupKey] = updatedGroups[groupKey].map(player => {
          if (player.userIdx === userIdx) {
            return { ...player, score: (player.score || 0) + 1 };
          }
          return player;
        });
      });
      return updatedGroups;
    });
  };

  const decrementScore = userIdx => {
    setPlayersGroups(prevGroups => {
      const updatedGroups = { ...prevGroups };
      Object.keys(updatedGroups).forEach(groupKey => {
        updatedGroups[groupKey] = updatedGroups[groupKey].map(player => {
          if (player.userIdx === userIdx) {
            return { ...player, score: Math.max((player.score || 0) - 1, 0) };
          }
          return player;
        });
      });
      return updatedGroups;
    });
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = () => {
    SPToast.show({ text: '스코어 입력이 완료됐어요', visibilityTime: 3000 });
    NavigationService.navigate(navName.matchingDetail, {
      matchIdx,
    });
  };

  const toggleCollapse = index => {
    setIsCollapsed(prevState => ({ ...prevState, [index]: !prevState[index] }));
  };

  const handleCheckboxPress = playerIdx => {
    setSelectedPlayerIdx(prevIdx =>
      prevIdx.includes(playerIdx)
        ? prevIdx.filter(idx => idx !== playerIdx)
        : [...prevIdx, playerIdx],
    );
  };

  const handleRemovePlayer = playerIdx => {
    setPlayersGroups(prevGroups => {
      const updatedGroups = { ...prevGroups };
      Object.keys(updatedGroups).forEach(groupKey => {
        updatedGroups[groupKey] = updatedGroups[groupKey].map(player => {
          if (player.userIdx === playerIdx) {
            return { ...player, score: 0 };
          }
          return player;
        });
      });
      return updatedGroups;
    });
  };

  const totalScore = Object.values(playersGroups)
    .flatMap(group => group.map(player => player.score || 0))
    .reduce((a, b) => a + b, 0);

  const players = Object.keys(playersGroups).map((key, index) => ({
    title: key,
    data: playersGroups[key],
  }));

  const isDisabled =
    selectedPlayerIdx.length !== 0 && team === TEAM_TYPE.HOME
      ? totalScore !== homeScore
      : totalScore !== awayScore;

  const constructParam = () => {
    const playerList = selectedPlayerIdx
      .map(playerIdx => {
        let playerDetails = null;

        Object.values(playersGroups).forEach(group => {
          group.forEach(player => {
            if (player.userIdx === playerIdx) {
              playerDetails = {
                playerIdx: player.userIdx,
                score: player.score || 0,
              };
            }
          });
        });

        return playerDetails;
      })
      .filter(player => player !== null);

    const param = {
      matchIdx,
      homeScore,
      awayScore,
      players: playerList,
    };

    return param;
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useEffect(() => {
    getMatchDetail();
  }, []);

  useEffect(() => {
    if (homeAcademyIdx && awayAcademyIdx) {
      switch (team) {
        case TEAM_TYPE.HOME:
          getAcademyConfigMngPlayers(homeAcademyIdx);
          break;
        case TEAM_TYPE.AWAY:
          getAcademyConfigMngPlayers(awayAcademyIdx);
          break;
        default:
          break;
      }
    }
  }, [homeAcademyIdx, awayAcademyIdx]);

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.contentItem,
        isCollapsed[index] ? { gap: 8 } : { gap: 0 },
      ]}>
      <View style={[styles.itemHeader]}>
        <View style={styles.itemTitleContainer}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              marginRight: 48,
            }}>
            <Text style={styles.contentTitle}>
              {item.title === 'unspecified' ? '미지정' : item.title}
            </Text>
            <Text style={[styles.contentTitle, { color: '#FF671F' }]}>
              {item.data.length}
            </Text>
          </View>
        </View>
        <Pressable
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          onPress={() => toggleCollapse(index)}>
          <Image
            source={
              isCollapsed[index]
                ? SPIcons.icArrowUpBlack
                : SPIcons.icArrowDownBlack
            }
            style={{ width: 24, height: 24 }}
          />
        </Pressable>
      </View>
      <Collapsible collapsed={!isCollapsed[index]} duration={500}>
        {item.data.map(player => (
          <View key={player.userIdx} style={styles.playerItem}>
            <View style={styles.playerInfo}>
              <View style={styles.playerInfoBox}>
                <TouchableOpacity
                  style={styles.checkboxWrapper}
                  onPress={() => handleCheckboxPress(player.userIdx)}>
                  <Image
                    source={
                      selectedPlayerIdx.includes(player.userIdx)
                        ? SPIcons.icChecked
                        : SPIcons.icOutlineCheck
                    }
                    style={{ width: 32, height: 32 }}
                  />
                </TouchableOpacity>
                <View style={styles.imageBox}>
                  {player.profilePath ? (
                    <Image
                      source={{ uri: player.profilePath }}
                      style={{ height: 32, width: 32, borderRadius: 16 }}
                    />
                  ) : (
                    <Image
                      source={SPIcons.icPerson}
                      style={{ height: 32, width: 32, borderRadius: 16 }}
                    />
                  )}
                </View>
                <View style={styles.textBox}>
                  <View style={styles.textTop}>
                    {player.backNo && (
                      <View style={styles.numberBox}>
                        <Text style={styles.numberText}>{player.backNo}</Text>
                      </View>
                    )}
                    <Text style={styles.nameText}>
                      {player.playerName ? player.playerName : '김파이'}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.scoreContainer,
                  selectedPlayerIdx.includes(player.userIdx)
                    ? styles.enabledScoreContainer
                    : styles.disabledScoreContainer,
                ]}>
                <TouchableOpacity
                  onPress={() => decrementScore(player.userIdx)}
                  style={[
                    styles.scoreButton,
                    (player.score || 0) === 0 && styles.disabledScoreButton,
                  ]}
                  hitSlop={15}
                  disabled={
                    !selectedPlayerIdx.includes(player.userIdx) ||
                    (player.score || 0) === 0
                  }>
                  <Image source={SPIcons.icMinus} />
                </TouchableOpacity>
                <View style={styles.scoreDisplay}>
                  <Text style={styles.scoreText}>{player.score || 0}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => incrementScore(player.userIdx)}
                  style={styles.scoreButton}
                  hitSlop={15}
                  disabled={!selectedPlayerIdx.includes(player.userIdx)}>
                  <Image source={SPIcons.icPlus} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </Collapsible>
    </View>
  );

  const renderSelectedPlayers = () => {
    return Object.keys(playersGroups).flatMap(groupKey =>
      playersGroups[groupKey]
        .filter(
          player =>
            selectedPlayerIdx.includes(player.userIdx) && player.score >= 1,
        )
        .map(player => (
          <View key={player.userIdx} style={styles.selectedPlayerContainer}>
            <View style={styles.addImageBox}>
              {player.profilePath ? (
                <Image
                  source={{ uri: player.profilePath }}
                  style={{ height: 32, width: 32, borderRadius: 16 }}
                />
              ) : (
                <Image
                  source={SPIcons.icPerson}
                  style={{ height: 24, width: 24, borderRadius: 12 }}
                />
              )}
            </View>
            <View style={styles.addTextBox}>
              <View style={styles.addTextTop}>
                {player.backNo && (
                  <View style={styles.addNumberBox}>
                    <Text style={styles.addNumberText}>{player.backNo}</Text>
                  </View>
                )}
                <Text style={styles.addNameText}>{player.playerName}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleRemovePlayer(player.userIdx)}>
              <Image
                source={SPIcons.icMinusRed}
                style={{ width: 16, height: 16 }}
              />
            </TouchableOpacity>
          </View>
        )),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="출전 선수 선택" />

      <View style={{ flex: 1 }}>
        {/* 상단 스코어 */}
        <View style={styles.topBox}>
          <View>
            <Text style={styles.topTitle}>스코어</Text>
            <View style={styles.topCountBox}>
              <Text style={styles.topCountMain}>{totalScore}</Text>
              <Text style={styles.topCountSub}>
                /{team === TEAM_TYPE.HOME ? homeScore : awayScore}
              </Text>
            </View>
          </View>
          <View style={styles.selectedPlayer}>{renderSelectedPlayers()}</View>
        </View>
        <FlatList
          data={players}
          renderItem={renderItem}
          keyExtractor={item => item.userIdx}
          contentContainerStyle={styles.contentList}
        />
      </View>

      {/* 완료 버튼 */}
      <TouchableOpacity
        style={[
          styles.clearBtn,
          isDisabled || selectedPlayerIdx?.length === 0
            ? styles.disabledClearBtn
            : styles.enabledClearBtn,
        ]}
        onPress={() => {
          setModalVisible(true);
        }}
        disabled={isDisabled || selectedPlayerIdx?.length === 0}>
        <Text
          style={[
            styles.clearBtnText,
            isDisabled || selectedPlayerIdx?.length === 0
              ? styles.disabledClearBtnText
              : styles.enabledClearBtnText,
          ]}>
          완료
        </Text>
      </TouchableOpacity>
      <SPModal
        title="선수 선택"
        contents="스코어와 출전 선수를 입력하시겠어요?"
        visible={modalVisible}
        twoButton
        onConfirm={() => selectPlayers()}
        onCancel={closeModal}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

export default memo(MatchingSelectScorer);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  topBox: {
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.22)',
    zIndex: 1, // 추가된 부분
    backgroundColor: '#FFF', // 배경색 설정
  },
  topTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 4,
  },
  topCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topCountMain: {
    fontSize: 28,
    fontWeight: 700,
    color: '#272C61',
    lineHeight: 38,
    letterSpacing: -0.661,
  },
  topCountSub: {
    fontSize: 16,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  contentList: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 25,
  },
  contentItem: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flexShrink: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    flexShrink: 1,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  playerInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageBox: {
    height: 32,
    width: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textBox: {
    gap: 4,
    justifyContent: 'center',
  },
  textTop: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  numberBox: {
    minWidth: 16,
    backgroundColor: '#5A5F94',
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  numberText: {
    fontSize: 11,
    fontWeight: 500,
    color: '#FFF',
    lineHeight: 14,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  enabledScoreContainer: {
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    opacity: 1,
  },
  disabledScoreContainer: {
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    opacity: 0.38,
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
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  enabledClearBtn: {
    backgroundColor: '#FF671F',
  },
  disabledClearBtn: {
    backgroundColor: '#E3E2E1',
  },
  enabledClearBtnText: {
    color: '#FFF',
  },
  disabledClearBtnText: {
    color: 'rgba(46, 49, 53, 0.28)',
  },
  selectedPlayer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  selectedPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addImageBox: {
    height: 24,
    width: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  addTextBox: {
    justifyContent: 'center',
  },
  addTextTop: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  addNumberBox: {
    minWidth: 16,
    backgroundColor: '#5A5F94',
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  addNumberText: {
    fontSize: 11,
    fontWeight: 500,
    color: '#FFF',
    lineHeight: 14,
    textAlign: 'center',
  },
  addNameText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
  },
};
