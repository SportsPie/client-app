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
import { useDispatch, useSelector } from 'react-redux';
import { moreClassMaterVideoListAction } from '../../redux/reducers/list/moreClassMasterVideoListSlice';
import { trainingDetailAction } from '../../redux/reducers/list/trainingDetailSlice';
import { masterDetailAction } from '../../redux/reducers/list/masterDetailSlice';
import { moreClassMaterCommentListAction } from '../../redux/reducers/list/moreClassMasterCommentListSlice';

const masterDetailInit = {
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
};
function MasterVideoDetail({ route }) {
  const dispatch = useDispatch();
  // 페이지 파라미터  > 접근 유효성 검사
  const { videoIdx } = route?.params || { videoIdx: '' };
  if (!videoIdx) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }
  const noParamReset = route?.params?.noParamReset;
  const pageKey = route?.params?.pageKey ? `${route?.params?.pageKey}` : '1';

  const listName = 'masterDetail';
  let pageState = useSelector(selector => selector[listName]);
  pageState = pageState?.data?.[pageKey] || {};
  const {
    masterVideoList: otherVideoList,
    refreshing,
    loading,
    videoPagingKey: otherVideoPagingKey,
  } = pageState;
  const masterDetail = pageState?.masterDetail || {};
  const action = masterDetailAction;
  const { width } = useWindowDimensions();
  let imageHeight;

  if (width <= 480) {
    imageHeight = 640;
  } else {
    const aspectRatio = 360 / 640;
    imageHeight = width / aspectRatio;
  }
  // [ ref ]
  const pageRef = useRef();

  // [ state ]
  const [trainingDetail, setTrainingDetail] = useState({
    trainingIdx: '',
    thumbPath: '',
    trainingName: '',
    programDesc: '',
  }); // 훈련영상 영상 상세
  const [showVideoMore, setShowVideoMore] = useState(false); // 영상 더보기 모달 Display

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
      videoIdx: masterDetail.videoIdx,
      trainingIdx: masterDetail.trainingIdx,
      pagingKey: otherVideoPagingKey,
    });
  };

  // [ api ] 마스터 영상 상세 조회
  const getMasterVideoDetail = async () => {
    try {
      const { data } = await apiGetMasterVideoDetail(videoIdx);

      if (data) {
        // pageRef.current.scrollTo(0, 0);
        dispatch(action.setMasterDetail({ key: pageKey, data: data.data }));
        dispatch(
          action.modifyItem({
            idx: videoIdx,
            idxName: 'videoIdx',
            item: data.data,
          }),
        );
        dispatch(
          trainingDetailAction.modifyItem({
            idxName: 'videoIdx',
            idx: videoIdx,
            item: data.data,
          }),
        );
        dispatch(
          moreClassMaterVideoListAction.modifyItem({
            idxName: 'videoIdx',
            idx: videoIdx,
            item: data.data,
          }),
        );
      }
    } catch (error) {
      if (error.code === 4907 || error.code === 9999) {
        dispatch(moreClassMaterCommentListAction.refresh());
        dispatch(moreClassMaterVideoListAction.refresh());
      }
      handleError(error);
    }
  };

  // [ api ] 트레이닝 상세 조회
  const getTrainingDetail = async () => {
    try {
      const { data } = await apiGetTrainingDetail(masterDetail.trainingIdx);

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
        videoIdx: masterDetail.videoIdx, // 상세 조회 시, API 필터
        trainingIdx: masterDetail.trainingIdx,
      });

      if (data) {
        dispatch(
          action.setPagingKey({ key: pageKey, data: data.data.pagingKey }),
        );
        dispatch(
          action.setMasterVideoList({ key: pageKey, data: data.data.list }),
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!noParamReset) {
        dispatch(action.reset(pageKey));
        NavigationService.replace(navName.masterVideoDetail, {
          ...(route?.params || {}),
          noParamReset: true,
        });
      } else if (videoIdx) getMasterVideoDetail();
    }, [videoIdx, noParamReset]),
  );

  // [ useFocusEffect ] 훈련영상 상세
  useEffect(() => {
    if (noParamReset && masterDetail.trainingIdx) getTrainingDetail();
  }, [masterDetail.trainingIdx, noParamReset]);

  // [ useFocusEffect ] 다른 마스터 영상 리스트
  useEffect(() => {
    if (noParamReset && masterDetail.videoIdx && masterDetail.trainingIdx) {
      getMasterVideoList();
    }
  }, [masterDetail.videoIdx, masterDetail.trainingIdx, noParamReset]);

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      {masterDetail.videoIdx && (
        <>
          <Header
            title={masterDetail.trainingName}
            rightContent={
              !masterDetail.isMine && (
                <Pressable style={{ padding: 10 }} onPress={openVideoModal}>
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
            {masterDetail.videoPath && (
              <SPSingleVideo
                source={masterDetail.videoPath}
                thumbnailPath={masterDetail.thumbPath ?? ''}
                repeat={true}
                isPaused={true}
                disablePlayPause={true}
                onLoad={() => setIsVideoLoading(false)}
                onFullScreen={moveToMasterReels}
              />
            )}

            {/* 내용 */}
            <MasterVideoDescription
              videoIdx={masterDetail.videoIdx}
              isLike={masterDetail.isLike}
              nickName={masterDetail.memberNickName}
              profilePath={masterDetail.profilePath}
              title={masterDetail.title}
              description={masterDetail.contents}
              cntView={masterDetail.cntView}
              cntLike={masterDetail.cntLike}
              regDate={masterDetail.regDate}
            />

            {/* 댓글 */}
            <MasterLastComment videoIdx={masterDetail.videoIdx} />

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
                pageKey={pageKey}
              />
            )}
          </ScrollView>

          {/* 모달 > 영상 더보기 > 신고 */}
          <SPMoreModal
            transparent={true}
            visible={showVideoMore}
            onClose={closeVideoModal}
            type={MODAL_MORE_TYPE.MASTER_VIDEO}
            idx={masterDetail.videoIdx}
            targetUserIdx={masterDetail.memberIdx}
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
