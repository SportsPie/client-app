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
import { useSelector } from 'react-redux';
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

function Community() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef();
  const isLogin = useSelector(selector => selector.auth)?.isLogin;

  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const [userInfo, setUserInfo] = useState(null);
  const [showWriteButton, setShowWriteButton] = useState(false);

  const [isInit, setIsInit] = useState(true);
  const [isFocus, setIsFocus] = useState(true);

  // list
  const [size, setSize] = useState(30);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedList, setFeedList] = useState([]);

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
      setSelectedFilter(list?.[0].value);
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
      setTotalCnt(data.data.totalCnt);
      setIsLast(data.data.isLast);
      if (page === 1) {
        setFeedList(data.data.list);
      } else {
        setFeedList(prev => [...prev, ...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
    setLoading(false);
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const searching = () => {
    setSearchedKeyword(keyword);
    setSearched(prev => !prev);
  };

  const onRefresh = async () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    setPage(1);
    setFeedList([]);
    setLoading(true);
    setIsLast(false);
    setRefreshing(true);
  };

  const onFocus = async () => {
    try {
      await getFilterList();
      setIsFocus(false);
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
      return () => {
        setIsFocus(true);
        setFeedList([]);
        setIsLast(false);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus) {
        getUserInfo();
      }
    }, [isFocus]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isInit) {
        onRefresh();
      }
    }, [searched, selectedFilter, isInit]),
  );

  useEffect(() => {
    if (!isInit && refreshing) {
      setRefreshing(false);
      getFeedList();
    }
  }, [page, isInit, refreshing]);

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
          horizontal
          showsHorizontalScrollIndicator={false}>
          {filterList &&
            filterList.length > 0 &&
            filterList.map((item, index) => {
              return (
                <TouchableOpacity
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
                </TouchableOpacity>
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
              setKeyword(e);
            }}
            placeholder="검색어를 입력해주세요"
            placeholderTextColor="rgba(46, 49, 53, 0.60)"
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={50}
            onSubmitEditing={searching}
            returnKeyType="search"
          />
          {keyword && (
            <Pressable
              hitSlop={8}
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
            keyExtractor={item => item?.feedIdx}
            renderItem={renderFeedItem}
            ItemSeparatorComponent={<Divider />}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={onRefresh} />
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
  }, [renderSearchInput, feedList, loading, keyword, selectedFilter]);

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
    paddingHorizontal: 16,
    columnGap: 8,
  },
  communityContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  filterContainer: {
    paddingVertical: 16,
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
    height: 36,
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
  },
  clearButton: {
    position: 'absolute',
    right: 8,
  },
});
