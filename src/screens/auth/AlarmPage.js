import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AlertItem from '../../components/alert-page/AlertItem';
import Header from '../../components/header';
import { COLORS } from '../../styles/colors';
import { handleError } from '../../utils/HandleError';
import notificationMapper from '../../utils/notification/NotificationMapper';
import notificationUtils from '../../utils/notification/NotificationUtils';
import { alarmListAction } from '../../redux/reducers/list/alarmListSlice';
import { store } from '../../redux/store';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

export const NOTI_TYPE = {
  TRAINING: 'TRAINING',
  ACADEMY: 'ACADEMY',
  MATCH: 'MATCH',
  COMMUNITY: 'COMMUNITY',
  LOGO: 'LOGO',
  TOURNAMENT: 'TOURNAMENT',
  POINT: 'POINT',
  WALLET: 'WALLET',
};
function AlarmPage({ route }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const listName = 'alarmList';
  const {
    page,
    list: notiList,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = alarmListAction;

  const flatListRef = useRef();

  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const [size, setSize] = useState(30);

  /**
   * sql lite
   */
  const getNotiList = async () => {
    try {
      const list = await notificationMapper.selectNotificationList({
        userIdx,
        paging: true,
        page,
        size,
      });
      dispatch(action.setIsLast(list.length < size));
      if (page === 1) {
        dispatch(action.setList(list));
      } else {
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...list]));
      }
    } catch (error) {
      handleError(error);
    } finally {
      dispatch(action.setRefreshing(false));
      dispatch(action.setLoading(false));
    }
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }
    }, 0);
  };

  const onRefresh = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    dispatch(action.refresh());
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      return () => {
        notificationUtils.read();
      };
    }, []),
  );

  useEffect(() => {
    if (!noParamReset) {
      dispatch(action.reset());
      NavigationService.replace(navName.alarmPage, {
        ...(route?.params || {}),
        noParamReset: true,
      });
    }
  }, [noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if (refreshing || (!refreshing && page > 1)) {
        getNotiList();
      }
    }
  }, [page, refreshing, noParamReset]);

  /**
   * render
   */
  const renderNotiItem = useCallback(({ item }) => {
    return <AlertItem item={item} />;
  }, []);

  const renderFooter = useCallback(() => {
    if (loading) {
      return <ActivityIndicator size="small" color={COLORS.orange} />;
    }
  }, [loading]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="알림" />

      {notiList && notiList.length ? (
        <FlatList
          ref={flatListRef}
          data={notiList}
          keyExtractor={item => item?.notiIdx}
          renderItem={renderNotiItem}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={loadMoreProjects}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(46, 49, 53, 0.60)',
              lineHeight: 18,
              letterSpacing: 0.252,
              textAlign: 'center',
            }}>
            알림 내역이 없습니다.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

export default memo(AlarmPage);
