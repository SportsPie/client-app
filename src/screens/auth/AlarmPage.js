import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AlertItem from '../../components/alert-page/AlertItem';
import Header from '../../components/header';
import { COLORS } from '../../styles/colors';
import { handleError } from '../../utils/HandleError';
import notificationMapper from '../../utils/notification/NotificationMapper';
import notificationUtils from '../../utils/notification/NotificationUtils';

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
function AlarmPage() {
  /**
   * state
   */
  const flatListRef = useRef();

  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [loading, setLoading] = useState(true);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [notiList, setNotiList] = useState([]);

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
      setIsLast(list.length < size);
      if (page === 1) {
        setNotiList(list);
      } else {
        setNotiList(prevProjects => [...prevProjects, ...list]);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
        setRefreshing(true);
      }
    }, 0);
  };

  const onRefresh = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    setPage(1);
    setIsLast(false);
    setRefreshing(true);
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

  useFocusEffect(
    useCallback(() => {
      if (refreshing) {
        getNotiList();
      }
    }, [page, refreshing]),
  );

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
          refreshing={loading}
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
