import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import {
  apiDeleteArticleBookmark,
  apiGetArticleBookmark,
} from '../../api/RestAPI';
import ListEmptyView from '../../components/ListEmptyView';
import Loading from '../../components/SPLoading';
import { handleError } from '../../utils/HandleError';
import ArticleItem from '../../components/article/ArticleItem';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';
import SPModal from '../../components/SPModal';
import { useDispatch, useSelector } from 'react-redux';
import { moreArticleBookmarksListAction } from '../../redux/reducers/list/moreArticleBookmarksListSlice';
import { store } from '../../redux/store';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

function MoreArticleBookmarks({ route }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const listName = 'moreArticleBookmarksList';
  const {
    page,
    list: articles,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = moreArticleBookmarksListAction;

  const [isFocus, setIsFocus] = useState(true);

  const trlRef = useRef({ current: { disabled: false } });
  const pageSize = 30;
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
      page,
    };
    try {
      const { data } = await apiGetArticleBookmark(params);

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
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
  }, []);

  /**
   * useEffect
   */
  useEffect(() => {
    if (!noParamReset) {
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.moreArticleBookmarks, {
        ...(route?.params || {}),
        noParamReset: true,
      });
      return;
    }
    dispatch(action.refresh());
    setIsFocus(false);
  }, [noParamReset, refresh]);

  useEffect(() => {
    if (noParamReset) {
      if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
        getBookmarkedArticleList();
      }
    }
  }, [page, refreshing, isFocus, noParamReset]);

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
    return <ListEmptyView text="스포츠파이 인사이트가 존재하지 않습니다." />;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="즐겨찾기" />

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
