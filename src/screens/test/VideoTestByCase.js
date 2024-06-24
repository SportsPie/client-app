import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SPVideo from '../../components/SPVideo';
import SPHeader from '../../components/SPHeader';

const windowWidth = Dimensions.get('window').width;
function VideoTestByCase() {
  const [time, setTime] = useState(0);
  const route = useRoute()?.params;
  const { single, multiple, top } = route;

  useEffect(() => {
    console.log('time', time);
  }, [time]);

  const url =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const url2 =
    'https://videos.pexels.com/video-files/4434242/4434242-sd_540_960_24fps.mp4';
  const url3 =
    'https://videos.pexels.com/video-files/4434150/4434150-sd_540_960_30fps.mp4';
  const url4 =
    'https://videos.pexels.com/video-files/2785536/2785536-sd_540_960_25fps.mp4';
  return (
    <View style={{ flex: 1 }}>
      {single && <SPHeader title="video" />}
      {!single && (
        <SPVideo
          source={[
            { id: 1, uri: url },
            { id: 2, uri: url2 },
            { id: 3, uri: url3 },
            { id: 4, uri: url4 },
          ]}
          firstVideoTime={35.361}
          setTime={setTime}
        />
      )}

      <ScrollView
        style={styles.container}
        {...(top && { stickyHeaderIndices: [0] })} // 스크롤 시 헤더 고정
      >
        {single && (
          <SPVideo
            source={url}
            firstVideoTime={35.361}
            setTime={setTime}
            disableBack
          />
        )}
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
        <Text>안드로이드 시뮬레이터에서는 실행 안됨</Text>
      </ScrollView>
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
    width: windowWidth,
    // height: windowHeight,
    margin: 0,
    padding: 0,
  },
});

export default VideoTestByCase;
