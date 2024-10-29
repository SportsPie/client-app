import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { SPSvgs } from '../assets/svg';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';

function ImageSizeGetter({ source, getter, resizeMode }) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleLayout = event => {
    const { width, height } = event.nativeEvent.layout;
    if (getter && imageSize.height > 0) getter({ width, height });
  };
  return (
    <View
      style={{ position: 'absolute', top: SCREEN_HEIGHT }}
      onLayout={handleLayout}>
      <Image
        source={{ uri: source }}
        onLoad={event => {
          const { width, height } = event.nativeEvent.source;
          setImageSize({ width, height });
        }}
        style={[
          styles.eventImage,
          imageSize.width && imageSize.height
            ? {
                aspectRatio: imageSize.width / imageSize.height,
                height: undefined,
              }
            : { height: SCREEN_HEIGHT * 0.6 }, // 기본 높이 설정
        ]}
        resizeMode={resizeMode || 'contain'} // 이미지가 잘리지 않도록 유지
      />
    </View>
  );
}

export default memo(ImageSizeGetter);
const styles = StyleSheet.create({
  eventImage: {
    width: SCREEN_WIDTH, // 이미지가 화면의 전체 너비에 맞게 설정됨
  },
});
