import React, { memo, useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useFocusEffect } from '@react-navigation/native';
import fontStyles from '../../styles/fontStyles';
import SPIcons from '../../assets/icon';
import { SPSvgs } from '../../assets/svg';
import { useSelector } from 'react-redux';
import {
  apiGetMyInfo,
  apiGetTournamentMngCheckReview,
  apiGetTournamentOpen,
  apiGetTournamentReviewList,
  apiGetTournamentTitle,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import SPLoading from '../../components/SPLoading';
import ListEmptyView from '../../components/ListEmptyView';
import moment from 'moment';

function TournamentReviewList({ route }) {
  /**
   * state
   */
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const tournamentIdx = route?.params?.tournamentIdx;

  const flatListRef = useRef();
  const [tournamentDetail, setTournamentDetail] = useState({});
  const [isLast, setIsLast] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [totalCnt, setTotalCnt] = useState(0);
  const [reviewList, setReviewList] = useState([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [fstCall, setFstCall] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tournamentCount, setTournamentCount] = useState();
  const [tournamentName, setTournamentName] = useState();

  /**
   * api
   */

  const getTournamentName = async () => {
    try {
      const { data } = await apiGetTournamentTitle(tournamentIdx);
      setTournamentCount(data.data.trnCnt);
      setTournamentName(data.data.title);
    } catch (error) {
      handleError(error);
    }
  };

  const getTournamentDetail = async () => {
    try {
      const { data } = await apiGetTournamentOpen({ tournamentIdx });
      setTournamentDetail(data.data?.tournament);
    } catch (error) {
      handleError(error);
    }
  };

  const checkReviewWrited = async () => {
    try {
      if (!isLogin) {
        setShowWriteReview(false);
        return;
      }

      const { data: myInfo } = await apiGetMyInfo();
      // 아카데미 운영자 여부 확인
      if (myInfo.data.isAcademyAdmin || myInfo.data.academyCreator) {
        const { data } = await apiGetTournamentMngCheckReview(tournamentIdx);
        if (!data.data?.isFinished) {
          setShowWriteReview(false);
        } else if (data.data?.isParticipation) {
          setShowWriteReview(!data.data?.hasReview);
        } else {
          setShowWriteReview(false);
        }
      } else {
        setShowWriteReview(false);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setFstCall(true);
    }
  };

  const getReviewList = async () => {
    try {
      const params = { tournamentIdx, page, size };
      const { data } = await apiGetTournamentReviewList(params);
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
    setRefreshing(false);
    setLoading(false);
  };

  /**
   * function
   */

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast && reviewList?.length > 0) {
        setPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const onRefresh = async () => {
    setLoading(true);
    setIsLast(false);
    setPage(1);
    setReviewList([]);
    setRefreshing(true);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getTournamentName();
      getTournamentDetail();
      checkReviewWrited();
      return () => {};
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!showWriteReview) onRefresh();
    }, [showWriteReview]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!showWriteReview) {
        if (refreshing || (!refreshing && page > 1)) {
          getReviewList();
        }
      }
    }, [refreshing, showWriteReview, page]),
  );

  /**
   * render
   */
  const renderRateStar = rate => {
    if (rate === null || rate === undefined) return;
    let rateNo = Number(rate).toFixed(0);
    rateNo = Number(rateNo);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {[...Array(rateNo)].map((item, index) => (
          <Image
            /* eslint-disable-next-line react/no-array-index-key */
            key={`fill-star-${index}`}
            source={SPIcons.icFillStar}
            style={{ width: 14, height: 14 }}
          />
        ))}
        {[...Array(5 - rateNo)].map((item, index) => (
          <Image
            /* eslint-disable-next-line react/no-array-index-key */
            key={`outline-star-${index}`}
            source={SPIcons.icOutlineStar}
            style={{ width: 14, height: 14 }}
          />
        ))}
      </View>
    );
  };
  return (
    fstCall && (
      <SafeAreaView style={styles.container}>
        <Header title="대회 리뷰" />
        <View style={{ padding: 16 }}>
          <Text style={{ ...fontStyles.fontSize20_Semibold }}>
            {tournamentCount &&
              `제${Utils.changeNumberComma(tournamentCount)}회 `}{' '}
            {tournamentName}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          {!showWriteReview ? (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  marginHorizontal: 16,
                  paddingBottom: 8,
                  borderBottomColor: 'rgba(135, 141, 150, 0.16)',
                }}>
                <Image
                  source={
                    reviewList?.length > 0
                      ? SPIcons.icFillStar
                      : SPIcons.icGrayStar
                  }
                  style={{ width: 24, height: 24 }}
                />
                <Text
                  style={{ ...fontStyles.fontSize18_Semibold, color: '#000' }}>
                  {' '}
                  {reviewList?.length === 0 && '평가 없음'}
                  {reviewList?.length > 0 &&
                    tournamentDetail?.avgRating &&
                    Number(tournamentDetail?.avgRating).toFixed(1)}{' '}
                </Text>
                <SPSvgs.Ellipse />
                <Text
                  style={{
                    ...fontStyles.fontSize16_Regular,
                    color: 'rgba(46, 49, 53, 0.80)',
                  }}>
                  {' '}
                  리뷰 {Utils.changeNumberComma(totalCnt)}개
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  key={loading ? 'loading' : 'loaded'}
                  ref={flatListRef}
                  data={reviewList}
                  contentContainerStyle={[
                    { gap: 12 },
                    reviewList?.length === 0 && { flex: 1 },
                  ]}
                  showsVerticalScrollIndicator={false}
                  onEndReached={loadMoreProjects}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  renderItem={({ item }) => {
                    return (
                      <View
                        style={{
                          gap: 8,
                          padding: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: 'rgba(135, 141, 150, 0.16)',
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 8,
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              height: 40,
                              width: 40,
                              backgroundColor: '#8A9BBE',
                              borderRadius: 8,
                              justifyContent: 'center',
                              alignItems: 'center',
                              overflow: 'hidden',
                            }}>
                            {item.logoPath ? (
                              <Image
                                source={{ uri: item.logoPath }}
                                style={{ height: 40, width: 40 }}
                              />
                            ) : (
                              <Image
                                source={SPIcons.icMyAcademy}
                                style={{ height: 40, width: 40 }}
                              />
                            )}
                          </View>
                          <View>
                            <Text style={{ ...fontStyles.fontSize13_Semibold }}>
                              {item.academyName}
                            </Text>
                            <Text
                              style={{
                                ...fontStyles.fontSize12_Medium,
                              }}>{`제 ${Utils.changeNumberComma(
                              item.trnCnt,
                            )}회 참가`}</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <Text style={{ ...fontStyles.fontSize11_Medium }}>
                                {item.regDate &&
                                  moment(item.regDate).format('YYYY.MM.DD')}
                              </Text>
                              {renderRateStar(item.rating)}
                            </View>
                          </View>
                        </View>
                        <View>
                          <Text style={{ ...fontStyles.fontSize14_Regular }}>
                            {item.review}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    loading ? (
                      <View style={{ flex: 1 }}>
                        <SPLoading />
                      </View>
                    ) : (
                      <ListEmptyView
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        text="등록된 리뷰가 없습니다."
                      />
                    )
                  }
                />
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={SPIcons.icGrayStar}
                  style={{ width: 24, height: 24 }}
                />
                <Text
                  style={{ ...fontStyles.fontSize18_Semibold, color: '#000' }}>
                  {' '}
                  평가 없음{' '}
                </Text>
                <SPSvgs.Ellipse />
                <Text
                  style={{
                    ...fontStyles.fontSize16_Regular,
                    color: 'rgba(46, 49, 53, 0.80)',
                  }}>
                  {' '}
                  리뷰 0개
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{ ...fontStyles.fontSize16_Regular }}>
                  리뷰를 작성해 주시기 바랍니다.
                </Text>
              </View>
              <View style={{ paddingVertical: 24 }}>
                <PrimaryButton
                  text="리뷰 작성"
                  buttonStyle={styles.buttonStyle}
                  onPress={() => {
                    NavigationService.navigate(navName.tournamentReviewEdit, {
                      tournamentIdx,
                    });
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    )
  );
}
export default memo(TournamentReviewList);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
