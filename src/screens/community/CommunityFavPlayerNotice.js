import { useFocusEffect } from '@react-navigation/native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  apiGetHolderCommunityNoticeList,
  apiGetMyInfo,
} from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { ACTIVE_OPACITY, IS_IOS } from '../../common/constants/constants';
import { navName } from '../../common/constants/navName';
import DismissKeyboard from '../../components/DismissKeyboard';
import Divider from '../../components/Divider';
import SPLoading from '../../components/SPLoading';
import FeedItem from '../../components/community/FeedItem';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import { store } from '../../redux/store';
import { communityFavPlayerNoticeListAction } from '../../redux/reducers/list/communityFavPlayerNoticeListSlice';
import { setHeaderProps } from '../../components/SPHeader';
import backHandlerUtils from '../../utils/BackHandlerUtils';

function CommunityFavPlayerNotice({ route }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef();
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const paramReset = route?.params?.paramReset;

  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const listName = 'communityFavPlayerNoticeList';
  const {
    page,
    list: feedList,
    refreshing,
    loading,
    isLast,
    listParamReset,
  } = useSelector(selector => selector[listName]);
  const action = communityFavPlayerNoticeListAction;

  // list
  const [size, setSize] = useState(100);

  // search
  const [keyword, setKeyword] = useState('');
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [searched, setSearched] = useState(false);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------

  const getFeedList = async () => {
    try {
      const params = {
        userIdx,
        page,
        size,
        keyword: searchedKeyword,
      };
      const { data } = await apiGetHolderCommunityNoticeList(params);
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
    }
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }
    }, 0);
  };

  const searching = () => {
    setSearchedKeyword(keyword);
    setSearched(prev => !prev);
  };

  const onRefresh = async () => {
    // if (flatListRef.current) {
    //   flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    // }
    dispatch(action.refresh());
  };

  const onFocus = async () => {
    try {
      if (paramReset || listParamReset) {
        dispatch(action.reset());
        setSearched();
        setSearchedKeyword();
        setKeyword();
        dispatch(action.setListParamReset(false));
        if (!listParamReset) {
          NavigationService.navigate(navName.communityFavPlayerNotice);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const clearKeyword = () => {
    setKeyword('');
    setSearchedKeyword('');
    onRefresh();
  };

  const handleDelete = useCallback(deletedItemId => {
    onRefresh();
  }, []);

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      setHeaderProps({
        noLeftButton: false,
        onPressLeftBtn: () => {
          NavigationService.navigate(navName.communityFavPlayer);
        },
      });
      backHandlerUtils.addDefaultBackHandlerEvent();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, [paramReset, listParamReset]),
  );

  useEffect(() => {
    if (!paramReset && !listParamReset) {
      onRefresh();
    }
  }, [searched, paramReset, listParamReset]);

  useEffect(() => {
    if (!paramReset && !listParamReset) {
      if (refreshing || (!refreshing && page > 1)) {
        getFeedList();
      }
    }
  }, [page, refreshing, paramReset, listParamReset]);

  const renderHeader = useMemo(() => {
    return (
      <Header
        title="SOL11"
        leftIconColor={COLORS.white}
        onLeftIconPress={() => {
          NavigationService.navigate(navName.communityFavPlayer);
        }}
        headerContainerStyle={{
          backgroundColor: '#080910',
          paddingTop: insets.top,
          paddingHorizontal: 20,
        }}
        headerTextStyle={{
          color: '#FFC433',
        }}
      />
    );
  }, []);

  const renderFilterButtons = useMemo(() => {
    return (
      <View style={styles.filterContainer}>
        <ScrollView
          contentContainerStyle={styles.filterWrapper}
          // horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View
            hitSlop={20}
            activeOpacity={ACTIVE_OPACITY}
            style={[
              styles.filterButton,
              {
                backgroundColor: '#FFC433',
                borderColor: '#FFC433',
              },
            ]}>
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: COLORS.black,
                },
              ]}>
              공지사항
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }, []);

  const renderFeedItem = useCallback(
    ({ item }) => {
      return (
        <FeedItem
          item={item}
          onDelete={handleDelete}
          isLogin={isLogin}
          fromFavPlayer
          notice
        />
      );
    },
    [feedList, handleDelete, isLogin],
  );

  const renderSearchInput = useMemo(() => {
    return (
      <View style={styles.searchContainer}>
        <SPSvgs.Search width={20} height={20} fill="#2E313599" />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.searchInput}
            value={keyword}
            onChangeText={e => {
              if (e?.length > 50) return;
              setKeyword(e);
            }}
            placeholder="검색어를 입력해주세요"
            placeholderTextColor="rgba(46, 49, 53, 0.60)"
            autoCorrect={false}
            autoCapitalize="none"
            onSubmitEditing={searching}
            returnKeyType="search"
          />
          {keyword && (
            <Pressable
              hitSlop={14}
              onPress={clearKeyword}
              style={styles.clearButton}>
              <SPSvgs.CloseCircleFill width={20} height={20} />
            </Pressable>
          )}
        </View>
      </View>
    );
  }, [keyword]);

  const renderFeedItems = useMemo(() => {
    return (
      <View style={styles.communityContainer}>
        {renderSearchInput}
        {feedList && feedList.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={feedList}
            keyExtractor={item =>
              typeof item?.feedIdx === 'string'
                ? `key${item?.feedIdx}`
                : item?.feedIdx
            }
            renderItem={renderFeedItem}
            ItemSeparatorComponent={<Divider />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  onRefresh();
                }}
              />
            }
            onEndReached={() => {
              loadMoreProjects();
            }}
            onEndReachedThreshold={0.5}
          />
        ) : loading ? (
          <SPLoading />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text>게시글이 존재하지 않습니다.</Text>
          </View>
        )}
      </View>
    );
  }, [renderSearchInput, feedList, loading, keyword, refreshing, isLogin]);

  return (
    <DismissKeyboard>
      <View style={styles.container}>
        {/* Header */}
        {renderHeader}

        {/* 커뮤니티 Button Group */}
        {renderFilterButtons}

        {/* List Feeds */}
        {renderFeedItems}
      </View>
    </DismissKeyboard>
  );
}

export default memo(CommunityFavPlayerNotice);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080910',
  },
  filterWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    // columnGap: 8,
    gap: 8,
  },
  communityContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  filterContainer: {
    // paddingVertical: 16,
  },
  filterButton: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    minHeight: 22,
    justifyContent: 'center',
  },
  filterButtonText: {
    ...fontStyles.fontSize13_Medium,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  wrtieBtn: {
    position: 'absolute',
    zIndex: 999,
    bottom: 16,
    right: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.peach,
    columnGap: 4,
    padding: 8,
    borderRadius: 10,
    height: 48,
  },
  searchInput: {
    ...fontStyles.fontSize14_Medium,
    letterSpacing: 0.2,
    color: COLORS.labelNormal,
    height: 36,
    width: '100%',
    top: IS_IOS ? -2 : 2,
  },
  inputAndClearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    paddingRight: 30,
  },
  clearButton: {
    position: 'absolute',
    right: 8,
  },
  headerRightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#19191D',
    ...Platform.select({
      android: {
        // elevation: 5, // Android only
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 2,
          height: 4, // offset is only applied on Y-axis as per your CSS box-shadow
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
    }),
  },
});
