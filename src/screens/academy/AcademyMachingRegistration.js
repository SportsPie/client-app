import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { apiGetMngTournament } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import SPLoading from '../../components/SPLoading';
import { PROGRESS_STATUS } from '../../common/constants/progressStatus';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function AcademyMachingRegistration({ route }) {
  /**
   * state
   */
  const academyIdx = route?.params?.academyIdx;
  const flatListRef = useRef();

  // list
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [loading, setLoading] = useState(true);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [competitionRegistrationList, setCompetitionRegistrationList] =
    useState([]);

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
      setTotalCnt(data.data.totalCnt);
      setIsLast(data.data.isLast);
      if (page === 1) {
        setCompetitionRegistrationList(data.data.list);
      } else {
        setCompetitionRegistrationList(prev => [...prev, ...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  /**
   * function
   */
  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
        setRefreshing(true);
      }
    }, 0);
  };

  const onRefresh = async () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    setPage(1);
    setIsLast(false);
    setCompetitionRegistrationList([]);
    setLoading(true);
    setRefreshing(true);
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

  useFocusEffect(
    useCallback(() => {
      // return () => {
      //   setPage(1);
      //   setLoading(true);
      //   setIsLast(false);
      //   setRefreshing(true);
      //   setCompetitionRegistrationList([]);
      // };
    }, []),
  );

  useEffect(() => {
    if (refreshing) {
      setRefreshing(false);
      getCompetionRegistrationList();
    }
  }, [page, refreshing]);

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
                        NavigationService.navigate(navName.tournamentDetail, {
                          tournamentIdx: item.tournamentIdx,
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

export default memo(AcademyMachingRegistration);

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
