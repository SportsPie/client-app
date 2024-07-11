import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGetMatches } from '../../api/RestAPI';
import ListEmptyView from '../../components/ListEmptyView';
import Loading from '../../components/SPLoading';
import GameScheduleItem from '../../components/game-schedule/GameScheduleItem';
import Header from '../../components/header';
import { handleError } from '../../utils/HandleError';

function MoreGameSchedule() {
  const [matches, setMatches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLast, setIsLast] = useState(false);
  const flatListRef = useRef();
  const pageSize = 30;

  const handleEndReached = () => {
    if (!isLast) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const getMatchInfo = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
    };
    try {
      const { data } = await apiGetMatches(params);

      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast);
        setMatches(prevMatches =>
          currentPage === 1 ? newList : [...prevMatches, ...newList],
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false); // 데이터 가져오기 완료 후 로딩 상태 false로 설정
    }
  };

  const onRefresh = useCallback(async () => {
    setIsLast(false);
    setRefreshing(true);
    setCurrentPage(1);
    setMatches([]);
    await getMatchInfo();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      getMatchInfo();
    }, []),
  );

  useEffect(() => {
    getMatchInfo();
  }, [currentPage]);

  const renderMatchesItem = useCallback(
    ({ item }) => {
      return <GameScheduleItem item={item} />;
    },
    [matches],
  );

  const renderEmptyList = useCallback(() => {
    return <ListEmptyView text="경기내역이 존재하지 않습니다." />;
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="경기내역" />

      <FlatList
        ref={flatListRef}
        data={matches}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        numColumns={1}
        renderItem={renderMatchesItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

export default memo(MoreGameSchedule);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    rowGap: 8,
  },
});
