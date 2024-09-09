import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  useWindowDimensions,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import YouTube from 'react-native-youtube-iframe';

import { PrimaryButton } from '../../components/PrimaryButton';
import Divider from '../../components/Divider';
import SPHeader from '../../components/SPHeader';
import DdayCounter from '../../components/DdayCounter';
import SPImages from '../../assets/images';
import SPIcons from '../../assets/icon';
import { SPSvgs } from '../../assets/svg';
import { COLORS } from '../../styles/colors';

import moment from 'moment';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { useFocusEffect } from '@react-navigation/native';
import { handleError } from '../../utils/HandleError';
import { apiGetEventApplyState, apiGetEventDetail } from '../../api/RestAPI';
import Header from '../../components/header';
import Utils from '../../utils/Utils';
import fontStyles from '../../styles/fontStyles';
import ListEmptyView from '../../components/ListEmptyView';
import SPLoading from '../../components/SPLoading';
import { EVENT_STATE } from '../../common/constants/eventState';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

function EventDetail({ route }) {
  const eventIdx = route.params?.eventIdx;
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const { width } = useWindowDimensions();
  const imageHeight = width <= 480 ? 246 : (width * 10) / 16;
  const paddingHorizontal = 16; // contentsBox의 수평 패딩 값
  const videoWidth = width - paddingHorizontal * 2; // 패딩을 제외한 비디오의 너비
  const videoHeight = (width * 9) / 16; // 16:9 비율로 높이 계산

  const [modalVisible, setModalVisible] = useState(false);
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const [showButtomModal, setShowButtomModal] = useState(false);
  const [alReadyApply, setAlReadyApply] = useState(false);
  const [fstCall, setFstCall] = useState(false);

  const handleImageLoad = event => {
    /**
     * state
     */
    const { width, height } = event.nativeEvent.source;
    setImageSize({ width, height });
  };

  const [eventInfo, setEventInfo] = useState({});
  const [eventImageList, setEventImageList] = useState([]);
  const [eventTargetList, setEventTargetList] = useState([]);
  const [eventNoticeList, setEventNoticeList] = useState([]);
  const [applyCount, setApplyCount] = useState({});

  /**
   * api
   */
  const getEventDetail = async () => {
    try {
      const { data: myState } = await apiGetEventApplyState(eventIdx);
      const { data } = await apiGetEventDetail(eventIdx);
      setEventInfo(data.data.eventInfo);
      setEventTargetList(data.data.eventTarget);
      setEventImageList(data.data.eventImage);
      setEventNoticeList(data.data.noticeList);
      setApplyCount(data.data.applyCount);
      modalShowCheck(data.data.eventInfo, myState.data);
    } catch (error) {
      handleError(error);
    }
    setFstCall(true);
  };

  /**
   * function
   */
  const modalShowCheck = (info, applied) => {
    if (info.eventState === EVENT_STATE.PRE_PROGRESS.value) {
      setAlReadyApply(false);
      setShowButtomModal(false);
      return;
    }
    if (applied) {
      setAlReadyApply(true);
      setShowButtomModal(true);
    } else if (info.closeYn === 'Y') {
      setAlReadyApply(false);
      setShowButtomModal(false);
    } else if (info.closeDate) {
      setAlReadyApply(false);
      const closeDate = moment(info.closeDate);
      const now = moment();
      if (closeDate.diff(now) > 0) {
        setShowButtomModal(true);
      } else {
        setShowButtomModal(false);
      }
    }
  };

  /**
   * usEffect
   */

  useFocusEffect(
    useCallback(() => {
      getEventDetail();
    }, []),
  );

  return fstCall ? (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header
        title={eventInfo?.eventName}
        closeIcon
        onLeftIconPress={() => {
          NavigationService.navigate(navName.home);
        }}
      />

      {/* 이벤트 내용 */}
      <ScrollView>
        {eventInfo?.detailPath && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: eventInfo.detailPath }}
              onLoad={handleImageLoad}
              style={[
                styles.eventImage,
                imageSize.width && imageSize.height
                  ? {
                      aspectRatio: imageSize.width / imageSize.height,
                      height: undefined,
                    }
                  : { height: SCREEN_HEIGHT * 0.6 }, // 기본 높이 설정
              ]}
              resizeMode="contain" // 이미지가 잘리지 않도록 유지
            />
          </View>
        )}

        {eventImageList && eventImageList.length > 0 && (
          <View style={styles.swiperBox}>
            <Swiper
              style={{ height: imageHeight }}
              showsButtons={false}
              autoplay
              autoplayTimeout={5}
              scrollEventThrottle={16}
              decelerationRate="fast"
              paginationStyle={{
                justifyContent: 'center',
                position: 'absolute',
                bottom: -24,
                paddingVertical: 8,
              }}
              dotStyle={{
                backgroundColor: 'rgba(135, 141, 150, 0.16)',
                opacity: 1,
                width: 5,
                height: 5,
                marginHorizontal: 2,
                marginVertical: 2.5,
              }}
              activeDotStyle={{
                backgroundColor: '#FF7C10',
                width: 5,
                height: 5,
              }}>
              {eventImageList.map((img, index) => (
                <TouchableOpacity
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={`event-image-${index}`}
                  activeOpacity={1}
                  onPress={() => {
                    if (img.linkUrl) {
                      // 링크가 있으면 클릭 시 해당 페이지로 이동
                      console.log(`Opening URL: ${img.linkUrl}`);
                    }
                  }}
                  style={[styles.slide, { height: imageHeight }]}>
                  <Image
                    source={{ uri: img.fileUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </Swiper>
          </View>
        )}
        <Divider lineHeight={8} lineColor={COLORS.indigo90} />

        {eventInfo?.youtubeUrl && (
          <View style={styles.contentsBox}>
            <Text style={styles.contentsTitle}>생중계</Text>
            <View style={styles.videoContainer}>
              <YouTube
                videoId={Utils.getYoutubeVideoId(eventInfo?.youtubeUrl)}
                height={videoHeight}
                width={videoWidth} // 패딩을 고려한 width
              />
            </View>
          </View>
        )}
        {eventInfo?.youtubeUrl && (
          <Divider lineHeight={8} lineColor={COLORS.indigo90} />
        )}
        {/* 생중계 */}

        {/* 접수 현황 */}
        {eventTargetList && eventTargetList.length > 0 && (
          <View style={styles.contentsBox}>
            <Text style={styles.contentsTitle}>접수 현황</Text>
            <View style={styles.bodyStatisticWrapper}>
              {eventTargetList.map((item, index) => {
                return (
                  <View
                    style={styles.statisticWrapper}
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={`event-target-${index}`}>
                    <Text style={styles.statisticValueTitle}>
                      {item.targetName}
                    </Text>
                    <Text numberOfLines={1} style={styles.statisticValueText}>
                      {Utils.changeNumberComma(item.participationCnt)}/
                      {Utils.changeNumberComma(item.targetCount)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.statusList}>
              <View style={styles.statusItem}>
                <Text style={styles.statusTitle}>공격수</Text>
                <Text style={styles.statusText}>
                  {Utils.changeNumberComma(applyCount?.fwCount)}명 지원
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusTitle}>미드필더</Text>
                <Text style={styles.statusText}>
                  {Utils.changeNumberComma(applyCount?.mfCount)}명 지원
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusTitle}>수비수</Text>
                <Text style={styles.statusText}>
                  {Utils.changeNumberComma(applyCount?.dfCount)}명 지원
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusTitle}>골키퍼</Text>
                <Text style={styles.statusText}>
                  {Utils.changeNumberComma(applyCount?.gkCount)}명 지원
                </Text>
              </View>
              <View style={styles.statusDescriptionWrap}>
                <Text style={styles.statusDescriptionText}>
                  해당 포지션은 메인 포지션 기준, 지원 현황입니다.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                NavigationService.navigate(navName.eventParticipantList);
              }}
              style={styles.profileButton}>
              <Text style={styles.profileText}>지원자 프로필 보러 가기</Text>
            </Pressable>
          </View>
        )}
        {eventTargetList && eventTargetList.length > 0 && (
          <Divider lineHeight={8} lineColor={COLORS.indigo90} />
        )}

        <View style={styles.contentsBox}>
          <View style={styles.topBox}>
            <Text style={styles.topTitle}>공지사항</Text>
            <Pressable
              onPress={() => {
                NavigationService.navigate(navName.eventNoticeList, {
                  eventIdx,
                  eventName: eventInfo?.eventName,
                });
              }}
              style={styles.moreBtn}>
              <Text style={styles.topBtn}>모두 보기</Text>
            </Pressable>
          </View>

          {eventNoticeList && eventNoticeList.length > 0 ? (
            <FlatList
              data={eventNoticeList} // 임의로 생성한 데이터 사용
              scrollEnabled={false} // 스크롤 비활성화
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.newsTitle,
                    index === eventNoticeList.length - 1
                      ? { borderBottomWidth: 0 }
                      : {},
                  ]}>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                      NavigationService.navigate(navName.eventNoticeDetail, {
                        noticeIdx: item.noticeIdx,
                      });
                    }}>
                    <View style={styles.newsItemContainer}>
                      <Text
                        style={styles.newsText}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.title}
                      </Text>
                      <Text style={styles.newsDate}>
                        {moment(item.regDate).format('YYYY.MM.DD')}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
              horizontal={false}
            />
          ) : (
            <View>
              <ListEmptyView text="공지사항이 존재하지 않습니다." />
            </View>
          )}
        </View>
      </ScrollView>

      {/* 접수 신청, 내 접수 현황 버튼 */}
      {showButtomModal && (
        <View style={styles.buttonBox}>
          {!alReadyApply && (
            <Text style={styles.buttonText}>
              <DdayCounter targetDate={eventInfo.closeDate} onEnd={() => {}} />
            </Text>
          )}
          <View style={{ marginTop: 8 }}>
            {!alReadyApply ? (
              <PrimaryButton
                onPress={() => {
                  NavigationService.navigate(navName.eventApplyType, {
                    eventIdx,
                  });
                }}
                buttonStyle={styles.button}
                text="접수 신청"
              />
            ) : (
              <PrimaryButton
                outlineButton
                onPress={() => {
                  NavigationService.navigate(navName.moreEvent);
                }}
                buttonStyle={styles.button}
                buttonTextStyle={styles.outlineButtonText}
                text="내 접수 현황"
              />
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  ) : (
    <SPLoading />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flex: 1,
  },
  eventImage: {
    width: SCREEN_WIDTH, // 이미지가 화면의 전체 너비에 맞게 설정됨
  },
  swiperBox: {
    paddingVertical: 24,
    marginBottom: 24,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentsBox: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentsTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
    marginBottom: 16,
  },
  videoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyStatisticWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginBottom: 16,
  },
  statisticWrapper: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    rowGap: 4,
    borderRadius: 8,
    backgroundColor: COLORS.fillNormal,
  },
  statisticValueText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  statisticValueTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  statusList: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusTitle: {
    ...fontStyles.fontSize14_Regular,
    color: 'rgba(46, 49, 53, 0.80)',
  },
  statusText: {
    ...fontStyles.fontSize14_Medium,
    color: '#1A1C1E',
  },
  statusDescriptionWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  statusDescriptionText: {
    ...fontStyles.fontSize13_Regular,
    color: 'rgba(46, 49, 53, 0.80)',
  },
  profileButton: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    borderRadius: 10,
  },
  profileText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
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
  newsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  buttonBox: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  button: {
    // marginTop: 8,
    borderColor: COLORS.orange,
  },
  outlineButtonText: {
    color: COLORS.orange,
  },
});

export default EventDetail;
