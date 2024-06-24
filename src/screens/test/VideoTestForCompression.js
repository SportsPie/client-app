import React, { useEffect, useState } from 'react';
import {
  Button,
  Image,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import axios from 'axios';
import ImagePicker, {
  clean,
  cleanSingle,
} from 'react-native-image-crop-picker';
import { getVideoMetaData } from 'react-native-compressor';

// Components
import SPVideo from '../../components/SPVideo';
import SPHeader from '../../components/SPHeader';

// Utils
import VideoUtils from '../../utils/VideoUtils';
import { handleError } from '../../utils/HandleError';

// 초기값
const initialThumbnailInfo = {
  mime: '',
  path: '',
  size: 0,
  width: 0,
  height: 0,
};

// =======================================================================
// [ 테스트 > 동영상 > 촬영 & 압축 ]
// =======================================================================
function VideoTestForCompression() {
  // --------------------------------------------------
  // [ state ]
  // --------------------------------------------------

  const [compressProgress, setCompressProgress] = useState('');
  const [compressedVideoPath, setCompressedVideoPath] = useState('');
  const [thumbnailInfo, setThumbnailInfo] = useState({
    ...initialThumbnailInfo,
  });

  // --------------------------------------------------
  // [ util ]
  // --------------------------------------------------

  // 동영상 촬영 by 카메라
  const openCarmeraForVideo = () => {
    VideoUtils.openCamera(getCompressedVideo);
  };

  // 동영상 선택 from 앨범
  const selectVideoFromAlbum = () => {
    VideoUtils.openAlbum(getCompressedVideo);
  };

  // 동영상 메타데이터 검증 + 압축 + 썸네일 생성
  const getCompressedVideo = videoPath => {
    // 메타데이터 확인
    getVideoMetaData(videoPath)
      .then(async metaData => {
        // 검증
        VideoUtils.validateVideoMetaData(metaData);

        // 압축 > 썸네일
        VideoUtils.compressVideo(videoPath, setCompressProgress).then(
          compressedPath => {
            // 압축 완료 후처리 - 진행률, 파일 경로, 썸네일
            setCompressProgress(100);
            setCompressedVideoPath(compressedPath);

            VideoUtils.getVideoThumbnail(compressedPath).then(thumbnail => {
              setThumbnailInfo(thumbnail);
            });
          },
        );
      })
      .catch(error => {
        // 초기화
        setCompressProgress('');
        setCompressedVideoPath('');
        setThumbnailInfo({ ...initialThumbnailInfo });

        // 에러 핸들러
        handleError(error);
      });
  };

  // --------------------------------------------------
  // [ api ]
  // --------------------------------------------------

  // TODO ::: 파일 업로드
  const requestFileUpload = async () => {
    const formData = new FormData();

    const name = photo.filename;
    const [, type] = name.split('.');

    formData.append('file', {
      name,
      type: 'image/jpeg',
      uri: photo.uri,
    });

    try {
      const {
        data: { path },
      } = await axios.post('http://192.168.0.27:4000/api/upload', formData, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      });
    } catch (e) {
      // Alert.alert('Cant upload', 'Try later');
    }
  };

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------

  // --------------------------------------------------
  // [ return ]
  // --------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      {/* 헤더 */}
      <SPHeader title="video" />

      {/* 동영상 촬영 */}
      <Button title="촬영" onPress={openCarmeraForVideo} />

      {/* 동영상 선택 */}
      <Button title="앨범" onPress={selectVideoFromAlbum} />

      {/* 동영상 업로드 */}
      <Button title="업로드" onPress={requestFileUpload} />

      <Text>{`${compressProgress}%`}</Text>

      {/* 썸네일 */}
      {thumbnailInfo.path && (
        <Image
          source={{ uri: `file://${thumbnailInfo.path}` }}
          style={{ width: 200, height: 200 }}
        />
      )}

      {/* 미리보기 */}
      {compressedVideoPath && (
        <SPVideo source={compressedVideoPath} disableBac />
      )}
    </View>
  );
}

export default VideoTestForCompression;
