import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Header from '../../components/header';
import { SPSvgs } from '../../assets/svg';
import MasterVideoDescription from '../../components/training/master-video-detail/MasterVideoDescription';
import TrainingVideoItem from '../../components/training/master-video-detail/TrainingVideoItem';
import fontStyles from '../../styles/fontStyles';
import MasterVideoTab from '../../components/training/MasterVideoTab';
import { handleError } from '../../utils/HandleError';
import { AccessDeniedException } from '../../common/exceptions';
import {
  apiGetMasterVideoDetail,
  apiGetMasterVideoList,
  apiGetTrainingDetail,
} from '../../api/RestAPI';
import SPSingleVideo from '../../components/SPSingleVideo';
import MasterLastComment from '../../components/training/master-video-detail/MasterLastComment';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { COLORS } from '../../styles/colors';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

function MasterVideoDetail({ route }) {
  const { width } = useWindowDimensions();
  let imageHeight;

  if (width <= 480) {
    imageHeight = 640;
  } else {
    const aspectRatio = 360 / 640;
    imageHeight = width / aspectRatio;
  }

  // 페이지 파라미터  > 접근 유효성 검사
  const { videoIdx } = route?.params || { videoIdx: '' };
  if (!videoIdx) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }
  // [ ref ]
  const pageRef = useRef();

  // [ state ]
  const [videoDetail, setVideoDetail] = useState({
    trainingIdx: '',
    trainingName: '',
    title: '',
    masterIdx: '',
    masterDate: '',
    videoIdx: '',
    videoName: '',
    videoPath: '',
    videoTime: 0,
    thumbPath: '',
    viewDate: '',
    regDate: '',
    memberIdx: '',
    memberName: '',
    profilePath: '',
    cntComment: 0,
    cntLike: 0,
    cntView: 0,
    contents: '',
    isLike: false,
    isMine: false,
  }); // 마스터 영상 상세
  const [trainingDetail, setTrainingDetail] = useState({
    trainingIdx: '',
    thumbPath: '',
    trainingName: '',
    programDesc: '',
  }); // 훈련영상 영상 상세
  const [showVideoMore, setShowVideoMore] = useState(false); // 영상 더보기 모달 Display
  const [otherVideoList, setOtherVideoList] = useState([]); // 다른 마스터 영상 리스트
  const [otherVideoPagingKey, setOtherVideoPagingKey] = useState([]); // 다른 마스터 영상 리스트 페이징 Key

  // [ state ] 동영상 플레이어
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // [ util ] 영상 '더보기' 모달 Open
  const openVideoModal = () => {
    setShowVideoMore(true);
  };

  // [ util ] 영상 '더보기' 모달 Close
  const closeVideoModal = () => {
    setShowVideoMore(false);
  };

  // [ util ] 마스터 릴스 이동
  const moveToMasterReels = () => {
    NavigationService.navigate(navName.masterVideoDetailPlayer, {
      videoIdx: videoDetail.videoIdx,
      trainingIdx: videoDetail.trainingIdx,
      pagingKey: otherVideoPagingKey,
    });
  };

  // [ api ] 마스터 영상 상세 조회
  const getMasterVideoDetail = async () => {
    try {
      const { data } = await apiGetMasterVideoDetail(videoIdx);

      if (data) {
        setVideoDetail({ ...data.data });
        pageRef.current.scrollTo(0, 0);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ api ] 트레이닝 상세 조회
  const getTrainingDetail = async () => {
    try {
      const { data } = await apiGetTrainingDetail(videoDetail.trainingIdx);

      if (data) {
        setTrainingDetail(data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ api ] 다른 마스터 영상 리스트 조회
  const getMasterVideoList = async () => {
    try {
      const { data } = await apiGetMasterVideoList({
        page: 1,
        size: 6,
        videoIdx: videoDetail.videoIdx, // 상세 조회 시, API 필터
        trainingIdx: videoDetail.trainingIdx,
      });

      if (data) {
        setOtherVideoPagingKey(data.data.pagingKey);
        setOtherVideoList([...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ useFocusEffect ] 마스터 영상 상세
  useFocusEffect(
    useCallback(() => {
      if (videoIdx) getMasterVideoDetail();
    }, [videoIdx]),
  );

  // [ useFocusEffect ] 훈련영상 상세
  useFocusEffect(
    useCallback(() => {
      if (videoDetail.trainingIdx) getTrainingDetail();
    }, [videoDetail.trainingIdx]),
  );

  // [ useFocusEffect ] 다른 마스터 영상 리스트
  useFocusEffect(
    useCallback(() => {
      if (videoDetail.videoIdx && videoDetail.trainingIdx) getMasterVideoList();
    }, [videoDetail.videoIdx, videoDetail.trainingIdx]),
  );

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      {videoDetail.videoIdx && (
        <>
          <Header
            title={videoDetail.trainingName}
            rightContent={
              !videoDetail.isMine && (
                <Pressable onPress={openVideoModal}>
                  <SPSvgs.EllipsesVertical />
                </Pressable>
              )
            }
          />

          <ScrollView
            ref={pageRef}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* 동영상 & 썸네일 */}
            {videoDetail.videoPath && (
              <SPSingleVideo
                source={videoDetail.videoPath}
                thumbnailPath={videoDetail.thumbPath ?? ''}
                repeat={true}
                isPaused={true}
                disablePlayPause={true}
                onLoad={() => setIsVideoLoading(false)}
                onFullScreen={moveToMasterReels}
              />
            )}

            {/* 내용 */}
            <MasterVideoDescription
              videoIdx={videoDetail.videoIdx}
              isLike={videoDetail.isLike}
              nickName={videoDetail.memberNickName}
              profilePath={videoDetail.profilePath}
              title={videoDetail.title}
              description={videoDetail.contents}
              cntView={videoDetail.cntView}
              cntLike={videoDetail.cntLike}
              regDate={videoDetail.regDate}
            />

            {/* 댓글 */}
            <MasterLastComment videoIdx={videoDetail.videoIdx} />

            {/* 훈련 영상 */}
            <View style={styles.trainingVideoWrapper}>
              <Text
                style={[
                  fontStyles.fontSize18_Semibold,
                  {
                    color: COLORS.black,
                    letterSpacing: -0.004,
                  },
                ]}>
                훈련영상
              </Text>
              {trainingDetail.trainingIdx && (
                <TrainingVideoItem trainingDetail={trainingDetail} />
              )}
            </View>

            {/* 다른 마스터 영상 */}
            {otherVideoList.length > 0 && (
              <MasterVideoTab
                type="OTHER"
                title="또 다른 마스터 영상"
                videoList={otherVideoList}
              />
            )}
          </ScrollView>

          {/* 모달 > 영상 더보기 > 신고 */}
          <SPMoreModal
            transparent={true}
            visible={showVideoMore}
            onClose={closeVideoModal}
            type={MODAL_MORE_TYPE.MASTER_VIDEO}
            idx={videoDetail.videoIdx}
            memberButtons={[MODAL_MORE_BUTTONS.REPORT]}
          />
        </>
      )}
    </SafeAreaView>
  );
}

export default memo(MasterVideoDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: '100%',
  },
  content: {
    rowGap: 24,
  },
  trainingVideoWrapper: {
    paddingHorizontal: 16,
    rowGap: 16,
  },
});
