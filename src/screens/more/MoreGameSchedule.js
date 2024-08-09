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
import { useDispatch, useSelector } from 'react-redux';
import { moreGameScheduleListAction } from '../../redux/reducers/list/moreGameScheduleListSlice';
import { store } from '../../redux/store';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

function MoreGameSchedule({ route }) {
  const dispatch = useDispatch();
  const listName = 'moreGameScheduleList';
  const {
    page,
    list: matches,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = moreGameScheduleListAction;

  const [isFocus, setIsFocus] = useState(true);

  const flatListRef = useRef();
  const pageSize = 30;

  const handleEndReached = () => {
    if (!isLast) {
      const prevPage = store.getState()[listName].page;
      dispatch(action.setPage(prevPage + 1));
    }
  };

  const getMatchInfo = async () => {
    const params = {
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetMatches(params);
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
      NavigationService.replace(navName.moreGameSchedule, {
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
          getMatchInfo();
        }
      }
    }, [page, refreshing, isFocus, noParamReset]),
  );

  const renderMatchesItem = useCallback(
    ({ item }) => {
      return <GameScheduleItem item={item} />;
    },
    [matches],
  );

  const renderEmptyList = useCallback(() => {
    return <ListEmptyView text="경기내역이 존재하지 않습니다." />;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="경기내역" />

      {matches && matches.length > 0 ? (
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
      ) : loading ? (
        <Loading />
      ) : (
        renderEmptyList()
      )}
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
