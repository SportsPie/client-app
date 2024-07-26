import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import {
  apiDeleteArticleBookmark,
  apiGetArticleBookmark,
  apiGetArticleDetail,
  apiGetArticleList,
} from '../../api/RestAPI';
import ListEmptyView from '../../components/ListEmptyView';
import Loading from '../../components/SPLoading';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import ArticleItem from '../../components/article/ArticleItem';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';
import SPModal from '../../components/SPModal';

function MoreArticleBookmarks() {
  /**
   * state
   */
  const trlRef = useRef({ current: { disabled: false } });
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [isLast, setIsLast] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const [selectedHiddenItem, setSelectedHiddenItem] = useState({});

  // modal
  const [showModal, setShowModal] = useState(false);

  /**
   * api
   */
  const getBookmarkedArticleList = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
    };
    try {
      const { data } = await apiGetArticleBookmark(params);

      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast);
        setArticles(prevArticles =>
          currentPage === 1 ? newList : [...prevArticles, ...newList],
        );
      }
    } catch (error) {
      setIsLast(true);
      handleError(error);
    } finally {
      setLoading(false); // 로딩 완료 후 로딩 상태 false로 설정
      setRefreshing(false);
    }
  };

  const removeBookmark = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiDeleteArticleBookmark(
        selectedHiddenItem.boardIdx,
      );
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */

  const hiddenItemHandle = item => {
    setSelectedHiddenItem(item);
    setShowModal(true);
  };

  const handleEndReached = () => {
    if (!isLast) {
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setArticles([]);
    setCurrentPage(1);
    setIsLast(false);
    setRefreshing(true);
  }, []);

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (refreshing || (!refreshing && currentPage > 1)) {
      getBookmarkedArticleList();
    }
  }, [currentPage, refreshing]);

  /**
   * render
   */

  const renderArticleItem = useCallback(({ item, index }) => {
    return (
      <ArticleItem
        item={item}
        onPressHiddenItem={hiddenItemHandle}
        containerStyle={{
          marginLeft: index % 2 === 0 ? 0 : 8,
        }}
      />
    );
  }, []);

  const renderEmptyList = useCallback(() => {
    return <ListEmptyView text="아티클이 존재하지 않습니다." />;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="즐겨찾기" />

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={articles}
          numColumns={2}
          renderItem={renderArticleItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.content}
        />
      )}

      <SPModal
        visible={showModal}
        title="확인"
        contents="즐겨찾기를 해제하시겠습니까?"
        onConfirm={removeBookmark}
        onCancel={() => {
          setShowModal(false);
        }}
        onClose={() => {
          setShowModal(false);
        }}
      />
    </SafeAreaView>
  );
}

export default memo(MoreArticleBookmarks);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    rowGap: 16,
    paddingVertical: 16,
  },
});
