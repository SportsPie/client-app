import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import Header from '../../components/header';
import ChallengeLastComment from '../../components/training/challenge-detail/ChallengeLastComment';
import ChallengeContent from '../../components/training/challenge-detail/ChallengeContent';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { handleError } from '../../utils/HandleError';
import { AccessDeniedException } from '../../common/exceptions';
import {
  apiGetChallengeDetail,
  apiGetChallengeVideoList,
  apiRemoveChallengeVideo,
} from '../../api/RestAPI';
import SPLoading from '../../components/SPLoading';
import ChallengeVideoDescription from '../../components/training/challenge-detail/ChallengeVideoDescription';
import SPSelectVideoModal from '../../components/SPSelectVideoModal';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import { SPSvgs } from '../../assets/svg';
import SPSingleVideo from '../../components/SPSingleVideo';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 챌린지 영상 상세
export function ChallengeDetail({ route }) {
  // 페이지 파라미터 > 접근 제한
  const { videoIdx } = route?.params || { videoIdx: '' };
  if (!videoIdx) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }

  // [ ref ]
  const scrollRef = useRef();

  // [ state ]
  const [loading, setLoading] = useState(false); // 데이터 로딩
  const [isScrollable, setIsScrollable] = useState(true); // 스크롤 동작
  const [videoDetail, setVideoDetail] = useState({
    videoIdx: '',
    title: '',
    contents: '',
    thumbPath: '',
    videoPath: '',
    videoTime: '',
    videoGroupIdx: '',
    videoGroupName: '',
    cntComment: 0,
    cntLike: 0,
    cntView: 0,
    confirmYn: null,
    isLike: false,
    isMine: false,
    memberIdx: '',
    memberName: '',
    profilePath: '',
    parentVideoIdx: '',
    regDate: '',
  }); // 챌린지 영상 상세

  // [ state ] 동영상 플레이어
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // [ state ] 모달
  const [showSelectModal, setShowSelectModal] = useState(false); // 동영상 첨부 모달
  const [showVideoMoreModal, setShowVideoMoreModal] = useState(false); // 영상 더보기 모달 Display

  // [ state ]
  const [challengeList, setChallengeList] = useState([]); // 챌린지 영상 리스트
  const [challengePage, setChallengePage] = useState({
    page: '', // 챌린지 페이지
    key: null, // 챌린지 페이지 Key
    isLast: false, // 챌린지 페이지 마지막
  });
  // const [otherVideoloading, setOtherVideoLoading] = useState(false);

  // [ state ] 다른 챌리지 리스트 페이징 Key
  // const [otherChallengePagingKey, setOtherChallengePagingKey] = useState('');

  // [ util ] 다른 챌리지 리스트 페이징 Key
  // const getOtherChallengeListPagingKey = pagingKey => {
  //   setOtherChallengePagingKey(pagingKey);
  // };

  // [ util ] 동영상 업로드
  const openVideoSelectModal = () => {
    setShowSelectModal(true);
  };

  // [ util ] 동영상 '더보기' 모달 Open
  const openVideoMoreModal = () => {
    setShowVideoMoreModal(true);
  };

  // [ util ] 동영상 '더보기' 모달 Close
  const closeVideoMoreModal = () => {
    setShowVideoMoreModal(false);
  };

  // [ util ] 챌린지 영상 '릴스' 이동
  const moveToChallengeReels = () => {
    NavigationService.navigate(navName.challengeContentPlayer, {
      videoIdx: videoDetail.videoIdx,
      parentIdx: videoDetail.parentVideoIdx,
      pagingKey: challengePage.key,
    });
  };

  // [ util ] 챌린지 영상 리스트 스크롤 이벤트
  const handleScroll = event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isScrolledToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isScrolledToBottom) {
      loadMoreProjects();
    }
  };

  // [ util ] 챌린지 영상 '업로드'
  const uploadMyMasterVideo = (type, fileUrl, videoName, videoType) => {
    switch (type) {
      case 'CAMERA':
        NavigationService.navigate(navName.challengeAddDetails, {
          videoURL: fileUrl,
          videoIdx: videoDetail.videoIdx,
          videoName,
          videoType,
          parentIdx: videoDetail.parentVideoIdx || videoDetail.videoIdx,
        });
        break;
      case 'ALBUM':
        NavigationService.navigate(navName.challengeVideoPlayer, {
          videoURL: fileUrl,
          videoIdx: videoDetail.videoIdx,
          videoName,
          videoType,
          parentIdx: videoDetail.parentVideoIdx || videoDetail.videoIdx,
        });
        break;
      default:
        break;
    }
  };

  // [ util ] 챌린지 영상 '수정'
  const moveToModifyChallengeVideo = () => {
    setShowVideoMoreModal(false);

    NavigationService.navigate(navName.challengeEditDetails, {
      videoIdx: videoDetail.videoIdx,
    });
  };

  // [ util ] 챌린지 페이징
  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!challengePage.isLast) {
        setChallengePage(prev => {
          return {
            ...prev,
            page: +prev.page + 1,
          };
        });
      }
    }, 0);
  };

  // [ util ] 동영상 풀 스크린 토글
  const toggleFullScreenMode = value => {
    scrollRef.current.scrollTo({
      x: 0,
      y: 0,
      animated: false,
    });
    setIsScrollable(value);
  };

  // [ api ] 챌린지 영상 '상세'
  const getChallengeDetail = async () => {
    try {
      setLoading(true);
      const { data } = await apiGetChallengeDetail(videoIdx);

      if (data) {
        setVideoDetail({ ...data.data });
      }

      setLoading(false);
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  // [ api ] 챌린지 영상 '삭제'
  const removeChallengeVideo = async () => {
    try {
      setLoading(true);
      const { data } = await apiRemoveChallengeVideo(videoIdx);

      if (data) {
        NavigationService.goBack();
      }

      setLoading(false);
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  // [ api ] 챌린지 참여 영상 리스트 조회
  const getChallengeVideoList = async () => {
    try {
      const { data } = await apiGetChallengeVideoList({
        videoIdx: videoDetail.videoIdx,
        parentIdx: videoDetail.parentVideoIdx
          ? videoDetail.parentVideoIdx
          : videoDetail.videoIdx,
        page: +challengePage.page,
        pagingKey: challengePage.key,
        size: 10,
      });

      if (data) {
        setChallengePage(prev => {
          return {
            ...prev,
            isLast: data.data.isLast,
          };
        });

        // 1 페이지
        if (+challengePage.page === 1) {
          setChallengeList([...data.data.list]);
        }
        // 2 페이지 이상
        else {
          setChallengeList([...challengeList, ...data.data.list]);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ useEffect ] 챌린지 영상 상세 조회
  useFocusEffect(
    useCallback(() => {
      if (videoIdx) getChallengeDetail();
    }, [videoIdx]),
  );

  // [ useEffect ] 챌린지 참여 영상 리스트 조회 ( with. 페이징 난수 Key 생성 )
  useFocusEffect(
    useCallback(() => {
      if (videoDetail.videoIdx) {
        setChallengePage(prev => {
          return {
            ...prev,
            key: Math.floor(Math.random() * 10000),
            page: typeof prev.page === 'string' ? 1 : '1',
          };
        });
      }
    }, [videoDetail.videoIdx]),
  );

  // [ useEffect ] 챌린지 참여 영상 페이징
  useFocusEffect(
    useCallback(() => {
      if (challengePage.page) getChallengeVideoList();
    }, [challengePage.page]),
  );

  // [ return ]
  return loading ? (
    <SPLoading />
  ) : (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      {isScrollable && (
        <Header
          title={videoDetail.challengeTitle}
          rightContent={
            videoDetail.parentVideoIdx && (
              <Pressable style={{ padding: 10 }} onPress={openVideoMoreModal}>
                <SPSvgs.EllipsesVertical />
              </Pressable>
            )
          }
        />
      )}

      {/* 바디 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEnabled={isScrollable}
        scrollEventThrottle={16}>
        {/* 동영상 & 썸네일 */}
        {videoDetail.videoPath && (
          <SPSingleVideo
            source={videoDetail.videoPath}
            thumbnailPath={videoDetail.thumbPath ?? ''}
            repeat={true}
            isPaused={true}
            disablePlayPause={true}
            onLoad={() => setIsVideoLoading(false)}
            onFullScreen={
              videoDetail.parentVideoIdx
                ? moveToChallengeReels
                : toggleFullScreenMode
            }
          />
        )}

        {/* 상세 */}
        <View style={{ marginVertical: 24 }}>
          <ChallengeVideoDescription
            videoIdx={videoDetail.videoIdx}
            parentVideoIdx={videoDetail.parentVideoIdx}
            nickName={videoDetail.memberNickName}
            profilePath={videoDetail.profilePath}
            title={videoDetail.title}
            description={videoDetail.contents}
            isLike={videoDetail.isLike}
            like={videoDetail.cntLike}
            view={videoDetail.cntView}
            date={videoDetail.regDate}
          />
        </View>

        {/* 도전하기 */}
        <PrimaryButton
          buttonStyle={styles.challengeButton}
          text="도전하기"
          onPress={openVideoSelectModal}
        />

        {/* 코멘트 */}
        <View style={{ marginTop: 16 }}>
          <ChallengeLastComment videoIdx={videoDetail.videoIdx} />
        </View>

        {/* 도전 챌린지 */}
        {!isVideoLoading && <ChallengeContent videoList={challengeList} />}
      </ScrollView>

      {/* 모달 : 영상 소스 선택 */}
      <SPSelectVideoModal
        title="챌린지 동영상 업로드"
        visible={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        setLoading={setLoading}
        onComplete={({ type, fileUrl, videoName, videoType }) => {
          uploadMyMasterVideo(type, fileUrl, videoName, videoType);
        }}
      />

      {/* 모달 : 영상 더보기 > 신고 */}
      <SPMoreModal
        transparent={true}
        visible={showVideoMoreModal}
        onClose={closeVideoMoreModal}
        onDelete={removeChallengeVideo}
        onModify={moveToModifyChallengeVideo}
        type={MODAL_MORE_TYPE.CHALLENGE_VIDEO}
        idx={videoDetail.videoIdx}
        targetUserIdx={videoDetail.memberIdx}
        memberButtons={
          videoDetail.isMine
            ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
            : [MODAL_MORE_BUTTONS.REPORT]
        }
      />
    </SafeAreaView>
  );
}

export default memo(ChallengeDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  challengeButton: {
    margin: 16,
  },
});
