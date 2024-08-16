import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import SPIcons from '../assets/icon';
import { SPSvgs } from '../assets/svg';
import { ACTIVE_OPACITY } from '../common/constants/constants';

function SPVideo({
  source,
  thumbnailPath,
  fullScreen,
  width,
  height,
  repeat = true,
  isPaused = false,
  firstVideoTime,
  setTime,
  getProgressData,
  disablePlayPause = true,
  disableVolume = true,
  disableTimer = true,
  disableBack = false,
  onLoad,
  onFullScreen,
  ...props
}) {
  const navigation = useNavigation();
  const videoRef = useRef();
  const videoRefs = useRef({});
  const singleVideo = typeof source === 'string' || source?.length === 1;
  const [videoHeight, setVideoHeight] = useState(240); // Null > 360 변경
  const [viewId, setViewId] = useState();
  const [pause, setPause] = useState(isPaused);
  const [playTime, setPlayTime] = useState(0);
  const [firstTime, setFirstTime] = useState(firstVideoTime);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // 컴포넌트 내에서
  const { width: windowWidth, height: windowHeight } = useSafeAreaFrame();

  const onVideoLoad = (e, id) => {
    if (onLoad) {
      onLoad();
    }

    if (!fullScreen) {
      const {
        width: widthNumber,
        height: heightNumber,
        orientation,
      } = e.naturalSize;

      // iOS > 세로 영상의 경우 width, height 값이 반대 ( 세로 240 고정 - 24.06.24 요청 반영 )
      // if (Platform.OS === 'ios' && orientation === 'portrait') {
      //   const videoRatio = widthNumber / heightNumber;
      //   setVideoHeight(windowWidth * videoRatio);
      // } else {
      //   const videoRatio = heightNumber / widthNumber;
      //   setVideoHeight(windowWidth * videoRatio);
      // }

      const videoRatio = heightNumber / widthNumber;
      setVideoHeight(
        windowWidth * videoRatio > 240 ? 240 : windowWidth * videoRatio,
      );
    }
    if (singleVideo) {
      if (firstTime) videoRef.current.seekTo(firstTime);
    }
    setPause(isPaused);
    setIsVideoLoaded(true);
    // setPause(true);
  };

  const onProgress = progressData => {
    const { currentTime } = progressData;
    setPlayTime(currentTime);

    if (setTime) {
      setTime(currentTime); // Update playback time state
    }

    if (getProgressData) {
      getProgressData(progressData);
    }
  };

  const styles = StyleSheet.create({
    video: {
      width: windowWidth,
      margin: 0,
      padding: 0,
    },
  });

  /* [[ 여러 동영상의 경우 화면 보이는 아이템이 변경될 때에 대한 이벤트 설정 */
  const viewabilityConfig = useMemo(() => {
    return {
      itemVisiblePercentThreshold: 50, // 항목의 50% 이상이 보일 때만 보이는 것으로 간주
    };
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    const viewItemId = viewableItems?.[0]?.item?.id;
    setViewId(viewItemId);
    // viewableItems: 현재 보여지는 항목들의 목록
    // changed: 상태(보이거나, 보이지 않거나)가 바뀐 항목들의 목록
    // console.log('Visible items are', viewableItems);
    // console.log('Changed in this iteration', changed);
  }, []);

  const onViewIdChanged = id => {
    if (id) {
      // 처음 로드시는 처음 보던 시간으로 동영상 시간 세팅
      if (viewId === source[0]?.id && firstTime) {
        videoRefs.current[id].seekTo(firstTime);
      } else {
        // 이후로는 또는 모든 동영상은 화면에 나타날 때마다 처음부터 재생
        videoRefs.current[id].seekTo(0);
      }
      setFirstTime(0);
      setPause(false);
    }
  };

  useEffect(() => {
    onViewIdChanged(viewId);
  }, [viewId]);
  /* ]] */

  // 영상 정지 시, Controller 출력
  useEffect(() => {
    if (pause) {
      videoRef.current.methods.toggleControls();
    }
  }, [pause]);

  return singleVideo ? (
    <View
      style={
        !fullScreen
          ? [styles.video, { height: videoHeight }]
          : { width: windowWidth, height: windowHeight }
      }>
      <VideoPlayer
        ref={videoRef}
        source={{
          uri: source,
        }}
        repeat={repeat}
        // style={
        //   !fullScreen
        //     ? [styles.video, { height: videoHeight }]
        //     : { width: windowWidth, height: windowHeight }
        // }
        onLoad={onVideoLoad}
        onProgress={onProgress}
        onPause={() => {
          setPause(true);
        }}
        disableBack={disableBack}
        disableFullscreen
        showOnStart={false}
        tapAnywhereToPause
        disableVolume={disableVolume}
        disablePlayPause={disablePlayPause}
        disableTimer={disableTimer}
        controlTimeout={5000}
        toggleResizeModeOnFullscreen={false}
        navigator={navigation}
        paused={pause}
      />

      {/* 정지 화면 & 썸네일 */}
      <View
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          visibility: pause ? 'hidden' : '',
        }}>
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
          // 터치 이벤트
          onPress={() => {
            setPause(prev => !prev);
          }}>
          {/* 최초 로드 > 썸네일 & 재생 버튼 */}
          {thumbnailPath && playTime === 0 && isVideoLoaded && (
            <Image
              source={{ uri: thumbnailPath }}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
              }}
            />
          )}

          {/* 시작/정지 버튼 */}
          {isVideoLoaded && pause && (
            <Image source={SPIcons.icPlay} style={{ width: 30, height: 30 }} />
          )}

          {/* 풀스크린 버튼 */}
          {isVideoLoaded && onFullScreen && (
            <Pressable
              style={{
                width: 25,
                height: 25,
                position: 'absolute',
                bottom: 12.5,
                right: 12.5,
              }}
              onPress={onFullScreen}>
              <SPSvgs.FullScreen />
            </Pressable>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <FlatList
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      scrollEnabled
      style={{ width: windowWidth, height: windowHeight }}
      data={source}
      renderItem={({ item, index }) => {
        return (
          <View style={{ width: windowWidth, height: windowHeight }}>
            <VideoPlayer
              ref={ref => {
                videoRefs.current[item.id] = ref;
              }}
              key={item.id}
              repeat={repeat}
              source={{
                uri: item.uri,
              }}
              style={{ width: windowWidth, height: windowHeight }}
              onLoad={onVideoLoad}
              onProgress={progressData => {
                if (item.id === viewId) {
                  onProgress(progressData);
                }
              }}
              // onPause={() => {
              //   setPause(true);
              // }}
              showOnStart={false}
              tapAnywhereToPause
              disableFullscreen
              disableBack={disableBack}
              disableVolume={disableVolume}
              disablePlayPause={disablePlayPause}
              disableTimer={disableTimer}
              toggleResizeModeOnFullscreen={false}
              navigator={navigation}
              controlTimeout={5000}
              paused={pause || viewId !== item.id}
            />
            {pause && (
              <View
                style={{
                  width: windowWidth,
                  height: windowHeight,
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setPause(prev => !prev);
                  }}>
                  <Text style={{ fontSize: 100, color: 'white' }}>
                    {pause ? '재생' : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }}
      snapToInterval={windowHeight}
      decelerationRate={0.65}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
    />
  );
}

export default SPVideo;
