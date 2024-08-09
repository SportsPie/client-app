import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { PROGRESS_STATUS } from '../../common/constants/progressStatus';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { useDispatch, useSelector } from 'react-redux';
import { academyMatchingRegistrationListAction } from '../../redux/reducers/list/academyMatchingRegistrationListSlice';
import { store } from '../../redux/store';

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
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = academyMatchingRegistrationListAction;

  const academyIdx = route?.params?.academyIdx;
  const flatListRef = useRef();

  // list
  const [size, setSize] = useState(30);

  /**
   * api
   */
  const getCompetionRegistrationList = async () => {
    try {
      const params = {
        page,
        size,
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

  const getStatusStyles = status => {
    switch (status) {
      case PROGRESS_STATUS.WAIT.value:
        return {
          backgroundColor: 'rgba(255, 103, 31, 0.08)',
          color: '#FF671F',
        };
      case PROGRESS_STATUS.COMPLETE.value:
        return {
          backgroundColor: 'rgba(49, 55, 121, 0.08)',
          color: '#313779',
        };
      case PROGRESS_STATUS.REJECTED.value:
        return {
          backgroundColor: 'rgba(255, 66, 66, 0.08)',
          color: '#FF4242',
        };
      default:
        return {
          backgroundColor: 'rgba(135, 141, 150, 0.08)',
          color: '#878D96',
        };
    }
  };

  /**
   * useEffect
   */

  useEffect(() => {
    if (!noParamReset) {
      dispatch(action.refresh());
      NavigationService.replace(navName.academyMatchingRegistration, {
        ...(route?.params || {}),
        noParamReset: true,
      });
    }
  }, [noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if (refreshing || (!refreshing && page > 1)) {
        getCompetionRegistrationList();
      }
    }
  }, [page, refreshing, noParamReset]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="대회 접수 내역" />
      <View style={{ flex: 1 }}>
        <View style={styles.contentContainer}>
          {competitionRegistrationList &&
          competitionRegistrationList.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={competitionRegistrationList}
              contentContainerStyle={{ gap: 24 }}
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
                <RefreshControl refreshing={false} onRefresh={onRefresh} />
              }
              onEndReached={() => {
                loadMoreProjects();
              }}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) => {
                return (
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        NavigationService.push(navName.tournamentDetail, {
                          tournamentIdx: item.tournamentIdx,
                          fromHistory: true,
                        });
                      }}>
                      <View style={styles.contentBox}>
                        <View style={styles.contentSub}>
                          <View
                            style={[
                              styles.statusBox,
                              {
                                backgroundColor: getStatusStyles(item.aprvState)
                                  .backgroundColor,
                              },
                            ]}>
                            <Text
                              style={[
                                styles.statusText,
                                { color: getStatusStyles(item.status).color },
                              ]}>
                              {PROGRESS_STATUS[item.aprvState]?.desc3}
                            </Text>
                          </View>
                          <Text style={styles.dateText}>
                            {moment(item.regDate).format('YYYY.MM.DD')}
                          </Text>
                        </View>
                        <Text style={styles.titleText}>
                          {item.tournamentName}
                        </Text>
                        <View style={styles.detailBox}>
                          <Text style={styles.detailText}>
                            {moment(item.startDate).format('MMM DD일 dddd')} -{' '}
                            {moment(item.endDate).format('MMM DD일 dddd')}
                          </Text>
                          <View style={styles.verticalLine} />
                          <Text style={styles.detailText}>{item.address}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
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
              <Text>대회 접수 내역이 없습니다.</Text>
            </View>
          )}
        </View>
      </View>
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
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 16,
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
    backgroundColor: 'rgba(255, 103, 31, 0.08)',
  },
  resolvedStatusBox: {
    backgroundColor: 'rgba(49, 55, 121, 0.08)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  unresolvedStatusText: {
    color: '#FF671F',
  },
  resolvedStatusText: {
    color: '#313779',
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
});
