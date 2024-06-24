import React, { memo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { navName } from '../../../common/constants/navName';
import NavigationService from '../../../navigation/NavigationService';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';

function TrainingVideoItem({
  trainingDetail = {
    trainingIdx: '',
    thumbPath: '',
    trainingName: '',
    programDesc: '',
  },
}) {
  const { width } = useWindowDimensions();
  let imageWidth = 146;
  let imageHeight = 82;

  if (width > 480) {
    imageWidth = (width * 146) / 480;
    imageHeight = (imageWidth * 82) / 146;
  }

  // [ util ] 훈련영상 상세 페이지 이동
  const moveToTrainingDetail = idx => {
    NavigationService.navigate(navName.trainingDetail, { trainingIdx: idx });
  };

  // [ return ]
  return (
    <View
      style={styles.container}
      onTouchEnd={() => moveToTrainingDetail(trainingDetail.trainingIdx)}>
      <Image
        source={{ uri: trainingDetail.thumbPath }}
        style={{
          width: imageWidth,
          height: imageHeight,
          borderRadius: 12,
        }}
      />

      <View style={styles.content}>
        <Text style={styles.titleText}>클래스 제목</Text>
        <Text
          style={[
            fontStyles.fontSize14_Semibold,
            {
              color: '#121212',
              letterSpacing: 0.203,
            },
          ]}>
          {trainingDetail.trainingName}
        </Text>
        <Text style={styles.desText} numberOfLines={2}>
          {trainingDetail.programDesc}
        </Text>
      </View>
    </View>
  );
}

export default memo(TrainingVideoItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
  content: {
    rowGap: 8,
    flex: 1,
  },
  titleText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelNeutral,
    letterSpacing: 0.302,
  },
  desText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.302,
  },
});
