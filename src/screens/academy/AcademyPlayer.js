import React, { useCallback, useState, useRef, memo } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Pressable,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import SPIcons from '../../assets/icon';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import {
  apiDeleteAcademyConfigMngPlayersByUserIdx,
  apiGetAcademyConfigMngPlayers,
  apiGetMyInfo,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { GENDER } from '../../common/constants/gender';
import SPModal from '../../components/SPModal';
import Utils from '../../utils/Utils';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { getFcmToken } from '../../utils/FirebaseMessagingService';

function AcademyPlayer({ route }) {
  /**
   * state
   */
  const academyIdx = route?.params?.academyIdx;
  const [userInfo, setUserInfo] = useState({});
  const [isCollapsed, setIsCollapsed] = useState({});

  const [playersGroups, setPlayersGroups] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState({});

  // modal
  const [modalShow, setModalShow] = useState(false);
  const [outModalShow, setOutModalShow] = useState(false);

  const [fstCall, setFstCall] = useState(true);
  const trlRef = useRef({ current: { disabled: false } });
  const [refresh, setRefresh] = useState(false);

  /**
   * api
   */
  const getUserInfo = async () => {
    try {
      const { data } = await apiGetMyInfo();
      setUserInfo(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const getPlayers = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngPlayers(academyIdx);
      const obj = {};
      data.data.forEach(player => {
        if (player.groupIdx) {
          if (obj[player.groupName]) {
            obj[player.groupName].push(player);
          } else {
            obj[player.groupName] = [player];
          }
        } else if (obj.unspecified) {
          obj.unspecified.push(player);
        } else {
          obj.unspecified = [player];
        }
      });
      setPlayersGroups(obj);
    } catch (error) {
      handleError(error);
    }
    setFstCall(false);
  };

  const out = async () => {
    setOutModalShow(false);
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      if (userInfo.userIdx === selectedPlayer.userIdx) {
        Utils.openModal({
          title: '알림',
          body: '본인은 내보낼 수 없습니다.',
        });
        trlRef.current.disabled = false;
        return;
      }
      const { data } = await apiDeleteAcademyConfigMngPlayersByUserIdx(
        selectedPlayer.userIdx,
      );
      Utils.openModal({
        title: '성공',
        body: '회원을 내보내는데 성공하였습니다.',
      });
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const setUnspecifiedToFirst = obj => {
    const keys = Object.keys(obj);
    const index = keys.indexOf('unspecified');

    if (index !== -1) {
      keys.splice(index, 1); // remove '미지정'
      keys.unshift('unspecified'); // add it to the beginning
    }
    return keys;
  };

  const openModal = player => {
    setSelectedPlayer(player);
    setModalShow(true);
  };
  const closeModal = () => {
    setModalShow(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getUserInfo();
      getPlayers();
    }, [refresh]),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="선수 관리" />

      <View style={{ flex: 1, backgroundColor: '#FFE8DD' }}>
        {!fstCall && (
          <View style={styles.container}>
            {playersGroups && Object.keys(playersGroups).length > 0 ? (
              <FlatList
                data={setUnspecifiedToFirst(playersGroups)}
                contentContainerStyle={
                  {
                    // gap: 16,
                    // borderRadius: 16,
                    // overflow: 'hidden',
                  }
                }
                renderItem={({ item, index }) => {
                  const isItemCollapsed = !!isCollapsed[index];
                  return (
                    playersGroups[item].length > 0 && (
                      <View
                        style={[
                          styles.contentItem,
                          { gap: isItemCollapsed ? 0 : 8 },
                        ]}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}>
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'flex-start',
                              gap: 8,
                              marginRight: 48,
                            }}>
                            <Text style={styles.contentTitle}>
                              {item !== 'unspecified' ? item : '미지정'}
                            </Text>
                            <Text
                              style={[
                                styles.contentTitle,
                                { color: '#FF7C10' },
                              ]}>
                              {playersGroups[item].length}
                            </Text>
                          </View>
                          <Pressable
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            activeOpacity={ACTIVE_OPACITY}
                            onPress={() => {
                              setIsCollapsed(prev => {
                                return {
                                  ...prev,
                                  [index]: !isCollapsed[index],
                                };
                              });
                            }}>
                            <Image
                              source={
                                isCollapsed[index]
                                  ? SPIcons.icArrowDownBlack
                                  : SPIcons.icArrowUpBlack
                              }
                              style={{ width: 24, height: 24 }}
                            />
                          </Pressable>
                        </View>
                        <Collapsible
                          collapsed={!!isCollapsed[index]}
                          duration={500}>
                          {/* eslint-disable-next-line no-shadow */}
                          {playersGroups[item].map((player, index) => {
                            return (
                              <View
                                /* eslint-disable-next-line react/no-array-index-key */
                                key={index}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 8,
                                  paddingVertical: 8,
                                }}>
                                <TouchableOpacity
                                  activeOpacity={ACTIVE_OPACITY}
                                  onPress={() => {
                                    NavigationService.navigate(
                                      navName.academyPlayerDetail,
                                      { userIdx: player.userIdx },
                                    );
                                  }}
                                  style={{
                                    flexDirection: 'row',
                                    gap: 8,
                                    alignItems: 'center',
                                  }}>
                                  <View style={styles.imageBox}>
                                    {player.profilePath ? (
                                      <Image
                                        source={{ uri: player.profilePath }}
                                        style={{ height: 32, width: 32 }}
                                      />
                                    ) : (
                                      <Image
                                        source={SPIcons.icPerson}
                                        style={{ height: 32, width: 32 }}
                                      />
                                    )}
                                  </View>
                                  <View style={styles.textBox}>
                                    <View style={styles.textTop}>
                                      {player.backNo && (
                                        <View style={styles.numberBox}>
                                          <Text style={styles.numberText}>
                                            {player.backNo}
                                          </Text>
                                        </View>
                                      )}
                                      <Text style={styles.nameText}>
                                        {player.playerName}
                                      </Text>
                                    </View>
                                    <View style={styles.textBottom}>
                                      {player.playerBirth && (
                                        <Text style={styles.playerText}>
                                          {moment(player.playerBirth).format(
                                            'YYYY.MM.DD',
                                          )}
                                          ({player.playerAge}세)
                                        </Text>
                                      )}
                                      <View
                                        style={{
                                          width: 4,
                                          height: 4,
                                          backgroundColor:
                                            'rgba(135, 141, 150, 0.22)',
                                          borderRadius: 8,
                                        }}
                                      />
                                      <Text style={styles.playerText}>
                                        {player.playerGender
                                          ? GENDER[player.playerGender].desc
                                          : ''}
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                                <Pressable
                                  hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                  }}
                                  activeOpacity={ACTIVE_OPACITY}
                                  style={{ marginLeft: 'auto' }}
                                  onPress={() => {
                                    openModal(player);
                                  }}>
                                  <Image
                                    source={SPIcons.icOptionsVertical}
                                    style={{ width: 20, height: 20 }}
                                  />
                                </Pressable>
                              </View>
                            );
                          })}
                        </Collapsible>
                      </View>
                    )
                  );
                }}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={(styles.noneText, { textAlign: 'center' })}>
                  아직 등록된 선수가 없습니다. {`\n`}선수를 등록해주세요.
                </Text>
              </View>
            )}
            <Modal
              animationType="fade"
              transparent
              visible={modalShow}
              onRequestClose={() => {
                closeModal();
              }}>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={styles.overlay}
                onPress={() => {
                  closeModal();
                }}>
                <View style={styles.modalContainer}>
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.button}
                    onPress={() => {
                      closeModal();
                      NavigationService.navigate(
                        navName.academyPlayerProfileEdit,
                        {
                          statIdx: selectedPlayer.statIdx,
                          userIdx: selectedPlayer.userIdx,
                        },
                      );
                    }}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icEdit} />
                      <Text style={styles.modalText}>수정하기</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      closeModal();
                      NavigationService.navigate(navName.academyGroupMove, {
                        groupIdx: selectedPlayer.groupIdx,
                        userIdx: selectedPlayer.userIdx,
                      });
                    }}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icMoveGroup} />
                      <Text style={styles.modalText}>그룹이동</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      closeModal();
                      setOutModalShow(true);
                    }}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icRemoveGroup} />
                      <Text style={styles.modalText}>내보내기</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
            <SPModal
              title="내보내기 확인"
              contents="정말로 내보내시겠습니까?"
              visible={outModalShow}
              onConfirm={() => {
                out();
              }}
              onCancel={() => {
                setOutModalShow(false);
              }}
              onClose={() => {
                setOutModalShow(false);
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default memo(AcademyPlayer);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFE8DD',
    // paddingHorizontal: 16,
    // paddingVertical: 24,
    paddingVertical: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
  },
  modalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalText: {
    // flex: 1,
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  contentItem: {
    flexDirection: 'column',
    // gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
  contentTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  imageBox: {
    height: 32,
    width: 32,
    backgroundColor: COLORS.gray,
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
    letterSpacing: 0.342,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  textBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playerText: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
});
