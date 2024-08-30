/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unstable-nested-components */
import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import Swiper from 'react-native-swiper';
import {
  apiGetChallengeList,
  apiGetTrainingList,
  apiPatchBannerViewCnt,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import SPImages from '../../assets/images';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { navName } from '../../common/constants/navName';
import SPLoading from '../../components/SPLoading';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import ListEmptyView from '../../components/ListEmptyView';
import { useDispatch, useSelector } from 'react-redux';
import { matchingHistoryListAction } from '../../redux/reducers/list/matchingHistoryListSlice';
import { trainingListAction } from '../../redux/reducers/list/trainingListSlice';
import { challengeListAction } from '../../redux/reducers/list/challengeListSlice';
import { store } from '../../redux/store';
import { masterDetailAction } from '../../redux/reducers/list/masterDetailSlice';
import { challengeDetailAction } from '../../redux/reducers/list/challengeDetailSlice';

// 기초튼튼 훈련 Carousel 슬라이드 컴포넌트
function BasicCarousel({ listData = [] }) {
  const screenWidth = Dimensions.get('window').width;

  let imageWidth;
  let dynamicHeight;

  // 스크린 너비가 480 이하일 경우
  if (screenWidth <= 480) {
    imageWidth = 144; // 고정 너비
    const aspectRatio = 4 / 3; // 세로 길이가 더 긴 4:3 비율
    dynamicHeight = imageWidth * aspectRatio; // 너비에 따른 동적 높이 계산
  }
  // 스크린 너비가 480 초과일 경우
  else {
    imageWidth = screenWidth * 0.4; // 화면 너비의 40%를 슬라이드 너비로 설정
    const aspectRatio = 4 / 3;
    dynamicHeight = imageWidth * aspectRatio; // 너비에 따른 동적 높이 계산
  }

  // 렌더 컴포넌트
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        key={`program-detail-${item.groupIdx}-${
          typeof item.trainingIdx === 'string'
            ? `${item.trainingIdx}key`
            : item.trainingIdx
        }`}
        activeOpacity={ACTIVE_OPACITY}
        onPress={() => {
          NavigationService.navigate(navName.trainingDetail, {
            trainingIdx: item.trainingIdx,
          });
        }}>
        <ImageBackground
          source={
            item.thumbPath ? { uri: item.thumbPath } : SPImages.challengeImage
          }
          alt={`program-img-${item.trainingIdx}`}
          style={[
            styles.image,
            styles.subBackgroundImage,
            { height: dynamicHeight, width: imageWidth },
          ]}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.gradient}>
            <View style={styles.trainingDetailList}>
              <View style={styles.trainingDetailItem}>
                <Image source={SPIcons.icView} />
                <Text style={styles.trainingDetailText}>
                  {Utils.changeNumberComma(item.cntView)}
                </Text>
              </View>
              <View style={styles.trainingDetailItem}>
                <Image source={SPIcons.icHeart} />
                <Text style={styles.trainingDetailText}>
                  {Utils.changeNumberComma(item.cntLike)}
                </Text>
              </View>
            </View>
            <View style={styles.trainingInfo}>
              <Text
                style={styles.trainingInfoTitle}
                numberOfLines={2}
                ellipsizeMode="tail">
                {item.trainingName}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ overflow: 'hidden' }}>
      <Carousel
        sliderWidth={screenWidth}
        itemWidth={imageWidth + 8}
        data={listData}
        renderItem={renderItem}
        activeSlideAlignment="start"
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        slideStyle={{ paddingRight: 8 }}
        vertical={false} // 수직 슬라이드 비활성화
        loop={false}
        enableMomentum={true}
        decelerationRate={0.9}
      />
    </View>
  );
}

// 챌린지 컴포넌트
function TrainingChallenge({ challenge }) {
  const screenWidth = Dimensions.get('window').width;
  let imageHeight;

  // 화면 너비에 따른 이미지 높이 동적 계산
  if (screenWidth <= 480) {
    imageHeight = 185; // 고정된 높이
  } else {
    const aspectRatio = 16 / 9; // 가로:세로 비율 설정 (예제로 16:9 사용)
    imageHeight = screenWidth / aspectRatio; // 화면 너비에 따라 비율 유지하며 높이 계산
  }

  // [ util ]
  const moveToChallengeDetail = idx => {
    NavigationService.navigate(navName.challengeDetail, {
      videoIdx: idx,
    });
  };

  // [ return ]
  return (
    <TouchableOpacity
      onPress={() => moveToChallengeDetail(challenge.videoIdx)}
      activeOpacity={ACTIVE_OPACITY}>
      <ImageBackground
        source={{ uri: challenge.thumbPath }}
        style={[
          styles.image,
          styles.subBackgroundImage,
          { height: imageHeight, width: '100%' }, // 너비를 100%로 설정하여 화면 폭에 맞춤
        ]}>
        <View style={styles.usersBox}>
          <View>
            <Image source={SPIcons.icUsers} />
          </View>
          <Text style={styles.subText}>
            {Utils.changeNumberComma(challenge.cntVideo)}
          </Text>
        </View>
      </ImageBackground>
      <View style={styles.subDetailContainer}>
        <Text style={styles.subDetailTitle}>{challenge.title}</Text>
        <View style={styles.subDetailList}>
          <View style={styles.subDetailItem}>
            <Image source={SPIcons.icChallengPlay} />
            <Text style={styles.subDetailText}>
              {Utils.changeNumberComma(challenge.cntView)}
            </Text>
          </View>
          <View style={styles.subDetailItem}>
            <Image source={SPIcons.icChallengHeart} />
            <Text style={styles.subDetailText}>
              {Utils.changeNumberComma(challenge.cntLike)}
            </Text>
          </View>
          <View style={styles.subDetailItem}>
            <Image source={SPIcons.icChallengComment} />
            <Text style={styles.subDetailText}>
              {Utils.changeNumberComma(challenge.cntComment)}
            </Text>
          </View>
          <Text style={styles.subDetailText}>
            {Utils.formatTimeAgo(challenge.regDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// 탭 컴포넌트 (기초튼튼 훈련, 챌린지)
function TabButton({ title, activeTab, setActiveTab }) {
  return (
    <TouchableOpacity
      activeOpacity={ACTIVE_OPACITY}
      style={[
        styles.tabButton,
        activeTab === title ? styles.activeTab : styles.inactiveTab,
      ]}
      onPress={() => setActiveTab(title)}>
      <Text
        style={[
          styles.tabText,
          activeTab === title ? styles.activeTabText : null,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// PIE 트레이닝 메인
function Training({ route }) {
  const dispatch = useDispatch();
  const listName = 'trainingList';
  const {
    bannerList, // 슬라이드 배너 리스트
    trainingObj: trainingObject,
    refreshing: trainingRefreshing,
    loading, // 트레이닝 로딩
  } = useSelector(selector => selector[listName]);
  const action = trainingListAction;

  const challengeListName = 'challengeList';
  const {
    list: challengeList,
    isLast,
    page: challengePage,
    refreshing: challengeRefreshing,
    loading: challengeLoading, // 트레이닝 로딩
    pagingKey,
  } = useSelector(selector => selector[challengeListName]);
  const challengeAction = challengeListAction;

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const imageHeight = width <= 480 ? 141 : (width * 9) / 16;

  // [ ref ]
  const challengeListRef = useRef(); // 챌린지 리스트 Ref

  // [ state ]
  const activeTab = route.params?.activeTab || '기초튼튼 훈련';
  const paramReset = route.params?.paramReset;

  const paddingTop = Platform.OS === 'ios' ? insets.top : 14;

  // [ util ] 외부 링크 열기 ( with 브라우저 )
  const openExternalLink = async url => {
    if (url) {
      const fullUrl =
        url.includes('http://') || url.includes('https://')
          ? url
          : `https://${url}`;

      await Linking.openURL(fullUrl);
    }
  };

  // [ util ] 챌린지 새로고침 ( with Key 갱신 )
  const onRefreshChallenge = () => {
    dispatch(challengeAction.refresh());
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[challengeListName].page;
        dispatch(challengeAction.setPage(prevPage + 1));
      }
    }, 0);
  };

  // [ util ] 챌린지 렌더
  const renderChallengeItem = useCallback(
    ({ item, index }) => {
      return (
        <TrainingChallenge key={`challenge-list-${index}`} challenge={item} />
      );
    },
    [challengeList],
  );

  // [ api ] 기초튼튼 훈련 리스트 조회
  const getTrainingList = async () => {
    try {
      const { data } = await apiGetTrainingList();

      if (data) {
        dispatch(action.setBannerList(data.data.banner));
        dispatch(action.setTrainingObj(data.data.trainingList));
      }

      dispatch(action.setLoading(false));
    } catch (error) {
      handleError(error);
      dispatch(action.setRefreshing(false));
      dispatch(action.setLoading(false));
    }
  };

  // [ api ] 챌린지 리스트 조회
  const getChallengeList = async () => {
    try {
      const { data } = await apiGetChallengeList({
        page: challengePage,
        size: 30,
        pagingKey,
      });

      if (data) {
        dispatch(challengeAction.setIsLast(data.data.isLast));

        if (challengePage === 1) {
          dispatch(challengeAction.setList(data.data.list));
        } else {
          const prevList = store.getState()[challengeListName].list;
          dispatch(challengeAction.setList([...prevList, ...data.data.list]));
        }
      }
    } catch (error) {
      handleError(error);
    }
    dispatch(challengeAction.setRefreshing(false));
    dispatch(challengeAction.setLoading(false));
  };

  // [ api ] 배너 조회수 갱신
  const patchBannerViewCnt = async idx => {
    await apiPatchBannerViewCnt(idx);
  };

  const handleTabChange = tab => {
    NavigationService.navigate(navName.training, {
      activeTab: tab,
      paramReset,
    });
  };

  useEffect(() => {
    if (paramReset) {
      dispatch(action.reset());
      dispatch(challengeAction.reset());
      dispatch(masterDetailAction.allReset());
      dispatch(challengeDetailAction.allReset());
      NavigationService.navigate(navName.training, {
        activeTab,
        paramReset: false,
      });
      onRefreshChallenge();
    }
  }, [paramReset]);

  useEffect(() => {
    if (!paramReset) {
      getTrainingList();
    }
  }, [paramReset, trainingRefreshing]);

  // [ useEffect ] 챌린지 페이징
  useEffect(() => {
    if (!paramReset) {
      if (challengeRefreshing || (!challengeRefreshing && challengePage > 1)) {
        getChallengeList();
      }
    }
  }, [challengePage, challengeRefreshing, paramReset]);

  // [ return ]
  return (
    <View style={[styles.container]}>
      {/* 헤더 */}
      <Header
        title="PIE 트레이닝"
        hideLeftIcon
        headerContainerStyle={{
          backgroundColor: COLORS.darkBlue,
          paddingTop,
          paddingBottom: 14,
        }}
        headerTextStyle={{
          color: COLORS.white,
        }}
      />
      <View style={[styles.background]} />
      {/* 트레이닝 Button Group */}
      <View style={[styles.trainingBox]}>
        {/* Tab */}
        <View style={styles.tabButtonBox}>
          <TabButton
            title="기초튼튼 훈련"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
          <TabButton
            title="챌린지"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
        </View>
        <View style={{ flex: 1, position: 'relative' }}>
          {/* Tab > 기초튼튼 훈련 */}
          <View
            style={[
              {
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              },
              activeTab === '기초튼튼 훈련'
                ? { zIndex: 1 }
                : { zIndex: 0, opacity: 0 },
            ]}>
            {loading ? (
              <SPLoading />
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}>
                <View>
                  {/* 슬라이드 배너 */}
                  {bannerList.length > 0 && (
                    <View style={(styles.swiperBox, { height: imageHeight })}>
                      <Swiper
                        style={{ height: imageHeight }}
                        showsButtons={false}
                        autoplay
                        autoplayTimeout={5}
                        scrollEventThrottle={16} // 스크롤 이벤트를 16ms 마다 처리
                        decelerationRate="fast" // 스크롤 감속률을 빠르게 설정
                        paginationStyle={{
                          justifyContent: 'flex-start',
                          position: 'absolute',
                          left: 32,
                          bottom: 16,
                          paddingVertical: 8,
                        }}
                        dotStyle={{
                          backgroundColor: '#FFF',
                          opacity: 0.4,
                          width: 12,
                          height: 3,
                          marginHorizontal: 2,
                          marginVertical: 2.5,
                        }}
                        activeDotStyle={{
                          backgroundColor: '#FFF',
                          width: 24,
                          height: 3,
                        }}>
                        {/* 슬라이드 배너 > 리스트 */}
                        {bannerList.map((banner, index) => {
                          return (
                            <TouchableOpacity
                              key={`banner-list-${index}`}
                              style={[styles.slide, { height: imageHeight }]}
                              activeOpacity={ACTIVE_OPACITY}
                              onPress={() => {
                                openExternalLink(banner.linkUrl);
                                patchBannerViewCnt(banner.boardIdx);
                              }}>
                              <Image
                                source={
                                  banner.filePath
                                    ? { uri: banner.filePath }
                                    : SPImages.homeTownAcademy
                                }
                                style={styles.image}
                                alt={`slice-img-${index + 1}`}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </Swiper>
                    </View>
                  )}

                  {/* 기초튼튼 훈련 > 카테고리 리스트 */}
                  {Object.keys(trainingObject).length > 0 &&
                    Object.keys(trainingObject).map((key, index) => {
                      return (
                        <View
                          key={`training-list-category-${index}`}
                          style={[styles.trainingSubBox]}>
                          <Text style={styles.trainingSubTitle}>{key}</Text>
                          <View>
                            <BasicCarousel
                              listData={[...trainingObject[key]]}
                            />
                          </View>
                        </View>
                      );
                    })}
                </View>
              </ScrollView>
            )}
          </View>

          {/* 챌린지 Tab */}
          <View
            style={[
              styles.challenge,
              activeTab === '챌린지'
                ? { zIndex: 1 }
                : { zIndex: 0, opacity: 0 },
            ]}>
            {challengeList && challengeList.length > 0 ? (
              <FlatList
                style={{ flex: 1 }}
                ref={challengeListRef}
                data={challengeList}
                renderItem={renderChallengeItem}
                onEndReached={loadMoreProjects}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{ gap: 16 }}
                ListFooterComponent={
                  challengeLoading
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
                  <RefreshControl
                    refreshing={challengeRefreshing}
                    onRefresh={onRefreshChallenge}
                  />
                }
              />
            ) : challengeLoading ? (
              <SPLoading />
            ) : (
              <ListEmptyView text="챌린지 영상이 존재하지 않습니다." />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default memo(Training);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFF',
    backgroundColor: COLORS.darkBlue,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  background: {
    // paddingBottom: 28,
    backgroundColor: '#313779',
  },
  trainingBox: {
    flex: 1,
    position: 'relative',
    // top: -28,
    // borderRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFF',
  },
  tabButtonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 4,
    backgroundColor: '#FFE1D2',
    borderRadius: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.28)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  activeTab: {
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  activeTabText: {
    color: '#FF7C10',
  },
  swiperBox: {
    marginBottom: 0,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  trainingSubBox: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  trainingSubTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 28,
    letterSpacing: -0.24,
    marginBottom: 16,
  },
  subBackgroundImage: {
    minWidth: 144,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    height: '100%', // 그라데이션의 높이를 조정하여 텍스트 영역만 커버하도록 설정
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  trainingDetailList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  trainingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    borderRadius: 4,
    padding: 2,
  },
  trainingDetailText: {
    fontSize: 11,
    fontWeight: 400,
    color: '#FFF',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  trainingInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  trainingInfoTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  challenge: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  usersBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    borderRadius: 4,
    padding: 2,
    margin: 16,
  },
  subText: {
    fontSize: 11,
    fontWeight: 400,
    color: '#FFF',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  subDetailContainer: {
    padding: 8,
  },
  subDetailTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    marginBottom: 8,
  },
  subDetailList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  subDetailText: {
    fontSize: 11,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
});
