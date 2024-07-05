import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SPSvgs } from '../../assets/svg';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import { AccessDeniedException } from '../../common/exceptions';
import {
  apiCompleteWatchTrainingVideo,
  apiGetTrainingVideoDetail,
} from '../../api/RestAPI';
import Utils from '../../utils/Utils';
import SPSelectVideoModal from '../../components/SPSelectVideoModal';
import { APPROVE_STATE } from '../../common/constants/approveState';
import SPModal from '../../components/SPModal';
import SPSingleVideo from '../../components/SPSingleVideo';
import { SafeAreaView } from 'react-native-safe-area-context';

// 상수값
const MAX_CONTENTS_TEXT_LENGTH = 250;

// PIE 트레이닝 > 상세 > 클래스 영상 리스트 > 상세
function TraningVideoDetail({ route }) {
  const { width } = useWindowDimensions();

  let imageHeight;
  if (width <= 480) {
    imageHeight = 203;
  } else {
    const aspectRatio = 360 / 203;
    imageHeight = width / aspectRatio;
  }

  // 영상 IDX
  const { videoIdx, isCurrentStep } = route?.params || {
    videoIdx: '',
    isCurrentStep: false,
  };

  // [ ref ]
  const scrollRef = useRef();
  const fullScreenRef = useRef();

  // [ state ]
  const [videoDetail, setVideoDetail] = useState({
    videoIdx: '',
    videoName: '',
    videoPath: '',
    title: '',
    trainingIdx: '',
    trainingName: '',
    cntView: 0,
    viewDate: '',
    videoTime: 0,
    aprvState: '',
    masterIdx: '',
    masterDate: '',
    contents: '',
    thumbPath: '',
  }); // 훈련 영상 상세
  const [displayAllDesc, setDisplayAllDesc] = useState(false); // 영상 소개 더보기
  const trlRef = useRef({ disabled: false }); // 다중 요청 방지
  const [isScrollable, setIsScrollable] = useState(true); // 스크롤 동작

  // [ state ] 모달
  const [showSelectModal, setShowSelectModal] = useState(false); // 동영상 첨부 모달
  const [showViewCompleteModal, setShowViewCompleteModal] = useState(false); // 시청완료 모달

  // [ state ] 동영상 플레이어
  const [isVideoLoading, setIsVideoLoading] = useState(true); // 동영상 로딩 유무

  // [ util ] 마스터 영상 업로드
  const openVideoSelectModal = () => {
    if (videoDetail.viewDate) {
      setShowSelectModal(true);
    } else {
      Utils.openModal({ body: '영상 시청을 완료해주세요.' });
    }
  };

  // [ util ] 시청완료 모달 Cloase
  const closeViewVideoCompleteModal = () => {
    setShowViewCompleteModal(false);
  };

  // [ util ] 마스터 영상 업로드
  const uploadMyMasterVideo = (type, fileUrl, videoName, videoType) => {
    switch (type) {
      case 'CAMERA':
        NavigationService.navigate(navName.addDetails, {
          videoURL: fileUrl,
          videoIdx: videoDetail.videoIdx,
          videoName,
          videoType,
          trainingIdx: videoDetail.trainingIdx,
        });
        break;
      case 'ALBUM':
        NavigationService.navigate(navName.videoPlayer, {
          videoURL: fileUrl,
          videoIdx: videoDetail.videoIdx,
          videoName,
          videoType,
          trainingIdx: videoDetail.trainingIdx,
        });
        break;
      default:
        break;
    }
  };

  // [ util ] 마스터 영상 보러가기
  const moveToViewMyMasterVideo = idx => {
    NavigationService.navigate(navName.masterVideoDetail, { videoIdx: idx });
  };

  // [ util ] 영상 진행 상태 확인 > 시청완료
  const getProgressData = ({ currentTime, seekableDuration }) => {
    if (!videoDetail.viewDate) {
      const isOver =
        Math.floor(currentTime + 1) >= Math.floor(seekableDuration);
      // 시청완료
      if (isOver && !trlRef.current.disabled) {
        completeWatchTrainingVideo();
      }
    }
  };

  // [ util ] 동영상 풀 스크린 토글
  const toggleFullScreenMode = value => {
    scrollRef.current.scrollTo({ x: 0, y: 0, animated: false });
    setIsScrollable(value);
  };

  // [ api ] 클래스 영상 상세 조회
  const getTrainingVideoDetail = async () => {
    try {
      const { data } = await apiGetTrainingVideoDetail(videoIdx);

      if (data) {
        setVideoDetail({ ...data.data });
        setDisplayAllDesc(data.data.contents.length < MAX_CONTENTS_TEXT_LENGTH);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ api ] 클래스 영상 시청완료
  const completeWatchTrainingVideo = async () => {
    try {
      trlRef.current.disabled = true;
      const { data } = await apiCompleteWatchTrainingVideo(videoIdx);

      if (data) {
        setVideoDetail({
          ...videoDetail,
          viewDate: new Date().toISOString(),
        });

        setShowViewCompleteModal(true);
      }
      trlRef.current.disabled = false;
    } catch (error) {
      trlRef.current.disabled = false;
      handleError(error);
    }
  };

  // [ useFocusEffect ] 클래스 영상 정보
  useFocusEffect(
    useCallback(() => {
      if (videoIdx) {
        getTrainingVideoDetail();
      } else {
        handleError(new AccessDeniedException('잘못된 접근입니다.'));
      }
    }, [videoIdx]),
  );

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      {isScrollable && <Header title={videoDetail.trainingName} />}

      {/* 바디 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        contentContainerStyle={styles.content}
        scrollEnabled={isScrollable}
        scrollEventThrottle={16}>
        {/* 동영상 & 썸네일 */}
        {videoDetail.videoPath && (
          <SPSingleVideo
            ref={fullScreenRef}
            source={videoDetail.videoPath}
            thumbnailPath={videoDetail.thumbPath ?? ''}
            repeat={true}
            isPaused={true}
            // isPaused={showViewCompleteModal} // 시청완료 팝업이 떠있을 때, 일시 정지
            disablePlayPause={true}
            onLoad={() => setIsVideoLoading(false)}
            onFullScreen={toggleFullScreenMode}
            getProgressData={getProgressData}
          />
        )}

        {/* 라벨 */}
        <View style={styles.statusWrapper}>
          {/* 시청완료 */}
          {videoDetail.viewDate && (
            <View style={styles.statusItem}>
              <SPSvgs.EyeShow width={12} height={12} stroke={COLORS.darkBlue} />
              <Text style={styles.statusText}>시청완료</Text>
            </View>
          )}

          {/* 승인완료 */}
          {videoDetail.aprvState === APPROVE_STATE.COMPLETE && (
            <View style={styles.statusItem}>
              <SPSvgs.Check width={12} height={12} fill={COLORS.darkBlue} />
              <Text style={styles.statusText}>마스터완료</Text>
            </View>
          )}

          {/* 승인대기 */}
          {videoDetail.aprvState === APPROVE_STATE.WAIT && (
            <View style={styles.statusItem}>
              <SPSvgs.Clock width={12} height={12} fill={COLORS.darkBlue} />
              <Text style={styles.statusText}>승인대기중</Text>
            </View>
          )}
        </View>
        {/* 훈련 정보 */}
        <View style={styles.titleWrapper}>
          <Text style={fontStyles.fontSize18_Semibold}>
            {videoDetail.title}
          </Text>
          <Text
            style={{
              ...fontStyles.fontSize12_Medium,
              color: COLORS.labelAlternative,
            }}>
            조회수 {Utils.changeNumberComma(videoDetail.cntView)}
          </Text>
        </View>
        <View style={styles.videoDesWrapper}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color: COLORS.labelNeutral,
              },
            ]}>
            {videoDetail.contents.length < MAX_CONTENTS_TEXT_LENGTH ||
            displayAllDesc
              ? videoDetail.contents
              : `${videoDetail.contents.substring(
                  0,
                  MAX_CONTENTS_TEXT_LENGTH,
                )}...`}
          </Text>

          {!displayAllDesc && (
            <Pressable onPress={() => setDisplayAllDesc(true)}>
              <Text
                style={[
                  fontStyles.fontSize14_Semibold,
                  { color: COLORS.labelAlternative },
                ]}>
                더 보기
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* 버튼 (1) : 클래스 마스터 하기 */}
      {isScrollable &&
        !videoDetail.aprvState &&
        videoDetail.viewDate &&
        isCurrentStep && (
          <PrimaryButton
            text="클래스 마스터 하기"
            buttonStyle={{
              marginHorizontal: 16,
              marginVertical: 24,
              visibility: isScrollable ? 'visible' : 'hidden',
            }}
            onPress={openVideoSelectModal}
          />
        )}

      {/* 버튼 (2) : 내 마스터 영상 보러가기 */}
      {isScrollable && videoDetail.aprvState === APPROVE_STATE.COMPLETE && (
        <PrimaryButton
          text="내 마스터 영상 보러가기"
          buttonStyle={{
            marginHorizontal: 16,
            marginVertical: 24,
          }}
          onPress={() => moveToViewMyMasterVideo(videoDetail.masterIdx)}
        />
      )}

      {/* 모달 : 영상 소스 선택 */}
      <SPSelectVideoModal
        title="클래스 마스터 동영상 업로드"
        visible={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        onComplete={({ type, fileUrl, videoName, videoType }) => {
          uploadMyMasterVideo(type, fileUrl, videoName, videoType);
        }}
      />

      {/* 모달 : 시청완료 */}
      <SPModal
        title="시청 완료!"
        contents={`
        영상 시청을 완료했나요?
        해당 동작 마스터 인증을 위한 실제 훈련 영상을 업로드 해주세요!
        `}
        visible={showViewCompleteModal}
        onConfirm={() => {
          closeViewVideoCompleteModal();
          openVideoSelectModal();
          setIsScrollable(true);
          fullScreenRef.current.closeFullScreen();
        }}
        onCancel={closeViewVideoCompleteModal}
        onClose={closeViewVideoCompleteModal}
      />
    </SafeAreaView>
  );
}

export default memo(TraningVideoDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    rowGap: 16,
    // paddingTop: 16,
  },
  titleWrapper: {
    paddingHorizontal: 16,
    rowGap: 8,
  },
  videoDesWrapper: {
    paddingHorizontal: 16,
    rowGap: 8,
  },
  statusWrapper: {
    flexDirection: 'row',
    columnGap: 8,
    paddingHorizontal: 16,
  },
  statusItem: {
    flexDirection: 'row',
    columnGap: 4,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 4,
    borderColor: COLORS.darkBlue,
    alignItems: 'center',
  },
  statusText: {
    ...fontStyles.fontSize11_Semibold,
    color: COLORS.darkBlue,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContent: {
    width: '100%',
    height: 200,
  },
});
