import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiGetArticleDetail, apiGetArticleList } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import ListEmptyView from '../../components/ListEmptyView';
import Loading from '../../components/SPLoading';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import ArticleItem from '../../components/article/ArticleItem';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function MoreArticle() {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [isLast, setIsLast] = useState(false);

  const getArticleInfo = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
    };
    try {
      const { data } = await apiGetArticleList(params);

      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast);
        setArticles(prevArticles =>
          currentPage === 1 ? newList : [...prevArticles, ...newList],
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false); // 로딩 완료 후 로딩 상태 false로 설정
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
    setArticles([]);
    await getArticleInfo();
    setRefreshing(false);
  }, []);

  const renderArticleItem = useCallback(({ item, index }) => {
    return (
      <ArticleItem
        item={item}
        containerStyle={{
          marginLeft: index % 2 === 0 ? 0 : 8,
        }}
      />
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setCurrentPage(1);
      getArticleInfo();
    }, []),
  );

  useEffect(() => {
    getArticleInfo();
  }, [currentPage]);

  const renderEmptyList = useCallback(() => {
    return <ListEmptyView text="아티클이 존재하지 않습니다." />;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="아티클" />

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
    </SafeAreaView>
  );
}

export default memo(MoreArticle);

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
