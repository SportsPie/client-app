import React, { memo, useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import fontStyles from '../../styles/fontStyles';
import ClassVideoItem from './ClassVideoItem';
import { apiGetTrainingVideoList } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';

// PIE 트레이닝 > 상세 > 클래스 영상 리스트
function ClassVideoTab({ trainingIdx }) {
  // [ state ]
  const [videoList, setVideoList] = useState([]); // 클래스 영상 리스트

  // [ util ] 컴포넌트 렌더
  const renderItem = useCallback(
    ({ item, index }) => {
      let isCurrentStep = false;

      // 현재 Step 계산
      if (!item.masterDate) {
        if (index === 0) {
          isCurrentStep = true;
        } else if (videoList[index - 1].masterDate) {
          isCurrentStep = true;
        } else {
          isCurrentStep = false;
        }
      }

      return (
        <ClassVideoItem
          key={`video-item-${item.videoIdx}`}
          index={index}
          item={{ ...item, isCurrentStep }}
        />
      );
    },
    [videoList],
  );

  // [ api ] 트레이닝 리스트 조회
  const getTrainingVideoList = async () => {
    try {
      const { data } = await apiGetTrainingVideoList(trainingIdx);

      if (data) {
        setVideoList([...data.data]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ useFocusEffect ] 트레이닝 리스트 조회
  useFocusEffect(
    useCallback(() => {
      if (trainingIdx) getTrainingVideoList();
    }, [trainingIdx]),
  );

  // [ return ]
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        전체 훈련 영상 {videoList.length === 0 ? '' : videoList.length}
      </Text>
      <FlatList
        scrollEnabled={false}
        data={videoList}
        keyExtractor={item => item.videoIdx}
        renderItem={renderItem}
        contentContainerStyle={{
          rowGap: 16,
        }}
      />
    </View>
  );
}

export default memo(ClassVideoTab);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    rowGap: 16,
    paddingBottom: 24,
  },
  headerText: {
    ...fontStyles.fontSize18_Semibold,
    paddingLeft: 16,
  },
});
