import React, { memo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import SPImages from '../../assets/images';
import { SPSvgs } from '../../assets/svg';
import { APPROVE_STATE } from '../../common/constants/approveState';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import { PrimaryButton } from '../PrimaryButton';
import SPSelectVideoModal from '../SPSelectVideoModal';

function ClassVideoItem({ item, index }) {
  const { width: screenWidth } = useWindowDimensions();
  let imageHeight;

  if (screenWidth <= 480) {
    imageHeight = 203;
  } else {
    const aspectRatio = 16 / 9;
    imageHeight = screenWidth / aspectRatio;
  }

  // [ state ] 모달
  const [showSelectModal, setShowSelectModal] = useState(false);

  // [ util ] 마스터 영상 업로드
  const openVideoSelectModal = () => {
    if (item.viewDate) {
      setShowSelectModal(true);
    } else if (item.aprvState === APPROVE_STATE.WAIT) {
      Utils.openModal({
        body: '승인대기중인 마스터 영상이 있습니다.',
        closeEvent: MODAL_CLOSE_EVENT.movePage,
        pageName: navName.traningVideoDetail,
        data: {
          videoIdx: item.videoIdx,
          isCurrentStep: item.isCurrentStep,
        },
      });
    } else {
      Utils.openModal({
        body: '영상 시청을 완료해주세요.',
        closeEvent: MODAL_CLOSE_EVENT.movePage,
        pageName: navName.traningVideoDetail,
        data: {
          videoIdx: item.videoIdx,
          isCurrentStep: item.isCurrentStep,
        },
      });
    }
  };

  // [ util ] 마스터 영상 업로드
  const uploadMyMasterVideo = (type, fileUrl, videoName, videoType) => {
    switch (type) {
      case 'CAMERA':
        NavigationService.navigate(navName.addDetails, {
          videoURL: fileUrl,
          videoIdx: item.videoIdx,
          videoName,
          videoType,
          trainingIdx: item.trainingIdx,
        });
        break;
      case 'ALBUM':
        NavigationService.navigate(navName.videoPlayer, {
          videoURL: fileUrl,
          videoIdx: item.videoIdx,
          videoName,
          videoType,
          trainingIdx: item.trainingIdx,
        });
        break;
      default:
        break;
    }
  };

  // [ return ]
  return (
    <Pressable
      onPress={() => {
        if (item.masterDate || item.isCurrentStep || index <= 2) {
          NavigationService.navigate(navName.traningVideoDetail, {
            videoIdx: item.videoIdx,
            isCurrentStep: item.isCurrentStep,
          });
        }
      }}>
      {/* 승인 O */}
      <ImageBackground
        blurRadius={
          !item.masterDate && !item.isCurrentStep && index > 2 ? 20 : 0
        }
        style={[
          styles.itemImage,
          {
            height: imageHeight,
          },
        ]}
        source={
          item.thumbPath ? { uri: item.thumbPath } : SPImages.challengeImage
        }>
        {item.viewDate && (
          <View style={styles.viewWrapper}>
            <SPSvgs.EyeShow stroke={COLORS.white} width={14} height={14} />
            <Text
              style={[fontStyles.fontSize11_Regular, { color: COLORS.white }]}>
              시청완료
            </Text>
          </View>
        )}
        {item.masterDate && <SPSvgs.Stamp style={styles.stamp} />}
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.trainingName}</Text>
        {item.isCurrentStep && (
          <PrimaryButton
            text="클래스 마스터 하기"
            onPress={openVideoSelectModal}
          />
        )}
      </View>

      {/* 승인 X */}
      {!item.masterDate && !item.isCurrentStep && index > 2 && (
        <View style={styles.blurView}>
          <Text style={styles.blurText}>
            {'이전 클래스를 마스터하면\n영상을 볼 수 있어요'}
          </Text>
        </View>
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
    </Pressable>
  );
}

export default memo(ClassVideoItem);

const styles = StyleSheet.create({
  itemImage: {
    width: '100%',
  },
  content: {
    padding: 16,
    rowGap: 8,
  },
  title: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.203,
  },
  text: {
    ...fontStyles.fontSize12_Regular,
    color: COLORS.labelNormal,
    letterSpacing: 0.302,
  },
  viewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    alignSelf: 'flex-start',
    padding: 2,
    borderRadius: 4,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  stamp: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  blurText: {
    ...fontStyles.fontSize18_Medium,
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -0.004,
    top: '-15%',
  },
});
