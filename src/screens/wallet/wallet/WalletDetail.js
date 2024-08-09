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
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  apiGetMoreWalletCheckFee,
  apiGetMoreWalletPieTokenHistoryList,
  apiGetTokenBalance,
} from '../../../api/RestAPI';
import { SPSvgs } from '../../../assets/svg';
import { navName } from '../../../common/constants/navName';
import { PrimaryButton } from '../../../components/PrimaryButton';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import { handleError } from '../../../utils/HandleError';
import Utils from '../../../utils/Utils';
import WalletUtils from '../../../utils/WalletUtils';
import { useDispatch, useSelector } from 'react-redux';
import { walletHistoryListAction } from '../../../redux/reducers/list/walletHistoryListSlice';
import { store } from '../../../redux/store';

function WalletDetail({ route }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const listName = 'walletHistoryList';
  const {
    page,
    list: tokenHistoryList,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = walletHistoryListAction;
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [point, setPoint] = useState(0);
  const trlRef = useRef({ current: { disabled: false } });
  const [isFocus, setIsFocus] = useState(true);

  /**
   * api
   */
  const getWalletBalance = async () => {
    try {
      const walletAddr = await WalletUtils.getWalletAddress();
      setAddress(walletAddr);

      const { data } = await apiGetTokenBalance(walletAddr);
      const { wallet: walletDetail, point: pointDetail } = data?.data || {};
      setPoint(pointDetail?.pointBalance || 0);
      setBalance(walletDetail?.balance || 0);
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  const getTokenHistoryList = async () => {
    try {
      const params = {
        walletAddr: address,
        page,
        size: 100,
      };
      const { data } = await apiGetMoreWalletPieTokenHistoryList(params);
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

  /**
   * function
   */

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

  const canSendCheck = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiGetMoreWalletCheckFee();
      if (Number(data.data) > Number(point)) {
        Utils.openModal({
          title: '알림',
          body: '출금 수수료로 지불할 포인트가 부족합니다.',
        });
      } else {
        NavigationService.navigate(navName.walletSend);
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const onFocus = async () => {
    try {
      if (!noParamReset) {
        setIsFocus(true);
        dispatch(action.reset());
        NavigationService.replace(navName.walletDetail, {
          ...(route?.params || {}),
          noParamReset: true,
        });
        return;
      }
      await getWalletBalance();
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      onFocus();
      return () => {
        setIsFocus(true);
      };
    }, [noParamReset]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus && noParamReset) {
        onRefresh();
      }
    }, [isFocus, noParamReset]),
  );

  useEffect(() => {
    if (noParamReset) {
      if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
        getTokenHistoryList();
      }
    }
  }, [page, isFocus, refreshing, noParamReset]);

  const renderHeader = useMemo(() => {
    return (
      <Header
        leftIconColor={COLORS.white}
        rightContent={
          <Pressable
            style={{ padding: 10 }}
            onPress={() => {
              NavigationService.navigate(navName.walletSetting);
            }}>
            <SPSvgs.Settings fill={COLORS.white} />
          </Pressable>
        }
        headerContainerStyle={{
          paddingTop: insets.top,
        }}
      />
    );
  }, []);

  const renderContent = useMemo(() => {
    return (
      <View style={styles.content}>
        <View style={styles.topContent}>
          <SPSvgs.WalletToken width={48} height={48} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: 70,
              color: '#000',
              lineHeight: 32,
              letterSpacing: -0.552,
            }}>
            {Utils.changeNumberComma(balance, true)} PIE
          </Text>

          <View style={styles.addressWrapper}>
            <Text
              style={[
                fontStyles.fontSize12_Regular,
                {
                  flex: 1,
                  color: COLORS.labelNeutral,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="middle">
              {address ?? ''}
            </Text>
            <Pressable
              onPress={() => {
                Utils.copyToClipboard(address);
              }}>
              <SPSvgs.Copy width={18} height={18} />
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <PrimaryButton
            onPress={() => {
              NavigationService.navigate(navName.walletReceive);
            }}
            buttonStyle={styles.button}
            text="받기"
          />
          <PrimaryButton
            onPress={() => {
              canSendCheck();
            }}
            buttonStyle={styles.button}
            text="보내기"
          />
        </View>
      </View>
    );
  }, [balance, address, point]);

  const renderItem = useCallback(
    ({ item, index }) => {
      let displayDate = moment(item?.regDate).format('MM.DD');
      // 리스트의 첫 아이템이 아닐 때만 판단
      if (index > 0) {
        if (tokenHistoryList[index - 1]) {
          const prevItemDate = moment(
            tokenHistoryList[index - 1]?.regDate,
          ).format('MM.DD');
          if (displayDate === prevItemDate) {
            displayDate = null; // 이전 아이템과 날짜가 같다면 null로 설정
          }
        }
      }

      return (
        <View style={styles.itemContainer}>
          <View style={{ width: 40 }}>
            <Text
              style={[
                fontStyles.fontSize12_Medium,
                {
                  color: COLORS.labelNeutral,
                },
              ]}>
              {displayDate}
            </Text>
          </View>

          <View style={{ rowGap: 4, flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={fontStyles.fontSize14_Medium}>
                {item?.coinExchangeType === 'D' ? '받기' : '보내기'}
              </Text>
              <Text
                style={[
                  fontStyles.fontSize14_Semibold,
                  {
                    color:
                      item?.coinExchangeType === 'D'
                        ? COLORS.orange
                        : COLORS.labelAlternative,
                  },
                ]}>
                {item?.coinExchangeType === 'D' ? '+' : '-'}
                {Utils.changeNumberComma(item?.amount)} PIE
              </Text>
            </View>

            <View
              style={{
                rowGap: 2,
                backgroundColor: COLORS.fillNormal,
                borderRadius: 8,
                padding: 8,
              }}>
              <Text
                style={[
                  fontStyles.fontSize11_Medium,
                  {
                    color: COLORS.labelAlternative,
                  },
                ]}>
                거래 ID
              </Text>
              <Text
                style={[
                  fontStyles.fontSize11_Medium,
                  {
                    color: COLORS.labelAlternative,
                  },
                ]}>
                {item?.txid}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [tokenHistoryList],
  );

  const renderListEmpty = useCallback(() => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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

  const renderDetails = useMemo(() => {
    return (
      <View style={styles.detailsContainer}>
        <Text
          style={[
            fontStyles.fontSize18_Semibold,
            {
              marginBottom: 16,
            },
          ]}>
          내역
        </Text>

        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={tokenHistoryList}
            renderItem={renderItem}
            ListEmptyComponent={renderListEmpty}
            keyExtractor={(_, index) => `${index}`}
            contentContainerStyle={{
              rowGap: 16,
              paddingBottom: 24,
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            refreshing={refreshing}
            onEndReached={() => {
              loadMoreProjects();
            }}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListFooterComponent={renderFooter}
          />
        </View>
      </View>
    );
  }, [tokenHistoryList, loading, refreshing]);

  return (
    <View style={styles.container}>
      {renderHeader}

      {renderContent}

      {renderDetails}
    </View>
  );
}

export default memo(WalletDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBlue,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 16,
  },
  topContent: {
    backgroundColor: COLORS.white,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 16,
    paddingVertical: 24,
    borderRadius: 16,
  },
  addressWrapper: {
    flexDirection: 'row',
    width: '40%',
    backgroundColor: COLORS.fillStrong,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    columnGap: 4,
    alignItems: 'center',
  },
  bottomContent: {
    flexDirection: 'row',
    columnGap: 8,
  },
  button: {
    flex: 1,
  },
  detailsContainer: {
    backgroundColor: COLORS.white,
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    columnGap: 16,
  },
});
