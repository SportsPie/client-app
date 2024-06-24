import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { apiGetNotices } from '../../api/RestAPI';
import Loading from '../../components/SPLoading';
import NoticeItem from '../../components/notice/NoticeItem';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MoreNotice() {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLast, setIsLast] = useState(false);

  const getNoticeInfo = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
    };
    try {
      const { data } = await apiGetNotices(params);

      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast); // 현재 페이지가 마지막 페이지임을 설정
        setNotices(prevNotices =>
          currentPage === 1 ? newList : [...prevNotices, ...newList],
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
    setNotices([]);
    await getNoticeInfo();
    setRefreshing(false);
  }, []);

  const renderNoticesItem = useCallback(({ item }) => {
    return <NoticeItem item={item} />;
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setCurrentPage(1);
      getNoticeInfo();
    }, []),
  );

  useEffect(() => {
    console.log(`Fetching data for page: ${currentPage}`);
    getNoticeInfo();
  }, [currentPage]);

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
          질문이 존재하지 않습니다.
        </Text>
      </View>
    );
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="공지사항" />

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

export default memo(MoreNotice);

const styles = StyleSheet.create({
  emptyViewWrapper: {
    justifyContent: 'center',
    paddingTop: 24,
  },
});
