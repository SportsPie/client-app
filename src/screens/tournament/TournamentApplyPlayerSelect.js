import React, { memo, useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { BasicButton } from '../../components/BasicButton';
import SPModal from '../../components/SPModal';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import CloseCircleIcon from '../../assets/svg/CloseCircle';
import ChevronDown from '../../assets/svg/ChevronDown';
import CheckboxChecked from '../../assets/svg/CheckboxChecked';
import CheckboxUnchecked from '../../assets/svg/CheckboxUnchecked';
import GenderMale from '../../assets/svg/GenderMale';
import GenderFemale from '../../assets/svg/GenderFemale';
import OrangePlus from '../../assets/svg/OrangePlus';
import Collapsible from 'react-native-collapsible';
import TournamentApplyPlayerRegisterModal from './TournamentApplyPlayerRegisterModal';
import { navName } from '../../common/constants/navName';
import { useAppState } from '../../utils/AppStateContext';
import { handleError } from '../../utils/HandleError';
import { apiGetTournamentMngPlayerList } from '../../api/RestAPI';
import { useFocusEffect } from '@react-navigation/native';
import { GENDER } from '../../common/constants/gender';
import moment from 'moment';
import { ENTRY_FEE_TYPE } from '../../common/constants/entryFeeType';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import Avatar from '../../components/Avatar';

function GroupSection({ title, count, isExpanded, onPress, children, style }) {
  return (
    <View style={[styles.groupSection, style]}>
      <TouchableOpacity
        activeOpacity={ACTIVE_OPACITY}
        style={[styles.groupHeader, !isExpanded && styles.groupHeaderCollapsed]}
        onPress={onPress}>
        <View style={styles.groupTitleContainer}>
          <Text style={styles.groupTitle}>{title}</Text>
          <Text style={styles.groupCount}>{count}</Text>
        </View>
        <ChevronDown
          width={24}
          height={24}
          style={[
            isExpanded ? styles.collapseIconRotated : styles.collapseIcon,
          ]}
        />
      </TouchableOpacity>
      <Collapsible collapsed={!isExpanded} duration={500}>
        <View style={styles.listContainer}>{children}</View>
      </Collapsible>
    </View>
  );
}

function TournamentApplyPlayerSelect({ route }) {
  /**
   * state
   */
  const params = route?.params;
  const targetName = params?.targetName;
  const entryFeeType = params?.entryFeeType;
  const personCount = params?.personCount;
  const minCnt = params?.minCnt || 0;
  const { setTournamentApplyModalShow } = useAppState();
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isDirectRegisterInformedRef = useRef(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const playerRegisterModalRef = useRef(null);

  const [groupKeyList, setGroupKeyList] = useState([]);
  const [groups, setGroups] = useState([]);

  const isDirectAddPlayerButtonDisabled =
    entryFeeType === ENTRY_FEE_TYPE.INDIVIDUAL.value &&
    selectedPlayers.length >= personCount;

  const nextButtonDisabled =
    entryFeeType === ENTRY_FEE_TYPE.INDIVIDUAL.value
      ? selectedPlayers.length !== personCount
      : selectedPlayers.length < minCnt;

  /**
   * api
   */
  const getPlayerList = async () => {
    try {
      const { data } = await apiGetTournamentMngPlayerList();
      if (data.data) {
        const keys = Object.keys(data.data);
        const noneIndex = keys.indexOf('NONE');
        if (noneIndex > -1) {
          keys.splice(noneIndex, 1); // "NONE" 키 제거
          keys.unshift('NONE'); // "NONE" 키를 맨 앞에 추가
        }
        setGroupKeyList(keys);
        setGroups(data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * function
   */

  const togglePlayer = player => {
    if (selectedPlayers.find(p => p.userIdx === player.userIdx)) {
      setSelectedPlayers(prev =>
        prev.filter(p => p.userIdx !== player.userIdx),
      );
    } else if (entryFeeType === ENTRY_FEE_TYPE.TEAM.value) {
      setSelectedPlayers(prev => [...prev, player]);
    } else if (selectedPlayers.length < personCount) {
      setSelectedPlayers(prev => [...prev, player]);
    }
  };

  const removePlayer = playerId => {
    setSelectedPlayers(prev => prev.filter(p => p.userIdx !== playerId));
  };

  const toggleGroup = groupName => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const isPlayerSelected = playerId => {
    return selectedPlayers.some(p => p.userIdx === playerId);
  };

  const openPlayerInputModal = () => playerRegisterModalRef.current?.show();

  const handleDirectInput = () => {
    if (isDirectRegisterInformedRef.current) {
      openPlayerInputModal();
    } else {
      setShowGuideModal(true);
      isDirectRegisterInformedRef.current = true;
    }
  };

  const directAddPlayer = playerInfo => {
    if (playerInfo) {
      setSelectedPlayers(prev => [...prev, playerInfo]);
    }
  };

  const goNext = () => {
    const selectedPlayerList = selectedPlayers.map(player => {
      return {
        mbIdx: !player.directAdd ? player.userIdx : null,
        playerName: player.playerName,
        playerGender: player.playerGender,
        playerBirth: player.playerBirth,
        playerPosition: player.position,
        playerBackNo: player.backNo,
        profilePath: player.profilePath,
        profileName: player.profileName,
      };
    });
    NavigationService.navigate(navName.tournamentApplyWaitOrPay, {
      ...params,
      playerList: selectedPlayerList,
    });
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getPlayerList();
    }, []),
  );

  /**
   * render
   */
  const renderHeader = () => (
    <View>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.titleContainer}
        onPress={() => setIsCollapsed(!isCollapsed)}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{targetName}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.selectedCountContainer}>
        <Text style={styles.selectedCount}>출전 선수</Text>
        <View style={styles.countWrapper}>
          <Text style={styles.numberCount}>{selectedPlayers.length}</Text>
          <Text style={styles.slashCount}>
            {entryFeeType === ENTRY_FEE_TYPE.TEAM.value
              ? ''
              : `/${personCount}`}
          </Text>
          <Text style={styles.personCount}>
            {entryFeeType === ENTRY_FEE_TYPE.TEAM.value
              ? `명(최소 ${minCnt}명)`
              : '명'}
          </Text>
        </View>

        {selectedPlayers.length > 0 && (
          <View style={styles.selectedPlayersContainer}>
            <View style={styles.cardRow}>
              {selectedPlayers.map(player => (
                <View key={player.userIdx} style={styles.selectedPlayerCard}>
                  <View style={styles.circleContainer}>
                    <Avatar
                      imageURL={player?.profilePath}
                      disableEditMode
                      imageSize={32}
                    />
                  </View>
                  <Text
                    style={styles.selectedPlayerName}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {player.playerName}
                  </Text>
                  <TouchableOpacity
                    hitSlop={20}
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.removeButton}
                    onPress={() => removePlayer(player.userIdx)}>
                    <CloseCircleIcon />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => {
    return (
      <GroupSection
        title={item === 'NONE' ? '미지정' : item}
        count={groups[item]?.length}
        isExpanded={expandedGroups[item]}
        onPress={() => toggleGroup(item)}
        style={index === 0 ? styles.firstGroupSection : styles.groupSection}>
        {expandedGroups[item] &&
          groups[item]?.map(player => (
            <TouchableOpacity
              key={player.userIdx}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => togglePlayer(player)}
              style={styles.playerRow}>
              <View style={styles.playerItem}>
                <View style={styles.checkbox}>
                  {isPlayerSelected(player.userIdx) ? (
                    <CheckboxChecked />
                  ) : (
                    <CheckboxUnchecked />
                  )}
                </View>
                <View style={styles.circleContainer}>
                  <Avatar
                    imageURL={player?.profilePath}
                    disableEditMode
                    imageSize={32}
                  />
                </View>
                <View style={styles.playerInfo}>
                  <View style={styles.numberNameContainer}>
                    {player.backNo && (
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberText}>{player.backNo}</Text>
                      </View>
                    )}
                    <Text style={styles.playerName}>{player.playerName}</Text>
                    <View style={styles.genderIcon}>
                      {player.playerGender === GENDER.M.value ? (
                        <GenderMale />
                      ) : (
                        <GenderFemale />
                      )}
                    </View>
                  </View>
                </View>
                <Text style={styles.birthDate}>
                  {player.playerBirth &&
                    moment(player.playerBirth).format('YYYY.MM.DD')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </GroupSection>
    );
  };

  const renderFooter = () => (
    <View
      style={[
        styles.footerContainer,
        groupKeyList?.length > 0 ? {} : { paddingVertical: 16 },
      ]}>
      <TouchableOpacity
        style={[
          styles.addPlayerButton,
          isDirectAddPlayerButtonDisabled && { borderColor: COLORS.lineBorder },
        ]}
        activeOpacity={ACTIVE_OPACITY}
        onPress={handleDirectInput}
        disabled={isDirectAddPlayerButtonDisabled}>
        <View style={styles.addPlayerContent}>
          <OrangePlus
            fill={
              isDirectAddPlayerButtonDisabled ? COLORS.lineBorder : '#FF7C10'
            }
            stroke={
              isDirectAddPlayerButtonDisabled ? COLORS.lineBorder : '#FF7C10'
            }
          />
          <Text
            style={[
              styles.addPlayerText,
              isDirectAddPlayerButtonDisabled && { color: COLORS.lineBorder },
            ]}>
            직접 입력
          </Text>
        </View>
      </TouchableOpacity>
      <SPModal
        title="안내"
        contents={'직접 입력한 회원은\n경기력 조회가 지원되지 않습니다.'}
        visible={showGuideModal}
        onConfirm={() => {
          setShowGuideModal(false);
          openPlayerInputModal();
        }}
      />
      <TournamentApplyPlayerRegisterModal
        ref={playerRegisterModalRef}
        onConfirm={directAddPlayer}
      />
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="출전 선수 등록" />

        <FlatList
          data={groupKeyList}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContentContainer}
        />

        <View style={styles.bottomButtons}>
          <BasicButton
            text="이전 단계"
            outlineButton
            buttonStyle={styles.prevButton}
            buttonTextStyle={styles.prevButtonText}
            onPress={() => {
              NavigationService.goBack();
              setTournamentApplyModalShow(true);
            }}
          />
          <BasicButton
            text="정보 확인"
            disabled={nextButtonDisabled}
            buttonStyle={styles.nextButton}
            buttonTextStyle={[
              styles.nextButtonText,
              nextButtonDisabled && { color: COLORS.disableText },
            ]}
            onPress={goNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 16,
  },
  selectedCountContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineBorder,
  },
  selectedCount: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  countWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  numberCount: {
    fontFamily: 'Roboto Condensed',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 38,
    color: '#001B51',
  },
  slashCount: {
    marginLeft: 4,
    fontFamily: 'Roboto Condensed',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#2E313599',
  },
  personCount: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: '#2E313599',
  },
  groupSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  firstGroupSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 16,
    paddingRight: 12,
  },
  groupHeaderCollapsed: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 16,
    paddingRight: 12,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupTitle: {
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.0002,
    color: COLORS.labelNormal,
  },
  groupCount: {
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.0002,
    color: COLORS.orange,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 1000,
  },
  playerInfo: {
    flex: 1,
    paddingLeft: 8,
  },
  numberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBadge: {
    backgroundColor: '#5A5F94',
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  numberText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  playerName: {
    marginHorizontal: 2,
    ...fontStyles.fontSize13_Semibold,
    color: COLORS.textDefault,
  },
  genderText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  birthDate: {
    ...fontStyles.fontSize13_Regular,
    color: COLORS.labelNormal,
  },
  addPlayerButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  addPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addPlayerText: {
    ...fontStyles.fontSize16_Medium,
    color: COLORS.orange,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  prevButton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#878D9652',
    backgroundColor: COLORS.white,
  },
  prevButtonText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.darkBlue,
  },
  nextButton: {
    borderRadius: 10,
    padding: 12,
    flex: 1,
  },
  nextButtonText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.white,
  },
  selectedPlayersContainer: {
    paddingTop: 8,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  selectedPlayerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    width: '31.5%',
    borderWidth: 1,
    borderColor: COLORS.lineBorder,
  },
  selectedPlayerName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
    color: COLORS.labelNormal,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -6,
  },
  title: {
    ...fontStyles.fontSize20_Semibold,
  },
  listContentContainer: {
    flexGrow: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  genderIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  collapseIcon: {
    transform: [{ rotate: '0deg' }],
  },
  collapseIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleContainer: {
    overflow: 'hidden',
    borderRadius: 999,
    aspectRatio: 1,
  },
});

export default memo(TournamentApplyPlayerSelect);
