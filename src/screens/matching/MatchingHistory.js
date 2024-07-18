/* eslint-disable react/no-unstable-nested-components */
import { BlurView } from '@react-native-community/blur';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import {
  apiGetAcademyDetail,
  apiGetAcademyOpenMatchResults,
  apiGetAcademyOpenMatchResultsByIdx,
  apiPostAcademyJoin,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { MATCH_RESULT_TYPE } from '../../common/constants/MatchResultType';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { JOIN_TYPE } from '../../common/constants/joinType';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { navName } from '../../common/constants/navName';
import SPLoading from '../../components/SPLoading';
import SPModal from '../../components/SPModal';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { IS_YN } from '../../common/constants/isYN';

function MatchingHistory({ route }) {
  /**
   * state
   */
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();
  const academyIdx = route?.params?.academyIdx;
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [joinWait, setJoinWait] = useState(false);
  const [hideMatchingItem, setHideMatchingItem] = useState(false);
  const [matchSatistics, setMatchSatistics] = useState({});
  const [openPublic, setOpenPublic] = useState(false);

  // list
  const [size, setSize] = useState(30);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [refreshUserInfo, setRefreshUserInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [matchList, setMatchList] = useState([]);

  // filter
  const [matchResultType, setMatchResultType] = useState(null);

  const [joinType, setJoinType] = useState();

  // modal
  const [joinModalVisible, setJoinModalVisible] = useState(false);

  const trlRef = useRef({ current: { disabled: false } });

  /**
   * api
   */
  const getAcademyDetail = async () => {
    try {
      const { data } = await apiGetAcademyDetail(academyIdx);
      setOpenPublic(data.data?.academy?.openMatchPublicYn === IS_YN.Y);
    } catch (error) {
      handleError(error);
    }
  };

  const getUserInfo = async () => {
    try {
      const type = await Utils.getUserJoinType(academyIdx);
      setJoinType(type);
    } catch (error) {
      handleError(error);
    }
  };

  const getMatchingSatistics = async () => {
    try {
      const { data } = await apiGetAcademyOpenMatchResultsByIdx(academyIdx);
      setMatchSatistics(data.data);
    } catch (error) {
      if (error.code !== 9999) {
        handleError(error);
      }
    }
  };

  const getMatchingHistory = async () => {
    try {
      const parmas = {
        academyIdx,
        page,
        size,
        resultType: matchResultType,
      };
      const { data } = await apiGetAcademyOpenMatchResults(parmas);
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
    setIsFocus(false);
    setLoading(false);
    setRefreshing(false);
  };

  const joinRequest = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const params = { academyIdx };
      const { data } = await apiPostAcademyJoin(params);
      Utils.openModal({
        title: '가입신청 완료',
        body: '가입 신청이 완료되었습니다.\n가입이 승인되면 알려두릴게요!',
      });
      setRefreshUserInfo(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */

  const renderByJoinType = () => {
    if (!joinType) return;
    switch (joinType) {
      case JOIN_TYPE.NO_LOGIN:
        setHideMatchingItem(true);
        break;
      case JOIN_TYPE.NO_JOIN:
        setHideMatchingItem(true);
        break;
      case JOIN_TYPE.ACADEMY_WAIT:
        setHideMatchingItem(true);
        break;
      case JOIN_TYPE.ACADEMY_MEMBER:
        setHideMatchingItem(false);
        break;
      case JOIN_TYPE.ACADEMY_ADMIN:
        setHideMatchingItem(false);
        break;
      case JOIN_TYPE.JOIN_OR_WAIT:
        setHideMatchingItem(true);
        break;
      default:
        break;
    }
  };

  const showJoinModal = () => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다.\n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
      });
    } else {
      setJoinModalVisible(true);
    }
  };

  const changeFilterHandler = type => {
    setMatchResultType(type);
    setRefresh(prev => !prev);
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const onRefresh = async () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    setLoading(true);
    setPage(1);
    setIsLast(false);
    setMatchList([]);
    setRefreshing(true);
  };

  const onFocus = () => {
    getAcademyDetail();
    getMatchingSatistics();
    setIsFocus(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      getUserInfo();
    }, [refreshUserInfo]),
  );

  useFocusEffect(
    useCallback(() => {
      renderByJoinType();
    }, [joinType]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus) {
        onRefresh();
      }
    }, [isFocus, refresh]),
  );

  useEffect(() => {
    if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
      getMatchingHistory();
    }
  }, [page, isFocus, refreshing]);

  const renderMatchItem = ({ item, index }) => (
    <View style={styles.contentItem}>
      {/* 미소속 회원일 경우 아래 가입신청 버튼이 보여짐 */}
      {hideMatchingItem && !openPublic && index > 1 && (
        <View style={styles.blurWrapper}>
          <BlurView blurType="light" blurAmount={5} style={styles.blurView}>
            <View style={styles.blurContainer}>
              <View>
                {joinType !== JOIN_TYPE.ACADEMY_MEMBER &&
                  joinType !== JOIN_TYPE.ACADEMY_ADMIN && (
                    <Text style={styles.blurText}>
                      소속된 회원만 조회 가능해요.
                    </Text>
                  )}
                {(joinType === JOIN_TYPE.NO_JOIN ||
                  joinType === JOIN_TYPE.NO_LOGIN) && (
                  <Text style={styles.blurText}>아카데미에 가입해보세요.</Text>
                )}
                {joinType === JOIN_TYPE.ACADEMY_WAIT && (
                  <Text style={styles.blurText}>
                    현재 아카데미 가입 대기중입니다.
                  </Text>
                )}
              </View>
              {(joinType === JOIN_TYPE.NO_JOIN ||
                joinType === JOIN_TYPE.NO_LOGIN) && (
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  style={styles.joinBtn}
                  onPress={showJoinModal}>
                  <Text style={styles.joinBtnText}>가입신청</Text>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </View>
      )}
      <View style={styles.textBox}>
        <Text style={styles.date}>
          {moment(`${item.matchDate} ${item.matchTime}`).format(
            'M월 DD일 dddd A hh:mm',
          )}
        </Text>
        <Text style={styles.location}>{item.matchPlace}</Text>
      </View>
      <View style={styles.contentDetail}>
        <View style={styles.team}>
          <View style={styles.teamIcon}>
            {item.homeLogoPath ? (
              <Image
                source={{ uri: item.homeLogoPath }}
                style={{ width: 32, height: 32, borderRadius: 6 }}
              />
            ) : (
              <Image
                source={SPIcons.icDefaultAcademy}
                style={{ width: 32, height: 32 }}
              />
            )}
          </View>
          <Text style={styles.teamName}>{item.homeName}</Text>
        </View>
        <View style={styles.count}>
          <Text
            style={[
              styles.score,
              item.team1Score < item.team2Score && {
                color: 'rgba(46, 49, 53, 0.28)',
              },
            ]}>
            {item.homeScore}
          </Text>
          <Text style={styles.middle}>:</Text>
          <Text
            style={[
              styles.score,
              item.team2Score < item.team1Score && {
                color: 'rgba(46, 49, 53, 0.28)',
              },
            ]}>
            {item.awayScore}
          </Text>
        </View>
        <View style={styles.team}>
          {item.awayLogoPath ? (
            <Image
              source={{ uri: item.awayLogoPath }}
              style={{ width: 32, height: 32, borderRadius: 6 }}
            />
          ) : (
            <Image
              source={SPIcons.icDefaultAcademy}
              style={{ width: 32, height: 32 }}
            />
          )}
          <Text style={styles.teamName}>{item.awayName}</Text>
        </View>
      </View>

      {/* 운영자일때 리뷰쓰기 버튼 보여짐  */}
      {/* 클릭시 경기매칭 상세 아카데미 매칭 리뷰작성 페이지로 이동 */}
      {joinType === JOIN_TYPE.ACADEMY_ADMIN && item.canReview && (
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          style={styles.WriteBtn}
          onPress={() => {
            NavigationService.navigate(navName.matchingRegistReview, {
              matchIdx: item.matchIdx,
            });
          }}>
          <Text style={styles.WriteBtnText}>리뷰쓰기</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="경기이력"
        headerContainerStyle={[
          styles.headerStyle,
          {
            paddingTop: insets.top,
          },
        ]}
        leftIconColor={COLORS.white}
        headerTextStyle={{
          color: COLORS.white,
        }}
      />

      <View style={styles.topContainer}>
        <View style={styles.topBox}>
          <TouchableOpacity
            style={styles.topSub}
            onPress={() => {
              changeFilterHandler(null);
            }}>
            <Text
              style={styles.topNumber}
              onPress={() => {
                changeFilterHandler(null);
              }}>
              {Utils.changeNumberComma(matchSatistics.cntMatch || 0)}
            </Text>
            <Text style={styles.topText}>총 경기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topSub}
            onPress={() => {
              changeFilterHandler(MATCH_RESULT_TYPE.W.code);
            }}>
            <Text style={styles.topNumber}>
              {Utils.changeNumberComma(matchSatistics.cntWin || 0)}
            </Text>
            <Text style={styles.topText}>승</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topSub}
            onPress={() => {
              changeFilterHandler(MATCH_RESULT_TYPE.D.code);
            }}>
            <Text style={styles.topNumber}>
              {Utils.changeNumberComma(matchSatistics.cntDraw || 0)}
            </Text>
            <Text style={styles.topText}>무</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topSub}
            onPress={() => {
              changeFilterHandler(MATCH_RESULT_TYPE.L.code);
            }}>
            <Text style={styles.topNumber}>
              {Utils.changeNumberComma(matchSatistics.cntLose || 0)}
            </Text>
            <Text style={styles.topText}>패</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        {matchList && matchList.length > 0 ? (
          <FlatList
            ref={flatListRef}
            contentContainerStyle={styles.contentList}
            data={matchList}
            ListFooterComponent={
              loading
                ? () => {
                    return (
                      <ActivityIndicator
                        size="small"
                        style={{ marginVertical: 20 }}
                      />
                    );
                  }
                : null
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={() => {
              loadMoreProjects();
            }}
            onEndReachedThreshold={0.5}
            renderItem={renderMatchItem}
          />
        ) : loading ? (
          <SPLoading />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={styles.noneText}>경기 이력이 존재하지 않습니다.</Text>
          </View>
        )}
      </View>
      <SPModal
        title="가입 신청"
        contents="가입 신청하시겠습니까?"
        visible={joinModalVisible}
        onConfirm={() => {
          joinRequest();
        }}
        onCancel={() => {
          setJoinModalVisible(false);
        }}
        onClose={() => {
          setJoinModalVisible(false);
        }}
      />
    </View>
  );
}
export default memo(MatchingHistory);

const styles = {
  container: {
    flex: 1,
  },
  headerStyle: {
    backgroundColor: COLORS.darkBlue,
  },
  topContainer: {
    backgroundColor: '#313779',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 20,
    padding: 8,
  },
  topSub: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItem: 'center',
    gap: 4,
  },
  topNumber: {
    fontSize: 20,
    fontWeight: 700,
    color: '#272C61',
    lineHeight: 28,
    letterSpacing: -0.24,
    textAlign: 'center',
  },
  topText: {
    fontSize: 13,
    fontWeight: 500,
    color: '#272C61',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  contentList: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentItem: {
    flexDirection: 'column',
    gap: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
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
  textBox: {
    flexDirection: 'column',
    gap: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: 600,
    color: '#FF671F',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  location: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  contentDetail: {
    flexDirection: 'row',
    alignItem: 'center',
    gap: 8,
    backgroundColor: '#F1F5FF',
    borderRadius: 12,
    paddingVertical: 16,
  },
  team: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  teamIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    overFlow: 'hidden',
  },
  teamName: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  count: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItem: 'center',
    // gap: 8,
    paddingVertical: 6,
  },
  score: {
    fontSize: 28,
    fontWeight: 700,
    color: '#272C61',
    lineHeight: 38,
    letterSpacing: -0.661,
  },
  middle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1A1C1E',
    lineHeight: 32,
    letterSpacing: -0.552,
    paddingHorizontal: 21.5,
  },
  WriteBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  WriteBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
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
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
};
