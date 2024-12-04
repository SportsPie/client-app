import React, { memo, useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Header from '../../components/header';
import {
  apiGetTournamentNotice,
  apiGetTournamentTitle,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import Loading from '../../components/SPLoading';
import { SafeAreaView } from 'react-native-safe-area-context';
import TournamentNoticeItem from '../../components/notice/TournamentNoticeItem';
import Utils from '../../utils/Utils';

function TournamentNoticeList({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  const [page, setPage] = useState(1);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noticeList, setNoticeList] = useState([]);

  const [tournamentCount, setTournamentCount] = useState();
  const [tournamentName, setTournamentName] = useState();

  const pageSize = 30;

  const getTournamentName = async () => {
    try {
      const { data } = await apiGetTournamentTitle(tournamentIdx);
      setTournamentCount(data.data.trnCnt);
      setTournamentName(data.data.title);
    } catch (error) {
      handleError(error);
    }
  };

  const getTournamentNoticeList = async () => {
    const params = {
      tournamentIdx,
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetTournamentNotice(params);
      if (Array.isArray(data.data.list)) {
        setTotalCnt(data.data.totalCnt);
        setIsLast(data.data.isLast);
        if (page === 1) {
          setNoticeList(data.data.list);
        } else {
          setNoticeList(prev => [...prev, ...data.data.list]);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleEndReached = () => {
    if (!isLast) {
      setTimeout(() => {
        setPage(prev => prev + 1);
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setNoticeList([]);
    setPage(1);
    setIsLast(false);
    setRefreshing(true);
  }, []);

  const renderNoticesItem = useCallback(({ item }) => {
    return <TournamentNoticeItem item={item} tournamentName={tournamentName} />;
  }, []);

  useEffect(() => {
    getTournamentName();
    onRefresh();
  }, []);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getTournamentNoticeList();
    }
  }, [page, refreshing]);

  const renderEmptyList = useCallback(() => {
    return (
      <View style={styles.emptyViewWrapper}>
        <Text
          style={[
            fontStyles.fontSize16_Medium,
            {
              color: 'rgba(46, 49, 53, 0.6)',
              textAlign: 'center',
            },
          ]}>
          공지사항이 존재하지 않습니다.
        </Text>
      </View>
    );
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="대회 공지사항" />
      <View style={{ padding: 16 }}>
        <Text style={{ ...fontStyles.fontSize20_Semibold }}>
          {tournamentCount &&
            `제${Utils.changeNumberComma(tournamentCount)}회 `}{' '}
          {tournamentName}
        </Text>
      </View>
      <FlatList
        data={noticeList}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        contentContainerStyle={
          (!noticeList || noticeList.length === 0) && { flex: 1 }
        }
        windowSize={10}
        renderItem={renderNoticesItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          refreshing ? (
            <View style={{ flex: 1 }}>
              <Loading />
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {renderEmptyList()}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
export default memo(TournamentNoticeList);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
