import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  apiGetSocialTokenHistoryList,
  apiGetTokenBalance,
} from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { POINT_OPERATION } from '../../common/constants/PointOperation';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import Selector from '../../components/Selector';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import Header from '../../components/header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { socialTokenHistoryListAction } from '../../redux/reducers/list/socialTokenHistoryListSlice';
import { store } from '../../redux/store';

function SocialTokenDetail({ route }) {
  const dispatch = useDispatch();
  const listName = 'socialTokenHistoryList';
  const {
    page,
    list: pointHistory,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = socialTokenHistoryListAction;

  const flatListRef = useRef();
  const insets = useSafeAreaInsets();
  const searchTypes = Object.values(POINT_OPERATION).map(v => {
    return { id: Utils.UUIDV4(), label: v.desc, value: v.value };
  });
  const [selectedSearchType, setSelectedSearchType] = useState(
    searchTypes[0]?.value,
  );
  const [point, setPoint] = useState(0);
  const [isFocus, setIsFocus] = useState(true);

  const getSocialTokenBalance = async () => {
    try {
      const { data } = await apiGetTokenBalance('entity');
      const { point: pointDetail } = data?.data || {};
      setPoint(pointDetail?.pointBalance || 0);
    } catch (error) {
      handleError(error);
    }
  };

  const getPointHistoryList = async () => {
    try {
      const params = {
        page,
        size: 30,
        pointOperation: selectedSearchType,
      };
      const { data } = await apiGetSocialTokenHistoryList(params);
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsFocus(false);
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
    // if (flatListRef.current) {
    //   flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    // }
    dispatch(action.refresh());
  };

  const onFocus = async () => {
    if (!noParamReset) {
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.socialTokenDetail, {
        ...(route?.params || {}),
        noParamReset: true,
      });
      return;
    }
    await getSocialTokenBalance();
    setIsFocus(false);
  };

  useFocusEffect(
    useCallback(() => {
      onFocus();
      return () => {};
    }, [noParamReset]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus && noParamReset) {
        onRefresh();
      }
    }, [selectedSearchType, isFocus, noParamReset]),
  );

  useEffect(() => {
    if (noParamReset) {
      if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
        getPointHistoryList();
      }
    }
  }, [page, isFocus, refreshing, noParamReset]);

  const renderHeader = useMemo(() => {
    return (
      <View style={styles.headerContainer}>
        <SPSvgs.SocialToken width={48} height={48} />
        <Text style={[fontStyles.fontSize14_Semibold, { color: COLORS.white }]}>
          보유 소셜토큰
        </Text>
        <Text style={[fontStyles.fontSize24_Bold, { color: COLORS.white }]}>
          {Utils.changeNumberComma(point)} P
        </Text>
        <PrimaryButton
          buttonStyle={{
            width: '100%',
          }}
          text="스왑"
          onPress={() => {
            NavigationService.navigate(navName.swap);
          }}
        />
      </View>
    );
  }, [point]);

  const renderListHeader = useMemo(() => {
    return (
      <View style={styles.listHeader}>
        <Text style={fontStyles.fontSize18_Semibold}>내역</Text>
        <Selector
          options={searchTypes}
          onItemPress={setSelectedSearchType}
          // selectedItem={selectedSearchType}
          selectedOnItem={selectedSearchType}
        />
      </View>
    );
  }, [selectedSearchType, searchTypes]);

  const renderPoint = useCallback(
    ({ item, index }) => {
      const hideDate =
        moment(item?.regDate).format('MM.DD') ===
          moment(pointHistory?.[index - 1]?.regDate).format('MM.DD') &&
        index !== 0;

      return (
        <View style={styles.itemContainer}>
          <Text style={styles.timeText}>
            {hideDate ? '' : moment(item?.regDate).format('MM.DD')}
          </Text>
          <View style={{ flex: 1, rowGap: 4, paddingVertical: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.pointTypeText}>{item?.pointTypeKo}</Text>
              <Text
                style={[
                  fontStyles.fontSize14_Semibold,
                  {
                    color:
                      item.pointValue > 0
                        ? COLORS.orange
                        : COLORS.labelAlternative,
                  },
                ]}>
                {Utils.changeNumberComma(`${item.pointValue}`, false, true)} P
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text />
              <Text
                style={[
                  fontStyles.fontSize12_Medium,
                  {
                    color: COLORS.labelAlternative,
                    letterSpacing: 0.302,
                  },
                ]}>
                {item.pointValue > 0 ? '적립' : '사용'}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [pointHistory],
  );

  const renderListEmpty = useCallback(() => {
    return (
      <View style={{ flex: 1, alignItems: 'center', top: '40%' }}>
        <Text
          style={[
            fontStyles.fontSize14_Medium,
            { color: COLORS.labelAlternative },
          ]}>
          내역이 없습니다.
        </Text>
      </View>
    );
  }, []);

  const renderFooter = useCallback(() => {
    if (loading) {
      return <ActivityIndicator size="small" color={COLORS.orange} />;
    }
  }, [loading]);

  return (
    <View style={styles.container}>
      <Header
        headerContainerStyle={{
          backgroundColor: COLORS.darkBlue,
          paddingTop: insets.top,
        }}
        leftIconColor={COLORS.white}
      />
      {/* Header */}
      {renderHeader}

      <View style={styles.content}>
        {renderListHeader}

        <FlatList
          contentContainerStyle={styles.listContent}
          data={pointHistory}
          keyExtractor={(_, index) => `${index}`}
          renderItem={renderPoint}
          ListEmptyComponent={renderListEmpty}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={loadMoreProjects}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          ListFooterComponent={renderFooter}
        />
      </View>
    </View>
  );
}

export default memo(SocialTokenDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBlue,
  },
  headerContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 8,
  },
  content: {
    backgroundColor: COLORS.white,
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    rowGap: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    columnGap: 16,
    paddingVertical: 8,
  },
  timeText: {
    ...fontStyles.fontSize12_Medium,
    top: 8,
    color: COLORS.labelNeutral,
    letterSpacing: 0.302,
    minWidth: 40,
  },
  pointTypeText: {
    ...fontStyles.fontSize14_Medium,
    letterSpacing: 0.203,
    color: COLORS.labelNormal,
  },
});
