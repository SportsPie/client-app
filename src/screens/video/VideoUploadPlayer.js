import React, { memo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView, useSafeAreaFrame } from 'react-native-safe-area-context';
import Video from 'react-native-video-controls';
import { navName } from '../../common/constants/navName';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';

function VideoUploadPlayer({ route }) {
  const { eventIdx, videoURL, videoIdx, videoName, videoType, uploadType } =
    route?.params || {
      eventIdx: '',
      videoURL: '',
      videoIdx: '',
      videoName: '',
      videoType: '',
      uploadType: '',
    };

  // [ hook ]
  const { width: windowWidth, height: windowHeight } = useSafeAreaFrame();
  // const insets = useSafeAreaInsets();

  // [ state ]
  const [position, setPosition] = useState('relative');

  // [ util ] 동영상 로드 완료
  const onVideoLoad = e => {
    // 동영상 높이 조정
    const { orientation } = e.naturalSize;

    // 가로영상
    if (orientation === 'landscape') {
      setPosition('absolute');
    }
  };

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      <Header
        rightContent={
          <Pressable
            onPress={() =>
              NavigationService.replace(navName.addVideoDetail, {
                eventIdx,
                videoURL,
                videoIdx,
                videoName,
                videoType,
                uploadType,
              })
            }>
            <Text style={styles.headerButtonText}>다음</Text>
          </Pressable>
        }
        headerContainerStyle={{
          backgroundColor: COLORS.black,
        }}
        leftIconColor={COLORS.white}
      />

      <Video
        source={{
          uri: videoURL,
        }}
        style={{
          position,
          width: windowWidth,
          height: windowHeight,
          // height:
          //   Platform.OS === 'ios'
          //     ? windowHeight - (insets.top + insets.bottom)
          //     : windowHeight,
        }}
        onLoad={onVideoLoad}
        repeat
        disablePlayPause={false}
        disableVolume
        disableTimer
        disableBack
        disableFullscreen
      />
    </SafeAreaView>
  );
}

export default memo(VideoUploadPlayer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  headerButtonText: {
    ...fontStyles.fontSize16_Semibold,
    padding: 10,
    color: COLORS.white,
  },
});
