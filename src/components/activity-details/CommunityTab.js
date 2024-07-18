import moment from 'moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { apiGetFeeds } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import ListEmptyView from '../ListEmptyView';
import FeedItemCommunity from './FeedItemCommunity';
import Loading from '../SPLoading';
import { useFocusEffect } from '@react-navigation/native';

function CommunityTab() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState(false);
  const pageSize = 5;
  const flatListRef = useRef();

  const getFeeds = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
    };

    try {
      const { data } = await apiGetFeeds(params);

      if (data && Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast);
        setFeeds(prevFeeds =>
          currentPage === 1 ? newList : [...prevFeeds, ...newList],
        );
      }
    } catch (error) {
      setIsLast(true);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndReached = () => {
    if (!isLast) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setFeeds([]);
    await getFeeds();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setCurrentPage(1);
      getFeeds();
    }, []),
  );

  useEffect(() => {
    getFeeds();
  }, [currentPage, deleteEvent]);

  const renderCommunityItem = ({ item }) => {
    return (
      <FeedItemCommunity
        item={item}
        onDelete={() => setDeleteEvent(prev => !prev)}
      />
    );
  };

  const renderListEmpty = useCallback(() => {
    return <ListEmptyView text="커뮤니티에 글이 존재하지 않습니다." />;
  }, []);

  return (
    <View>
      {loading ? (
        <Loading />
      ) : (
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
          keyExtractor={item => item?.id}
        />
      )}
    </View>
  );
}

export default memo(CommunityTab);

const styles = StyleSheet.create({});
