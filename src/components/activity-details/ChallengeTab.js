import moment from 'moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  apiGetChallengeComments,
  apiGetChallengeVideos,
  apiGetTrainingVideos,
} from '../../api/RestAPI';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import ListEmptyView from '../ListEmptyView';
import FeedItemChallenge from './FeedItemChallenge';
import FeedVideoItemChallenge from './FeedVideoItemChallenge';
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../SPLoading';
import { useDispatch, useSelector } from 'react-redux';
import { moreClassMaterCommentListAction } from '../../redux/reducers/list/moreClassMasterCommentListSlice';
import { moreClassMaterVideoListAction } from '../../redux/reducers/list/moreClassMasterVideoListSlice';
import { moreChallengeCommentListAction } from '../../redux/reducers/list/moreChallengeCommentListSlice';
import { moreChallengeVideoListAction } from '../../redux/reducers/list/moreChallengeVideoListSlice';
import { store } from '../../redux/store';
import FeedVideoItem from './FeedVideoItem';

function ChallengeTab() {
  const dispatch = useDispatch();
  const listName = 'moreChallengeCommentList';
  const {
    page,
    list: feedList,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const action = moreChallengeCommentListAction;

  const videoListName = 'moreChallengeVideoList';
  const {
    page: videoPage,
    list: videoList,
    refreshing: videoRefreshing,
    loading: videoLoading,
    isLast: videoIsLast,
  } = useSelector(selector => selector[videoListName]);
  const videoAction = moreChallengeVideoListAction;

  const [selectedCategory, setSelectedCategory] = useState('apply');
  const pageSize = 30;
  const flatListRef = useRef();
  const [deleteEvent, setDeleteEvent] = useState(false);
  const getFeeds = async () => {
    const params = {
      size: pageSize,
      page,
    };

    try {
      const { data } = await apiGetChallengeComments(params);

      if (data && Array.isArray(data.data.list)) {
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

  const getVideos = async () => {
    const params = {
      size: pageSize,
      page: videoPage,
    };
    try {
      const { data } = await apiGetChallengeVideos(params);
      if (data && Array.isArray(data.data.list)) {
        dispatch(videoAction.setTotalCnt(data.data.totalCnt));
        dispatch(videoAction.setIsLast(data.data.isLast));
        if (videoPage === 1) {
          dispatch(videoAction.setList(data.data.list));
        } else {
          const prevList = store.getState()[videoListName].list;
          dispatch(videoAction.setList([...prevList, ...data.data.list]));
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      dispatch(videoAction.setRefreshing(false));
      dispatch(videoAction.setLoading(false));
    }
  };

  const handleEndReached = () => {
    if (!isLast) {
      setTimeout(() => {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }, 0);
    }
  };

  const handleEndReachedForVideo = () => {
    if (!videoIsLast) {
      setTimeout(() => {
        const prevPage = store.getState()[videoListName].page;
        dispatch(videoAction.setPage(prevPage + 1));
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
  }, []);

  const onVideoRefresh = useCallback(async () => {
    dispatch(videoAction.refresh());
  }, []);

  useEffect(() => {
    onRefresh();
    onVideoRefresh();
  }, []);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getFeeds();
    }
  }, [page, refreshing]);

  useEffect(() => {
    if (videoRefreshing || (!videoRefreshing && videoPage > 1)) {
      getVideos();
    }
  }, [videoPage, videoRefreshing]);

  const renderVideoListEmpty = useCallback(() => {
    return <ListEmptyView text="챌린지에 영상이 존재하지 않습니다." />;
  }, []);

  const renderApplyListEmpty = useCallback(() => {
    return <ListEmptyView text="챌린지에 댓글이 존재하지 않습니다." />;
  }, []);

  const renderChallengeItem = useCallback(
    ({ item }) => (
      <FeedItemChallenge
        item={item}
        onModify={(commentIdx, comment) => {
          // eslint-disable-next-line no-param-reassign
          item.comment = comment;
          dispatch(
            action.modifyItem({
              idxName: 'commentIdx',
              idx: commentIdx,
              item,
            }),
          );
        }}
        onDelete={() => {
          onRefresh();
        }}
      />
    ),
    [selectedCategory],
  );

  const renderChallengeItemForVideo = useCallback(({ item }) => {
    return (
      <FeedVideoItemChallenge
        item={item}
        onDelete={() => {
          onVideoRefresh();
        }}
      />
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.filterWrapper}>
        <Pressable
          onPress={() => {
            setSelectedCategory('apply');
          }}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                selectedCategory === 'apply'
                  ? COLORS.orange
                  : COLORS.fillStrong,
              borderColor:
                selectedCategory === 'apply'
                  ? COLORS.orange
                  : 'rgba(135, 141, 150, 0.16)',
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color:
                  selectedCategory === 'apply'
                    ? COLORS.white
                    : COLORS.labelAlternative,
              },
            ]}>
            내가 쓴 댓글
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setSelectedCategory('video');
          }}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                selectedCategory === 'video'
                  ? COLORS.orange
                  : COLORS.fillStrong,
              borderColor:
                selectedCategory === 'video'
                  ? COLORS.orange
                  : 'rgba(135, 141, 150, 0.16)',
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color:
                  selectedCategory === 'video'
                    ? COLORS.white
                    : COLORS.labelAlternative,
              },
            ]}>
            내가 올린 영상
          </Text>
        </Pressable>
      </View>
      <View style={{ flex: 1, position: 'relative' }}>
        <View
          style={[
            styles.list,
            selectedCategory === 'apply' ? styles.active : styles.inActive,
          ]}>
          {feedList?.length > 0 ? (
            <FlatList
              ref={flatListRef}
              style={styles.container}
              data={feedList}
              renderItem={renderChallengeItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                selectedCategory === 'video'
                  ? renderVideoListEmpty()
                  : renderApplyListEmpty()
              }
              contentContainerStyle={{
                rowGap: 0,
                paddingTop: 0,
              }}
              keyExtractor={item => item?.commentIdx}
            />
          ) : loading ? (
            <Loading />
          ) : (
            renderApplyListEmpty()
          )}
        </View>
        <View
          style={[
            styles.list,
            selectedCategory !== 'apply' ? styles.active : styles.inActive,
          ]}>
          {videoList?.length > 0 ? (
            <FlatList
              style={styles.container}
              data={videoList}
              renderItem={renderChallengeItemForVideo}
              refreshControl={
                <RefreshControl
                  refreshing={videoRefreshing}
                  onRefresh={onVideoRefresh}
                />
              }
              onEndReached={handleEndReachedForVideo}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={renderVideoListEmpty}
              contentContainerStyle={{
                rowGap: 16,
                paddingTop: 16,
              }}
              keyExtractor={item => item?.videoIdx}
            />
          ) : videoLoading ? (
            <Loading />
          ) : (
            renderVideoListEmpty()
          )}
        </View>
      </View>
    </View>
  );
}

export default memo(ChallengeTab);

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
