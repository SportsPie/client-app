import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiGetFeeds, apiGetHolderFeeds } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import ListEmptyView from '../ListEmptyView';
import FeedItemCommunity from './FeedItemCommunity';
import Loading from '../SPLoading';
import { useDispatch, useSelector } from 'react-redux';
import { moreCommunityListAction } from '../../redux/reducers/list/moreCommunityListSlice';
import { store } from '../../redux/store';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { moreCommunityFavPlayerListAction } from '../../redux/reducers/list/moreCommunityFavPlayerListSlice';

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

  const vipListName = 'moreCommunityFavPlayerList';
  const {
    page: vipPage,
    list: vipFeeds,
    refreshing: vipRefreshing,
    loading: vipLoading,
    isLast: vipIsLast,
  } = useSelector(selector => selector[vipListName]);
  const vipAction = moreCommunityFavPlayerListAction;

  const [selectedCategory, setSelectedCategory] = useState('normal');
  const pageSize = 30;
  const flatListRef = useRef();
  const vipFlatListRef = useRef();
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

  const getVipFeeds = async () => {
    const params = {
      size: pageSize,
      page: vipPage,
    };

    try {
      const { data } = await apiGetHolderFeeds(params);
      if (data && Array.isArray(data.data.list)) {
        dispatch(vipAction.setTotalCnt(data.data.totalCnt));
        dispatch(vipAction.setIsLast(data.data.isLast));
        if (page === 1) {
          dispatch(vipAction.setList(data.data.list));
        } else {
          const prevList = store.getState()[vipListName].list;
          dispatch(vipAction.setList([...prevList, ...data.data.list]));
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      dispatch(vipAction.setRefreshing(false));
      dispatch(vipAction.setLoading(false));
    }
  };

  const handleEndReached = () => {
    if (!isLast) {
      const prevPage = store.getState()[listName].page;
      dispatch(action.setPage(prevPage + 1));
    }
  };

  const handleEndReachedForVip = () => {
    if (!vipIsLast) {
      const prevPage = store.getState()[vipListName].page;
      dispatch(vipAction.setPage(prevPage + 1));
    }
  };

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
  }, []);

  const onVipRefresh = useCallback(async () => {
    dispatch(vipAction.refresh());
  }, []);

  useEffect(() => {
    onRefresh();
    onVipRefresh();
  }, []);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getFeeds();
    }
  }, [page, refreshing]);

  useEffect(() => {
    if (vipRefreshing || (!vipRefreshing && vipPage > 1)) {
      getVipFeeds();
    }
  }, [vipPage, vipRefreshing]);

  const renderCommunityItem = ({ item }) => {
    return (
      <FeedItemCommunity
        item={item}
        onDelete={() => {
          onRefresh();
        }}
      />
    );
  };

  const renderVipCommunityItem = ({ item }) => {
    return (
      <FeedItemCommunity
        item={item}
        onDelete={() => {
          onVipRefresh();
        }}
        fromFavPlayer
      />
    );
  };

  const renderListEmpty = useCallback(() => {
    return <ListEmptyView text="커뮤니티에 글이 존재하지 않습니다." />;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterWrapper}>
        <Pressable
          onPress={() => {
            setSelectedCategory('normal');
          }}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                selectedCategory === 'normal'
                  ? COLORS.orange
                  : COLORS.fillStrong,
              borderColor:
                selectedCategory === 'normal'
                  ? COLORS.orange
                  : 'rgba(135, 141, 150, 0.16)',
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color:
                  selectedCategory === 'normal'
                    ? COLORS.white
                    : COLORS.labelAlternative,
              },
            ]}>
            일반
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setSelectedCategory('vip');
          }}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                selectedCategory === 'vip' ? COLORS.orange : COLORS.fillStrong,
              borderColor:
                selectedCategory === 'vip'
                  ? COLORS.orange
                  : 'rgba(135, 141, 150, 0.16)',
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color:
                  selectedCategory === 'vip'
                    ? COLORS.white
                    : COLORS.labelAlternative,
              },
            ]}>
            VIP
          </Text>
        </Pressable>
      </View>
      <View style={{ flex: 1, position: 'relative' }}>
        <View
          style={[
            styles.list,
            selectedCategory === 'normal' ? styles.active : styles.inActive,
          ]}>
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
        <View
          style={[
            styles.list,
            selectedCategory !== 'normal' ? styles.active : styles.inActive,
          ]}>
          {vipFeeds?.length > 0 ? (
            <FlatList
              ref={vipFlatListRef}
              style={styles.container}
              data={vipFeeds}
              renderItem={renderVipCommunityItem}
              refreshControl={
                <RefreshControl
                  refreshing={vipRefreshing}
                  onRefresh={onVipRefresh}
                />
              }
              onEndReached={handleEndReachedForVip}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={renderListEmpty}
              keyExtractor={item => item?.feedIdx}
            />
          ) : vipLoading ? (
            <Loading />
          ) : (
            renderListEmpty()
          )}
        </View>
      </View>
    </View>
  );
}

export default memo(CommunityTab);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    columnGap: 8,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  list: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  active: {
    zIndex: 1,
  },
  inActive: {
    zIndex: 0,
    opacity: 0,
  },
});
