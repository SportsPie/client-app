import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { apiGetMngTournament } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import SPLoading from '../../components/SPLoading';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { useDispatch, useSelector } from 'react-redux';
import { academyMatchingRegistrationListAction } from '../../redux/reducers/list/academyMatchingRegistrationListSlice';
import { store } from '../../redux/store';
import { PARTICIPATION_STATE } from '../../common/constants/ParticipationState';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import { COLORS } from '../../styles/colors';
import { TOURNAMENT_STATE_TYPE } from '../../common/constants/TournamentStateType';
import SPModal from '../../components/SPModal';

function AcademyMatchingRegistration({ route }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const listName = 'academyMatchingRegistrationList';
  const {
    page,
    list: competitionRegistrationList,
    refreshing,
    loading,
    isLast,
    totalCnt,
    type,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const participationState = route?.params?.participationState;
  const action = academyMatchingRegistrationListAction;

  const academyIdx = route?.params?.academyIdx;
  const flatListRef = useRef();

  // list
  const [size, setSize] = useState(20);

  // modal
  const [refundCheckModalShow, setRefundCheckModalShow] = useState(false);
  const [cancelCheckModalShow, setCancelCheckModalShow] = useState(false);
  const [selectedPrtIdx, setSelectedPrtIdx] = useState();
  const [selectedTournamentName, setSelectedTournamentName] = useState('');

  const openRefundCheckModal = (idx, name) => {
    setSelectedPrtIdx(idx);
    setSelectedTournamentName(name);
    setRefundCheckModalShow(true);
  };
  const closeRefundCheckModal = () => {
    setRefundCheckModalShow(false);
  };

  const openCancelCheckModal = (idx, name) => {
    setSelectedPrtIdx(idx);
    setSelectedTournamentName(name);
    setCancelCheckModalShow(true);
  };
  const closeCancelCheckModal = () => {
    setCancelCheckModalShow(false);
  };

  /**
   * api
   */
  const getCompetionRegistrationList = async () => {
    try {
      const params = {
        page,
        size,
        prtState: type,
      };
      const { data } = await apiGetMngTournament(params);
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    }
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  /**
   * function
   */
  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }
    }, 0);
  };

  const onRefresh = async () => {
    // if (flatListRef.current) {
    //   flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    // }
    dispatch(action.refresh());
  };

  /**
   * useEffect
   */

  useEffect(() => {
    if (!noParamReset) {
      dispatch(action.reset());
      dispatch(action.setType(participationState ?? null));
      NavigationService.replace(navName.academyMatchingRegistration, {
        ...(route?.params || {}),
        noParamReset: true,
      });
    }
  }, [noParamReset]);

  useEffect(() => {
    if (noParamReset) onRefresh();
  }, [type, noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if (refreshing || (!refreshing && page > 1)) {
        getCompetionRegistrationList();
      }
    }
  }, [page, refreshing, noParamReset]);

  /**
   * render
   */
  const getStatusRender = (status, waitNo) => {
    switch (status) {
      case PARTICIPATION_STATE.WAITING.value: {
        return (
          <View style={styles.waitBox}>
            <Text style={styles.waitText}>대기 {waitNo}번</Text>
          </View>
        );
      }
      case PARTICIPATION_STATE.PAY_PENDING.value: {
        return (
          <View style={styles.payPendingBox}>
            <Text style={styles.payPendingText}>
              {PARTICIPATION_STATE[status].desc}
            </Text>
          </View>
        );
      }
      case PARTICIPATION_STATE.CONFIRMED.value: {
        return (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              {PARTICIPATION_STATE[status].desc}
            </Text>
          </View>
        );
      }
      case PARTICIPATION_STATE.CANCEL.value: {
        return (
          <View style={styles.cancelBox}>
            <Text style={styles.cancelText}>
              {PARTICIPATION_STATE[status].desc}
            </Text>
          </View>
        );
      }
      case PARTICIPATION_STATE.REFUND_REQUEST.value: {
        return (
          <View style={styles.cancelBox}>
            <Text style={styles.cancelText}>
              {PARTICIPATION_STATE[status].desc}
            </Text>
          </View>
        );
      }
      case PARTICIPATION_STATE.REFUND_COMPLETE.value: {
        return (
          <View style={styles.cancelBox}>
            <Text style={styles.cancelText}>
              {PARTICIPATION_STATE[status].desc}
            </Text>
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="대회 접수 내역" />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 8,
            borderBottomWidth: 1,
            borderColor: 'rgba(135, 141, 150, 0.16)',
          }}>
          <TouchableOpacity
            style={
              type === null ? styles.activeFilterBox : styles.disabledFilterBox
            }
            activeOpacity={1}
            onPress={() => {
              dispatch(action.setType(null));
            }}>
            <Text
              style={
                type === null
                  ? styles.activeFilterText
                  : styles.disabledFilterText
              }>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              type === PARTICIPATION_STATE.CONFIRMED.value
                ? styles.activeFilterBox
                : styles.disabledFilterBox
            }
            activeOpacity={1}
            onPress={() => {
              dispatch(action.setType(PARTICIPATION_STATE.CONFIRMED.value));
            }}>
            <Text
              style={
                type === PARTICIPATION_STATE.CONFIRMED.value
                  ? styles.activeFilterText
                  : styles.disabledFilterText
              }>
              확정
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              type === PARTICIPATION_STATE.WAITING.value
                ? styles.activeFilterBox
                : styles.disabledFilterBox
            }
            activeOpacity={1}
            onPress={() => {
              dispatch(action.setType(PARTICIPATION_STATE.WAITING.value));
            }}>
            <Text
              style={
                type === PARTICIPATION_STATE.WAITING.value
                  ? styles.activeFilterText
                  : styles.disabledFilterText
              }>
              대기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              type === PARTICIPATION_STATE.CANCEL.value
                ? styles.activeFilterBox
                : styles.disabledFilterBox
            }
            activeOpacity={1}
            onPress={() => {
              dispatch(action.setType(PARTICIPATION_STATE.CANCEL.value));
            }}>
            <Text
              style={
                type === PARTICIPATION_STATE.CANCEL.value
                  ? styles.activeFilterText
                  : styles.disabledFilterText
              }>
              취소
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          {competitionRegistrationList &&
          competitionRegistrationList.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={competitionRegistrationList}
              contentContainerStyle={{ gap: 24 }}
              ListFooterComponent={
                loading
                  ? // eslint-disable-next-line react/no-unstable-nested-components
                    () => {
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
                <RefreshControl refreshing={false} onRefresh={onRefresh} />
              }
              onEndReached={() => {
                loadMoreProjects();
              }}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      NavigationService.navigate(navName.tournamentDetail, {
                        tournamentIdx: item.tournamentIdx,
                      });
                    }}
                    style={styles.contentBox}>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          alignItems: 'center',
                        }}>
                        {getStatusRender(item.prtState, item.waitNo)}
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              flex: 1,
                              ...fontStyles.fontSize14_Semibold,
                            }}>
                            {item.targetName}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          marginTop: 8,
                          minHeight: 52,
                        }}>
                        <Text
                          numberOfLines={2}
                          style={{
                            ...fontStyles.fontSize18_Semibold,
                          }}>
                          {item.trnCount &&
                            `제${Utils.changeNumberComma(item.trnCount)}회 `}
                          {item.trnName}
                        </Text>
                      </View>
                      <View style={{ marginTop: 4 }}>
                        <Text
                          style={{
                            ...fontStyles.fontSize14_Medium,
                            color: 'rgba(46, 49, 53, 0.80)',
                          }}>
                          {moment(item.trnStartDate).format('M월 DD일 dddd')} -{' '}
                          {moment(item.trnEndDate).format('M월 DD일 dddd')}
                        </Text>
                      </View>
                      <View style={{ marginTop: 8, flex: 1 }}>
                        <Text
                          style={{
                            flex: 1,
                            ...fontStyles.fontSize12_Medium,
                            color: 'rgba(46, 49, 53, 0.80)',
                          }}>
                          {item.trnPlace}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                      {item?.prtState === PARTICIPATION_STATE.WAITING.value && (
                        <TouchableOpacity
                          activeOpacity={1}
                          style={styles.buttonWarp}
                          onPress={e => {
                            e.stopPropagation();
                            openCancelCheckModal(
                              item.prtIdx,
                              `${
                                item.trnCount &&
                                `제${Utils.changeNumberComma(item.trnCount)}회 `
                              }${item.trnName}`,
                            );
                          }}>
                          <Text style={styles.buttonText}>접수 취소</Text>
                        </TouchableOpacity>
                      )}
                      {item?.prtState ===
                        PARTICIPATION_STATE.PAY_PENDING.value && (
                        <TouchableOpacity
                          activeOpacity={1}
                          style={styles.buttonWarp}
                          onPress={e => {
                            e.stopPropagation();
                            openRefundCheckModal(
                              item.prtIdx,
                              `${
                                item.trnCount &&
                                `제${Utils.changeNumberComma(item.trnCount)}회 `
                              }${item.trnName}`,
                            );
                          }}>
                          <Text style={styles.buttonText}>환불 신청</Text>
                        </TouchableOpacity>
                      )}
                      {item?.prtState === PARTICIPATION_STATE.CONFIRMED.value &&
                        item?.twoDaysBeforeStart && (
                          <TouchableOpacity
                            activeOpacity={1}
                            style={styles.buttonWarp}
                            onPress={e => {
                              e.stopPropagation();
                              openRefundCheckModal(
                                item.prtIdx,
                                `${
                                  item.trnCount &&
                                  `제${Utils.changeNumberComma(
                                    item.trnCount,
                                  )}회 `
                                }${item.trnName}`,
                              );
                            }}>
                            <Text style={styles.buttonText}>환불 신청</Text>
                          </TouchableOpacity>
                        )}
                      {item?.prtState === PARTICIPATION_STATE.CONFIRMED.value &&
                        item.trnState === TOURNAMENT_STATE_TYPE.FINISHED.code &&
                        !item.reviewWrited && (
                          <TouchableOpacity
                            activeOpacity={1}
                            style={styles.buttonWarp}
                            onPress={e => {
                              e.stopPropagation();
                              NavigationService.navigate(
                                navName.tournamentReviewEdit,
                                {
                                  tournamentIdx: item.tournamentIdx,
                                },
                              );
                            }}>
                            <Text style={styles.buttonText}>리뷰 작성</Text>
                          </TouchableOpacity>
                        )}
                      <TouchableOpacity
                        activeOpacity={1}
                        style={styles.buttonWarp}
                        onPress={e => {
                          e.stopPropagation();
                          NavigationService.navigate(
                            navName.tournamentInquiryList,
                            { tournamentIdx: item.tournamentIdx },
                          );
                        }}>
                        <Text style={styles.buttonText}>1:1 문의</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={1}
                        style={styles.buttonWarp}
                        onPress={e => {
                          e.stopPropagation();
                          NavigationService.navigate(
                            navName.tournamentApplyDetail,
                            { prtIdx: item.prtIdx },
                          );
                        }}>
                        <Text style={styles.buttonText}>접수 상세</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
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
              <Text>내역이 없습니다.</Text>
            </View>
          )}
        </View>
      </View>
      <SPModal
        visible={cancelCheckModalShow}
        title={`${selectedTournamentName} 접수 신청`}
        titleStyle={{
          paddingHorizontal: 24,
          textAlign: 'center',
        }}
        contents={
          '접수 취소 후 다시 접수하면\n대기번호를 새로 받아야 할 수 있습니다.'
        }
        confirmButtonText="계속하기"
        onConfirm={() => {
          NavigationService.navigate(navName.tournamentCancelApplyInfo, {
            prtIdx: selectedPrtIdx,
          });
        }}
        onCancel={closeCancelCheckModal}
        onClose={closeCancelCheckModal}
      />
      <SPModal
        visible={refundCheckModalShow}
        title={`${selectedTournamentName} 환불 신청`}
        titleStyle={{
          paddingHorizontal: 24,
          textAlign: 'center',
        }}
        contents={`환불이 완료되면\n접수가 최종적으로 취소됩니다.`}
        confirmButtonText="계속하기"
        onConfirm={() => {
          NavigationService.navigate(navName.tournamentRefundRequestForm, {
            prtIdx: selectedPrtIdx,
          });
        }}
        onCancel={closeRefundCheckModal}
        onClose={closeRefundCheckModal}
      />
    </SafeAreaView>
  );
}

export default memo(AcademyMatchingRegistration);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentBox: {
    flexDirection: 'column',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 16,
    gap: 16,
  },
  contentSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBox: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 3,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unresolvedStatusBox: {
    backgroundColor: 'rgba(255, 124, 16, 0.15)',
  },
  resolvedStatusBox: {
    backgroundColor: 'rgba(0, 38, 114, 0.10)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  unresolvedStatusText: {
    color: '#FF7C10',
  },
  resolvedStatusText: {
    color: '#002672',
  },
  dateText: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  verticalLine: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(135, 141, 150, 0.22)',
  },
  activeFilterBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF7C10',
  },
  activeFilterText: {
    ...fontStyles.fontSize14_Medium,
    color: '#FF7C10',
  },
  disabledFilterBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
  },
  disabledFilterText: {
    ...fontStyles.fontSize14_Medium,
    color: 'rgba(46, 49, 53, 0.80)',
  },
  waitBox: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E6E9F1',
  },
  waitText: { ...fontStyles.fontSize14_Semibold, color: '#002672' },
  payPendingBox: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 124, 16, 0.15)',
  },
  payPendingText: {
    ...fontStyles.fontSize14_Semibold,
    color: '#FF7C10',
  },
  confirmBox: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FF7C10',
  },
  confirmText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.white,
  },
  cancelBox: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 66, 66, 0.15)',
  },
  cancelText: {
    ...fontStyles.fontSize14_Semibold,
    color: '#FF4242',
  },
  buttonWarp: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...fontStyles.fontSize15_Medium,
    color: '#002672',
  },
});
