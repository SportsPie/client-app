import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import React, { memo } from 'react';
import { navName } from '../../common/constants/navName';
import { AccessDeniedException } from '../../common/exceptions';
import { handleError } from '../../utils/HandleError';
import SPHeader from '../../components/SPHeader';
import { SPGifs } from '../../assets/gif';
import NavigationService from '../../navigation/NavigationService';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function ChallengeRegistrationComplete({ route }) {
  const { width } = useWindowDimensions();

  let imageHeight;
  if (width <= 480) {
    imageHeight = 203;
  } else {
    const aspectRatio = 360 / 203;
    imageHeight = width / aspectRatio;
  }

  // 전달 파라미터 > 접근 유효성 검증
  const { videoIdx } = route?.params || {
    videoIdx: '',
  };
  if (!videoIdx) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header closeIcon />

      <View style={styles.contentBox}>
        <Image
          source={SPGifs.success}
          style={{ width: 100, height: 100, marginBottom: 24 }}
        />
        <View style={styles.mainTextBox}>
          <Text style={styles.mainText}>챌린지 등록이</Text>
          <Text style={styles.mainText}>완료되었어요</Text>
        </View>
        <View>
          <Text style={styles.subText}>
            챌린지 영상 등록은 확인이 필요해요.
          </Text>
          <Text style={styles.subText}>끝나는대로 알려드릴게요.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(ChallengeRegistrationComplete);

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
