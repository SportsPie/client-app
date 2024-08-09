import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { apiGetFeeds } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import ListEmptyView from '../ListEmptyView';
import FeedItemCommunity from './FeedItemCommunity';
import Loading from '../SPLoading';
import { useDispatch, useSelector } from 'react-redux';
import { moreCommunityListAction } from '../../redux/reducers/list/moreCommunityListSlice';
import { store } from '../../redux/store';

function CommunityTab() {
  const dispatch = useDispatch();
  const listName = 'moreCommunityList';
  const {
    page,
    list: feeds,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const action = moreCommunityListAction;

  const [deleteEvent, setDeleteEvent] = useState(false);
  const pageSize = 30;
  const flatListRef = useRef();
  const getFeeds = async () => {
    const params = {
      size: pageSize,
      page,
    };

    try {
      const { data } = await apiGetFeeds(params);
      if (data && Array.isArray(data.data.list)) {
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

  const handleEndReached = () => {
    if (!isLast) {
      const prevPage = store.getState()[listName].page;
      dispatch(action.setPage(prevPage + 1));
    }
  };

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
  }, []);

  useEffect(() => {
    onRefresh();
  }, [deleteEvent]);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getFeeds();
    }
  }, [page, refreshing]);

  const renderCommunityItem = ({ item }) => {
    return (
      <FeedItemCommunity
        item={item}
        onDelete={() => {
          setDeleteEvent(prev => !prev);
        }}
      />
    );
  };

  const renderListEmpty = useCallback(() => {
    return <ListEmptyView text="커뮤니티에 글이 존재하지 않습니다." />;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {feeds?.length > 0 ? (
        <FlatList
          ref={flatListRef}
          style={styles.container}
          data={feeds}
          renderItem={renderCommunityItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderListEmpty}
          keyExtractor={item => item?.feedIdx}
        />
      ) : loading ? (
        <Loading />
      ) : (
        renderListEmpty()
      )}
    </View>
  );
}

export default memo(CommunityTab);

const styles = StyleSheet.create({});
