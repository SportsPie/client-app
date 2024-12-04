import moment from 'moment/moment';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiGetTournamentQna, apiGetTournamentTitle } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import { PROGRESS_STATUS } from '../../common/constants/progressStatus';
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
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import SPIcons from '../../assets/icon';
import { tournamentInquiryListAction } from '../../redux/reducers/list/tournamentInquiryListSlice';
import Utils from '../../utils/Utils';

function TournamentInquiryList({ route }) {
  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const dispatch = useDispatch();
  const listName = 'tournamentInquiryList';
  const {
    page,
    list: inquiry,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const tournamentIdx = route?.params?.tournamentIdx;
  const action = tournamentInquiryListAction;

  const [isFocus, setIsFocus] = useState(true);
  const [tournamentCount, setTournamentCount] = useState();
  const [tournamentName, setTournamentName] = useState();

  const pageSize = 30;

  const getTournamentName = async () => {
    try {
      const { data } = await apiGetTournamentTitle(tournamentIdx);
      setTournamentCount(data.data.trnCnt);
      setTournamentName(data.data.title);
    } catch (error) {
      handleError(error);
    }
  };

  const getInquiryList = async () => {
    if (!isLogin) {
      dispatch(action.setRefreshing(false));
      dispatch(action.setLoading(false));
      return;
    }
    const params = {
      tournamentIdx,
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetTournamentQna(params);
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
      NavigationService.navigate(navName.tournamentInquiryDetail, {
        tournamentIdx,
        qnaIdx: inquires.qnaIdx,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const moveEditPage = () => {
    NavigationService.navigate(navName.tournamentInquiryEdit, {
      tournamentIdx,
    });
  };

  useEffect(() => {
    if (!noParamReset) {
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.tournamentInquiryList, {
        ...(route?.params || {}),
        noParamReset: true,
      });
      return;
    }
    getTournamentName();
    dispatch(action.refresh());
    setIsFocus(false);
  }, [noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
        getInquiryList();
      }
    }
  }, [page, refreshing, isFocus, noParamReset]);

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
    if (!isLogin) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ ...fontStyles.fontSize16_Regular }}>
              로그인 후 이용하실 수 있습니다.
            </Text>
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 28,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: '#FF7C10',
              }}>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => {
                  NavigationService.replace(navName.login, {
                    from: navName.tournamentInquiryList,
                    tournamentIdx,
                  });
                }}>
                <Text
                  style={{
                    ...fontStyles.fontSize16_Semibold,
                    color: '#FF7C10',
                  }}>
                  로그인하기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
    return (
      <FlatList
        style={styles.container}
        data={inquiry}
        renderItem={renderInquiryItem}
        contentContainerStyle={inquiry?.length === 0 && { flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {renderListEmpty()}
          </View>
        }
      />
    );
  }, [inquiry, refreshing, loading, onRefresh, isFocus, noParamReset]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="1:1 문의" />
      <View style={{ padding: 16 }}>
        <Text style={{ ...fontStyles.fontSize20_Semibold }}>
          {tournamentCount &&
            `제${Utils.changeNumberComma(tournamentCount)}회 `}{' '}
          {tournamentName}
        </Text>
      </View>

      {renderListInquiry}
      <View style={{ position: 'absolute', bottom: 24, right: 16 }}>
        <TouchableOpacity activeOpacity={ACTIVE_OPACITY} onPress={moveEditPage}>
          <Image
            style={{ width: 56, height: 56 }}
            source={SPIcons.icCommunityWrite}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default memo(TournamentInquiryList);

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
