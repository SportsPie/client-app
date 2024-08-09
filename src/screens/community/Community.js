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
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  apiGetCommunityOpen,
  apiGetCommunityOpenFilters,
  apiGetMyInfo,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
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
import { communityListAction } from '../../redux/reducers/list/communityListSlice';
import { store } from '../../redux/store';

function Community({ route }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef();
  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const paramReset = route?.params?.paramReset;

  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const {
    page,
    list: feedList,
    refreshing,
    loading,
    isLast,
    listParamReset,
  } = useSelector(selector => selector.communityList);
  const action = communityListAction;
  const [userInfo, setUserInfo] = useState(null);
  const [showWriteButton, setShowWriteButton] = useState(false);

  const [isInit, setIsInit] = useState(true);
  const [isFocus, setIsFocus] = useState(true);

  // list
  const [size, setSize] = useState(300);

  const [filterList, setFilterList] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState();

  // search
  const [keyword, setKeyword] = useState('');
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [searched, setSearched] = useState(false);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------

  const getUserInfo = async () => {
    if (!isLogin) {
      setShowWriteButton(false);
      setIsInit(false);
      return;
    }
    try {
      const { data } = await apiGetMyInfo();

      if (data) {
        setUserInfo(data.data);
        setShowWriteButton(true);
      }
    } catch (error) {
      handleError(error);
    }
    setIsInit(false);
  };

  const getFilterList = async () => {
    try {
      const { data } = await apiGetCommunityOpenFilters();
      let etc = null;
      const list = data.data
        .map(item => {
          if (item.codeSub === 'ETC') {
            etc = item;
            return null;
          }
          return { label: item.codeName, value: item.codeSub };
        })
        .filter(item => item);

      list.unshift({ label: '전체글', value: null });
      if (etc) {
        list.push({ label: etc.codeName, value: etc.codeSub });
      }
      setFilterList(list);
    } catch (error) {
      handleError(error);
    }
  };

  const getFeedList = async () => {
    try {
      const params = {
        userIdx: userInfo?.userIdx,
        page,
        size,
        keyword: searchedKeyword,
        tag: selectedFilter,
      };
      const { data } = await apiGetCommunityOpen(params);
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState().communityList.list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState().communityList.page;
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
        setIsFocus(true);
        dispatch(action.reset());
        setIsInit(true);
        setSelectedFilter();
        setSearched();
        setSearchedKeyword();
        setKeyword();
        dispatch(action.setListParamReset(false));
        if (!listParamReset) {
          NavigationService.navigate(navName.community);
        }
      } else {
        await getFilterList();
        setIsFocus(false);
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
      onFocus();
    }, [paramReset, listParamReset]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus && !paramReset && !listParamReset) {
        getUserInfo();
      }
    }, [isFocus, paramReset, listParamReset]),
  );

  useEffect(() => {
    if (!isInit && !paramReset && !listParamReset) {
      onRefresh();
    }
  }, [searched, selectedFilter, isInit, paramReset, listParamReset]);

  useEffect(() => {
    if (!paramReset && !listParamReset && filterList && filterList.length > 0) {
      setSelectedFilter(selectedFilter || filterList?.[0].value);
    }
  }, [filterList, paramReset, listParamReset]);

  useEffect(() => {
    if (!paramReset && !listParamReset) {
      if ((!isInit && refreshing) || (!refreshing && page > 1)) {
        setSearchedKeyword('');
        getFeedList();
      }
    }
  }, [page, isInit, refreshing, paramReset, listParamReset]);

  const renderHeader = useMemo(() => {
    return (
      <Header
        title="커뮤니티"
        hideLeftIcon
        headerContainerStyle={{
          backgroundColor: COLORS.darkBlue,
          paddingTop: insets.top,
        }}
        headerTextStyle={{
          color: COLORS.white,
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
          {filterList &&
            filterList.length > 0 &&
            filterList.map((item, index) => {
              return (
                <Pressable
                  hitSlop={20}
                  activeOpacity={ACTIVE_OPACITY}
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        selectedFilter === item.value
                          ? COLORS.orange
                          : COLORS.fillStrong,
                      borderColor:
                        selectedFilter === item.value
                          ? COLORS.orange
                          : COLORS.lineBorder,
                    },
                  ]}
                  onPress={() => setSelectedFilter(item.value)}>
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color:
                          selectedFilter === item.value
                            ? COLORS.white
                            : '#A7ACB399',
                      },
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
        </ScrollView>
      </View>
    );
  }, [selectedFilter]);

  const renderFeedItem = useCallback(
    ({ item }) => {
      return <FeedItem item={item} onDelete={handleDelete} isLogin={isLogin} />;
    },
    [(feedList, handleDelete)],
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
  }, [
    renderSearchInput,
    feedList,
    loading,
    keyword,
    selectedFilter,
    refreshing,
  ]);

  return (
    <DismissKeyboard>
      <View style={styles.container}>
        {/* Header */}
        {renderHeader}

        {/* 커뮤니티 Button Group */}
        {renderFilterButtons}

        {/* List Feeds */}
        {renderFeedItems}

        {showWriteButton && (
          <Pressable
            style={styles.wrtieBtn}
            onPress={() => {
              NavigationService.navigate(navName.communityWrite);
            }}>
            <Image source={SPIcons.icCommunityWrite} />
          </Pressable>
        )}
      </View>
    </DismissKeyboard>
  );
}

export default memo(Community);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBlue,
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
});
