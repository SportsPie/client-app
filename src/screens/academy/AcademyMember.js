import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/ko';
import React, { memo, useCallback, useState, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Linking,
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Swiper from 'react-native-swiper';
import { useSelector } from 'react-redux';
import {
  apiDeleteAcademyJoin,
  apiGetAcademyInit,
  apiGetAcademyOpen,
  apiPatchBannerViewCnt,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { SPSvgs } from '../../assets/svg';
import { ACADEMY_MEMBER_TYPE } from '../../common/constants/academyMemberType';
import { MATCH_GENDER } from '../../common/constants/matchGender';
import { MATCH_STATE } from '../../common/constants/matchState';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { navName } from '../../common/constants/navName';
import { RECRUIT_PAGE_TYPE } from '../../common/constants/recruitPageType';
import SPLoading from '../../components/SPLoading';
import { SPToast } from '../../components/SPToast';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import GeoLocationUtils from '../../utils/GeoLocationUtils';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IS_YN } from '../../common/constants/isYN';
import fontStyles from '../../styles/fontStyles';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { isBefore } from 'date-fns';
import SPImages from '../../assets/images';

// 경기 일정
function MatchingBox({ data }) {
  const title = data?.title;
  const gender = MATCH_GENDER[data?.genderCode]?.desc;
  const currentDate = new Date();

  const isMatchOver = isBefore(
    new Date(`${data.matchDate} ${data.matchTime}`),
    currentDate,
  );

  const isMatchClose = isBefore(new Date(data.closeDate), currentDate);

  const getStatusStyle = matchState => {
    switch (matchState) {
      case MATCH_STATE.APPLY.code:
        if (isMatchClose) {
          return {
            backgroundColor: 'rgba(255, 66, 66, 0.16)',
            color: '#FF4242',
            desc: '경기취소',
          };
        }
        return {
          backgroundColor: 'rgba(255, 103, 31, 0.16)',
          color: '#FF7C10',
          desc: '경기예정',
        };
      case MATCH_STATE.REVIEW.code:
      case MATCH_STATE.CONFIRM.code:
        return {
          backgroundColor: 'rgba(135, 141, 150, 0.16)',
          color: 'rgba(46, 49, 53, 0.80)',
          desc: '경기완료',
        };
      case MATCH_STATE.READY.code:
        if (isMatchOver) {
          return {
            backgroundColor: 'rgba(50, 83, 255, 0.16)',
            color: '#3253FF',
            desc: '경기중',
          };
        }
        return {
          backgroundColor: 'rgba(36, 161, 71, 0.16)',
          color: '#24A147',
          desc: '경기대기',
        };
      case MATCH_STATE.FINISH.code:
      case MATCH_STATE.REJECT.code:
        return {
          backgroundColor: 'rgba(50, 83, 255, 0.16)',
          color: '#3253FF',
          desc: '경기중',
        };
      case MATCH_STATE.EXPIRE.code:
      case MATCH_STATE.CANCEL.code:
        return {
          backgroundColor: 'rgba(255, 66, 66, 0.16)',
          color: '#FF4242',
          desc: '경기취소',
        };
      default:
        return {};
    }
  };

  const date = `${data?.matchDate} ${data?.matchTime}`;
  const momentDate = moment(date);
  const newFormatString = momentDate.format('MMMM Do dddd A h:mm');
  const matchPlace = data?.matchPlace;
  const matchMethod = data?.matchMethod;
  const matchIdx = data?.matchIdx;
  return (
    <TouchableOpacity
      style={styles.matchingBox}
      onPress={() => {
        NavigationService.navigate(navName.matchingDetail, {
          matchIdx,
        });
      }}>
      <View style={styles.matchingPersonnel}>
        <View style={styles.matchingPersonnelBox}>
          <View style={styles.matchingGender}>
            <Text style={styles.matchingGenderText}>{gender}</Text>
          </View>
          <View style={styles.matchingNumber}>
            <Text style={styles.matchingNumberText}>
              {matchMethod == null
                ? '-'
                : matchMethod === 0
                ? '협의 후 결정'
                : `${matchMethod} : ${matchMethod}`}
            </Text>
          </View>
        </View>
        <View style={[styles.matchingStatus, getStatusStyle(data?.matchState)]}>
          <Text
            style={[
              styles.matchingStatusText,
              { color: getStatusStyle(data?.matchState).color },
            ]}>
            {getStatusStyle(data?.matchState).desc}
          </Text>
        </View>
      </View>
      <Text style={styles.matchingTitle} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      <View style={[styles.matchingDay, { marginBottom: 5 }]}>
        <Image source={SPIcons.icDate} style={styles.matchingDayIcon} />
        <Text style={styles.matchingDayText}>{newFormatString}</Text>
      </View>
      <View style={styles.matchingDay}>
        <Image source={SPIcons.icMarker} style={styles.matchingDayIcon} />
        <Text style={styles.matchingDayText}>{matchPlace}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CarouselSection({ data }) {
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = data.length > 1 ? screenWidth - 60 : screenWidth - 16;
  const renderItem = ({ item }) => <MatchingBox data={item} />;

  return (
    <Carousel
      sliderWidth={screenWidth}
      itemWidth={itemWidth}
      data={data}
      renderItem={renderItem}
      activeSlideAlignment="center"
      inactiveSlideScale={1}
      inactiveSlideOpacity={0.7}
      slideStyle={{ paddingHorizontal: 8 }}
      vertical={false}
    />
  );
}

function Academy({ navigation }) {
  /**
   * state
   */
  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const { width } = useWindowDimensions();
  const imageHeight = width <= 480 ? 225 : (width * 10) / 16;
  const dynamicHeight = Math.max(156, Math.min(300, width / 3));

  const [firstCall, setFirstCall] = useState(false);
  const [address, setAddress] = useState('');
  const [academyMemberType, setAcademyMemberType] = useState();
  const [notice, setNotice] = useState({}); // 공지
  const [bannerList, setBannerList] = useState([]); // 광고
  const [myAcademy, setMyAcademy] = useState(); // 내 아카데미
  const [waitAcademy, setWaitAcademy] = useState(); // 가입 대기 중인 아카데미
  const [matchScheduleList, setMatchScheduleList] = useState([]); // 경기일정
  const [nearbyAcademyList, setNearbyAcademyList] = useState([]); // 우리 동네 아카데미
  const [academyRecruitList, setAcademyRecruitList] = useState([]); // 아카데미 회원모집
  const [finishMatchList, setFinishMatchList] = useState([]); // 아카데미 관리자일 경우 종료된 경기 리뷰 등록 조회
  const [homeTownData, setHomeTownData] = useState([]);

  const trlRef = useRef({ current: { disabled: false } });
  const [refresh, setRefresh] = useState(false);

  // 'N' 항목들을 먼저 정렬
  const closeYNItemsN = academyRecruitList.filter(item => item.closeYn === 'N');

  // 'Y' 항목들을 그 다음에 정렬
  const closeYNItemsY = academyRecruitList.filter(item => item.closeYn === 'Y');

  // 'N' 항목들을 먼저, 그 다음에 'Y' 항목들을 추가하여 순서를 조정
  const sortedAcademyRecruitList = [...closeYNItemsN, ...closeYNItemsY];
  /**
   * api
   */
  const getAcademyMainData = async () => {
    try {
      const { latitude, longitude } = await GeoLocationUtils.getLocation();
      const resultAddr = await GeoLocationUtils.getAddress({
        latitude,
        longitude,
      });
      if (resultAddr) {
        const { city, gu, dong } = resultAddr;
        setAddress(`${city} ${gu}`);
      }
      const params = {
        latitude,
        longitude,
      };
      let academyMainData = null;
      if (isLogin) {
        academyMainData = await apiGetAcademyInit(params);
      } else {
        academyMainData = await apiGetAcademyOpen(params);
      }
      const {
        data: { data },
      } = academyMainData;
      if (isLogin) {
        if (data?.isAcademyAdmin || data?.isAcademyCreator) {
          setAcademyMemberType(ACADEMY_MEMBER_TYPE.ADMIN);
        } else if (data?.isAcademyMember) {
          setAcademyMemberType(ACADEMY_MEMBER_TYPE.MEMBER);
        } else {
          setAcademyMemberType(ACADEMY_MEMBER_TYPE.NO_MEMBER);
        }
      } else {
        setAcademyMemberType(ACADEMY_MEMBER_TYPE.NO_MEMBER);
      }

      // 배너
      setBannerList(data?.bannerList || []);

      // 내 아카데미(운영자, 회원(소속/미소속))
      setMyAcademy(data?.academy);
      setWaitAcademy(data?.waitAcademy);

      // 광고 공지(회원, 비회원)
      setNotice(data?.academyNotice?.[0] || {});

      // 경기일정(운영자, 소속회원)
      setMatchScheduleList(data?.matchList || []);

      // 우리 동네 아카데미(비회원, 미소속회원)
      setNearbyAcademyList(data?.nearbyList || []);

      // 아카데미 회원모집(전체)
      setAcademyRecruitList(data?.recruitList || []);

      // 리뷰(운영자)
      setFinishMatchList(data.finishMatchList || []);
    } catch (error) {
      if (error?.message?.includes('Location permission not granted')) {
        Utils.openModal({
          body: '위치 정보 조회 권한을 허용해주시기 바랍니다.',
          confirmEvent: MODAL_CLOSE_EVENT.goBack,
        });
      } else {
        handleError(error);
      }
    }
  };

  const cancelJoinAcademy = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiDeleteAcademyJoin(waitAcademy.academyIdx);
      setRefresh(prev => true);
      setTimeout(() => {
        SPToast.show({ text: '가입신청이 취소되었습니다.' });
      }, 0);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const patchBannerViewCnt = async idx => {
    await apiPatchBannerViewCnt(idx);
  };

  /**
   * function
   */
  const checkRecruitEndRender = item => {
    if (item.closeYn === IS_YN.Y || item.dday < 0) {
      return (
        <View style={[styles.recruitEndBox, { alignSelf: 'flex-start' }]}>
          <Text style={styles.recruitEndText}>모집종료</Text>
        </View>
      );
    }
    return (
      <View style={[styles.recruitingBox, { alignSelf: 'flex-start' }]}>
        <Text style={styles.recruitingText}>모집중</Text>
      </View>
    );
  };

  const homeTownMargin = index => {
    const marginStyle = {};
    if (index % 2 === 0) {
      marginStyle.marginRight = 16;
    }
    if (index) {
      marginStyle.marginBottom = 16;
    }
    return marginStyle;
  };

  const onFocus = async () => {
    try {
      await getAcademyMainData();
      setFirstCall(true);
    } catch (error) {
      handleError(error);
    }
    setRefresh(false);
  };

  const academyPage = async academy => {
    NavigationService.navigate(navName.academyDetail, {
      academyIdx: academy.academyIdx,
    });
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      return () => {
        setFirstCall(false);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, [isLogin, refresh]),
  );

  if (!firstCall || refresh) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <SPLoading />
      </View>
    );
  }

  return (
    firstCall && (
      <SafeAreaView edges={['top']} style={styles.container}>
        <Header
          title="아카데미"
          hideLeftIcon
          rightContent={
            <Pressable
              onPress={() => {
                NavigationService.navigate(navName.searchAcademy);
              }}
              style={{ padding: 10 }}>
              <SPSvgs.Search />
            </Pressable>
          }
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 아카데미 광고/공지 이미지 */}
          <View style={styles.swiperBox}>
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
              {bannerList &&
                bannerList.length > 0 &&
                bannerList.map((img, index) => {
                  return (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        if (img.linkUrl) {
                          Utils.openOrMoveUrl(img.linkUrl);
                          patchBannerViewCnt(img.boardIdx);
                        }
                      }}
                      key={index}
                      style={[styles.slide, { height: imageHeight }]}>
                      <Image
                        // resizeMode="cover"
                        source={{
                          uri: img.filePath,
                        }}
                        style={[styles.image]}
                      />
                    </TouchableOpacity>
                  );
                })}
            </Swiper>
          </View>
          {/* 아카데미 미소속 */}
          <View style={styles.noBelong}>
            {academyMemberType === ACADEMY_MEMBER_TYPE.NO_MEMBER &&
              !waitAcademy && (
                <View style={styles.noBelongDetail}>
                  {/* 아카데미 만들기 */}
                  <View style={styles.academyProduce}>
                    <Text style={styles.academyProduceTitle}>
                      원하는 아카데미를 찾지 못했나요?
                    </Text>
                    <View style={styles.academyProduceBox}>
                      <Text style={styles.academyProduceText}>
                        나에게 맞는 아카데미를 직접 운영해보세요
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          NavigationService.navigate(navName.academyRegist);
                        }}
                        style={styles.academyProduceBtn}>
                        <Text style={styles.buttonText}>아카데미 만들기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* 우리 동네 아카데미 */}
                  <View style={styles.academyAround}>
                    <View style={styles.topBox}>
                      <Text style={styles.topTitle}>우리 동네 아카데미</Text>
                      <TouchableOpacity
                        onPress={() => {
                          NavigationService.navigate(navName.nearbyAcademy);
                        }}
                        style={styles.moreBtn}>
                        <Text style={styles.topBtn}>모두 보기</Text>
                      </TouchableOpacity>
                    </View>
                    {/* {nearbyAcademyList && nearbyAcademyList.length > 0 && ( */}
                    {/*  <View style={styles.location}> */}
                    {/*    <Image */}
                    {/*      source={SPIcons.icMyLocation} */}
                    {/*      style={styles.locationIcon} */}
                    {/*    /> */}
                    {/*    <Text style={styles.locationText}>{address}</Text> */}
                    {/*  </View> */}
                    {/* )} */}
                    <View>
                      {nearbyAcademyList && nearbyAcademyList.length > 0 ? (
                        <FlatList
                          data={
                            nearbyAcademyList.length % 2 === 1
                              ? [
                                  ...nearbyAcademyList.slice(0, 3),
                                  { isEmpty: true },
                                ]
                              : nearbyAcademyList.slice(0, 4)
                          }
                          scrollEnabled={false}
                          renderItem={({ item, index }) => (
                            <ImageBackground
                              source={
                                item.thumbPath
                                  ? { uri: item.thumbPath }
                                  : SPImages.defaultAcademyThumb
                              }
                              style={[
                                styles.contentsBox,
                                styles.homeContentsBox,
                                { height: dynamicHeight },
                                homeTownMargin(index),
                                item.isEmpty && {
                                  backgroundColor: 'transparent',
                                },
                              ]}>
                              {!item.isEmpty && (
                                <View
                                  style={{
                                    ...styles.imageOverlay,
                                    backgroundColor: 'rgba(0, 0, 0, 0.38)',
                                    flex: 1,
                                  }}>
                                  <TouchableOpacity
                                    onPress={() => academyPage(item)}>
                                    <View style={styles.homeTownBox}>
                                      <View style={styles.homeTownDistance}>
                                        <Text
                                          style={styles.homeTownDistanceText}>
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
                                  </TouchableOpacity>
                                </View>
                              )}
                            </ImageBackground>
                          )}
                          keyExtractor={(item, index) =>
                            item.academyIdx || `empty-${index}`
                          }
                          numColumns={2}
                        />
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
                          <TouchableOpacity
                            style={styles.searchBtn}
                            onPress={() =>
                              NavigationService.navigate(navName.searchAcademy)
                            }>
                            <Text style={styles.searchBtnText}>
                              아카데미 검색하기
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
            {/* 가입신청 대기 */}
            {academyMemberType === ACADEMY_MEMBER_TYPE.NO_MEMBER &&
              waitAcademy && (
                <View style={styles.noBelongDetail}>
                  <View style={[styles.introduction, { marginHorizontal: 0 }]}>
                    <View style={styles.topBox}>
                      <Text style={styles.topTitle}>내 아카데미</Text>
                      <View>
                        <TouchableOpacity
                          onPress={() => {
                            NavigationService.navigate(navName.academyDetail, {
                              academyIdx: waitAcademy.academyIdx,
                            });
                          }}>
                          <View>
                            <Image source={SPIcons.icArrowRightNoraml} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.academyInfo}>
                      {waitAcademy?.logoPath ? (
                        <View style={styles.academyImg}>
                          <Image
                            source={{ uri: waitAcademy?.logoPath }}
                            style={styles.image}
                          />
                        </View>
                      ) : (
                        <View style={styles.academyImg}>
                          <Image
                            source={SPIcons.icMyAcademy}
                            style={styles.image}
                          />
                        </View>
                      )}

                      <View>
                        <Text style={styles.name}>
                          {waitAcademy.academyName}
                        </Text>
                        <View style={styles.academyTextBox}>
                          <Text style={styles.info}>
                            {waitAcademy.addrCity} · {waitAcademy.addrGu}
                          </Text>
                          {waitAcademy.rating !== null && (
                            <View style={styles.VerticalLine} />
                          )}
                          {waitAcademy.rating !== null && (
                            <View style={styles.review}>
                              <Image source={SPIcons.icStar} />
                              <Text style={styles.info}>
                                {parseFloat(waitAcademy.rating).toFixed()}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={e => {
                        cancelJoinAcademy();
                        e.stopPropagation();
                      }}
                      style={[styles.academyProduceBtn]}>
                      <Text
                        style={[styles.buttonText, { textAlign: 'center' }]}>
                        가입신청 취소
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* 우리 동네 아카데미 */}
                  {nearbyAcademyList && nearbyAcademyList.length > 0 && (
                    <View style={styles.academyAround}>
                      <View style={styles.topBox}>
                        <Text style={styles.topTitle}>우리 동네 아카데미</Text>
                        <TouchableOpacity
                          onPress={() => {
                            NavigationService.navigate(navName.nearbyAcademy);
                          }}>
                          <Text style={styles.topBtn}>모두 보기</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.location}>
                        <Image
                          source={SPIcons.icMyLocation}
                          style={styles.locationIcon}
                        />
                        <Text style={styles.locationText}>{address}</Text>
                      </View>
                      <View>
                        <FlatList
                          data={
                            nearbyAcademyList.length % 2 === 1
                              ? [
                                  ...nearbyAcademyList.slice(0, 4),
                                  { isEmpty: true },
                                ]
                              : nearbyAcademyList.slice(0, 4)
                          }
                          scrollEnabled={false}
                          renderItem={({ item, index }) => (
                            <ImageBackground
                              source={
                                item.thumbPath
                                  ? { uri: item.thumbPath }
                                  : SPImages.defaultAcademyThumb
                              }
                              style={[
                                styles.contentsBox,
                                styles.homeContentsBox,
                                { height: dynamicHeight },
                                homeTownMargin(index),
                                item.isEmpty && {
                                  backgroundColor: 'transparent',
                                },
                              ]}>
                              {!item.isEmpty && (
                                <View
                                  style={{
                                    ...styles.imageOverlay,
                                    backgroundColor: 'rgba(0, 0, 0, 0.38)',
                                    flex: 1,
                                  }}>
                                  <TouchableOpacity
                                    onPress={() => academyPage(item)}>
                                    <View style={styles.homeTownBox}>
                                      <View style={styles.homeTownDistance}>
                                        <Text
                                          style={styles.homeTownDistanceText}>
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
                                  </TouchableOpacity>
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
                    </View>
                  )}
                </View>
              )}
          </View>
          {/* 아카데미 소속 회원 */}
          {(academyMemberType === ACADEMY_MEMBER_TYPE.MEMBER ||
            academyMemberType === ACADEMY_MEMBER_TYPE.ADMIN) &&
            myAcademy && (
              <View>
                {/* 내 아카데미 */}
                <Pressable
                  style={styles.introduction}
                  onPress={() => {
                    NavigationService.navigate(navName.academyDetail, {
                      academyIdx: myAcademy?.academyIdx,
                    });
                  }}>
                  <View style={styles.topBox}>
                    <Text style={styles.topTitle}>내 아카데미</Text>
                    <View>
                      <View>
                        <Image source={SPIcons.icArrowRightNoraml} />
                      </View>
                    </View>
                  </View>
                  <View style={styles.academyInfo}>
                    {myAcademy?.logoPath ? (
                      <View style={styles.academyImg}>
                        <Image
                          source={{ uri: myAcademy.logoPath }}
                          style={styles.image}
                        />
                      </View>
                    ) : (
                      <View style={styles.academyImg}>
                        <Image
                          source={SPIcons.icMyAcademy}
                          style={styles.image}
                        />
                      </View>
                    )}
                    <View style={{ flexShrink: 1 }}>
                      <Text style={[styles.name]}>{myAcademy.academyName}</Text>
                      <View style={styles.academyTextBox}>
                        <Text style={styles.info}>
                          {myAcademy.addrCity} · {myAcademy.addrGu}
                        </Text>
                        {myAcademy.rating !== null && (
                          <View style={styles.VerticalLine} />
                        )}
                        {myAcademy.rating !== null && (
                          <View style={styles.review}>
                            <Image source={SPIcons.icStar} />
                            <Text style={styles.info}>
                              {parseFloat(myAcademy.rating).toFixed(1)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  {notice.contents && (
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      style={styles.announcementBox}
                      onPress={() => {
                        NavigationService.navigate(
                          navName.academyCommunityDetail,
                          {
                            feedIdx: notice.feedIdx,
                            academyIdx: notice.academyIdx,
                          },
                        );
                      }}>
                      <Text style={styles.announcementTitle}>공지사항</Text>
                      <Text
                        style={styles.announcementText}
                        numberOfLines={3}
                        ellipsizeMode="tail">
                        {notice.contents}
                      </Text>
                    </TouchableOpacity>
                  )}
                </Pressable>
                {/* 경기일정 */}
                <View style={styles.matching}>
                  <View
                    style={[styles.matchingTopBox, { marginHorizontal: 16 }]}>
                    <Text style={styles.topTitle}>경기일정</Text>

                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      onPress={() => {
                        NavigationService.navigate(navName.matchingSchedule, {
                          activeTab: '매칭',
                          paramReset: true,
                        });
                      }}
                      style={styles.moreArrowBtn}>
                      <Image source={SPIcons.icArrowRightNoraml} />
                      {/* <Text style={styles.topBtn}>모두 보기</Text> */}
                    </TouchableOpacity>
                  </View>
                  {matchScheduleList && matchScheduleList.length > 0 ? (
                    <CarouselSection data={matchScheduleList} />
                  ) : (
                    <View style={styles.noneMatchingContainer}>
                      <View style={styles.noneMatchingBox}>
                        <Text style={styles.noneText}>
                          예정된 경기 일정이 없어요.
                        </Text>
                        <Text style={styles.noneText}>
                          다른 아카데미의 경기 매칭 일정을 확인해보세요.
                        </Text>
                      </View>
                      <View style={styles.moreBtn}>
                        <TouchableOpacity
                          onPress={() =>
                            NavigationService.navigate(
                              navName.matchingSchedule,
                              {
                                activeTab: '매칭',
                                paramReset: true,
                              },
                            )
                          }
                          style={styles.moreBtnBox}>
                          <Text
                            style={[
                              styles.moreBtnText,
                              { alignSelf: 'center' },
                            ]}>
                            경기매칭 둘러보기
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          {/* 운영자 */}
          {academyMemberType === ACADEMY_MEMBER_TYPE.ADMIN &&
            finishMatchList &&
            finishMatchList.length > 0 && (
              <View style={styles.operatorReview}>
                <View style={styles.topBox}>
                  <Text style={styles.topTitle}>종료된 경기 리뷰 써보세요</Text>
                </View>
                <View />
                {finishMatchList && finishMatchList.length > 0 ? (
                  <FlatList
                    data={finishMatchList}
                    scrollEnabled={false}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={styles.operatorReviwBox}
                        activeOpacity={1}
                        onPress={() => {
                          NavigationService.navigate(navName.matchingDetail, {
                            matchIdx: item.matchIdx,
                          });
                        }}>
                        <View>
                          <View
                            style={[styles.matchingDay, { marginBottom: 6 }]}>
                            <Image
                              source={SPIcons.icDate}
                              style={styles.matchingDayIcon}
                            />
                            <Text style={styles.matchingDayText}>
                              {moment(
                                `${item.matchDate} ${item.matchTime}`,
                                'YYYY-MM-DD HH:mm',
                              ).format('MMMM Do dddd A hh:mm')}
                            </Text>
                          </View>
                          <View style={styles.matchingDay}>
                            <Image
                              source={SPIcons.icMarker}
                              style={styles.matchingDayIcon}
                            />
                            <Text style={styles.matchingDayText}>
                              {item.matchPlace}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={e => {
                            e.stopPropagation();
                            NavigationService.navigate(
                              navName.matchingRegistReview,
                              {
                                matchIdx: item.matchIdx,
                              },
                            );
                          }}
                          style={[
                            styles.academyReviewBtn,
                            { alignSelf: 'flex-start' },
                          ]}>
                          <Text style={styles.reviewBtn}>리뷰 쓰기</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noContent}>
                      리뷰를 쓸 수 있는 종료된 경기가 존재하지 않습니다.
                    </Text>
                  </View>
                )}
              </View>
            )}
          {/* 아카데미 회원 모집 */}
          <View style={styles.recruitment}>
            <View style={styles.matchingTopBox}>
              <Text style={styles.topTitle}>아카데미 회원 모집</Text>
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate(navName.academyRecruitment, {
                    pageType: RECRUIT_PAGE_TYPE.ALL,
                  });
                }}
                style={styles.moreArrowBtn}>
                <Image source={SPIcons.icArrowRightNoraml} />
                {/* <Text style={styles.topBtn}>모두 보기</Text> */}
              </TouchableOpacity>
            </View>
            {academyRecruitList && academyRecruitList.length > 0 ? (
              <FlatList
                data={sortedAcademyRecruitList}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      NavigationService.navigate(
                        navName.academyRecruitmentDetail,
                        { recruitIdx: item.recruitIdx },
                      );
                    }}
                    style={styles.recruitmentBox}>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={[
                            styles.recruitmentGender,
                            { alignSelf: 'flex-start' },
                          ]}>
                          <Text style={styles.recruitmentGenderText}>
                            {MATCH_GENDER[item?.genderCode]?.desc}
                          </Text>
                        </View>
                        {checkRecruitEndRender(item)}
                      </View>
                      <Text style={styles.recruitmentTitle}>{item.title}</Text>
                      <View style={styles.recruitmentTextBox}>
                        <View>
                          <Text style={styles.recruitmentText}>
                            {item.academyName}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                          <Text style={styles.recruitmentText}>{`${
                            item.addrCity
                          } ${item.addrGu ? '・' : ''} ${item.addrGu}`}</Text>
                          <View style={styles.VerticalLine} />
                          <Text style={styles.recruitmentText}>
                            {moment(item.startDate).format('YYYY.MM.DD')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View>
                <Text style={styles.noContent}>
                  모집 공고가 존재하지 않습니다.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  );
}

export default memo(Academy);

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
    top: -23,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 17,
    borderRadius: 16,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  topBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
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
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  academyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  academyImg: {
    width: 40,
    height: 40,
    backgroundColor: '#ADAFC9',
    // padding: 3.333,
    borderRadius: 8,
    overflow: 'hidden',
  },
  academyTextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
    marginBottom: 2,
  },
  info: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  VerticalLine: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
  },
  review: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  announcementBox: {
    padding: 16,
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 8,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#000',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 8,
  },
  announcementText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  matching: {
    borderRadius: 12,
    // paddingVertical: 16,
    // paddingLeft: 16,
    marginBottom: 24,
  },
  matchingTopBox: {
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  matchingContainer: {
    width: '100%',
    gap: 16,
    paddingRight: 40,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  matchingBox: {
    position: 'relative',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  matchingPersonnel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchingPersonnelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchingGender: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(49, 55, 121, 0.43)',
  },
  matchingGenderText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingNumber: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(49, 55, 121, 0.43)',
  },
  matchingNumberText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingStatus: {
    backgroundColor: 'rgba(255, 103, 31, 0.16)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchingStatusText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FF7C10',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 8,
  },
  matchingDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchingDayIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center', // 내부 Image 중앙 정렬
    alignItems: 'center',
  },
  matchingDayText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  recruitment: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  recruitmentBox: {
    flex: 1,
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.22)',
  },
  recruitmentGender: {
    backgroundColor: 'rgba(0, 38, 114, 0.10)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitmentGenderText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  recruitmentTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  recruitmentTextBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  recruitmentText: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  boundary: {
    paddingHorizontal: 8,
  },
  noBelong: {
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  academyProduce: {
    position: 'relative',
    top: -39,
    borderRadius: 12,
    padding: 16,
    marginBottom: 1,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  academyProduceTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    marginBottom: 16,
  },
  academyProduceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  academyProduceText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 20,
    width: 140,
  },
  academyProduceBtn: {
    borderWidth: 1,
    borderColor: '#FF7C10',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#FF7C10',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  academyReviewBtn: {
    backgroundColor: '#FF7C10',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  reviewBtn: {
    fontSize: 15,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  location: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationIcon: {
    width: 18,
    height: 18,
  },
  locationText: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
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
  operatorReview: {
    paddingVertical: 24,
    marginHorizontal: 16,
  },
  operatorReviwBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
  },
  homeContentsBox: {
    borderRadius: 12,
    overflow: 'hidden',
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
  noContent: {
    fontSize: 14,
    fontWeight: 500,
    color: '#808891',
    lineHeight: 20,
    letterSpacing: 0.203,
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
    backgroundColor: '#FF7C10',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  searchBtnText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  noneMatchingContainer: {
    paddingHorizontal: 38,
    paddingVertical: 118,
  },
  noneMatchingBox: {
    marginBottom: 16,
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
  moreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  moreBtnBox: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  moreBtnText: {
    fontSize: 15,
    fontWeight: 500,
    color: '#313779',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  recruitEndBox: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitEndText: {
    ...fontStyles.fontSize11_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  recruitingBox: {
    borderWidth: 1,
    backgroundColor: 'rgba(255, 124, 16, 0.15)',
    borderColor: 'transparent',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitingText: {
    ...fontStyles.fontSize11_Semibold,
    color: '#FF7C10',
  },
  moreArrowBtn: {
    padding: 12,
  },
});
