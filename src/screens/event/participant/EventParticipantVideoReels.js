import React, { memo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { SPSvgs } from '../../../assets/svg';
import Avatar from '../../../components/Avatar';
import Header from '../../../components/header';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import SPMultipleVideoForReels from '../../../components/SPMultipleVideoForReels';
import { handleError } from '../../../utils/HandleError';
import { SPToast } from '../../../components/SPToast';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../../components/SPMoreModal';
import { AccessDeniedException } from '../../../common/exceptions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiDeleteEventVideo } from '../../../api/RestAPI';
import NavigationService from '../../../navigation/NavigationService';
import { moreEventVideoListAction } from '../../../redux/reducers/list/moreEventVideoListSlice';

// 상수값
const MAX_DESC_LENGTH = 50; // 더보기 Text 길이

// PIE 트래이닝 > 마스터 > 동영상 릴스
function EventParticipantVideoReels({ route }) {
  const dispatch = useDispatch();
  const trlRef = useRef({ current: { disabled: false } });
  const isLogin = useSelector(selector => selector.auth)?.isLogin;

  // 페이지 파라미터 > 접근 유효성 검사
  const { video } = route?.params || {
    video: null,
  };
  if (!video) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }

  // [ state ]
  const [collapse, setCollapse] = useState(true); // 상세 설명 더보기
  const [showVideoMore, setShowVideoMore] = useState(false); // 영상 더보기 모달 Display

  // [ util ] 영상 '더보기' 모달 Open
  const openVideoModal = () => {
    setShowVideoMore(true);
  };

  // [ util ] 영상 '더보기' 모달 Close
  const closeVideoModal = () => {
    setShowVideoMore(false);
  };

  const removeEventVideo = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;

    try {
      const { data } = await apiDeleteEventVideo(video.videoIdx);
      dispatch(moreEventVideoListAction.refresh());
      SPToast.show({ text: '영상을 삭제했습니다.' });
      NavigationService.goBack();
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  // [ return ]
  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <Header
          title={video.trainingName}
          rightContent={
            video.isMine && (
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
        {video && (
          <SPMultipleVideoForReels
            source={[video]}
            // onReachLast={getNextPage}
            // onChangeVideo={changeTargetVideo}
          />
        )}

        {/* 내용 */}
        <LinearGradient
          colors={[`${COLORS.black}10`, `${COLORS.black}40`]}
          style={styles.videoDesWrapper}>
          <Text style={styles.titleText}>{video.title}</Text>

          <View style={styles.userInfoWrapper}>
            <Avatar
              disableEditMode
              imageSize={24}
              imageURL={video.profilePath}
            />
            <Text style={styles.usernameText}>{video.memberName}</Text>
          </View>

          <View
            style={{
              flexDirection: collapse ? 'row' : 'column',
              alignItems: collapse ? 'center' : 'flex-start',
              gap: 8,
            }}>
            <Text style={styles.videoDesText}>
              {!collapse && video.contents.length > MAX_DESC_LENGTH
                ? `${video.contents.substring(0, MAX_DESC_LENGTH)}...`
                : video.contents}
            </Text>

            {!collapse && (
              <Pressable onPress={() => setCollapse(!collapse)}>
                <Text style={styles.viewMoreButtonText}>더 보기</Text>
              </Pressable>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* 모달 > 영상 더보기 > 신고 */}
      <SPMoreModal
        transparent={true}
        visible={showVideoMore}
        onClose={closeVideoModal}
        type={MODAL_MORE_TYPE.EVENT_VIDEO}
        idx={video.videoIdx}
        memberButtons={[MODAL_MORE_BUTTONS.REMOVE]}
        onDelete={removeEventVideo}
      />
    </>
  );
}

export default memo(EventParticipantVideoReels);

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
