import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import Header from '../../components/header';
import ChallengeLastComment from '../../components/training/challenge-detail/ChallengeLastComment';
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
import { useDispatch, useSelector } from 'react-redux';
import { moreChallengeVideoListAction } from '../../redux/reducers/list/moreChallengeVideoListSlice';
import { challengeListAction } from '../../redux/reducers/list/challengeListSlice';
import { store } from '../../redux/store';
import { challengeDetailAction } from '../../redux/reducers/list/challengeDetailSlice';
import Utils from '../../utils/Utils';
import ChallengeContentItem from '../../components/training/challenge-detail/ChallengeContentItem';
import ListEmptyView from '../../components/ListEmptyView';
import { moreChallengeCommentListAction } from '../../redux/reducers/list/moreChallengeCommentListSlice';

// 챌린지 영상 상세
export function ChallengeDetail({ route }) {
  const dispatch = useDispatch();
  const flatListRef = useRef();
  const trlRef = useRef({ current: { disabled: false } });
  // 페이지 파라미터 > 접근 제한
  const { videoIdx } = route?.params || { videoIdx: '' };
  if (!videoIdx) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }
  const noParamReset = route?.params?.noParamReset;
  const pageKey = route?.params?.pageKey ? `${route?.params?.pageKey}` : '1';
  const fromMorePage = route?.params?.fromMorePage;

  const listName = 'challengeDetail';
  let pageState = useSelector(selector => selector[listName]);
  pageState = pageState?.data?.[pageKey] || {};
  const {
    page: challengePage,
    isLast,
    list: challengeList,
    refreshing,
    loading: videoLoading,
    pagingKey: videoPagingKey,
  } = pageState;
  const challengeDetail = pageState?.challengeDetail || {};

  const action = challengeDetailAction;

  // [ state ]
  const [isScrollable, setIsScrollable] = useState(true); // 스크롤 동작

  // [ state ] 모달
  const [showSelectModal, setShowSelectModal] = useState(false); // 동영상 첨부 모달
  const [showVideoMoreModal, setShowVideoMoreModal] = useState(false); // 영상 더보기 모달 Display
  const [videoLoaded, setVideoLoaded] = useState(false);

  const [showVideo, setShowVideo] = useState(false);
  const [layoutTimer, setLayoutTimer] = useState();
  const [layoutDone, setLayoutDone] = useState(false);

  // 영상 상제
  const [detailHeight, setDetailHeight] = useState();

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
      videoIdx: challengeDetail.videoIdx,
      parentIdx: challengeDetail.parentVideoIdx,
      pagingKey: videoPagingKey,
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
          videoIdx: challengeDetail.videoIdx,
          videoName,
          videoType,
          parentIdx: challengeDetail.parentVideoIdx || challengeDetail.videoIdx,
        });
        break;
      case 'ALBUM':
        NavigationService.navigate(navName.challengeVideoPlayer, {
          videoURL: fileUrl,
          videoIdx: challengeDetail.videoIdx,
          videoName,
          videoType,
          parentIdx: challengeDetail.parentVideoIdx || challengeDetail.videoIdx,
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
      videoIdx: challengeDetail.videoIdx,
    });
  };

  // [ util ] 챌린지 페이징
  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast && videoLoaded) {
        const prevPage = store.getState()[listName]?.data[pageKey]?.page;
        dispatch(action.setPage({ key: pageKey, data: prevPage + 1 }));
      }
    }, 0);
  };

  // [ util ] 동영상 풀 스크린 토글
  const toggleFullScreenMode = value => {
    // scrollRef.current.scrollTo({
    //   x: 0,
    //   y: 0,
    //   animated: false,
    // });
    setIsScrollable(value);
  };

  // [ api ] 챌린지 영상 '상세'
  const getChallengeDetail = async () => {
    try {
      const { data } = await apiGetChallengeDetail(videoIdx);

      if (data) {
        dispatch(action.setChallengeDetail({ key: pageKey, data: data.data }));
        dispatch(
          action.modifyItem({
            idxName: 'videoIdx',
            idx: videoIdx,
            item: data.data,
          }),
        );
        dispatch(
          challengeListAction.modifyItem({
            idxName: 'videoIdx',
            idx: videoIdx,
            item: data.data,
          }),
        );
        dispatch(
          moreChallengeVideoListAction.modifyItem({
            idxName: 'videoIdx',
            idx: videoIdx,
            item: data.data,
          }),
        );
      }
    } catch (error) {
      if (error.code === 4907 || error.code === 9999) {
        dispatch(moreChallengeCommentListAction.refresh());
        dispatch(moreChallengeVideoListAction.refresh());
        if (Number(pageKey) > 1) {
          dispatch(action.refresh(Number(pageKey) - 1));
        }
      }
      handleError(error);
    }
    dispatch(action.setLoading({ key: pageKey, data: false }));
  };

  // [ api ] 챌린지 영상 '삭제'
  const removeChallengeVideo = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiRemoveChallengeVideo(videoIdx);

      if (data) {
        Utils.openModal({
          title: '성공',
          body: '영상을 삭제하였습니다.',
        });
        if (!fromMorePage) {
          NavigationService.navigate(navName.training, {
            activeTab: '챌린지',
            paramReset: true,
          });
        } else {
          dispatch(moreChallengeVideoListAction.refresh());
          NavigationService.goBack();
        }
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  // [ api ] 챌린지 참여 영상 리스트 조회
  const getChallengeVideoList = async () => {
    try {
      const { data } = await apiGetChallengeVideoList({
        videoIdx: challengeDetail.videoIdx,
        parentIdx: challengeDetail.parentVideoIdx
          ? challengeDetail.parentVideoIdx
          : challengeDetail.videoIdx,
        page: challengePage,
        pagingKey: videoPagingKey,
        size: 300,
      });

      if (data) {
        dispatch(
          action.setPagingKey({ key: pageKey, data: data.data.pagingKey }),
        );
        dispatch(action.setIsLast({ key: pageKey, data: data.data.isLast }));

        // 1 페이지
        if (challengePage === 1) {
          dispatch(action.setList({ key: pageKey, data: data.data.list }));
        }
        // 2 페이지 이상
        else {
          const prevList = store.getState()[listName]?.data[pageKey]?.list;
          dispatch(
            action.setList({
              key: pageKey,
              data: [...prevList, ...data.data.list],
            }),
          );
        }
      }
    } catch (error) {
      handleError(error);
    }
    dispatch(action.setRefreshing({ key: pageKey, data: false }));
    dispatch(action.setLoading({ key: pageKey, data: false }));
  };

  // [ useEffect ] 챌린지 영상 상세 조회
  const onFocus = async () => {
    try {
      if (!noParamReset) {
        dispatch(action.reset(pageKey));
        NavigationService.replace(navName.challengeDetail, {
          ...(route?.params || {}),
          pageKey,
          noParamReset: true,
        });
      } else if (videoIdx) {
        await getChallengeDetail();
      }
    } catch (error) {
      handleError(error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      onFocus();
      // setVideoLoaded(true);
    }, [videoIdx]),
  );

  const detailVideoIdx = challengeDetail.videoIdx
    ? Number(challengeDetail.videoIdx)
    : '';
  useEffect(() => {
    if (noParamReset && detailVideoIdx) {
      dispatch(action.setRefreshing({ key: pageKey, data: true }));
    }
  }, [noParamReset, detailVideoIdx]);

  // [ useEffect ] 챌린지 참여 영상 페이징  useEffect(()=>{
  useEffect(() => {
    if (noParamReset && detailVideoIdx && videoLoaded) {
      if (
        (refreshing && challengePage === 1) ||
        (!refreshing && challengePage > 1)
      ) {
        getChallengeVideoList();
      }
    }
  }, [challengePage, refreshing, noParamReset, detailVideoIdx, videoLoaded]);

  useEffect(() => {
    if (videoLoaded && layoutDone) {
      setShowVideo(true);
    } else {
      setShowVideo(false);
    }
  }, [layoutDone, videoLoaded]);

  const challengeVideoDetail = useMemo(() => {
    return (
      <View
        onLayout={event => {
          if (videoLoaded) {
            const { x, y, width, height } = event.nativeEvent.layout;
            if (layoutTimer) {
              clearTimeout(layoutTimer);
              setLayoutTimer(null);
            }
            const timer = setTimeout(() => {
              setLayoutDone(true);
            }, 300);
            setLayoutTimer(timer);
          }
        }}>
        {/* 동영상 & 썸네일 */}
        {challengeDetail.videoPath && (
          <SPSingleVideo
            source={challengeDetail.videoPath}
            thumbnailPath={challengeDetail.thumbPath ?? ''}
            repeat={true}
            isPaused={true}
            disablePlayPause={true}
            onLoad={() => {
              setVideoLoaded(true);
            }}
            onFullScreen={
              challengeDetail.parentVideoIdx
                ? moveToChallengeReels
                : toggleFullScreenMode
            }
          />
        )}

        {/* 상세 */}
        <View style={{ marginVertical: 24 }}>
          <ChallengeVideoDescription
            videoIdx={challengeDetail.videoIdx}
            parentVideoIdx={challengeDetail.parentVideoIdx}
            nickName={challengeDetail.memberNickName}
            profilePath={challengeDetail.profilePath}
            title={challengeDetail.title}
            description={challengeDetail.contents}
            isLike={challengeDetail.isLike}
            like={challengeDetail.cntLike}
            view={challengeDetail.cntView}
            date={challengeDetail.regDate}
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
          <ChallengeLastComment videoIdx={challengeDetail.videoIdx} />
        </View>

        {/* /!* 도전 챌린지 *!/ */}
        {/* <ChallengeContent */}
        {/*  videoList={challengeList} */}
        {/*  videoLoading={videoLoading} */}
        {/*  pageKey={pageKey} */}
        {/* /> */}
      </View>
    );
  }, [challengeDetail, layoutTimer, videoLoaded]);

  const [refreshNum, setRefreshNum] = useState(0);

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      {isScrollable && (
        <Header
          title={challengeDetail.challengeTitle}
          rightContent={
            challengeDetail.parentVideoIdx && (
              <Pressable style={{ padding: 10 }} onPress={openVideoMoreModal}>
                <SPSvgs.EllipsesVertical />
              </Pressable>
            )
          }
        />
      )}
      <View style={{ flex: 1 }}>
        {videoLoading ? (
          <SPLoading />
        ) : (
          <View style={{ flex: 1, position: 'relative' }}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: showVideo ? 0 : 1,
                opacity: showVideo ? 0 : 1,
              }}>
              <SPLoading />
            </View>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: showVideo ? 1 : 0,
                opacity: showVideo ? 1 : 0,
              }}>
              <FlatList
                scrollEnabled={isScrollable}
                ref={flatListRef}
                key={showVideo ? pageKey : 'loading'}
                style={{ flex: 1, position: 'relative' }}
                data={showVideo && !videoLoading ? challengeList : []}
                // keyExtractor={item => item?.videoIdx}
                extraData={refreshNum}
                initialNumToRender={30}
                maxToRenderPerBatch={30}
                windowSize={30}
                ListHeaderComponent={challengeVideoDetail}
                renderItem={({ item }) => {
                  return (
                    <View
                      style={{
                        paddingTop: 16,
                        paddingHorizontal: 16,
                      }}>
                      <ChallengeContentItem
                        challenge={item}
                        pageKey={pageKey}
                      />
                    </View>
                  );
                }}
                onEndReached={loadMoreProjects}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  if (videoLoaded) {
                    setRefreshNum(prev => prev + 1);
                  }
                }}
                ListEmptyComponent={
                  videoLoaded && !videoLoading ? (
                    <View style={{ flex: 1 }}>
                      <ListEmptyView text="등록된 챌린지 영상이 없습니다." />
                    </View>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        height: '100%',
                      }}>
                      <SPLoading />
                    </View>
                  )
                }
                ListFooterComponent={<View style={{ height: 16 }} />}
              />
            </View>
          </View>
        )}
      </View>
      <View>
        {/* 모달 : 영상 소스 선택 */}
        <SPSelectVideoModal
          title="챌린지 동영상 업로드"
          visible={showSelectModal}
          onClose={() => setShowSelectModal(false)}
          setLoading={() => {
            dispatch(action.setLoading({ key: pageKey, data: true }));
          }}
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
          idx={challengeDetail.videoIdx}
          targetUserIdx={challengeDetail.memberIdx}
          memberButtons={
            challengeDetail.isMine
              ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
              : [MODAL_MORE_BUTTONS.REPORT]
          }
        />
      </View>
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
