import React, { memo, useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SPGifs } from '../../assets/gif';
import { handleError } from '../../utils/HandleError';
import { AccessDeniedException } from '../../common/exceptions';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { trainingDetailAction } from '../../redux/reducers/list/trainingDetailSlice';
import { VIDEO_UPLOAD_TYPE } from '../../common/constants/VideoUploadType';

function VideoUploadComplete({ route }) {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();

  let imageHeight;
  if (width <= 480) {
    imageHeight = 203;
  } else {
    const aspectRatio = 360 / 203;
    imageHeight = width / aspectRatio;
  }

  // 전달 파라미터 > 접근 유효성 검증
  const { videoIdx, uploadType } = route?.params || {
    videoIdx: '',
    uploadType: '',
  };

  switch (uploadType) {
    case VIDEO_UPLOAD_TYPE.EVENT:
      break;
    default: {
      if (!videoIdx) {
        handleError(new AccessDeniedException('잘못된 접근입니다.'));
      }
      break;
    }
  }
  useFocusEffect(
    useCallback(() => {
      // redux에 저장된 리스트 정보 refresh
      // dispatch(trainingDetailAction.refresh());
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header closeIcon />

      <View style={styles.contentBox}>
        <Image
          source={SPGifs.success}
          style={{ width: 100, height: 100, marginBottom: 24 }}
        />
        <View style={styles.mainTextBox}>
          <Text style={styles.mainText}>영상 등록이</Text>
          <Text style={styles.mainText}>완료되었어요</Text>
        </View>
        <View>
          <Text style={styles.subText}>영상 등록은 확인이 필요해요.</Text>
          <Text style={styles.subText}>끝나는대로 알려드릴게요.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(VideoUploadComplete);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 64,
  },
  mainTextBox: {
    marginBottom: 16,
  },
  mainText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
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
