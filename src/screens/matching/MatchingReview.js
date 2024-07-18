/* eslint-disable react/no-unstable-nested-components */
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import Utils from '../../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import SPIcons from '../../assets/icon';
import { handleError } from '../../utils/HandleError';
import {
  apiGetAcademyOpenMatchReviews,
  apiLogin,
  apiPostAcademyJoin,
} from '../../api/RestAPI';
import { useFocusEffect } from '@react-navigation/native';
import { JOIN_TYPE } from '../../common/constants/joinType';
import { useSelector } from 'react-redux';
import SPModal from '../../components/SPModal';
import SPLoading from '../../components/SPLoading';
import moment from 'moment';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACTIVE_OPACITY } from '../../common/constants/constants';

function MatchingReview({ route }) {
  /**
   * state
   */
  const academyIdx = route?.params?.academyIdx;
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const flatListRef = useRef();

  const [isFocus, setIsFocus] = useState(true);

  const [refresh, setRefresh] = useState(false);
  const [refreshUserInfo, setRefreshUserInfo] = useState(false);
  const [joinType, setJoinType] = useState();

  const [hideReviewItem, setHideReviewItem] = useState(false);

  // list
  const [size, setSize] = useState(30);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewList, setReviewList] = useState([]);

  // modal
  const [joinModalVisible, setJoinModalVisible] = useState(false);

  const trlRef = useRef({ current: { disabled: false } });

  /**
   * api
   */
  const getUserInfo = async () => {
    try {
      const type = await Utils.getUserJoinType(academyIdx);
      setJoinType(type);
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  const getReviewHistory = async () => {
    try {
      const params = {
        academyIdx,
        page,
        size,
      };
      const { data } = await apiGetAcademyOpenMatchReviews(params);
      setTotalCnt(data.data.totalCnt);
      setIsLast(data.data.isLast);
      if (page === 1) {
        setReviewList(data.data.list);
      } else {
        setReviewList(prev => [...prev, ...data.data.list]);
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
    if (
      joinType === JOIN_TYPE.ACADEMY_ADMIN ||
      joinType === JOIN_TYPE.ACADEMY_MEMBER
    ) {
      setHideReviewItem(false);
    } else {
      setHideReviewItem(true);
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
    setReviewList([]);
    setRefreshing(true);
  };

  /**
   * useEffect
   */

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
      getReviewHistory();
    }
  }, [page, isFocus, refreshing]);

  const renderReviewItem = ({ item, index }) => {
    return (
      <View style={styles.contentItem}>
        {hideReviewItem && index > 1 && (
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
                    <Text style={styles.blurText}>
                      아카데미에 가입해보세요.
                    </Text>
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
        <View style={styles.communityTitle}>
          <View style={styles.communityLeft}>
            <View style={styles.iconContainer}>
              {item.profilePath ? (
                <Image source={{ uri: item.profilePath }} style={styles.icon} />
              ) : (
                <Image source={SPIcons.icPerson} style={styles.icon} />
              )}
              {/* {item.isAcademyCreator && ( */}
              {/*  <Image */}
              {/*    source={SPIcons.icSuperAdmin} */}
              {/*    style={styles.overlayIcon} */}
              {/*  /> */}
              {/* )} */}
              {/* {!item.isAcademyCreator && item.isAcademyAdmin && ( */}
              {/*  <Image source={SPIcons.icAdmin} style={styles.overlayIcon} /> */}
              {/* )} */}
            </View>
            <View>
              <Text style={styles.name}>{item.memberNickName}</Text>
              <Text style={styles.dateCreated}>
                {moment(item.regDate).format('YYYY.MM.DD A hh:mm')}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailText}>{item.review}</Text>
        </View>
        {/* 클릭시 매칭 상세 페이지로 이동 (경기완료만 볼 수 있음) */}
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          style={styles.matching}
          onPress={() => {
            NavigationService.navigate(navName.matchingDetail, {
              matchIdx: item.matchIdx,
            });
          }}>
          <Text style={styles.matchingTitle}>{item.matchTitle}</Text>
          <View style={styles.matchingSubBox}>
            <Text style={styles.matchingText}>
              {moment(`${item.matchDate} ${item.matchTime}`).format(
                'YYYY.MM.DD dddd A hh:mm',
              )}
            </Text>
            <View style={styles.verticalLine} />
            <Text style={styles.matchingText}>{item.matchPlace}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="경기 리뷰" />

      <View style={styles.contentContainer}>
        <View style={styles.countBox}>
          <Text style={styles.countTitle}>리뷰</Text>
          <Text style={styles.countText}>
            {Utils.changeNumberComma(totalCnt)}
          </Text>
        </View>
        {reviewList && reviewList.length > 0 ? (
          <FlatList
            ref={flatListRef}
            contentContainerStyle={styles.contentList}
            data={reviewList}
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
            renderItem={renderReviewItem}
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
            <Text style={styles.noneText}>리뷰 내역이 존재하지 않습니다.</Text>
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
    </SafeAreaView>
  );
}

export default memo(MatchingReview);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    // gap: 16,
    paddingVertical: 24,
  },
  countBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
  },
  countTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  countText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FF671F',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  contentList: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contentItem: {
    flexDirection: 'column',
    gap: 8,
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
  communityTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  communityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
    marginBottom: 2,
  },
  dateCreated: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overlayIcon: {
    position: 'absolute',
    width: 16,
    height: 16,
    bottom: 0,
    right: 0,
  },
  detail: {
    paddingLeft: 48,
  },
  detailText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  matching: {
    flexDirection: 'column',
    gap: 6,
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  matchingTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#FF671F',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  matchingSubBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalLine: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(135, 141, 150, 0.22)',
  },
  matchingText: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 14,
    letterSpacing: 0.342,
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
