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
  Platform,
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
  apiGetCommunityNoticeLast,
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
import SPImages from '../../assets/images';

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
  const [showFavPlayerButton, setShowFavPlayerButton] = useState(false);

  const [isInit, setIsInit] = useState(true);
  const [isFocus, setIsFocus] = useState(true);

  const [communityNotice, setCommunityNotice] = useState();

  // list
  const [size, setSize] = useState(100);

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
        setShowFavPlayerButton(data.data.holderYn === 'Y');
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

  const getNoticeLast = async () => {
    try {
      const { data } = await apiGetCommunityNoticeLast();
      setCommunityNotice(data.data);
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
    getNoticeLast();
    dispatch(action.refresh());
  };

  const onFocus = async () => {
    try {
      if (paramReset || listParamReset) {
        setIsFocus(true);
        dispatch(action.reset());
        setCommunityNotice();
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
        await getNoticeLast();
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
          paddingHorizontal: 20,
        }}
        headerTextStyle={{
          color: COLORS.white,
        }}
        {...(showFavPlayerButton
          ? {
              rightContent: (
                <Pressable
                  style={[styles.headerRightButton]}
                  onPress={() => {
                    NavigationService.navigate(navName.communityFavPlayer, {
                      paramReset: true,
                    });
                  }}>
                  <Image
                    source={SPImages.solMark}
                    style={{ width: 24, height: 24 }}
                  />
                  <Text
                    style={{
                      ...fontStyles.fontSize14_Bold,
                      color: '#E6E9F1',
                    }}>
                    SOL11
                  </Text>
                </Pressable>
              ),
            }
          : {})}
      />
    );
  }, [userInfo, showFavPlayerButton]);

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
                          : COLORS.fillMoreStrong,
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
                            : 'rgba(167, 172, 179, 0.60)',
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

  const renderCommunityNotice = useMemo(() => {
    if (!communityNotice) return;
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          NavigationService.navigate(navName.communityDetails, {
            feedIdx: communityNotice?.feedIdx,
          });
        }}
        style={styles.noticeWrap}>
        <View style={styles.noticeBox}>
          <View style={styles.noticeTextBox}>
            <Text style={styles.noticeText}>공지</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.noticeContents}>
              {communityNotice?.contents}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            hitSlop={20}
            onPress={e => {
              e.stopPropagation();
              NavigationService.navigate(navName.communityNotice, {
                paramReset: true,
              });
            }}>
            <Text style={styles.moreText}>More</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [communityNotice]);

  const renderFeedItems = useMemo(() => {
    return (
      <View style={styles.communityContainer}>
        {renderSearchInput}
        {renderCommunityNotice}
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
    communityNotice,
    isLogin,
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
    backgroundColor: '#002672',
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
    backgroundColor: '#1E3D7A',
    ...Platform.select({
      android: {
        elevation: 5, // Android only
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
  noticeWrap: {
    marginTop: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E6E9F1',
  },
  noticeBox: {
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeTextBox: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderColor: '#FF7C10',
    backgroundColor: COLORS.white,
  },
  noticeText: {
    ...fontStyles.fontSize13_Semibold,
    color: '#FF7C10',
  },
  noticeContents: {
    ...fontStyles.fontSize14_Medium,
    color: '#000',
  },
  moreText: {
    ...fontStyles.fontSize14_Regular,
    color: 'rgba(46, 49, 53, 0.60)',
  },
});
