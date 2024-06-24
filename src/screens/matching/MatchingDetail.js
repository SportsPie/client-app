import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Modal,
} from 'react-native';
import NaverMapView, { Marker } from 'react-native-nmap/index';
import {
  apiApplyMatch,
  apiCancelApplyMatch,
  apiGetMatchDetail,
  apiGetMyInfo,
} from '../../api/RestAPI';
import { BlurView } from '@react-native-community/blur';
import { handleError } from '../../utils/HandleError';
import { GENDER } from '../../common/constants/gender';
import { MATCH_CLASS } from '../../common/constants/matchClass';
import { MATCH_STATE } from '../../common/constants/matchState';
import { USER_TYPE } from '../../utils/chat/ChatMapper';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import ChatUtils from '../../utils/chat/ChatUtils';
import SPIcons from '../../assets/icon';
import Utils from '../../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import AcademyDetail from '../academy/AcademyDetail';
import SPHeader from '../../components/SPHeader';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import { TEAM_TYPE } from '../../common/constants/teamType';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACTIVE_OPACITY } from '../../common/constants/constants';

function BlurWrapper({ onJoinPress }) {
  return (
    <View style={styles.blurWrapper}>
      <BlurView blurType="light" blurAmount={5} style={styles.blurView}>
        <View style={styles.blurContainer}>
          <View>
            <Text style={styles.blurText}>소속된 회원만 조회 가능해요.</Text>
            <Text style={styles.blurText}>아카데미에 가입해보세요.</Text>
          </View>
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={onJoinPress}
            activeOpacity={ACTIVE_OPACITY}>
            <Text style={styles.joinBtnText}>가입하기</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

function MatchingDetail({ route }) {
  const matchIdx = route?.params?.matchIdx;
  const { width, height } = useWindowDimensions();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isLogin, userIdx } = useSelector(selector => selector.auth);

  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  // detail
  const [matchInfo, setMatchInfo] = useState({});
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [scorers, setScorers] = useState([]);
  const [matchApplies, setMatchApplies] = useState([]);
  const [camera, setCamera] = useState();
  const [member, setMember] = useState({});
  const [matchAdmin, setMatchAdmin] = useState({});
  const [matchReject, setMatchReject] = useState({});
  const [matchReview, setMatchReview] = useState([]);
  const [homeMvp, setHomeMvp] = useState({});
  const [awayMvp, setAwayMvp] = useState({});
  const [selectedAcademyIdx, setSelectedAcademyIdx] = useState();

  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [academyModalShow, setAcademyModalShow] = useState(false);

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const openMoreModal = () => {
    setModalVisible(true);
  };

  const closeMoreModal = () => {
    setModalVisible(false);
  };

  const openAcademyModal = academyIdx => {
    setSelectedAcademyIdx(academyIdx);
    setAcademyModalShow(true);
  };

  const closeAcademyModal = () => {
    setAcademyModalShow(false);
  };

  const moveToSelectAcademy = () => {
    NavigationService.navigate(navName.matchingSelectAcademy, {
      matchIdx,
    });
  };

  const moveToReview = () => {
    NavigationService.navigate(navName.matchingRegistReview, {
      matchIdx,
    });
  };

  const moveToReject = () => {
    NavigationService.navigate(navName.matchingReject, {
      matchIdx,
    });
  };

  const moveToCancel = () => {
    NavigationService.navigate(navName.matchingCancel, {
      matchIdx,
    });
  };

  const moveToSelectScorer = () => {
    NavigationService.navigate(navName.matchingSelectScorer, {
      matchIdx,
      homeScore: matchInfo.hostScore,
      awayScore: matchInfo.participantScore,
      team: TEAM_TYPE.AWAY,
    });
  };

  const moveToScore = () => {
    NavigationService.navigate(navName.matchingScore, {
      matchIdx,
    });
  };

  const moveToJoin = () => {
    if (!isLogin) {
      showJoinModal();
      return;
    }
    NavigationService.navigate(navName.academyMember);
  };

  const showJoinModal = () => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
      });
    }
  };

  const trlRef = useRef({ current: { disabled: false } });
  const moveToChat = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const participants = [
        {
          userIdx: member.userIdx,
          userType: USER_TYPE.MEMBER,
          userNm: member.userName,
          academyIdx: member.academyIdx,
        },
        {
          userIdx: matchAdmin.userIdx,
          userType: USER_TYPE.MEMBER,
          userNm: matchAdmin.userName,
          academyIdx: matchAdmin.academyIdx,
        },
      ];

      const result = await ChatUtils.createRoom(
        participants,
        matchInfo.title,
        true,
        matchInfo.matchIdx,
      );
      const created = await ChatUtils.waitChatCreated(result);
      if (created) {
        NavigationService.navigate(navName.matchingChatRoomScreen, {
          roomId: result.room?.roomId,
        });
      } else {
        Utils.openModal({ title: '실패', body: '채팅방 생성에 실패했습니다.' });
      }
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  const parseDate = dateString => {
    const date = new Date(dateString);

    const isValidDate = d => {
      // eslint-disable-next-line no-restricted-globals
      return d instanceof Date && !isNaN(d);
    };

    if (!isValidDate(date)) {
      return '';
    }

    // 요일 배열
    const days = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];

    // 날짜 부분 포맷팅 (YYYY년 MM월 DD일 요일)
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()]; // 요일 추출

    // 시간 부분 포맷팅 (오전/오후 HH:MM)
    let hours = date.getHours();
    const minutes = `0${date.getMinutes()}`.slice(-2);
    const period = hours < 12 ? '오전' : '오후';

    // 12시간제로 변환
    hours = hours % 12 || 12; // 0시를 12시로 변환

    // 최종 포맷팅
    const formattedDate = `${month}월 ${day}일 ${dayOfWeek} ${period} ${hours}:${minutes}`;

    return formattedDate;
  };

  const getStatusStyle = state => {
    switch (state) {
      case MATCH_STATE.APPLY.code:
        return {
          backgroundColor: 'rgba(255, 103, 31, 0.16)',
          color: '#FF671F',
          desc: '경기예정',
        };
      // 경기완료
      case MATCH_STATE.REVIEW.code:
      case MATCH_STATE.CONFIRM.code:
        return {
          backgroundColor: 'rgba(135, 141, 150, 0.16)',
          color: 'rgba(46, 49, 53, 0.80)',
          desc: '경기완료',
        };
      case MATCH_STATE.READY.code:
        return {
          backgroundColor: 'rgba(36, 161, 71, 0.16)',
          color: '#24A147',
          desc: '경기대기',
        };
      // 경기중
      case MATCH_STATE.FINISH.code:
      case MATCH_STATE.REJECT.code:
        return {
          backgroundColor: 'rgba(50, 83, 255, 0.16)',
          color: '#3253FF',
          desc: '경기중',
        };
      // 경기취소
      case MATCH_STATE.EXPIRE.code:
      case MATCH_STATE.CANCEL.code:
        return {
          backgroundColor: 'rgba(255, 66, 66, 0.16)',
          color: '#FF4242',
          desc: '경기취소',
        };
      default:
        return {};
    }
  };

  // 경기결과 > 이의신청 또는 승인요청중일때 배경, 텍스트 스타일 적용
  const getStatusBoxStyle = status => {
    switch (status) {
      case MATCH_STATE.REJECT.code:
        return {
          backgroundColor: 'rgba(255, 66, 66, 0.18)',
          color: '#FF4242',
          desc: '이의신청',
        };
      case MATCH_STATE.FINISH.code:
        return {
          backgroundColor: 'rgba(255, 103, 31, 0.18)',
          color: '#FF671F',
          desc: '승인요청중',
        };
      default:
        return {};
    }
  };

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getMatchDetail = async () => {
    try {
      const { data } = await apiGetMatchDetail(matchIdx);

      if (data) {
        setMatchInfo(data.data.matchInfo);
        setMatchApplies(data.data.matchApplies);
        setScorers(data.data.scorers);
        setMatchAdmin(data.data.matchAdmin);
        setMatchReject(data.data.matchReject);
        setMatchReview(data.data.reviews);
        setHomeMvp(
          data.data.matchMvp?.find(
            item => item.acdmyIdx === data.data.matchInfo.homeAcademyIdx,
          ),
        );
        setAwayMvp(
          data.data.matchMvp?.find(
            item => item.acdmyIdx === data.data.matchInfo.awayAcademyIdx,
          ),
        );
        setCamera({
          latitude: data.data.matchInfo.latitude,
          longitude: data.data.matchInfo.longitude,
        });

        const now = new Date();
        const matchDateTimeString = `${data.data.matchInfo.matchDate} ${data.data.matchInfo.matchTime}`;
        const matchDateTime = new Date(matchDateTimeString);
        setIsMatchOver(matchDateTime < now);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getMyInfo = async () => {
    if (!isLogin) {
      return;
    }

    try {
      const { data } = await apiGetMyInfo();
      if (data) {
        setMember(data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const applyMatch = async () => {
    try {
      const { data } = await apiApplyMatch(matchInfo.matchIdx);
      if (data) {
        getMatchDetail();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const cancelApplyMatch = async () => {
    try {
      const { data } = await apiCancelApplyMatch(matchInfo.matchIdx);
      if (data) {
        getMatchDetail();
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      getMyInfo();
      getMatchDetail();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SPHeader
        title="매칭 상세"
        noLeftLogo
        rightBasicAddButton={SPIcons.icOptionsVertical}
        onPressAddRightIcon={openMoreModal}
      />
      <SPMoreModal
        visible={modalVisible}
        onClose={closeMoreModal}
        isAdmin={isAdmin}
        type={MODAL_MORE_TYPE.RECRUIT}
        adminButtons={[MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.SHARE]}
        memberButtons={[MODAL_MORE_BUTTONS.SHARE]}
        shareLink={`matching?id=${matchIdx}`}
        shareTitle={matchInfo?.title ?? ''}
        shareDescription={matchInfo?.description ?? ''}
      />
      <ScrollView>
        <View style={styles.topBox}>
          {/* 경기 상태 */}
          <View style={styles.matchingStatusContainer}>
            <View
              style={[
                styles.matchingStatus,
                getStatusStyle(matchInfo.matchState),
              ]}>
              <Text
                style={[
                  styles.matchingStatusText,
                  { color: getStatusStyle(matchInfo.matchState).color },
                ]}>
                {matchInfo.matchState
                  ? getStatusStyle(matchInfo.matchState).desc
                  : '-'}
              </Text>
            </View>
          </View>
          <View style={styles.topSubBox}>
            <Text style={styles.title}>
              {matchInfo?.title ? matchInfo?.title : '-'}
            </Text>
            <View style={styles.topDetailContainer}>
              <Image
                source={SPIcons.icDate}
                style={{ width: 24, height: 24 }}
              />
              <Text style={styles.topValue}>
                {parseDate(`${matchInfo?.matchDate} ${matchInfo?.matchTime}`)}
              </Text>
            </View>

            <View style={styles.topDetailContainer}>
              <Image
                source={SPIcons.icMarker}
                style={{ width: 24, height: 24 }}
              />
              <Text style={styles.topValue}>{matchInfo?.matchPlace}</Text>
            </View>
          </View>
        </View>
        {matchInfo.matchState === MATCH_STATE.READY.code && (
          <View style={styles.contentBox}>
            <Text style={styles.title}>경기결과</Text>
            <View style={styles.resultContainer}>
              {member.academyIdx === matchInfo.homeAcademyIdx ||
              member.academyIdx === matchInfo.awayAcademyIdx ? (
                ''
              ) : (
                <BlurWrapper onJoinPress={() => moveToJoin()} />
              )}
              <View>
                <View style={styles.resultBox}>
                  <View style={styles.resultAcademy}>
                    {matchInfo.homeLogoPath ? (
                      <Image
                        style={styles.resultAcademyImage}
                        source={{ uri: matchInfo.homeLogoPath }}
                      />
                    ) : (
                      <Image
                        style={styles.resultAcademyImage}
                        source={SPIcons.icDefaultAcademy}
                      />
                    )}
                    <Text style={styles.resultAcademyName}>
                      {matchInfo.academyName}
                    </Text>
                  </View>
                  <View style={styles.resultScore}>
                    <View style={{ height: 38 }}>
                      <Text style={styles.semicolon}>:</Text>
                    </View>
                  </View>
                  <View style={styles.resultAcademy}>
                    {matchInfo.awayLogoPath ? (
                      <Image
                        style={styles.resultAcademyImage}
                        source={{ uri: matchInfo.awayLogoPath }}
                      />
                    ) : (
                      <Image
                        style={styles.resultAcademyImage}
                        source={SPIcons.icDefaultAcademy}
                      />
                    )}
                    <Text style={styles.resultAcademyName}>
                      {matchInfo.awayAcademyName}
                    </Text>
                  </View>
                </View>
              </View>
              {member.academyAdmin &&
                member.academyIdx === matchInfo.homeAcademyIdx &&
                isMatchOver && (
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.buttonContainer}
                    onPress={() => moveToScore()}>
                    <Text style={styles.buttonText}>스코어 입력</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        )}
        {matchInfo.matchState === MATCH_STATE.CONFIRM.code ||
        matchInfo.matchState === MATCH_STATE.FINISH.code ||
        matchInfo.matchState === MATCH_STATE.REJECT.code ||
        matchInfo.matchState === MATCH_STATE.REVIEW.code ? (
          <View>
            <View style={styles.contentBox}>
              <Text style={styles.title}>경기결과</Text>
              <View style={styles.resultContainer}>
                {member.academyIdx === matchInfo.homeAcademyIdx ||
                member.academyIdx === matchInfo.awayAcademyIdx ? (
                  ''
                ) : (
                  <BlurWrapper
                    onJoinPress={() =>
                      NavigationService.navigate(navName.academyMember)
                    }
                  />
                )}
                {matchInfo.matchState === MATCH_STATE.FINISH.code ||
                matchInfo.matchState === MATCH_STATE.REJECT.code ? (
                  <View
                    style={[
                      styles.resultStatusBox,
                      getStatusBoxStyle(matchInfo.matchState).backgroundColor,
                    ]}>
                    <Text
                      style={[
                        styles.resultStatusText,
                        {
                          color: getStatusBoxStyle(matchInfo.matchState).color,
                        },
                      ]}>
                      {matchInfo
                        ? getStatusBoxStyle(matchInfo.matchState).desc
                        : '-'}
                    </Text>
                  </View>
                ) : (
                  ''
                )}

                <View style={styles.resultBox}>
                  <View style={styles.resultAcademy}>
                    {matchInfo.homeLogoPath ? (
                      <Image
                        style={styles.resultAcademyImage}
                        source={{ uri: matchInfo.homeLogoPath }}
                      />
                    ) : (
                      <Image
                        style={styles.resultAcademyImage}
                        source={SPIcons.icDefaultAcademy}
                      />
                    )}
                    <Text style={styles.resultAcademyName}>
                      {matchInfo.academyName}
                    </Text>
                  </View>
                  {/* 스코어 점수 */}
                  <View style={styles.resultScore}>
                    <Text
                      style={
                        matchInfo.participantScore <= matchInfo.hostScore
                          ? styles.resultWinnerScoreText
                          : styles.resultScoreText
                      }>
                      {matchInfo.hostScore}
                    </Text>
                    <View style={{ height: 38 }}>
                      <Text style={styles.semicolon}>:</Text>
                    </View>
                    <Text
                      style={
                        matchInfo.participantScore >= matchInfo.hostScore
                          ? styles.resultWinnerScoreText
                          : styles.resultScoreText
                      }>
                      {matchInfo.participantScore}
                    </Text>
                  </View>
                  <View style={styles.resultAcademy}>
                    {matchInfo.awayLogoPath ? (
                      <Image
                        style={styles.resultAcademyImage}
                        source={{ uri: matchInfo.awayLogoPath }}
                      />
                    ) : (
                      <Image
                        style={styles.resultAcademyImage}
                        source={SPIcons.icDefaultAcademy}
                      />
                    )}
                    <Text style={styles.resultAcademyName}>
                      {matchInfo.awayAcademyName}
                    </Text>
                  </View>
                </View>

                {/* 경기결과 > 득점 선수, 득점수 */}
                {(matchInfo.matchState === MATCH_STATE.REVIEW.code ||
                  matchInfo.matchState === MATCH_STATE.CONFIRM.code) && (
                  <View style={styles.scoreBox}>
                    <View style={styles.scoreList}>
                      {scorers
                        .filter(
                          item => item.acdmyIdx === matchInfo.homeAcademyIdx,
                        )
                        .map(item => (
                          <Text
                            style={[styles.scoreText, { textAlign: 'right' }]}>
                            {item.playerName ? item.playerName : '김파이'}{' '}
                            {item.score}
                          </Text>
                        ))}
                    </View>
                    <Image
                      source={SPIcons.icSoccerBall}
                      style={{ width: 16, height: 16 }}
                    />
                    <View style={styles.scoreList}>
                      {scorers
                        .filter(
                          item => item.acdmyIdx === matchInfo.awayAcademyIdx,
                        )
                        .map(item => (
                          <Text style={styles.scoreText}>
                            {item.score}{' '}
                            {item.playerName ? item.playerName : '김파이'}
                          </Text>
                        ))}
                    </View>
                  </View>
                )}
                {matchInfo.matchState === MATCH_STATE.FINISH.code &&
                  member.academyAdmin &&
                  member.academyIdx === matchInfo.awayAcademyIdx && (
                    <View style={styles.appealBox}>
                      <TouchableOpacity
                        activeOpacity={ACTIVE_OPACITY}
                        style={styles.appealBtn}
                        onPress={() => moveToReject()}>
                        <Text style={styles.appealBtnText}>이의신청</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={ACTIVE_OPACITY}
                        style={styles.appealBtn}
                        onPress={() => moveToSelectScorer()}>
                        <Text style={styles.appealBtnText}>승인</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                {matchInfo.matchState === MATCH_STATE.REJECT.code &&
                  member.academyAdmin && (
                    <View style={styles.opinion}>
                      <Text style={styles.opinionTitle}>의견</Text>
                      <Text style={styles.opinionText}>
                        {matchReject?.rejectReason}
                      </Text>
                    </View>
                  )}
              </View>
            </View>
          </View>
        ) : (
          ''
        )}

        {matchInfo.matchState === MATCH_STATE.REVIEW.code &&
          (member.academyIdx === matchInfo.homeAcademyIdx ||
            member.academyIdx === matchInfo.awayAcademyIdx) &&
          member.academyAdmin && (
            <View>
              <View style={styles.contentBox}>
                <Text style={styles.title}>MVP</Text>
                <View style={styles.selectedList}>
                  <View style={styles.selectedItem}>
                    <View style={styles.selectedNameContainer}>
                      <View style={styles.iconContainer}>
                        {matchInfo.homeLogoPath ? (
                          <Image
                            style={styles.icon}
                            source={{ uri: matchInfo.homeLogoPath }}
                          />
                        ) : (
                          <Image
                            style={styles.icon}
                            source={SPIcons.icDefaultAcademy}
                          />
                        )}
                        {matchInfo.certYn === 'Y' && (
                          <Image
                            source={SPIcons.icCheckBadge}
                            style={styles.overlayIcon}
                          />
                        )}
                      </View>
                      <Text style={styles.selectedNameText}>
                        {matchInfo.homeAcademyName
                          ? matchInfo.homeAcademyName
                          : '-'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <View style={styles.selectedPlayerContainer}>
                        {homeMvp?.profilePath ? (
                          <View>
                            <Image
                              source={{ uri: homeMvp?.profilePath }}
                              style={styles.icon}
                            />
                          </View>
                        ) : (
                          <View>
                            <Image
                              source={SPIcons.icPerson}
                              style={styles.icon}
                            />
                          </View>
                        )}
                        <View style={styles.addTextTop}>
                          {homeMvp?.backNo && (
                            <View style={styles.addNumberBox}>
                              <Text style={styles.addNumberText}>
                                {homeMvp?.backNo}
                              </Text>
                            </View>
                          )}
                          <Text style={styles.addNameText}>
                            {homeMvp?.playerName
                              ? homeMvp?.playerName
                              : '김파이'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.selectedItem}>
                    <View style={styles.selectedNameContainer}>
                      <View style={styles.iconContainer}>
                        {matchInfo.awayLogoPath ? (
                          <Image
                            style={styles.icon}
                            source={{ uri: matchInfo.awayLogoPath }}
                          />
                        ) : (
                          <Image
                            style={styles.icon}
                            source={SPIcons.icDefaultAcademy}
                          />
                        )}
                        {matchInfo.awayCertYn === 'Y' && (
                          <Image
                            source={SPIcons.icCheckBadge}
                            style={styles.overlayIcon}
                          />
                        )}
                      </View>
                      <Text style={styles.selectedNameText}>
                        {matchInfo.awayAcademyName
                          ? matchInfo.awayAcademyName
                          : '-'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <View style={styles.selectedPlayerContainer}>
                        {awayMvp?.profilePath ? (
                          <View>
                            <Image
                              source={{ uri: awayMvp?.profilePath }}
                              style={styles.icon}
                            />
                          </View>
                        ) : (
                          <View>
                            <Image
                              source={SPIcons.icPerson}
                              style={styles.icon}
                            />
                          </View>
                        )}
                        <View style={styles.addTextTop}>
                          {awayMvp?.backNo && (
                            <View style={styles.addNumberBox}>
                              <Text style={styles.addNumberText}>
                                {awayMvp?.backNo}
                              </Text>
                            </View>
                          )}
                          <Text style={styles.addNameText}>
                            {awayMvp?.playerName
                              ? awayMvp?.playerName
                              : '김파이'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.contentBox}>
                <Text style={styles.title}>리뷰</Text>
                <View style={styles.contentReview}>
                  <View style={styles.contentReviewTop}>
                    <Image
                      source={SPIcons.icThreeStar}
                      style={{ width: 24, height: 24 }}
                    />
                    <Text style={styles.contentReviewTitle}>
                      경기에 대한 평가를 확인해보세요
                    </Text>
                  </View>
                  <View style={styles.contentReviewBottom}>
                    <Text style={styles.contentReviewText}>
                      {matchReview?.find(
                        item => item.opnntAcdmyIdx === member.academyIdx,
                      )?.review || '-'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

        <View>
          {/* 아카데미 정보 */}
          <View style={styles.contentBox}>
            <Text style={styles.title}>아카데미 정보</Text>
            <View style={styles.contentDetailBox}>
              <View style={styles.contentTitle}>
                {matchInfo.logoPath ? (
                  <Image
                    style={styles.academySubImage}
                    source={{ uri: matchInfo.logoPath }}
                  />
                ) : (
                  <Image
                    style={styles.academySubImage}
                    source={SPIcons.icDefaultAcademy}
                  />
                )}
                <Text style={styles.contentTitleText}>
                  {matchInfo.academyName ? matchInfo.academyName : '-'}
                </Text>
                {matchInfo.certYn === 'Y' && (
                  <Image
                    source={SPIcons.icCheckBadge}
                    style={{ width: 20, height: 20 }}
                  />
                )}
              </View>
              <View style={styles.contentSubBox}>
                <Text style={styles.contentSubTitle}>매칭전적</Text>
                <Text style={styles.contentSubText}>
                  {`${matchInfo.winCnt ? matchInfo.winCnt : 0}승 ${
                    matchInfo.loseCnt ? matchInfo.loseCnt : 0
                  }패 ${matchInfo.drawCnt ? matchInfo.drawCnt : 0}무`}
                </Text>
              </View>
              <View style={styles.contentSubBox}>
                <Text style={styles.contentSubTitle}>매너점수</Text>
                <View style={styles.reviewBox}>
                  <Image
                    source={SPIcons.icStar}
                    style={{ width: 18, height: 18 }}
                  />
                  <Text style={styles.contentSubText}>
                    {matchInfo.rating ? matchInfo.rating : 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 경기정보 */}
          <View style={styles.contentBox}>
            <View>
              <Text style={styles.title}>경기정보</Text>
            </View>
            <View style={styles.contentDetailBox}>
              <View style={styles.contentSubBox}>
                <Text style={styles.contentSubTitle}>경기방식</Text>
                <Text style={styles.contentSubText}>
                  {matchInfo.matchMethod == null
                    ? '-'
                    : matchInfo.matchMethod === 0
                    ? '협의 후 결정'
                    : `${matchInfo.matchMethod} : ${matchInfo.matchMethod}`}
                </Text>
              </View>
              <View style={styles.contentSubBox}>
                <Text style={styles.contentSubTitle}>성별</Text>
                <Text style={styles.contentSubText}>
                  {matchInfo.genderCode
                    ? GENDER[matchInfo.genderCode].desc
                    : '-'}
                </Text>
              </View>
              <View style={styles.contentSubBox}>
                <Text style={styles.contentSubTitle}>클래스</Text>
                <Text style={styles.contentSubText}>
                  {matchInfo?.matchClassCode
                    ? MATCH_CLASS[matchInfo.matchClassCode]?.desc
                    : '-'}
                </Text>
              </View>
              <View
                style={[styles.contentSubBox, { alignItems: 'flex-start' }]}>
                <Text style={styles.contentSubTitle}>소개글</Text>
                <Text style={styles.contentSubDetailText}>
                  {matchInfo.description ? matchInfo.description : '-'}
                </Text>
              </View>
            </View>
          </View>

          {matchInfo.matchState === MATCH_STATE.APPLY.code && (
            <View style={styles.contentBox}>
              <View>
                <Text style={styles.title}>마감일</Text>
              </View>
              <View>
                <Text style={styles.contentSubDetailText}>
                  {`${parseDate(matchInfo.closeDate)} 까지`}
                </Text>
              </View>
            </View>
          )}

          {/* 경기구장 */}
          <View style={styles.contentBox}>
            <View>
              <Text style={styles.title}>경기구장</Text>
            </View>
            <View style={styles.mapContainer}>
              <View style={{ height: width > 360 ? width * 0.45 : 164 }}>
                {camera && (
                  <NaverMapView
                    style={{
                      width: '100%',
                      height: '100%',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      overflow: 'hidden',
                    }}
                    center={{ ...camera, zoom: 15 }}
                    showsMyLocationButton={false}
                    zoomControl={false}
                    scaleBar={false}
                    useTextureView>
                    <Marker coordinate={camera} />
                  </NaverMapView>
                )}
              </View>

              {/* 경기구장 주소 */}
              <View style={styles.mapTextBox}>
                <Text style={styles.mapText}>
                  {matchInfo.addressFull ? matchInfo.addressFull : '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* 매칭 신청 */}
          {matchInfo.matchState === MATCH_STATE.APPLY.code &&
            matchApplies.length !== 0 &&
            member.academyAdmin &&
            member.academyIdx === matchInfo.homeAcademyIdx && (
              <View>
                <View style={styles.contentMatchBox}>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.title}>매칭 신청</Text>
                  </View>
                  {matchApplies.map(item => (
                    <View
                      style={[styles.detailContainer, { paddingVertical: 8 }]}>
                      <TouchableOpacity
                        activeOpacity={ACTIVE_OPACITY}
                        style={styles.detailSubContainer}
                        onPress={() => openAcademyModal(item.academyIdx)}>
                        {item.logoPath ? (
                          <Image
                            style={styles.academyDetailImage}
                            source={{ uri: item.logoPath }}
                          />
                        ) : (
                          <Image
                            style={styles.academyDetailImage}
                            source={SPIcons.icDefaultAcademy}
                          />
                        )}
                        <Text style={styles.DetailTitleText}>
                          {item.academyName ? item.academyName : '-'}
                        </Text>
                        {item.certYn === 'Y' && (
                          <Image
                            source={SPIcons.icCheckBadge}
                            style={{ width: 20, height: 20 }}
                          />
                        )}
                      </TouchableOpacity>
                      {item.academyIdx === matchInfo.awayAcademyIdx && (
                        <View style={styles.completeBox}>
                          <Text style={styles.completeText}>매칭완료</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
                <View style={[styles.appealBox, { paddingTop: 0 }]}>
                  <TouchableOpacity
                    style={styles.appealOutlineBtn}
                    onPress={() => moveToCancel()}>
                    <Text style={styles.appealOutlineBtnText}>경기취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.appealBtn}
                    onPress={() => moveToSelectAcademy()}>
                    <Text style={styles.appealBtnText}>아카데미 선택하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          {matchInfo.matchState === MATCH_STATE.APPLY.code &&
            matchApplies.length === 0 &&
            member.academyAdmin &&
            member.academyIdx === matchInfo.homeAcademyIdx && (
              <TouchableOpacity
                style={styles.mainBtn}
                onPress={() => moveToCancel()}>
                <Text style={styles.mainBtnText}>경기취소</Text>
              </TouchableOpacity>
            )}
          {matchInfo.matchState === MATCH_STATE.APPLY.code &&
            member.academyAdmin &&
            member.academyIdx !== matchInfo.homeAcademyIdx &&
            matchApplies.some(
              item => item.academyIdx === member.academyIdx,
            ) && (
              <View style={styles.appealBox}>
                <TouchableOpacity
                  style={styles.appealOutlineBtn}
                  onPress={() => cancelApplyMatch()}>
                  <Text style={styles.appealOutlineBtnText}>
                    매칭 신청 취소
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.appealBtn}
                  onPress={() => moveToChat()}>
                  <Text style={styles.appealBtnText}>1:1 채팅하기</Text>
                </TouchableOpacity>
              </View>
            )}
          {matchInfo.matchState === MATCH_STATE.APPLY.code &&
            member.academyAdmin &&
            member.academyIdx !== matchInfo.homeAcademyIdx &&
            !matchApplies.some(
              item => item.academyIdx === member.academyIdx,
            ) && (
              <TouchableOpacity
                style={styles.mainBtn}
                onPress={() => applyMatch()}>
                <Text style={styles.mainBtnText}>매칭 신청하기</Text>
              </TouchableOpacity>
            )}
          {matchInfo.matchState === MATCH_STATE.READY.code &&
            member.academyAdmin && (
              <View>
                {member.academyIdx === matchInfo.homeAcademyIdx && (
                  <View>
                    <View style={styles.contentMatchBox}>
                      <View style={{ marginBottom: 8 }}>
                        <Text style={styles.title}>매칭 신청</Text>
                      </View>
                      {matchApplies.map(item => (
                        <View
                          style={[
                            styles.detailContainer,
                            { paddingVertical: 8 },
                          ]}>
                          <TouchableOpacity
                            style={styles.detailSubContainer}
                            onPress={() => openAcademyModal(item.academyIdx)}>
                            {item.logoPath ? (
                              <Image
                                style={styles.academyDetailImage}
                                source={{ uri: item.logoPath }}
                              />
                            ) : (
                              <Image
                                style={styles.academyDetailImage}
                                source={SPIcons.icDefaultAcademy}
                              />
                            )}
                            <Text style={styles.DetailTitleText}>
                              {item.academyName ? item.academyName : '-'}
                            </Text>
                            {item.certYn === 'Y' && (
                              <Image
                                source={SPIcons.icCheckBadge}
                                style={{ width: 20, height: 20 }}
                              />
                            )}
                          </TouchableOpacity>
                          {item.academyIdx === matchInfo.awayAcademyIdx && (
                            <View style={styles.completeBox}>
                              <Text style={styles.completeText}>매칭완료</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.mainBtn}
                      onPress={() => moveToCancel()}>
                      <Text style={styles.mainBtnText}>경기취소</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {member.academyIdx === matchInfo.awayAcademyIdx && (
                  <View style={styles.appealBox}>
                    <TouchableOpacity
                      style={styles.appealBtn}
                      onPress={() => moveToChat()}>
                      <Text style={styles.appealBtnText}>1:1 채팅하기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

          {matchInfo.matchState === MATCH_STATE.CONFIRM.code &&
            (member.academyIdx === matchInfo.homeAcademyIdx ||
              member.academyIdx === matchInfo.awayAcademyIdx) &&
            member.academyAdmin &&
            !matchReview.find(item => item.acdmyIdx === member.academyIdx) && (
              <TouchableOpacity
                style={styles.mainBtn}
                onPress={() => moveToReview()}>
                <Text style={styles.mainBtnText}>리뷰작성</Text>
              </TouchableOpacity>
            )}

          {matchInfo.matchState === MATCH_STATE.REJECT.code &&
            member.academyAdmin &&
            member.academyIdx === matchInfo.homeAcademyIdx && (
              <TouchableOpacity
                style={styles.mainBtn}
                onPress={() => moveToScore()}>
                <Text style={styles.mainBtnText}>스코어 수정</Text>
              </TouchableOpacity>
            )}
        </View>

        {/* TODO:: 매칭 신청 > 아카데미 상세 정보 모달창 */}
        <Modal
          animationType="fade"
          transparent
          visible={academyModalShow}
          onRequestClose={closeAcademyModal}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
            <View>
              <TouchableOpacity
                onPress={closeAcademyModal}
                style={{
                  width: '100%',
                  height: 60,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                }}>
                <Image
                  source={SPIcons.icNavCancle}
                  style={[{ height: 28, width: 28 }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <AcademyDetail
              showHeader={false}
              showMenu={false}
              showTopRow={false}
              showContentSubBox={true}
              isModal={true}
              route={{ params: { academyIdx: selectedAcademyIdx } }}
            />
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MatchingDetail);

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 5,
    margin: 1,
    marginTop: 5,
    height: 250,
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeBox: {
    backgroundColor: 'rgba(49, 55, 121, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  leftGroup: {
    flexDirection: 'row',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center', // 버튼을 텍스트와 수직으로 가운데 정렬합니다.
  },
  text: {
    marginRight: 10, // 각 텍스트 요소 사이의 간격을 조정할 수 있습니다.
  },
  matchingStatusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchingStatus: {
    backgroundColor: 'rgba(49, 55, 121, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchingStatusText: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  academyImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    marginRight: 10,
  },
  value: {
    flex: 5,
    fontSize: 16,
    fontWeight: 600,
  },
  matchResultTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    paddingTop: 25,
    paddingBottom: 10,
  },
  matchResult: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  matchAcademy: {
    flex: 2,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    marginBottom: 15,
    textAlign: 'center',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  score: {
    marginTop: 20,
    flex: 1,
    flexDirection: 'column',
    fontSize: 30,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreAcademyImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10,
    padding: 20,
  },
  buttonText: {
    padding: 10,
    color: 'white',
    fontSize: 17,
    marginVertical: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: '#FF671F',
    borderRadius: 10,
    margin: 3,
    marginTop: 20,
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  topBox: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  topSubBox: {
    flexDirection: 'column',
    gap: 16,
  },
  topDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topValue: {
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  contentBox: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentDetailBox: {
    flexDirection: 'column',
    gap: 8,
  },
  contentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  academySubImage: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    overflow: 'hidden',
    marginRight: 8,
  },
  contentTitleText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#121212',
    lineHeight: 24,
    letterSpacing: 0.091,
    marginRight: 4,
  },
  contentSubBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  contentSubTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentSubText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'right',
  },
  reviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentSubDetailText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 22,
    letterSpacing: 0.203,
    flex: 1,
  },
  mapContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.16)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapTextBox: {
    padding: 16,
  },
  mapText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  blurWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  blurText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  joinBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  joinBtnText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  resultContainer: {
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    padding: 16,
    minHeight: 130,
    justifyContent: 'center',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultAcademy: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  resultAcademyImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
  },
  resultAcademyName: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  resultScore: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 21.5,
  },
  resultScoreText: {
    fontSize: 28,
    fontWeight: 700,
    color: 'rgba(46, 49, 53, 0.28)',
    lineHeight: 38,
    letterSpacing: -0.661,
  },
  resultWinnerScoreText: {
    fontSize: 28,
    fontWeight: 700,
    color: '#272C61',
    lineHeight: 38,
    letterSpacing: -0.661,
  },
  semicolon: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1A1C1E',
    lineHeight: 32,
    letterSpacing: -0.552,
  },
  scoreBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  scoreList: {
    minWidth: 64,
    flexDirection: 'column',
    // alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  appealBox: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
    paddingHorizontal: 15,
  },
  appealBtn: {
    flex: 1,
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
  },
  appealBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  appealOutlineBtn: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    marginBottom: 24,
  },
  appealOutlineBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  mainBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  mainBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  contentMatchBox: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  academyDetailImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    marginRight: 8,
  },
  DetailTitleText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginRight: 4,
  },
  resultStatusBox: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 66, 66, 0.18)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 16,
  },
  resultStatusText: {
    fontSize: 12,
    fontWeight: 600,
    // color: '#FF4242',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  opinion: {
    flexDirection: 'column',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  opinionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  opinionText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  selectedList: {
    flexDirection: 'column',
    gap: 8,
  },
  selectedItem: {
    flexDirection: 'column',
    gap: 16,
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 16,
    padding: 16,
  },
  selectedNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    overflow: 'hidden',
  },
  overlayIcon: {
    position: 'absolute',
    width: 10,
    height: 10,
    bottom: 0,
    right: 0,
  },
  selectedNameText: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
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
    letterSpacing: 0.342,
    textAlign: 'center',
  },
  addNameText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  contentReview: {
    flexDirection: 'column',
    gap: 8,
  },
  contentReviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentReviewTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  contentReviewBottom: {
    backgroundColor: '#FFE1D2',
    borderRadius: 8,
    padding: 16,
  },
  contentReviewText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
});
