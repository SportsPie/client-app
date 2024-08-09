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
import { useDispatch, useSelector } from 'react-redux';
import { moreArticleListAction } from '../../redux/reducers/list/moreArticleListSlice';
import { store } from '../../redux/store';

function MoreArticle({ route }) {
  const dispatch = useDispatch();
  const listName = 'moreArticleList';
  const {
    page,
    list: articles,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = moreArticleListAction;

  const [isFocus, setIsFocus] = useState(true);

  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const pageSize = 30;

  const getArticleList = async () => {
    const params = {
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetArticleList(params);

      if (Array.isArray(data.data.list)) {
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
      setTimeout(() => {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
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

  useEffect(() => {
    if (!noParamReset) {
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.moreArticle, {
        ...(route?.params || {}),
        noParamReset: true,
      });
      return;
    }
    dispatch(action.refresh());
    setIsFocus(false);
  }, [noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
        getArticleList();
      }
    }
  }, [page, refreshing, isFocus, noParamReset]);

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

      {articles && articles.length > 0 ? (
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
      ) : loading ? (
        <Loading />
      ) : (
        renderEmptyList()
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
