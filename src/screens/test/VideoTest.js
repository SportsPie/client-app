import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';

function VideoTest() {
  const navigation = NavigationService;
  return (
    <View style={{ flex: 1 }}>
      <Button
        title="1개 동영상"
        onPress={() => {
          navigation.navigate(navName.videoTestByCase, { single: true });
        }}
      />
      <Button
        title="1개 동영상 상단 고정"
        onPress={() => {
          navigation.navigate(navName.videoTestByCase, {
            single: true,
            top: true,
          });
        }}
      />
      <Button
        title="여러 동영상"
        onPress={() => {
          navigation.navigate(navName.videoTestByCase, { multiple: true });
        }}
      />
      <Button
        title="동영상 촬영 & 압축"
        onPress={() => {
          navigation.navigate(navName.videoTestForCompression);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  video: {
    width: '100%',
    // height: windowHeight,
    margin: 0,
    padding: 0,
  },
});

export default VideoTest;
