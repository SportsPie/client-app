import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import { apiGetArticleList } from '../../api/RestAPI';
import ListEmptyView from '../../components/ListEmptyView';
import Loading from '../../components/SPLoading';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import ArticleItem from '../../components/article/ArticleItem';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { navName } from '../../common/constants/navName';
import { useSelector } from 'react-redux';

function MoreArticle() {
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [isLast, setIsLast] = useState(false);

  const getArticleList = async () => {
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
      setIsLast(true);
      handleError(error);
    } finally {
      setLoading(false); // 로딩 완료 후 로딩 상태 false로 설정
      setRefreshing(false);
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
    setLoading(true);
    setArticles([]);
    setCurrentPage(1);
    setIsLast(false);
    setRefreshing(true);
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
      onRefresh();
    }, []),
  );

  useEffect(() => {
    if (refreshing || (!refreshing && currentPage > 1)) {
      getArticleList();
    }
  }, [currentPage, refreshing]);

  const renderEmptyList = useCallback(() => {
    return <ListEmptyView text="아티클이 존재하지 않습니다." />;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="아티클"
        {...(isLogin
          ? {
              rightContent: (
                <Pressable
                  onPress={() => {
                    NavigationService.navigate(navName.moreArticleBookmarks);
                  }}
                  style={{ padding: 16 }}>
                  <Text
                    style={{
                      ...fontStyles.fontSize16_Medium,
                      color: COLORS.blue,
                    }}>
                    즐겨찾기
                  </Text>
                </Pressable>
              ),
            }
          : {})}
      />

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
