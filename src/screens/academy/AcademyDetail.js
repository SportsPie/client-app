import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { useSelector } from 'react-redux';
import { apiGetAcademyDetail, apiGetMyInfo } from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { IS_YN } from '../../common/constants/isYN';
import { navName } from '../../common/constants/navName';
import { RECRUIT_PAGE_TYPE } from '../../common/constants/recruitPageType';
import SPHeader from '../../components/SPHeader';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import AcademyJoinModal from './AcademyJoinModal';
import { JOIN_TYPE } from '../../common/constants/joinType';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACTIVE_OPACITY } from '../../common/constants/constants';

function AcademyDetail({
  navigation,
  route,
  showHeader = true,
  showMenu = true,
  showTopRow = true,
  showContentSubBox = false,
  isModal = false,
}) {
  /**
   * state
   */
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const academyIdx = route?.params?.academyIdx;
  const [isAdmin, setIsAdmin] = useState(false);
  const { width } = useWindowDimensions();
  const imageHeight = width <= 480 ? 246 : (width * 9) / 16;
  const [academyDetail, setAcademyDetail] = useState({});
  const [shouldShowMoreButton, setShouldShowMoreButton] = useState(false);
  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [academyJoinType, setAcademyJoinType] = useState(JOIN_TYPE.NO_LOGIN);
  const [isJoined, setIsJoined] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  /**
   * api
   */
  const getUserInfo = async () => {
    try {
      const joinType = await Utils.getUserJoinType(academyIdx);
      setAcademyJoinType(joinType);
      setIsAdmin(joinType === JOIN_TYPE.ACADEMY_ADMIN);
    } catch (error) {
      handleError(error);
    }
  };

  const getAcademyDetailInfo = async () => {
    try {
      const { data } = await apiGetAcademyDetail(academyIdx);
      setAcademyDetail(data.data.academy);
    } catch (error) {
      handleError(error);
    }
  };

  const onFocus = async () => {
    try {
      await getUserInfo();
      await getAcademyDetailInfo();
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      return () => {
        setAcademyDetail({});
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, [isJoined]),
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {showHeader && (
        <SPHeader
          title={academyDetail.academyName}
          noLeftLogo
          {...(isAdmin
            ? {
                rightBasicButton: SPIcons.icSetting,
                onPressRightIcon: () =>
                  NavigationService.navigate(navName.academyManagement, {
                    academyIdx,
                  }),
              }
            : {})}
          rightBasicAddButton={SPIcons.icOptionsVertical}
          onPressAddRightIcon={openModal} // 모달을 열어 주는 함수
        />
      )}
      <SPMoreModal
        visible={modalVisible}
        onClose={closeModal}
        isAdmin={isAdmin}
        type={MODAL_MORE_TYPE.ACADEMY}
        idx={academyIdx}
        adminButtons={[MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.SHARE]}
        memberButtons={[
          MODAL_MORE_BUTTONS.REPORT,
          MODAL_MORE_BUTTONS.SHARE,
          academyJoinType === JOIN_TYPE.ACADEMY_MEMBER
            ? MODAL_MORE_BUTTONS.LEAVE
            : null,
        ]}
        shareLink={`academy?id=${academyIdx}`}
        shareTitle={academyDetail?.academyName ?? ''}
        shareDescription={academyDetail?.description ?? ''}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 24,
        }}>
        {/* 아카데미 상세 이미지 */}
        <View
          style={[
            styles.swiperBox,
            isModal && { marginVertical: 24 },
            { height: imageHeight },
          ]}>
          {academyDetail?.files?.length > 0 && (
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
              {academyDetail.files.map((img, index) => (
                <View
                  // eslint-disable-next-line react/no-array-index-key
                  key={`slide_${index}`}
                  style={[styles.slide, { height: imageHeight }]}>
                  <Image
                    source={{
                      uri: img.fileUrl,
                    }}
                    style={styles.image}
                  />
                </View>
              ))}
            </Swiper>
          )}
        </View>
        {/* 메뉴 리스트 */}
        {showMenu && (
          <View style={styles.menuContainer}>
            <View style={styles.menuList}>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={{ flex: 1 }}
                onPress={() => {
                  NavigationService.navigate(navName.academyIntroduction, {
                    academyIdx,
                  });
                }}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIcon}>
                    <Image
                      source={SPIcons.icBigSoccerBall}
                      style={styles.iconImg}
                    />
                  </View>
                  <Text style={styles.menuText}>아카데미 소개</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  NavigationService.navigate(navName.academyCommunity, {
                    academyIdx,
                  });
                }}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIcon}>
                    <Image
                      source={SPIcons.icBigCommunity}
                      style={styles.iconImg}
                    />
                  </View>
                  <Text style={styles.menuText}>커뮤니티</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  NavigationService.navigate(navName.matchingHistory, {
                    academyIdx,
                  });
                }}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIcon}>
                    <Image
                      source={SPIcons.icBigScourt}
                      style={styles.iconImg}
                    />
                  </View>
                  <Text style={styles.menuText}>경기이력</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  NavigationService.navigate(navName.matchingReview, {
                    academyIdx,
                  });
                }}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIcon}>
                    <Image
                      source={SPIcons.icBigReview}
                      style={styles.iconImg}
                    />
                  </View>
                  <Text style={styles.menuText}>경기리뷰</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.menuList}>
              {isAdmin && (
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    NavigationService.navigate(navName.academyPlayer);
                  }}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuIcon}>
                      <Image
                        source={SPIcons.icBigPlayer}
                        style={styles.iconImg}
                      />
                    </View>
                    <Text style={styles.menuText}>선수관리</Text>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  if (isAdmin) {
                    NavigationService.navigate(
                      navName.academyRecruitmentForAdmin,
                      {
                        academyIdx,
                      },
                    );
                  } else {
                    NavigationService.navigate(navName.academyRecruitment, {
                      pageType: RECRUIT_PAGE_TYPE.ACADEMY,
                      academyIdx,
                    });
                  }
                }}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIcon}>
                    <Image source={SPIcons.icBigNoti} style={styles.iconImg} />
                  </View>
                  <Text style={styles.menuText}>회원모집</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  NavigationService.navigate(navName.academySchedule, {
                    academyIdx,
                  });
                }}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIcon}>
                    <Image
                      source={SPIcons.icBigSchedule}
                      style={styles.iconImg}
                    />
                  </View>
                  <Text style={styles.menuText}>
                    {isAdmin ? '일정관리' : '일정'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.menuItem} />
              {!isAdmin && <View style={styles.menuItem} />}
            </View>
          </View>
        )}
        <View style={[styles.introduction, isModal && { marginVertical: 24 }]}>
          <View style={styles.topBox}>
            <Text style={styles.topAddress}>
              {academyDetail.addrCity} · {academyDetail.addrGu}
            </Text>
            <View style={styles.topRow}>
              <Text style={styles.topTitle}>{academyDetail.academyName}</Text>
              {academyDetail.certYn === IS_YN.Y && (
                <View>
                  <Image source={SPIcons.icCheckBadge} />
                </View>
              )}
            </View>
            {showTopRow && academyDetail.rating !== null && (
              <View style={styles.topRow}>
                <View>
                  <Image source={SPIcons.icStar} />
                </View>
                <Text style={styles.score}>
                  {parseFloat(academyDetail.rating).toFixed(1)}
                </Text>
              </View>
            )}
            {showContentSubBox && (
              <>
                <View style={styles.contentSubBox}>
                  <Text style={styles.contentSubTitle}>매칭전적</Text>
                  <Text style={styles.contentSubText}>
                    {`${academyDetail.winCnt}승 ${academyDetail.drawCnt}무 ${academyDetail.loseCnt}패`}
                  </Text>
                </View>
                {academyDetail.rating && (
                  <View style={styles.contentSubBox}>
                    <Text style={styles.contentSubTitle}>매너점수</Text>
                    <View style={styles.reviewBox}>
                      <Image
                        source={SPIcons.icStar}
                        style={{ width: 18, height: 18 }}
                      />
                      <Text style={styles.contentSubText}>
                        {parseFloat(academyDetail.rating).toFixed(1)}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
            <View style={[styles.topRow, { gap: 8 }]}>
              {academyDetail.instagramUrl && (
                <TouchableOpacity
                  onPress={() => {
                    if (academyDetail.instagramUrl) {
                      Utils.openInstagram(academyDetail.instagramUrl);
                    }
                  }}>
                  <Image source={SPIcons.icInstagram} />
                </TouchableOpacity>
              )}
              {academyDetail.homepageUrl && (
                <TouchableOpacity
                  onPress={() => {
                    if (academyDetail.homepageUrl) {
                      Utils.openOrMoveUrl(academyDetail.homepageUrl);
                    }
                  }}>
                  <Image source={SPIcons.icExplore} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.middleBox}>
            <Text
              style={styles.middleText}
              numberOfLines={showMoreDesc ? 0 : 3}
              onTextLayout={({ nativeEvent: { lines } }) => {
                setShouldShowMoreButton(lines.length > 2);
              }}
              ellipsizeMode="tail">
              {academyDetail.description}
            </Text>
            {shouldShowMoreButton && (
              <TouchableOpacity
                style={{ alignSelf: 'flex-start' }}
                onPress={() => {
                  setShowMoreDesc(prev => !prev);
                }}>
                <Text style={styles.moreText}>
                  {showMoreDesc ? '숨기기' : '더보기'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.middleBox}>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>대표번호</Text>
              </View>
              <Text style={styles.middleInfoText}>
                {Utils.addHypenToPhoneNumber(academyDetail.phoneNo)}
              </Text>
            </View>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>영업시간</Text>
              </View>
              <Text style={styles.middleInfoText}>
                {academyDetail.workTime}
              </Text>
            </View>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>주소</Text>
              </View>
              <Text style={styles.middleInfoText}>
                {academyDetail.addressFull}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <AcademyJoinModal academyIdx={academyIdx} setIsJoined={setIsJoined} />
    </SafeAreaView>
  );
}

export default memo(AcademyDetail);

const styles = {
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
    padding: 16,
    marginBottom: 0,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  introduction: {
    padding: 16,
    margin: 16,
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
    flexDirection: 'column',
    gap: 8,
  },
  topAddress: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF671F',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  score: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  middleBox: {
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.16)',
  },
  middleText: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 26,
    letterSpacing: 0.091,
  },
  moreText: {
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  middleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  middleInfoTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  middleInfoText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'right',
    flexShrink: 1,
  },
  menuContainer: {
    flexDirection: 'column',
    gap: 16,
    padding: 16,
  },
  menuList: {
    flexDirection: 'row',
    justifyContent: 'center',
    // paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    flex: 1,
  },
  menuText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentSubBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  contentSubTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentSubText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'right',
  },
  reviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuIcon: {
    width: 40,
    height: 40,
    overflow: 'hidden',
  },
  iconImg: {
    width: 40,
    height: 40,
  },
};
