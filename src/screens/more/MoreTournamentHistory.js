import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGetTournamentApplyHistoryList } from '../../api/RestAPI';
import ListEmptyView from '../../components/ListEmptyView';
import Loading from '../../components/SPLoading';
import Header from '../../components/header';
import { handleError } from '../../utils/HandleError';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../redux/store';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { moreTournamentHistoryListAction } from '../../redux/reducers/list/moreTournamentHistoryListSlice';
import TournamentHistoryItem from '../../components/game-schedule/TournamentHistoryItem';

function MoreTournamentHistory({ route }) {
  const dispatch = useDispatch();
  const listName = 'moreTournamentHistoryList';
  const {
    page,
    list: tournamentList,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = moreTournamentHistoryListAction;

  const [isFocus, setIsFocus] = useState(true);

  const flatListRef = useRef();
  const pageSize = 30;

  const handleEndReached = () => {
    if (!isLast) {
      const prevPage = store.getState()[listName].page;
      dispatch(action.setPage(prevPage + 1));
    }
  };

  const getTournamentHistoryList = async () => {
    const params = {
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetTournamentApplyHistoryList(params);
      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        dispatch(action.setTotalCnt(data.data.totalCnt));
        dispatch(action.setIsLast(data.data.isLast));
        if (page === 1) {
          dispatch(action.setList(data.data.list));
        } else {
          const prevList = store.getState()[listName].list;
          dispatch(action.setList([...prevList, ...data.data.list]));
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      dispatch(action.setRefreshing(false));
      dispatch(action.setLoading(false));
    }
  };

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
  }, []);

  useEffect(() => {
    if (!noParamReset) {
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.moreTournamentHistory, {
        ...(route?.params || {}),
        noParamReset: true,
      });
      return;
    }
    dispatch(action.refresh());
    setIsFocus(false);
  }, [noParamReset]);

  useFocusEffect(
    useCallback(() => {
      if (noParamReset) {
        if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
          getTournamentHistoryList();
        }
      }
    }, [page, refreshing, isFocus, noParamReset]),
  );

  const renderMatchesItem = useCallback(
    ({ item }) => {
      return <TournamentHistoryItem item={item} />;
    },
    [tournamentList],
  );

  const renderEmptyList = useCallback(() => {
    return <ListEmptyView text="대회내역이 존재하지 않습니다." />;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="대회내역" />

      {tournamentList && tournamentList.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={tournamentList}
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
      ) : loading ? (
        <Loading />
      ) : (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {renderEmptyList()}
        </View>
      )}
    </SafeAreaView>
  );
}

export default memo(MoreTournamentHistory);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    rowGap: 8,
  },
});
