/* eslint-disable react/no-array-index-key */
import { useFocusEffect, useRoute } from '@react-navigation/native';
import moment from 'moment/moment';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import Swiper from 'react-native-swiper';
import { useSelector } from 'react-redux';
import {
  apiGetArticleDetail,
  apiGetHomeInit,
  apiGetHomeOpen,
  apiGetNoticesDetail,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import SPImages from '../../assets/images';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { navName } from '../../common/constants/navName';
import MainPopup from '../../components/MainPopup';
import SPLoading from '../../components/SPLoading';
import { SPToast } from '../../components/SPToast';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { getFcmToken } from '../../utils/FirebaseMessagingService';
import GeoLocationUtils from '../../utils/GeoLocationUtils';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';

// 아카데미 소개
const introductionData = [
  {
    key: '0',
    image: SPImages.objectsImage,
    title: '아카데미',
    text: '내 주변에 있는 아카데미를\n한눈에 확인하세요',
    navName: navName.academyMember,
  },
  {
    key: '1',
    image: SPImages.objectsImage1,
    title: '대회',
    text: '스포츠파이의 대회를\n만나보세요',
    navName: navName.matchingSchedule,
    navParams: { activeTab: '대회', paramReset: true },
  },
  {
    key: '2',
    image: SPImages.objectsImage2,
    title: '경기매칭',
    text: '나와 맞는 상대를 찾아\n즐겨운 경기를 즐겨보세요',
    navName: navName.matchingSchedule,
    navParams: { activeTab: '매칭', paramReset: true },
  },
  {
    key: '3',
    image: SPImages.objectsImage3,
    title: 'PIE 트레이닝',
    text: '전문적인 코칭과 함께\n실력을 향상시켜 보세요',
    navName: navName.training,
    navParams: { activeTab: '기초튼튼 훈련', paramReset: true },
  },
];

// 핫한 챌린지
function CarouselSection({ challengeData }) {
  const { width: screenWidth } = useWindowDimensions();
  const aspectRatio = 16 / 9; // 이미지의 원본 비율
  const minHeight = 198; // 최소 높이
  const calculatedHeight = screenWidth / aspectRatio; // 디바이스 크기에 비례하는 높이
  const dynamicHeight = Math.max(minHeight, calculatedHeight);
  const challengePage = videoIdx => {
    // 여기서 NavigationService.navigate로 이동하고 videoIdx를 보냄
    NavigationService.navigate(navName.challengeDetail, { videoIdx });
  };
  const getDaysAgo = date => {
    return moment(date, 'YYYY-MM-DD').fromNow(); // 오늘과의 차이를 문자열로 반환
  };
  const renderItem = ({ item }) => (
    <Pressable onPress={() => challengePage(item.videoIdx)}>
      <ImageBackground
        source={{ uri: item.thumbPath }}
        style={[
          styles.image,
          styles.subBackgroundImage,
          { height: dynamicHeight },
        ]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)']}
          style={styles.gradient}>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeInfoTitle}>{item.title}</Text>
          </View>
          <View style={styles.challengeDetailList}>
            <View style={styles.challengeDetailItem}>
              <Image source={SPIcons.icPlay} />
              <Text style={styles.challengeDetailText}>{item.cntView}</Text>
            </View>
            <View style={styles.challengeDetailItem}>
              <Image source={SPIcons.icHeart} />
              <Text style={styles.challengeDetailText}>{item.cntLike}</Text>
            </View>
            <View style={styles.challengeDetailItem}>
              <Image source={SPIcons.icComment} />
              <Text style={styles.challengeDetailText}>{item.cntComment}</Text>
            </View>
            <Text style={styles.challengeDetailText}>
              {getDaysAgo(item.regDate)}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
  return (
    <Carousel
      sliderWidth={screenWidth}
      itemWidth={screenWidth - 40}
      data={challengeData}
      renderItem={renderItem}
      activeSlideAlignment="center"
      inactiveSlideScale={1}
      inactiveSlideOpacity={0.7}
      slideStyle={{ paddingHorizontal: 8 }}
      vertical={false} // 수직 슬라이드 비활성화
      enableMomentum={true}
      decelerationRate={0.9}
      loop={true}
      autoplay={true}
      autoplayInterval={5000}
    />
  );
}

function Home() {
  const route = useRoute();
  const mainPopupRef = useRef();
  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const { width, height } = useWindowDimensions();
  const aspectRatio = 16 / 9;
  const dynamicHeight = Math.max(144, Math.min(300, width / 3));
  // const hometownHeight = Math.max(156, width / 3);
  const imageHeight = width <= 480 ? 225 : (width * 9) / 16;
  const subImageHeight = width > 480 ? Math.max(91, width / 4) : 91;
  const magazineHeight = width <= 480 ? 225 : width / aspectRatio;
  const [homeTownData, setHomeTownData] = useState([]);
  const [magazineData, setMagazineData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [images, setImages] = useState([]);
  const [slidesData, setSlidesData] = useState([]);
  const [challengeData, setChallengeData] = useState([]);
  const [popupData, setPopupData] = useState([]);
  const [hasGeoLocationPermission, setHasGeoLocationPermission] =
    useState(false);
  const [init, setInit] = useState(false);
  const moreChallenge = () => {
    NavigationService.navigate(navName.training, {
      activeTab: '챌린지',
      paramReset: true,
    });
  };

  const calculateMargin = index => {
    const marginStyle = {};
    if (index % 2 === 0) {
      marginStyle.marginRight = 8;
    }
    if (index < 2) {
      marginStyle.marginBottom = 8;
    }
    return marginStyle;
  };

  const homeTownMargin = index => {
    const marginStyle = {};
    if (index % 2 === 0) {
      marginStyle.marginRight = 16;
    }
    if (index < 2) {
      marginStyle.marginBottom = 16;
    }
    return marginStyle;
  };
  async function homePage() {
    try {
      const hasPermission = await GeoLocationUtils.checkPermission(true);
      let locationData = {
        latitude: null,
        longitude: null,
      };
      setHasGeoLocationPermission(hasPermission);
      if (hasPermission) {
        const location = await GeoLocationUtils.getLocation();
        locationData = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }

      let response;
      if (isLogin) {
        response = await apiGetHomeInit({
          ...locationData,
        });
      } else {
        response = await apiGetHomeOpen({
          ...locationData,
        });
      }
      setHomeTownData(
        hasPermission ? response.data.data.academyList4Nearby || [] : [],
      );
      setMagazineData(response.data.data.article);
      setNewsData(response.data.data.notice);
      setSlidesData(response.data.data.tournament);
      setChallengeData(response.data.data.videoList);
    } catch (error) {
      handleError(error);
    }
    setInit(true);
  }

  async function homeBanner() {
    try {
      const hasPermission = await GeoLocationUtils.checkPermission(true);
      let locationData = {
        latitude: null,
        longitude: null,
      };
      setHasGeoLocationPermission(hasPermission);
      if (hasPermission) {
        const location = await GeoLocationUtils.getLocation();
        locationData = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }

      let response;
      if (isLogin) {
        response = await apiGetHomeInit({
          ...locationData,
        });
      } else {
        response = await apiGetHomeOpen({
          ...locationData,
        });
      }
      setImages(response.data.data.banner);
      setPopupData(response.data.data.popup);
    } catch (error) {
      handleError(error);
    }
    setInit(true);
  }

  useFocusEffect(
    useCallback(() => {
      homeBanner();
      return () => {
        setInit(false);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      homePage();
    }, []),
  );

  const articlePage = async article => {
    try {
      NavigationService.navigate(navName.moreArticleDetail, {
        boardIdx: article.boardIdx,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const noticePage = async notice => {
    try {
      NavigationService.navigate(navName.moreNoticeDetail, {
        boardIdx: notice.boardIdx,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const academyPage = async academy => {
    NavigationService.navigate(navName.academyDetail, {
      academyIdx: academy.academyIdx,
    });
  };
  const bannerWebPress = img => {
    if (img.linkUrl) {
      // If linkUrl exists, open WebView
      Utils.openOrMoveUrl(img.linkUrl);
    }
  };

  const tournamentWebPress = slide => {
    if (slide.linkUrl) {
      // If linkUrl exists, open WebView
      Utils.openOrMoveUrl(slide.linkUrl);
    }
  };

  if (!init) return <SPLoading />;

  return (
    init && (
      <SafeAreaView edges={['top']} style={styles.container}>
        {/* 헤더 */}
        <Header headerType="HOME" />

        {/* <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            NavigationService.navigate(navName.test);
          }}>
          <Image source={SPImages.mainLogo} />
        </TouchableOpacity>
        <View style={styles.iconBox}>
          <Image source={SPIcons.icAlret} style={styles.icon} />
          <TouchableOpacity
            onPress={() => {
              NavigationService.navigate(navName.moreMyInfo);
            }}>
            <Image
              source={SPIcons.icMenuBtn}
              style={[styles.icon, styles.lastIcon]}
            />
          </TouchableOpacity>
        </View>
      </View> */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 메인 이미지 */}
          <View style={styles.swiperBox}>
            <View style={{ height: imageHeight }}>
              {images && images.length > 0 ? (
                <Swiper
                  style={{ height: imageHeight }}
                  showsButtons={false}
                  autoplay
                  autoplayTimeout={5}
                  scrollEventThrottle={16} // 스크롤 이벤트를 16ms 마다 처리
                  decelerationRate="fast" // 스크롤 감속률을 빠르게 설정
                  removeClippedSubviews={false}
                  paginationStyle={{
                    justifyContent: 'flex-start',
                    position: 'absolute',
                    left: 16,
                    bottom: 36,
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
                  {images.map((img, index) => (
                    <Pressable
                      onPress={() => bannerWebPress(img)}
                      key={index}
                      style={[styles.slide, { height: imageHeight }]}>
                      <Image
                        source={{ uri: img.filePath }}
                        style={styles.image}
                      />
                    </Pressable>
                  ))}
                </Swiper>
              ) : (
                <View style={{ height: imageHeight }} />
              )}
            </View>
          </View>

          {/* 아카데미 소개 */}
          <View style={styles.introduction}>
            <FlatList
              data={introductionData}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <ImageBackground
                  source={item.image}
                  style={[
                    styles.introductionBox(dynamicHeight),
                    calculateMargin(index),
                  ]}>
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={{ flex: 1 }}
                    onPress={() => {
                      if (item.navName)
                        NavigationService.navigate(
                          item.navName,
                          item.navParams ?? {},
                        );
                    }}>
                    <Text style={styles.introductionTitle}>{item.title}</Text>
                    <Text style={styles.introductionText}>{item.text}</Text>
                  </TouchableOpacity>
                </ImageBackground>
              )}
              keyExtractor={item => item.key}
              numColumns={2}
            />
          </View>
          {/* 우리 동네 아카데미 */}
          {hasGeoLocationPermission && (
            <View style={styles.homeTown}>
              <View style={[styles.topBox, { paddingHorizontal: 0 }]}>
                <Text style={styles.topTitle}>우리 동네 아카데미</Text>
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  onPress={() => {
                    NavigationService.navigate(navName.academyMember);
                  }}
                  style={styles.moreBtn}>
                  <Text style={styles.topBtn}>모두 보기</Text>
                </TouchableOpacity>
              </View>
              {homeTownData?.length > 0 ? (
                <View>
                  <FlatList
                    data={
                      homeTownData.length % 2 === 1
                        ? [...homeTownData, { isEmpty: true }]
                        : homeTownData
                    }
                    scrollEnabled={false}
                    renderItem={({ item, index }) => (
                      <ImageBackground
                        source={{
                          uri: item?.logoPath ? item.logoPath : item.thumbPath,
                        }}
                        style={[
                          styles.contentsBox,
                          styles.homeContentsBox,
                          { height: dynamicHeight },
                          homeTownMargin(index),
                          item.isEmpty && { backgroundColor: 'transparent' },
                        ]}>
                        {!item.isEmpty && (
                          <View
                            style={{
                              ...styles.imageOverlay,
                              backgroundColor: 'rgba(0, 0, 0, 0.38)',
                              flex: 1,
                            }}>
                            <Pressable onPress={() => academyPage(item)}>
                              <View style={styles.homeTownBox}>
                                <View style={styles.homeTownDistance}>
                                  <Text style={styles.homeTownDistanceText}>
                                    {Utils.addDistanceUnit(item.distance)}
                                  </Text>
                                </View>
                                <Text
                                  style={styles.homeTownText}
                                  numberOfLines={1} // 한 줄로 제한
                                  ellipsizeMode="tail">
                                  {item.academyName}
                                </Text>
                              </View>
                            </Pressable>
                          </View>
                        )}
                      </ImageBackground>
                    )}
                    keyExtractor={(item, index) =>
                      item.academyIdx || `empty-${index}`
                    }
                    numColumns={2}
                  />
                </View>
              ) : (
                // 아카데미 없을때 보여짐
                <View style={styles.noneAcademy}>
                  <Image
                    source={SPIcons.icMap}
                    style={{ width: 80, height: 80 }}
                  />
                  <View>
                    <Text style={styles.noneAcademyText}>
                      주변에 아카데미가 없어요.
                    </Text>
                    <Text style={styles.noneAcademyText}>
                      아카데미를 검색해보세요.
                    </Text>
                  </View>
                  <Pressable
                    style={styles.searchBtn}
                    onPress={() =>
                      NavigationService.navigate(navName.searchAcademy)
                    }>
                    <Text style={styles.searchBtnText}>아카데미 검색하기</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
          {/* 대회 일정 */}
          <View style={styles.swiperBackgroundContainer}>
            {slidesData && slidesData.length > 0 && (
              <Swiper
                style={{ height: subImageHeight }}
                showsButtons={false}
                autoplay
                autoplayTimeout={5}
                scrollEventThrottle={16} // 스크롤 이벤트를 16ms 마다 처리
                decelerationRate="fast" // 스크롤 감속률을 빠르게 설정
                paginationStyle={{
                  justifyContent: 'center',
                  position: 'absolute',
                  bottom: -24,
                  paddingVertical: 8,
                }}
                dotStyle={{
                  backgroundColor: '#000',
                  opacity: 0.4,
                  width: 12,
                  height: 3,
                  marginHorizontal: 2,
                  marginVertical: 2.5,
                }}
                activeDotStyle={{
                  backgroundColor: '#313779',
                  width: 24,
                  height: 3,
                }}>
                {slidesData.map((slide, index) => (
                  <Pressable
                    key={index}
                    onPress={() => tournamentWebPress(slide)}
                    style={[styles.slide, { height: subImageHeight }]}>
                    <ImageBackground
                      source={{ uri: slide.filePath }}
                      style={styles.image}>
                      <View
                        style={{
                          ...styles.imageOverlay,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          flex: 1,
                        }}>
                        <View style={styles.swiperBackgroundBox}>
                          <Text style={styles.swiperBackgroundTitle}>
                            {slide.title}
                          </Text>
                          <Text style={styles.swiperBackgroundText}>
                            {slide.contents}
                          </Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </Pressable>
                ))}
              </Swiper>
            )}
          </View>
          {/* 지금 핫한 챌린지 */}
          <View style={[styles.common, { paddingHorizontal: 0 }]}>
            {Object.keys(challengeData).map(category => (
              <View key={category}>
                <View
                  style={[
                    styles.topBox,
                    { paddingHorizontal: 16, marginTop: 48 },
                  ]}>
                  <Text style={styles.topTitle}>{`#${category}`}</Text>
                  <TouchableOpacity
                    onPress={moreChallenge}
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.moreBtn}>
                    <Text style={styles.topBtn}>모두 보기</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <CarouselSection challengeData={challengeData[category]} />
                </View>
              </View>
            ))}
          </View>
          {/* 스포츠 꿀팁 매거진 */}
          <View style={styles.common}>
            <View style={[styles.topBox, { marginBottom: 20 }]}>
              <Text style={styles.topTitle}>#스포츠 꿀팁 매거진</Text>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => {
                  NavigationService.navigate(navName.moreArticle);
                }}
                style={styles.moreBtn}>
                <Text style={styles.topBtn}>모두 보기</Text>
              </TouchableOpacity>
            </View>
            <View>
              <FlatList
                data={
                  magazineData.length % 2 === 1
                    ? [...magazineData, { isEmpty: true }]
                    : magazineData
                }
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View style={[styles.contentsBox, homeTownMargin(index)]}>
                    {item.isEmpty ? (
                      <View
                        style={{
                          height: magazineHeight,
                          backgroundColor: 'transparent',
                        }}
                      />
                    ) : (
                      <Pressable onPress={() => articlePage(item)}>
                        <View
                          style={[
                            styles.contentsImage,
                            { height: magazineHeight },
                          ]}>
                          <ImageBackground
                            source={{ uri: item.filePath }}
                            style={[styles.image, styles.magazineImageBox]}>
                            <LinearGradient
                              colors={['transparent', 'rgba(0,0,0,0.35)']}
                              style={styles.gradient}>
                              <View style={styles.magazineTitleBox}>
                                <Text
                                  numberOfLines={2}
                                  ellipsizeMode="tail"
                                  style={styles.magazineTitle}>
                                  {item.title}
                                </Text>
                              </View>
                            </LinearGradient>
                          </ImageBackground>
                        </View>
                        <Text
                          style={styles.magazineText}
                          numberOfLines={2}
                          ellipsizeMode="tail">
                          {item.contents}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
                keyExtractor={item => item.boardIdx}
                numColumns={2}
              />
            </View>
          </View>

          {/* 최신소식 */}
          <View style={styles.common}>
            <View style={[styles.topBox, { marginBottom: 8 }]}>
              <Text style={styles.topTitle}>스포츠파이 최신소식</Text>
              <Pressable
                onPress={() => {
                  NavigationService.navigate(navName.moreNotice);
                }}
                style={styles.moreBtn}>
                <Text style={styles.topBtn}>모두 보기</Text>
              </Pressable>
            </View>
            <FlatList
              data={newsData}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.newsTitle,
                    index === newsData.length - 1
                      ? { borderBottomWidth: 0 }
                      : {},
                  ]}>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => noticePage(item)}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={styles.newsText}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.title}
                      </Text>
                      <Text style={styles.newsDate}>
                        {moment(item?.regDate).format('YYYY.MM.DD')}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
              keyExtractor={item => item.boardIdx}
              horizontal={false} // 수평 스크롤 여부 결정
            />
          </View>
        </ScrollView>

        {/* Main Popup */}
        {Array.isArray(popupData) && popupData.length > 0 && (
          <MainPopup ref={mainPopupRef} data={popupData} />
        )}
      </SafeAreaView>
    )
  );
}

export default memo(Home);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconBox: {
    flexDirection: 'row',
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 16,
  },
  lastIcon: {
    marginRight: 0,
  },
  swiperBox: {
    marginBottom: 0,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  introduction: {
    position: 'relative',
    top: -28,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFF',
  },
  introductionBox: height => ({
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    backgroundColor: '#F1F5FF',
    minHeight: 144,
    height, // 동적 높이
  }),
  introductionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  introductionText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#757078',
    marginBottom: 8,
  },
  introductionIconBox: {
    flex: 1,
    alignItems: 'flex-end', // 아이콘을 오른쪽 끝으로 정렬
  },
  introductionIcon: {
    width: 40,
    height: 40, // 아이콘 크기 설정
  },
  homeTown: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  topBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  topBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: '#757078',
    lineHeight: 24,
    letterSpacing: 0.203,
  },
  homeContentsBox: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  contentsBox: {
    flex: 1,
  },
  contentsImage: {
    marginBottom: 12,
  },
  contentsText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#171719',
    lineHeight: 22,
    letterSpacing: 0.144,
    marginBottom: 8,
  },
  homeTownBox: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 16,
  },
  homeTownDistance: {
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4,
  },
  homeTownDistanceText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  homeTownText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  swiperBackgroundContainer: {
    paddingTop: 24,
  },
  swiperBackgroundBox: {
    height: '100%',
    minHeight: 93,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 16,
  },
  swiperBackgroundTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 4,
  },
  swiperBackgroundText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#FFF',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  common: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  challengeBox: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subBackgroundImage: {
    minWidth: 304,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    height: '50%', // 그라데이션의 높이를 조정하여 텍스트 영역만 커버하도록 설정
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  challengeInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  challengeInfoTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  challengeDetailList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  challengeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  challengeDetailText: {
    fontSize: 11,
    fontWeight: 400,
    color: '#FFF',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  magazineImageBox: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  magazineTitleBox: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 10,
  },
  magazineTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  magazineText: {
    fontSize: 13,
    fontWeight: 500,
    color: '#171719',
    lineHeight: 18,
    letterSpacing: 0.252,
    marginBottom: 12,
  },
  newsTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(112, 115, 124, 0.08)',
  },
  newsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: '#121212',
    lineHeight: 20,
  },
  newsDate: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.60)',
    lineHeight: 18,
  },
  noneAcademy: {
    height: 328,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  noneAcademyText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  searchBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  searchBtnText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  moreBtn: {
    paddingVertical: 10,
  },
});
