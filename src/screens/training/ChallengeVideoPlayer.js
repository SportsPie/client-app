import React, { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Video from 'react-native-video-controls';
import { navName } from '../../common/constants/navName';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';

function ChallengeVideoPlayer({ route }) {
  const { videoURL, parentIdx, videoIdx, videoName, videoType } =
    route?.params || {
      videoURL: '',
      parentIdx: '',
      videoIdx: '',
      videoName: '',
      videoType: '',
    };

  // [ hook ]
  const { width: windowWidth, height: windowHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      <Header
        rightContent={
          <Pressable
            onPress={() =>
              NavigationService.replace(navName.challengeAddDetails, {
                videoURL,
                parentIdx,
                videoIdx,
                videoName,
                videoType,
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
          position: 'absolute',
          width: windowWidth,
          height:
            Platform.OS === 'ios'
              ? windowHeight - (insets.top + insets.bottom)
              : windowHeight,
        }}
        repeat
        disablePlayPause={false}
      />
    </SafeAreaView>
  );
}

export default memo(ChallengeVideoPlayer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  headerButtonText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.white,
  },
});
