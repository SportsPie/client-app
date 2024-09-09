import React, { memo, useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { apiGetEventNoticeList } from '../../api/RestAPI';
import Loading from '../../components/SPLoading';
import NoticeItem from '../../components/notice/NoticeItem';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { useDispatch, useSelector } from 'react-redux';
import { moreNoticeListAction } from '../../redux/reducers/list/moreNoticeListSlice';
import { store } from '../../redux/store';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

function EventNoticeList({ route }) {
  const dispatch = useDispatch();
  const listName = 'moreNoticeList';
  const {
    page,
    list: notices,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const eventIdx = route?.params?.eventIdx;
  const eventName = route?.params?.eventName;
  const action = moreNoticeListAction;

  const pageSize = 30;

  const [isFocus, setIsFocus] = useState(true);

  const getEventNoticeList = async () => {
    const params = {
      eventIdx,
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetEventNoticeList(params);
      if (Array.isArray(data.data.list)) {
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

  const renderNoticesItem = useCallback(({ item }) => {
    return <NoticeItem event eventName={eventName} item={item} />;
  }, []);

  useEffect(() => {
    if (!noParamReset) {
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.eventNoticeList, {
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
        getEventNoticeList();
      }
    }
  }, [page, refreshing, isFocus, noParamReset]);

  const renderEmptyList = useCallback(() => {
    return (
      <View style={styles.emptyViewWrapper}>
        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelAlternative,
              textAlign: 'center',
            },
          ]}>
          공지사항이 존재하지 않습니다.
        </Text>
      </View>
    );
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="이벤트 공지사항" />
      <View style={{ padding: 16 }}>
        <Text style={{ ...fontStyles.fontSize20_Medium }}>{eventName}</Text>
      </View>
      <FlatList
        data={notices}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        renderItem={renderNoticesItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyList}
      />
    </SafeAreaView>
  );
}

export default memo(EventNoticeList);

const styles = StyleSheet.create({
  emptyViewWrapper: {
    justifyContent: 'center',
    paddingTop: 24,
  },
});
