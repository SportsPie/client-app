import React, { memo, useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Header from '../../components/header';
import { apiGetTournamentNotice } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import Loading from '../../components/SPLoading';
import { SafeAreaView } from 'react-native-safe-area-context';
import TournamentNoticeItem from '../../components/notice/TournamentNoticeItem';

function TournamentNoticeList({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  const tournamentName = route?.params?.tournamentName;
  const [page, setPage] = useState(1);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noticeList, setNoticeList] = useState([]);

  const pageSize = 30;

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
    return (
      <TournamentNoticeItem
        event
        eventName={tournamentName}
        item={item}
        tournamentName={tournamentName}
      />
    );
  }, []);

  useEffect(() => {
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
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelAlternative,
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
