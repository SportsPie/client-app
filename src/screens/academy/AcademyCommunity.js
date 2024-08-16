/* eslint-disable react/no-unstable-nested-components */
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import SPIcons from '../../assets/icon';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import Utils from '../../utils/Utils';
import { handleError } from '../../utils/HandleError';
import {
  apiGetCommunityOpen,
  apiGetCommunityOpenFilters,
  apiGetMyInfo,
  apiPatchCommunityLike,
  apiPatchCommunityUnLike,
} from '../../api/RestAPI';
import SPLoading from '../../components/SPLoading';
import DismissKeyboard from '../../components/DismissKeyboard';
import moment from 'moment';
import { IS_YN } from '../../common/constants/isYN';
import AcademyJoinModal from './AcademyJoinModal';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '../../components/header';
import { academyCommunityListAction } from '../../redux/reducers/list/academyCommunityListSlice';
import { store } from '../../redux/store';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';

// 커뮤니티 이미지 슬라이드
function CarouselSection({ challengeData, openImageModal, setSelectedImage }) {
  const screenWidth = Dimensions.get('window').width;
  const aspectRatio = 16 / 9; // 이미지의 원본 비율
  const minHeight = 200; // 최소 높이
  const calculatedHeight = screenWidth / aspectRatio; // 디바이스 크기에 비례하는 높이
  const dynamicHeight = Math.max(minHeight, calculatedHeight);
  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => {
        setSelectedImage(item.fileUrl);
        openImageModal();
      }}>
      <Image
        source={{ uri: item.fileUrl }}
        style={[
          styles.image,
          styles.subBackgroundImage,
          { height: dynamicHeight },
        ]}
        resizeMethod="resize"
        resizeMode="cover"
      />
    </Pressable>
  );
  return (
    <Carousel
      // sliderWidth={screenWidth}
      // itemWidth={screenWidth - (challengeData?.length > 1 ? 52 : 52 / 2)}
      sliderWidth={SCREEN_WIDTH}
      itemWidth={SCREEN_WIDTH - 16 - 8}
      data={challengeData}
      renderItem={renderItem}
      activeSlideAlignment="start"
      inactiveSlideScale={1}
      inactiveSlideOpacity={0.7}
      // contentContainerStyle={{ paddingHorizontal: 16 }}
      slideStyle={{ paddingRight: 8 }}
      enableMomentum={true}
      vertical={false} // 수직 슬라이드 비활성화
      decelerationRate="fast"
    />
  );
}

function AcademyCommunity({ route }) {
  const dispatch = useDispatch();
  /**
   * state
   */
  const listName = 'academyCommunityList';
  const {
    page,
    list: feedList,
    refreshing,
    loading,
    isLast,
    listParamReset,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = academyCommunityListAction;

  const flatListRef = useRef();
  const insets = useSafeAreaInsets();

  const [userInfo, setUserInfo] = useState(null);
  const academyIdx = route?.params.academyIdx;
  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWriteButton, setShowWriteButton] = useState(false);
  const [showOptionButton, setShowOptionButton] = useState(false);

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

  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdminFeed, setIsAdminFeed] = useState(false);
  const [isMyFeed, setIsMyFeed] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [isJoined, setIsJoined] = useState(false);

  const [imageModalShow, setImageModalShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [changeEvent, setChangeEvent] = useState(false);

  const userIdx = route?.params.userIdx;
  /**
   * api
   */

  const getUserInfo = async () => {
    if (!isLogin) {
      setShowWriteButton(false);
      setShowOptionButton(false);
      setIsInit(false);
      return;
    }
    try {
      const { data } = await apiGetMyInfo();
      if (
        academyIdx === data.data.academyIdx &&
        (data.data.academyAdmin || data.data.academyCreator)
      ) {
        setIsAdmin(true);
      }
      if (
        academyIdx === data.data.academyIdx &&
        (data.data.academyMember ||
          data.data.academyAdmin ||
          data.data.academyCreator)
      ) {
        setShowWriteButton(true);
        setShowOptionButton(true);
      } else {
        setShowWriteButton(false);
        setShowOptionButton(false);
      }
      if (data) {
        setUserInfo(data.data);
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
        academyIdx,
        userIdx: userInfo?.userIdx || userIdx,
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
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  const changeLike = async item => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
      });
      return;
    }
    if (item.isLike) {
      await apiPatchCommunityUnLike(item.feedIdx);
      // eslint-disable-next-line no-param-reassign
      item.cntLike -= 1;
    } else {
      await apiPatchCommunityLike(item.feedIdx);
      // eslint-disable-next-line no-param-reassign
      item.cntLike += 1;
    }
    // eslint-disable-next-line no-param-reassign
    item.isLike = !item.isLike;
    dispatch(
      action.modifyItem({
        idxName: 'feedIdx',
        idx: item.feedIdx,
        item,
      }),
    );
  };

  /**
   * function
   */
  const openModal = item => {
    setIsMyFeed(item.isMine);
    setIsAdminFeed(item.isAcademyCreator || item.isAcademyAdmin);
    setSelectedItem(item);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const openImageModal = () => {
    setImageModalShow(true);
  };

  const closeImageModal = () => {
    setImageModalShow(false);
  };

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

  // refresh & focus
  const onRefresh = async () => {
    // if (flatListRef.current) {
    //   flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    // }
    dispatch(action.refresh());
  };

  const onFocus = async () => {
    try {
      if (!noParamReset || listParamReset) {
        setIsFocus(true);
        dispatch(action.reset());
        setIsInit(true);
        setSelectedFilter();
        setSearched();
        setSearchedKeyword();
        setKeyword();
        setIsJoined(false);
        setIsInit(true);
        if (!listParamReset) {
          NavigationService.replace(navName.academyCommunity, {
            ...(route?.params || {}),
            noParamReset: true,
          });
        }
      } else {
        await getFilterList();
        setIsFocus(false);
      }
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * useEffect
   */

  useEffect(() => {
    onFocus();
  }, [noParamReset, listParamReset]);

  useEffect(() => {
    if (!isFocus && noParamReset && !listParamReset) {
      getUserInfo();
    }
  }, [isFocus, isJoined, noParamReset, listParamReset]);

  useEffect(() => {
    if (!isInit && noParamReset && !listParamReset) {
      onRefresh();
    }
  }, [
    searched,
    selectedFilter,
    isInit,
    changeEvent,
    noParamReset,
    listParamReset,
  ]);

  useEffect(() => {
    if (
      noParamReset &&
      !listParamReset &&
      filterList &&
      filterList.length > 0
    ) {
      setSelectedFilter(selectedFilter || filterList?.[0].value);
    }
  }, [filterList, noParamReset, listParamReset]);

  useEffect(() => {
    if (noParamReset && !listParamReset) {
      if ((!isInit && refreshing) || (!refreshing && page > 1)) {
        getFeedList();
      }
    }
  }, [page, isInit, refreshing, noParamReset, listParamReset]);

  return (
    <DismissKeyboard>
      <SafeAreaView style={styles.container}>
        <Header title="커뮤니티" />
        {/* 커뮤니티 Button Group */}
        <View style={styles.searchBox}>
          <Image
            source={SPIcons.icSearchGray}
            style={{ width: 20, height: 20 }}
          />
          <TextInput
            style={styles.textInput}
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
        </View>
        <View style={styles.buttonBox}>
          {filterList &&
            filterList.length > 0 &&
            filterList.map((item, index) => {
              return (
                <Pressable
                  hitSlop={{
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                  }}
                  key={index}
                  style={[
                    styles.button,
                    selectedFilter === item.value && styles.activeButton,
                  ]}
                  onPress={() => setSelectedFilter(item.value)}>
                  <Text
                    style={[
                      styles.buttonText,
                      selectedFilter === item.value && styles.activeButtonText,
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
        </View>
        <View style={styles.communityContainer}>
          {feedList && feedList.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={feedList}
              ListFooterComponent={
                loading
                  ? () => {
                      return (
                        <ActivityIndicator
                          size="small"
                          style={{ marginVertical: 20 }}
                        />
                      );
                    }
                  : null
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onEndReached={() => {
                loadMoreProjects();
              }}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) => {
                return (
                  <View style={styles.communityBox}>
                    {/* 게시글 상단 정보 */}
                    <View style={styles.communityTitle}>
                      <View style={styles.communityLeft}>
                        <View style={styles.iconContainer}>
                          {item.profilePath ? (
                            <Image
                              source={{ uri: item.profilePath }}
                              style={styles.icon}
                            />
                          ) : (
                            <Image
                              source={SPIcons.icPerson}
                              style={styles.icon}
                            />
                          )}
                          {item.isAcademyCreator && (
                            <Image
                              source={SPIcons.icSuperAdmin}
                              style={styles.overlayIcon}
                            />
                          )}
                          {!item.isAcademyCreator && item.isAcademyAdmin && (
                            <Image
                              source={SPIcons.icAdmin}
                              style={styles.overlayIcon}
                            />
                          )}
                        </View>
                        <View style={{ flexShrink: 1, flexGrow: 1 }}>
                          <Text style={styles.name}>{item.userNickname}</Text>
                          <Text style={styles.dateCreated}>
                            {moment(item.regDate).format('YYYY.MM.DD')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.communityRight}>
                        {item.topYn === IS_YN.Y && (
                          <Image
                            source={SPIcons.icPinFill}
                            style={{ width: 24, height: 24 }}
                          />
                        )}
                        {item.topYn === IS_YN.Y
                          ? isAdmin && (
                              <Pressable
                                hitSlop={{
                                  top: 12,
                                  bottom: 12,
                                  left: 12,
                                  right: 12,
                                }}
                                onPress={() => {
                                  openModal(item);
                                }}>
                                {/* <Image source={SPIcons.icOptionsVertical} /> */}
                                <SPSvgs.EllipsesVertical />
                              </Pressable>
                            )
                          : showOptionButton && (
                              <Pressable
                                hitSlop={{
                                  top: 12,
                                  bottom: 12,
                                  left: 12,
                                  right: 12,
                                }}
                                onPress={() => {
                                  openModal(item);
                                }}>
                                <Image source={SPIcons.icOptionsVertical} />
                              </Pressable>
                            )}
                      </View>
                    </View>

                    {/* 내용 */}
                    <Pressable
                      onPress={() => {
                        NavigationService.navigate(
                          navName.academyCommunityDetail,
                          { feedIdx: item.feedIdx, academyIdx },
                        );
                      }}>
                      <Text style={styles.communityText}>{item.contents}</Text>
                    </Pressable>
                    {/* 이미지 슬라이드 */}
                    {item.files && item.files.length > 0 && (
                      <View>
                        <CarouselSection
                          challengeData={item.files}
                          openImageModal={openImageModal}
                          setSelectedImage={setSelectedImage}
                        />
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}>
                      {item.tagsKo?.length > 0 &&
                        item.tagsKo.map((tag, index) => {
                          return (
                            // eslint-disable-next-line react/no-array-index-key
                            <View key={index} style={styles.communityTag}>
                              <Text style={styles.communityTagText}>
                                #{tag}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                    {/* 좋아요, 댓글 */}
                    <View style={styles.bottomBox}>
                      <TouchableOpacity
                        style={styles.bottomBtn}
                        onPress={() => {
                          changeLike(item);
                        }}>
                        <View>
                          <Image
                            source={
                              item.isLike
                                ? SPIcons.icFillHeart
                                : SPIcons.icGrayHeart
                            }
                          />
                        </View>
                        <Text style={styles.number}>
                          {Utils.changeNumberComma(item.cntLike)}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.bottomBtn}
                        onPress={() => {
                          NavigationService.navigate(
                            navName.academyCommunityDetail,
                            { feedIdx: item.feedIdx, academyIdx },
                          );
                        }}>
                        <View>
                          <Image source={SPIcons.icChatBubble} />
                        </View>
                        <Text style={styles.number}>
                          {Utils.changeNumberComma(item.cntComment)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
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
          {/* 수정 */}
          <SPMoreModal
            visible={modalVisible}
            onClose={closeModal}
            isAdmin={isAdmin}
            type={MODAL_MORE_TYPE.FEED}
            idx={selectedItem?.feedIdx}
            targetUserIdx={selectedItem?.userIdx}
            onDelete={() => {
              dispatch(action.refresh());
            }}
            onConfirm={() => {
              setChangeEvent(prev => !prev);
            }}
            adminButtons={
              isMyFeed
                ? [
                    MODAL_MORE_BUTTONS.EDIT,
                    MODAL_MORE_BUTTONS.REMOVE,
                    isAdminFeed
                      ? selectedItem?.topYn === IS_YN.Y
                        ? MODAL_MORE_BUTTONS.UNFIX
                        : MODAL_MORE_BUTTONS.FIX
                      : null,
                  ]
                : [MODAL_MORE_BUTTONS.REMOVE]
            }
            memberButtons={
              isMyFeed
                ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
                : [MODAL_MORE_BUTTONS.REPORT]
            }
          />
        </View>

        <AcademyJoinModal academyIdx={academyIdx} setIsJoined={setIsJoined} />

        {/* 미소속일때는 글쓰기 버튼 숨겨짐 */}
        {/* 글쓰기 버튼 */}
        {showWriteButton && (
          <TouchableOpacity
            style={styles.wrtieBtn}
            onPress={() => {
              NavigationService.navigate(navName.communityWrite, {
                academyIdx,
              });
            }}>
            <Image source={SPIcons.icCommunityWrite} />
          </TouchableOpacity>
        )}
        <Modal
          animationType="fade"
          transparent
          visible={imageModalShow}
          onRequestClose={closeImageModal}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <View
              style={{
                marginTop: insets.top,
              }}>
              <TouchableOpacity
                onPress={closeImageModal}
                style={{
                  width: '100%',
                  height: 60,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}>
                <Image
                  source={SPIcons.icNavCancleWhite}
                  style={[{ height: 28, width: 28 }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.searchContainer} />
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                  }}
                />
              )}
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(AcademyCommunity);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EE',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  textInput: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
    width: '100%',
    margin: 0,
    paddingRight: 32,
    paddingVertical: 0,
  },
  image: {
    width: '100%',
    borderRadius: 12,
  },
  buttonBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(167, 172, 179, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  activeButton: {
    backgroundColor: '#FF7C10',
  },
  activeButtonText: {
    color: '#FFF',
  },
  communityContainer: {
    flex: 1,
  },
  communityBox: {
    flexDirection: 'column',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.16)',
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overlayIcon: {
    position: 'absolute',
    width: 16,
    height: 16,
    bottom: 0,
    right: 0,
  },
  communityTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  communityLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flexShrink: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
    marginBottom: 2,
  },
  dateCreated: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  communityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  communityTag: {
    backgroundColor: '#E6E9F1',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  communityTagText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#002672',
    lineHeight: 16,
  },
  communityText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  subBackgroundImage: {
    minWidth: 304,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bottomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  number: {
    minWidth: 14,
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  // wrtieBtn: {
  //   position: 'absolute',
  //   right: 16,
  //   bottom: 16,
  //   backgroundColor: 'white', // 배경색 지정
  //   borderRadius: 50,
  //   ...Platform.select({
  //     ios: {
  //       shadowColor: '#000',
  //       shadowOffset: { width: 0, height: 2 },
  //       shadowOpacity: 0.3,
  //       shadowRadius: 4,
  //     },
  //     android: {
  //       elevation: 4,
  //     },
  //   }),
  // },
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
  applyBtn: {
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
};
