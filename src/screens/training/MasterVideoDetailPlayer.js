import React, { memo, useEffect, useState, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { SPSvgs } from '../../assets/svg';
import Avatar from '../../components/Avatar';
import Header from '../../components/header';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import SPMultipleVideoForReels from '../../components/SPMultipleVideoForReels';
import {
  apiGetMasterVideoDetail,
  apiGetMasterVideoList,
  apiLikeChallenge,
  apiUnlikeChallenge,
} from '../../api/RestAPI';
import Utils from '../../utils/Utils';
import { handleError } from '../../utils/HandleError';
import { SPToast } from '../../components/SPToast';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import { AccessDeniedException } from '../../common/exceptions';
import { SafeAreaView } from 'react-native-safe-area-context';

// 초기값
const initVideoDetail = {
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

// 상수값
const MAX_DESC_LENGTH = 50; // 더보기 Text 길이

// PIE 트래이닝 > 마스터 > 동영상 릴스
function MasterVideoDetailPlayer({ route }) {
  const isLogin = useSelector(selector => selector.auth)?.isLogin;

  // 페이지 파라미터 > 접근 유효성 검사
  const { videoIdx, trainingIdx, pagingKey } = route?.params || {
    videoIdx: '',
    trainingIdx: '',
    pagingKey: '',
  };
  if (!videoIdx || !trainingIdx || !pagingKey) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }

  // [ state ]
  const trlRef = useRef({ current: { disabled: false } }); // 다중 클릭 방지
  const [collapse, setCollapse] = useState(true); // 상세 설명 더보기
  const [showVideoMore, setShowVideoMore] = useState(false); // 영상 더보기 모달 Display

  const [targetVideo, setTargetVideo] = useState({ ...initVideoDetail }); // 현재 조회 동영상
  const [videoList, setVideoList] = useState([]); // 동영상 리스트
  const [videoListIsLast, setVideoListIsLast] = useState(false); // 동영상 리스트 마지막
  const [videoListPage, setVideoListPage] = useState(1); // 동영상 리스트 페이지

  // [ util ] 다음 페이지 호출
  const getNextPage = () => {
    if (!videoListIsLast) {
      setVideoListPage(prev => +prev + 1);
    } else {
      SPToast.show({ text: '마지막 영상입니다.' });
    }
  };

  // [ util ] 시청 영상 정보 갱신
  const changeTargetVideo = idx => {
    const info = videoList.find(item => item.videoIdx === idx);

    if (info.videoIdx !== targetVideo.videoIdx) {
      setTargetVideo({ ...info });
      setCollapse(info.contents.length < MAX_DESC_LENGTH);
    }
  };

  // [ util ] 영상 '더보기' 모달 Open
  const openVideoModal = () => {
    setShowVideoMore(true);
  };

  // [ util ] 영상 '더보기' 모달 Close
  const closeVideoModal = () => {
    setShowVideoMore(false);
  };

  // [ util ] 좋아요 등록/취소
  const touchLikeHandler = e => {
    if (!isLogin) {
      SPToast.show({ text: '로그인이 필요합니다.' });
      return;
    }

    if (!trlRef.current.disabled) {
      trlRef.current.disabled = true;

      if (!targetVideo.isLike) {
        likeChallenge();
      } else {
        unLikeChallenge();
      }
    }
  };

  // [ api ] 다른 마스터 영상 리스트 조회
  const getMasterVideoList = async () => {
    try {
      const { data } = await apiGetMasterVideoList({
        page: +videoListPage,
        size: 6,
        pagingKey,
        videoIdx,
        trainingIdx,
      });

      if (data) {
        const list = [...data.data.list];
        setVideoListIsLast(data.data.isLast);

        // 1 페이지
        if (+videoListPage === 1) {
          // 영상 갱신 이력이 있을 수 있기에 상세 영상 다시 조회
          apiGetMasterVideoDetail(videoIdx).then(res => {
            const info = res.data.data;
            setCollapse(info.contents.length < MAX_DESC_LENGTH);
            setTargetVideo({ ...info });
            setVideoList([{ ...info }, ...list]);
          });
        }
        // 2 페이지 이상
        else {
          setVideoList([...videoList, ...list]);
        }

        if (!list || list.length === 0) {
          SPToast.show({ text: '마지막 영상입니다.' });
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ api ] 좋아요 등록
  const likeChallenge = async () => {
    try {
      const { data } = await apiLikeChallenge(targetVideo.videoIdx);

      if (data) {
        // 타겟 정보 갱신
        setTargetVideo({
          ...targetVideo,
          cntLike: targetVideo.cntLike + 1,
          isLike: true,
        });

        // 리스트 내부 정보 갱신
        const targetListIndex = videoList.findIndex(
          v => v.videoIdx === targetVideo.videoIdx,
        );

        if (targetListIndex >= 0) {
          videoList[targetListIndex].cntLike += 1;
          videoList[targetListIndex].isLike = true;
          setVideoList([...videoList]);
        }

        trlRef.current.disabled = false;
      }
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  // [ api ] 좋아요 취소
  const unLikeChallenge = async () => {
    try {
      const { data } = await apiUnlikeChallenge(targetVideo.videoIdx);

      if (data) {
        // 타겟 정보 갱신
        setTargetVideo({
          ...targetVideo,
          cntLike: targetVideo.cntLike - 1,
          isLike: false,
        });

        // 리스트 내부 정보 갱신
        const targetListIndex = videoList.findIndex(
          v => v.videoIdx === targetVideo.videoIdx,
        );

        if (targetListIndex >= 0) {
          videoList[targetListIndex].cntLike -= 1;
          videoList[targetListIndex].isLike = false;
          setVideoList([...videoList]);
        }

        trlRef.current.disabled = false;
      }
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  // [ useEffect ] 초기 데이터 조회
  useEffect(() => {
    if (videoIdx && pagingKey) {
      setVideoListPage(1); // 초기 페이지 정보 입력
    }
  }, [videoIdx, pagingKey]);

  // [  ]
  useEffect(() => {
    if (videoListPage) getMasterVideoList(); // 다른 마스터 영상 리스트
  }, [videoListPage]);

  // [ return ]
  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <Header
          title={targetVideo.trainingName}
          rightContent={
            !targetVideo.isMine && (
              <Pressable onPress={openVideoModal}>
                <SPSvgs.EllipsesVertical fill={COLORS.white} />
              </Pressable>
            )
          }
          headerContainerStyle={{
            backgroundColor: COLORS.transparent,
          }}
          headerTextStyle={{
            color: COLORS.white,
          }}
          leftIconColor={COLORS.white}
        />

        {/* 동영상 */}
        {videoList.length > 0 && (
          <SPMultipleVideoForReels
            source={videoList}
            onReachLast={getNextPage}
            onChangeVideo={changeTargetVideo}
          />
        )}

        {/* 내용 */}
        <LinearGradient
          colors={[`${COLORS.black}10`, `${COLORS.black}40`]}
          style={styles.videoDesWrapper}>
          <Text style={styles.titleText}>{targetVideo.title}</Text>

          <View style={styles.userInfoWrapper}>
            <Avatar
              disableEditMode
              imageSize={24}
              imageURL={targetVideo.profilePath}
            />
            <Text style={styles.usernameText}>{targetVideo.memberName}</Text>
            <Text style={styles.dateText}>{`조회수 ${Utils.changeNumberComma(
              targetVideo.cntView,
            )}`}</Text>
            <SPSvgs.Ellipse />
            <Text style={styles.dateText}>
              {targetVideo.regDate && Utils.formatTimeAgo(targetVideo.regDate)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: collapse ? 'row' : 'column',
              alignItems: collapse ? 'center' : 'flex-start',
              gap: 8,
            }}>
            <Text style={styles.videoDesText}>
              {!collapse && targetVideo.contents.length > MAX_DESC_LENGTH
                ? `${targetVideo.contents.substring(0, MAX_DESC_LENGTH)}...`
                : targetVideo.contents}
            </Text>

            {!collapse && (
              <Pressable onPress={() => setCollapse(!collapse)}>
                <Text style={styles.viewMoreButtonText}>더 보기</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.footerWrapper}>
            <View style={styles.button}>
              <TouchableOpacity onPress={touchLikeHandler}>
                {targetVideo.isLike ? (
                  <SPSvgs.HeartFill fill={COLORS.white} />
                ) : (
                  <SPSvgs.HeartOutline fill={COLORS.white} />
                )}
              </TouchableOpacity>
              <Text
                style={{
                  ...fontStyles.fontSize11_Semibold,
                  // color: COLORS.labelNeutral,
                  color: COLORS.white,
                }}>
                {Utils.changeNumberComma(targetVideo.cntLike)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* 모달 > 영상 더보기 > 신고 */}
      <SPMoreModal
        transparent={true}
        visible={showVideoMore}
        onClose={closeVideoModal}
        type={MODAL_MORE_TYPE.MASTER_VIDEO}
        idx={targetVideo.videoIdx}
        memberButtons={[MODAL_MORE_BUTTONS.REPORT]}
      />
    </>
  );
}

export default memo(MasterVideoDetailPlayer);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black,
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoDesWrapper: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
    width: '100%',
  },
  titleText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.white,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  usernameText: {
    ...fontStyles.fontSize13_Semibold,
    // color: COLORS.labelGray,
    color: COLORS.white,
  },
  dateText: {
    ...fontStyles.fontSize12_Medium,
    // color: COLORS.labelNeutral,
    color: COLORS.white,
  },
  videoDesText: {
    flexShrink: 1,
    ...fontStyles.fontSize14_Medium,
    // color: COLORS.labelNeutral,
    color: COLORS.white,
  },
  viewMoreButtonText: {
    ...fontStyles.fontSize14_Semibold,
    // color: COLORS.labelAlternative,
    color: COLORS.white,
  },
  footerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    backgroundColor: 'rgba(10, 11, 24, 0.48)',
    minHeight: 26,
    borderWidth: 1,
    borderColor: 'rgba(20, 22, 48, 0.48)',
    borderRadius: 999,
    paddingHorizontal: 8,
  },
});
