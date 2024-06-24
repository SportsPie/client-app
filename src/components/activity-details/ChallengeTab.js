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

function ChallengeTab() {
  const [selectedCategory, setSelectedCategory] = useState('apply');
  const [feeds, setFeeds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const flatListRef = useRef();
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const getFeeds = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
    };

    try {
      const { data } =
        selectedCategory === 'apply'
          ? await apiGetChallengeComments(params)
          : await apiGetChallengeVideos(params);

      if (data && Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast);

        setFeeds(prevFeeds =>
          currentPage === 1 ? newList : [...prevFeeds, ...newList],
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndReached = () => {
    if (!isLast) {
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
      }, 0);
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
    }, [selectedCategory]),
  );

  useEffect(() => {
    getFeeds();
  }, [selectedCategory, currentPage]);

  const renderListEmpty = useCallback(() => {
    return <ListEmptyView text="커뮤니티에 글이 존재하지 않습니다." />;
  }, []);

  const renderMasterClassItem = useCallback(
    ({ item }) => {
      if (selectedCategory === 'apply') {
        return <FeedItemChallenge item={item} />;
      }
      return <FeedVideoItemChallenge item={item} hideTitle />;
    },
    [selectedCategory],
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterWrapper}>
        <Pressable
          onPress={() => {
            setSelectedCategory('apply');
            setCurrentPage(1);
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
            setCurrentPage(1);
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
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.container}
          data={feeds}
          renderItem={renderMasterClassItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderListEmpty}
          contentContainerStyle={{
            rowGap: selectedCategory === 'video' ? 16 : 0,
            paddingTop: selectedCategory === 'video' ? 16 : 0,
          }}
        />
      )}
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
});
