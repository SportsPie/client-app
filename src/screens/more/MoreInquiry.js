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
import { apiGetQna } from '../../api/RestAPI';
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
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../redux/store';
import { moreInquiryListAction } from '../../redux/reducers/list/moreInquiryListSlice';

function MoreInquiry({ route }) {
  const dispatch = useDispatch();
  const listName = 'moreInquiryList';
  const {
    page,
    list: inquiry,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = moreInquiryListAction;

  const [isFocus, setIsFocus] = useState(true);

  const pageSize = 6;

  const getInquiryInfo = async () => {
    const params = {
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetQna(params);
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

  useEffect(() => {
    if (!noParamReset) {
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.moreInquiry, {
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
        getInquiryInfo();
      }
    }
  }, [page, refreshing, isFocus, noParamReset]);

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
  }, [inquiry, refreshing, loading, onRefresh, isFocus, noParamReset]);

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
