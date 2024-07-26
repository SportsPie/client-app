import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment/moment';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiGetQna, apiGetQnaDetail } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import { PROGRESS_STATUS } from '../../common/constants/progressStatus';
import { PrimaryButton } from '../../components/PrimaryButton';
import Loading from '../../components/SPLoading';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import ListEmptyView from '../../components/ListEmptyView';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MoreInquiry() {
  const pageSize = 6;
  const [inquiry, setInquiry] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLast, setIsLast] = useState(false);

  const getInquiryInfo = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
    };
    try {
      const { data } = await apiGetQna(params);
      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast); // 현재 페이지가 마지막 페이지임을 설정
        setInquiry(prevInquiry =>
          currentPage === 1 ? newList : [...prevInquiry, ...newList],
        );
      }
    } catch (error) {
      setIsLast(true);
      handleError(error);
    } finally {
      setRefreshing(false);
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
    // setRefreshing(true); // 새로 고침을 시작함
    // setCurrentPage(1); // 현재 페이지를 1로 설정
    // setInquiry([]); // 기존의 목록 초기화
    // await getInquiryInfo(); // 기사 정보 다시 가져오기
    // setRefreshing(false); // 새로 고침 완료
    setLoading(true);
    setInquiry([]);
    setCurrentPage(1);
    setIsLast(false);
    setRefreshing(true);
  }, []);

  const detailPage = async inquires => {
    try {
      NavigationService.navigate(navName.moreInquiryDetail, {
        qnaIdx: inquires.qnaIdx,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const nextPage = () => {
    NavigationService.navigate(navName.moreInquiryRegist);
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, []),
  );
  useEffect(() => {
    if (refreshing || (!refreshing && currentPage > 1)) {
      getInquiryInfo();
    }
  }, [currentPage, refreshing]);

  const renderHeader = useMemo(() => {
    return (
      <View style={styles.headerWrapper}>
        <Text style={styles.headerText}>운영시간 안내</Text>

        <View style={{ rowGap: 8 }}>
          <Text style={styles.timeText}>접수시간 : 24시간 가능</Text>
          <Text style={styles.timeText}>
            답변가능 시간 : 평일 09:00 - 18:00(토, 일, 공휴일 휴무)
          </Text>
        </View>

        <Text style={styles.headerText}>고객센터 안내</Text>

        <View style={{ rowGap: 8 }}>
          <Text style={styles.timeText}>고객센터 전화번호 : 010-4070-9024</Text>
          <Text style={styles.timeText}>
            고객센터 운영시간 : 평일 09:00 - 18:00(토, 일, 공휴일 휴무)
          </Text>
        </View>

        <PrimaryButton text="문의하기" onPress={nextPage} />
      </View>
    );
  }, []);

  const renderListEmpty = useCallback(() => {
    return <ListEmptyView text="문의내역이 없습니다." />;
  }, []);

  const renderInquiryItem = useCallback(({ item }) => {
    return (
      <Pressable
        style={styles.inquiryItemWrapper}
        onPress={() => detailPage(item)}>
        <View
          style={[
            styles.statusWrapper,
            {
              backgroundColor:
                PROGRESS_STATUS[item.qnaState] === PROGRESS_STATUS.WAIT
                  ? COLORS.peach
                  : 'rgba(49, 55, 121, 0.10)',
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize12_Semibold,
              {
                color:
                  PROGRESS_STATUS[item.qnaState] === PROGRESS_STATUS.WAIT
                    ? COLORS.orange
                    : COLORS.darkBlue,
              },
            ]}>
            {PROGRESS_STATUS[item.qnaState]
              ? PROGRESS_STATUS[item.qnaState].desc2
              : ''}
          </Text>
        </View>

        <Text style={fontStyles.fontSize16_Semibold}>{item.title}</Text>

        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelAlternative,
            },
          ]}>
          {moment(item.regDate).format('YYYY-MM-DD')}
        </Text>
      </Pressable>
    );
  }, []);

  const renderListInquiry = useMemo(() => {
    if (loading) {
      return <Loading />;
    }
    return (
      <FlatList
        style={styles.container}
        data={inquiry}
        renderItem={renderInquiryItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderListEmpty}
      />
    );
  }, [inquiry, refreshing, loading, onRefresh]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="1:1 문의" />

      {renderHeader}

      {renderListInquiry}
    </SafeAreaView>
  );
}

export default memo(MoreInquiry);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineBorder,
    rowGap: 16,
  },
  timeText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelNeutral,
    letterSpacing: 0.3,
  },
  inquiryItemWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineBorder,
    rowGap: 8,
  },
  statusWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    width: 58,
    height: 24,
  },
  headerText: {
    ...fontStyles.fontSize16_Semibold,
    lineHeight: 24,
    color: COLORS.labelNormal,
  },
});
