import React, { memo, useEffect, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SPGifs } from '../../assets/gif';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { apiSaveChallengeVideo } from '../../api/RestAPI';
import VideoUtils from '../../utils/VideoUtils';
import {
  AccessDeniedException,
  CustomException,
} from '../../common/exceptions';
import { handleError } from '../../utils/HandleError';
import { getVideoMetaData } from 'react-native-compressor';
import { SafeAreaView } from 'react-native-safe-area-context';

// 상수값
const MAX_FILE_NAME_LENGTH = 60; // 업로드 동영상 파일명

// PIE 트레이닝 > 클래스 마스터 > 등록중
function ChallengeRegistering({ route }) {
  const { width } = useWindowDimensions();

  let imageHeight;
  if (width <= 480) {
    imageHeight = 203;
  } else {
    const aspectRatio = 360 / 203;
    imageHeight = width / aspectRatio;
  }

  // 전달 파라미터 > 접근 유효성 검증
  const {
    videoURL,
    parentIdx,
    videoIdx,
    videoName,
    videoType,
    title,
    description,
    isOpenVideo,
    isAgreed,
  } = route?.params || {
    videoURL: '',
    videoIdx: '',
    parentIdx: '',
    videoName: '',
    videoType: '',
    title,
    description,
    isOpenVideo,
    isAgreed,
  };

  if (
    !videoURL ||
    !parentIdx ||
    !videoIdx ||
    !title ||
    !description ||
    !isAgreed
  ) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }

  // [ state ] 동영상 & 썸네일
  const [videoDurationSec, setVideoDurationSec] = useState(''); // 동영상 재생시간
  const [compressionProgress, setCompressionProgress] = useState(''); // 압축 진행률
  const [compressedVideoPath, setCompressedVideoPath] = useState(''); // 압축 동영상 경로

  const [thumbnailImagePath, setThumbnailImagePath] = useState(''); // 썸네일 경로
  const [thumbnailImageType, setThumbnailImageType] = useState(''); // 썸네일 타입
  const [thumbnailImageName, setThumbnailImageName] = useState(''); // 썸네일 이름

  // [ util ] 동영상 압축
  const compressUploadVideo = async videoPath => {
    try {
      // 비트레이트 계산
      const { size: orgSize, duration } = await getVideoMetaData(videoPath);

      const orgBitrate =
        Platform.OS === 'ios'
          ? (orgSize / duration) * 8 // = ios
          : ((orgSize * 1024) / duration) * 8; // = android
      const compressRate = 0.45; // Platform.OS === 'ios' ? 1 : 0.45; // iOS > 프레임 레이트, 해상도, 코덱 등 다른 파라미터 자동 변경 대응
      const calBitrate = Math.ceil((orgBitrate * compressRate) / 10) * 10; // 짝수 맞춤

      const compressedPath = await VideoUtils.compressVideo(
        videoPath,
        setCompressionProgress,
        calBitrate,
      );

      // 압축 완료
      setVideoDurationSec(Math.floor(duration));
      setCompressionProgress(100);
      setCompressedVideoPath(compressedPath);

      // 썸네일 추출
      const { path, mime } = await VideoUtils.getVideoThumbnail(compressedPath);
      const fileName = VideoUtils.extractThumbnailFileNameWithExt(path, mime);
      setThumbnailImagePath(path);
      setThumbnailImageType(mime);
      setThumbnailImageName(fileName);
    } catch (error) {
      handleError(new CustomException('파일을 읽어오는데 실패했습니다.'));
      NavigationService.goBack();
    }
  };

  // [ api ] 챌린지 영상 등록
  const saveChallengeVideo = async () => {
    try {
      // 파라미터 설정 ( JSON, File )
      const formData = new FormData();

      const params = {
        parentVideoIdx: parentIdx,
        title,
        contents: description,
        showYn: isOpenVideo ? 'Y' : 'N',
        videoPlaySec: videoDurationSec,
      };
      formData.append('dto', {
        string: JSON.stringify(params),
        type: 'application/json',
      });
      formData.append('videoFile', {
        uri: compressedVideoPath,
        name:
          videoName.length < MAX_FILE_NAME_LENGTH
            ? videoName
            : videoName.substring(
                videoName.length - MAX_FILE_NAME_LENGTH,
                videoName.length,
              ),
        type: videoType,
      });
      formData.append('thumbFile', {
        uri: thumbnailImagePath,
        name:
          thumbnailImageName.length < MAX_FILE_NAME_LENGTH
            ? thumbnailImageName
            : thumbnailImageName.substring(
                thumbnailImageName.length - MAX_FILE_NAME_LENGTH,
                thumbnailImageName.length,
              ),
        type: thumbnailImageType,
      });

      const { data } = await apiSaveChallengeVideo(formData);

      if (data) {
        VideoUtils.clearThubnailCache();

        NavigationService.replace(navName.challengeRegistrationComplete, {
          parentIdx,
          videoIdx,
        });
      }
    } catch (error) {
      VideoUtils.clearThubnailCache();

      handleError(error);
      NavigationService.goBack();
    }
  };

  // [ useEffect ] 동영상 압축
  useEffect(() => {
    if (videoURL) {
      compressUploadVideo(videoURL);
    }
  }, [videoURL]);

  // [ useEffect ] 동영상 업로드
  useEffect(() => {
    if (
      compressionProgress === 100 &&
      thumbnailImagePath &&
      thumbnailImageType &&
      thumbnailImageName &&
      videoDurationSec &&
      compressedVideoPath
    ) {
      saveChallengeVideo();
    }
  }, [
    compressionProgress,
    thumbnailImagePath,
    thumbnailImageType,
    thumbnailImageName,
    videoDurationSec,
    compressedVideoPath,
  ]);

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentBox}>
        <Image
          source={SPGifs.registering}
          style={{ width: 140, height: 140, marginBottom: 24 }}
        />
        <Text style={styles.mainText}>영상을 등록하는 중입니다.</Text>
        <View>
          <Text style={styles.subText}>잠시만 기다리시면</Text>
          <Text style={styles.subText}>챌린지 영상 등록이 완료됩니다.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(ChallengeRegistering);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  contentBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 64,
  },
  mainText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 16,
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
    textAlign: 'center',
  },
});
