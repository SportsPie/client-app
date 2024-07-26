import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import convertToProxyURL from 'react-native-video-cache';
import VideoPlayer from 'react-native-video-controls';
import SPIcons from '../assets/icon';
import { SPSvgs } from '../assets/svg';

const SPSingleVideo = forwardRef(
  (
    {
      source,
      thumbnailPath,
      repeat = true,
      isPaused = false,
      getProgressData,
      disablePlayPause = true,
      disableVolume = true,
      disableTimer = true,
      disableBack = true,
      onLoad,
      onFullScreen,
    },
    ref,
  ) => {
    // [ css ]
    const { width: windowWidth, height: windowHeight } = useSafeAreaFrame();
    const insets = useSafeAreaInsets();
    const styles = StyleSheet.create({
      video: {
        width: windowWidth - (insets.left + insets.right),
        margin: 0,
        padding: 0,
      },
      thumbnailWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      },
    });

    // [ ref ]
    const videoRef = useRef();

    useImperativeHandle(ref, () => ({
      closeFullScreen: () => setIsFullScreen(false), // 풀스크린 해제
    }));

    // [ state ]
    const [videoHeight, setVideoHeight] = useState(240); // 영상 Default 높이
    const [pause, setPause] = useState(isPaused); // 정지 or 재생 상태값
    const [isVideoLoaded, setIsVideoLoaded] = useState(false); // 영상 로드 완료 유무
    const [isFullScreen, setIsFullScreen] = useState(false); // 풀 스크린 유무

    // [ util ] 동영상 로드 완료
    const onVideoLoad = e => {
      if (onLoad) onLoad();

      // 동영상 높이 조정
      const {
        width: widthNumber,
        height: heightNumber,
        orientation,
      } = e.naturalSize;

      // iOS > 세로 영상의 경우 width, height 값이 반대
      if (Platform.OS === 'ios' && orientation === 'portrait') {
        const videoRatio = widthNumber / heightNumber;
        setVideoHeight(windowWidth * videoRatio);
      } else {
        const videoRatio = heightNumber / widthNumber;
        setVideoHeight(windowWidth * videoRatio);
      }

      setPause(isPaused);
      setIsVideoLoaded(true);
    };

    // [ util ] 영상 재생중 메타데이터
    const onProgress = progressData => {
      if (getProgressData) getProgressData(progressData);
    };

    // [ util ] 풀 스크린 이벤트
    const toggleFullScreen = () => {
      setIsFullScreen(prev => {
        // 릴스 이동
        if (
          onFullScreen &&
          (onFullScreen.name === 'moveToChallengeReels' ||
            onFullScreen.name === 'moveToMasterReels')
        ) {
          onFullScreen();
          return prev;
        }
        // 풀 스크린 전환 > 스크롤 Disable
        if (onFullScreen && onFullScreen.name === 'toggleFullScreenMode') {
          onFullScreen(prev);
        }
        return !prev;
      });
    };

    // [ useEffect ] 영상 정지 > 컨트롤러 출력
    useEffect(() => {
      if (pause) {
        videoRef.current.methods.toggleControls();
      }
    }, [pause]);

    // [ return ]
    return (
      <View
        style={
          !isFullScreen
            ? [styles.video, { height: videoHeight }]
            : {
                flex: 1,
                width: windowWidth - (insets.left + insets.right),
                height:
                  Platform.OS === 'ios'
                    ? windowHeight - (insets.top + insets.bottom)
                    : windowHeight,
              }
        }>
        {/* 비디오 플레이어 */}
        <VideoPlayer
          ref={videoRef}
          source={{
            uri: convertToProxyURL(source),
          }}
          onLoad={onVideoLoad}
          onProgress={onProgress}
          disableBack={disableBack}
          disableFullscreen
          showOnStart={false}
          tapAnywhereToPause
          disablePlayPause={disablePlayPause}
          disableVolume={disableVolume}
          disableTimer={disableTimer}
          controlTimeout={5000}
          toggleResizeModeOnFullscreen={false}
          repeat={repeat}
          paused={pause}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
            backBufferDurationMs: 120000,
            cacheSizeMB: 1024,
            live: {
              targetOffsetMs: 500,
            },
          }}
          playWhenInactive={true}
          poster={thumbnailPath}
          posterResizeMode="cover"
        />

        {/* 정지 화면 & 썸네일 */}
        {isVideoLoaded && (
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
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
              // 터치 이벤트
              onPress={() => {
                setPause(prev => !prev);
              }}>
              {/* 시작/정지 버튼 */}
              {pause && (
                <Image
                  source={SPIcons.icPlay}
                  style={{ width: 30, height: 30 }}
                />
              )}

              {/* 풀스크린 버튼 */}
              <Pressable
                style={{
                  width: 25,
                  height: 25,
                  position: 'absolute',
                  bottom: 12.5,
                  right: 12.5,
                }}
                onPress={toggleFullScreen}>
                <SPSvgs.FullScreen />
              </Pressable>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  },
);

export default memo(SPSingleVideo);
