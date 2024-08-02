import React, { useCallback, useState, useRef, memo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiGetAcademyConfigMngPlayerMatchHistory,
  apiGetAcademyConfigMngPlayersByUserIdx,
  apiPatchAcademyConfigMngConfirm,
  apiPatchAcademyConfigMngReject,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { CAREER_TYPE } from '../../common/constants/careerType';
import { GENDER } from '../../common/constants/gender';
import { MAIN_FOOT_TYPE } from '../../common/constants/mainFootType';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import SPHeader from '../../components/SPHeader';
import SPModal from '../../components/SPModal';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';

function AcademyPlayerDetail({ route }) {
  /**
   * state
   */
  const userIdx = route?.params?.userIdx;
  const joinIdx = route?.params?.joinIdx;
  const showButton = route?.params?.showButton;
  const [player, setPlayer] = useState({});
  const [matchTotal, setMatchTotal] = useState({});
  const [careerList, setCareerList] = useState([]);

  // modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const trlRef = useRef({ current: { disabled: false } });

  // list
  const [size, setSize] = useState(30);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [matchList, setMatchList] = useState([]);

  /**
   * api
   */
  const getProfile = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngPlayersByUserIdx(userIdx);
      setPlayer(data.data.player);
      setMatchTotal(data.data.matchTotal || {});
      setCareerList(data.data.careerList);
    } catch (error) {
      handleError(error);
    }
  };

  const getMachingList = async () => {
    try {
      const params = {
        page,
        size,
      };
      const { data } = await apiGetAcademyConfigMngPlayerMatchHistory(
        userIdx,
        params,
      );
      setTotalCnt(data.data.totalCnt);
      setIsLast(data.data.isLast);
      if (page === 1) {
        setMatchList(data.data.list);
      } else {
        setMatchList(prev => [...prev, ...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const reject = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiPatchAcademyConfigMngReject(joinIdx);
      Utils.openModal({
        title: '성공',
        body: '거절되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };
  const confirm = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiPatchAcademyConfigMngConfirm(joinIdx);
      Utils.openModal({
        title: '성공',
        body: '승인되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const handleScroll = event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isScrolledToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isScrolledToBottom) {
      loadMoreProjects();
    }
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const openRejectModal = idx => {
    setRejectModalVisible(true);
  };
  const closeRejectModal = () => {
    setRejectModalVisible(false);
  };
  const openConfirmModal = idx => {
    setConfirmModalVisible(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalVisible(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      getMachingList();
    }, [page]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <SPHeader
        title="선수 프로필"
        noLeftLogo
        leftButtonIcon={SPIcons.icArrowLeftWhite}
        headerBackgroundColor="#313779"
        titleColor="#FFF"
      />
      {/* 선수 프로필 */}
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.playerProfile}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                overflow: 'hidden',
              }}>
              {player.profilePath ? (
                <Image
                  source={{ uri: player.profilePath }}
                  style={{ width: 56, height: 56 }}
                />
              ) : (
                <Image
                  source={SPIcons.icPerson}
                  style={{ width: 56, height: 56 }}
                />
              )}
            </View>
            <View style={styles.topBox}>
              {player.backNo && (
                <View style={styles.number}>
                  <Text style={styles.numberText}>{player.backNo}</Text>
                </View>
              )}
              <Text style={styles.nameText}>{player.playerName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentsContainer}>
          <View style={styles.contentsList}>
            <View style={styles.contentsItem}>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>포지션</Text>
                <Text style={styles.infoText}>{player.position || '-'}</Text>
              </View>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>지역</Text>
                <Text style={styles.infoText}>
                  {player.playerRegion || player.playerRegionSub
                    ? `${player.playerRegion} ${player.playerRegionSub}`
                    : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.contentsItem}>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>성별</Text>
                <Text style={styles.infoText}>
                  {GENDER[player.playerGender]?.desc || '-'}
                </Text>
              </View>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>나이</Text>
                <View style={styles.infoTextBox}>
                  <Text style={styles.infoText}>
                    {player.playerAge ? `${player.playerAge}세` : '-'}
                  </Text>
                  <Text style={styles.infoSubText}>
                    {player.playerBirth
                      ? moment(player.playerBirth).format('YYYY.MM.DD')
                      : ''}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.contentsItem}>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>주 발</Text>
                <Text style={styles.infoText}>
                  {MAIN_FOOT_TYPE[player.mainFoot]?.desc || '-'}
                </Text>
              </View>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>키</Text>
                <Text style={styles.infoText}>
                  {player.height ? `${player.height}cm` : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.contentsItem}>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>발사이즈</Text>
                <Text style={styles.infoText}>
                  {player.shoeSize ? `${player.shoeSize}mm` : '-'}
                </Text>
              </View>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>몸무게</Text>
                <Text style={styles.infoText}>
                  {player.weight ? `${player.weight}kg` : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.contentsItem}>
              <View style={styles.contentsBox}>
                <Text style={styles.titleText}>선수경력</Text>
                <View style={styles.infoBox}>
                  {careerList && careerList.length > 0 ? (
                    careerList.map((level, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <React.Fragment key={index}>
                        <Text style={styles.infoText}>
                          {CAREER_TYPE[level]?.desc}
                        </Text>
                        {index < careerList.length - 1 && (
                          <View style={styles.circle} />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <Text style={styles.infoText}>-</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* 경기 참가이력 */}
          <View style={styles.contentsDetail}>
            <Text style={styles.infoText}>경기 참가이력</Text>
            <View style={styles.contentsList}>
              <View style={styles.contentsItem}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.titleText}>출전경기수</Text>
                  <Text style={styles.infoText}>
                    {Utils.changeNumberComma(matchTotal.cntMatch || 0)}
                  </Text>
                </View>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.titleText}>득점</Text>
                  <Text style={styles.infoText}>
                    {Utils.changeNumberComma(matchTotal.sumPoint || 0)}
                  </Text>
                </View>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.titleText}>MVP</Text>
                  <Text style={styles.infoText}>
                    {Utils.changeNumberComma(matchTotal.cntMvp || 0)}
                  </Text>
                </View>
              </View>
              <View style={styles.contentsItem}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.titleText}>도움</Text>
                  <Text style={styles.infoText}>
                    {Utils.changeNumberComma(matchTotal.sumAssist || 0)}
                  </Text>
                </View>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.titleText}>경고</Text>
                  <Text style={styles.infoText}>
                    {Utils.changeNumberComma(matchTotal.sumYellow || 0)}
                  </Text>
                </View>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.titleText}>퇴장</Text>
                  <Text style={styles.infoText}>
                    {Utils.changeNumberComma(matchTotal.sumRed || 0)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.contentsSubDetail}>
              {matchList &&
                matchList.length > 0 &&
                matchList.map((item, index) => {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <View key={index} style={styles.contentsSubDetailBox}>
                      <Text style={styles.subTitle}>{item.title}</Text>
                      <Text style={styles.subText}>
                        {moment(item.matchDate).format('YYYY-MM-DD')}
                      </Text>
                    </View>
                  );
                })}
            </View>
          </View>
        </View>
      </ScrollView>
      {showButton && (
        <View style={styles.subBtnBox}>
          <TouchableOpacity
            style={styles.subRefuseBtn}
            onPress={openRejectModal}>
            <Text style={styles.subRefuseText}>거절</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.subApprovalBtn}
            onPress={openConfirmModal}>
            <Text style={styles.subApprovalText}>승인</Text>
          </TouchableOpacity>
        </View>
      )}
      <SPModal
        title="거절 확인"
        contents="거절하시겠습니까?"
        visible={rejectModalVisible}
        onConfirm={() => {
          reject();
        }}
        onCancel={closeRejectModal}
        onClose={closeRejectModal}
      />
      <SPModal
        title="승인 확인"
        contents="승인하시겠습니까?"
        visible={confirmModalVisible}
        twoButton
        onConfirm={() => {
          confirm();
        }}
        onCancel={closeConfirmModal}
        onClose={closeConfirmModal}
      />
    </SafeAreaView>
  );
}

export default memo(AcademyPlayerDetail);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#313779',
  },
  playerProfile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  topBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  number: {
    backgroundColor: '#5A5F94',
    borderRadius: 6,
    paddingHorizontal: 2,
  },
  numberText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#E1E3E6',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  contentsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentsList: {
    flexDirection: 'column',
    gap: 8,
  },
  contentsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 96,
  },
  contentsBox: {
    flex: 1,
    // minHeight: 96,
    height: '100%',
    backgroundColor: '#F1F5FF',
    borderRadius: 12,
    padding: 16,
  },
  titleText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
    marginBottom: 4,
  },
  infoTextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  infoSubText: {
    fontSize: 13,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  circle: {
    width: 6,
    height: 6,
    backgroundColor: '#8387AF',
    borderRadius: 10,
  },
  contentsDetail: {
    flexDirection: 'column',
    gap: 16,
    paddingTop: 24,
  },
  contentsSubBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5FF',
    borderRadius: 12,
    padding: 8,
  },
  contentsSubDetail: {
    flexDirection: 'column',
    gap: 16,
  },
  contentsSubDetailBox: {
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 8,
    padding: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#000',
    lineHeight: 24,
    letterSpacing: 0.091,
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  subBtnBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFF',
    padding: 16,
  },
  subRefuseBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  subRefuseText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  subApprovalBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  subApprovalText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
};
