import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import {
  useSafeAreaInsets,
  useSafeAreaFrame,
} from 'react-native-safe-area-context';
import SPIcons from '../assets/icon';
import { SPSvgs } from '../assets/svg';

const SPSingleVideo = forwardRef(
  (
    {
      source,
      thumbnailPath,
      width,
      height,
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
    const screenHeight = Dimensions.get('window').height;
    const styles = StyleSheet.create({
      video: {
        width: windowWidth,
        margin: 0,
        padding: 0,
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
    const [playTime, setPlayTime] = useState(0); // 재생시간
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
      const { currentTime } = progressData;
      setPlayTime(currentTime);
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
        else if (onFullScreen && onFullScreen.name === 'toggleFullScreenMode') {
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
                width: windowWidth,
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
            uri: source,
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
            {/* 최초 로드 > 썸네일 & 재생 버튼 */}
            {thumbnailPath && playTime === 0 && isVideoLoaded && (
              <Image
                source={{ uri: thumbnailPath }}
                style={{
                  width: windowWidth,
                  height: videoHeight,
                  position: 'absolute',
                }}
              />
            )}

            {/* 시작/정지 버튼 */}
            {isVideoLoaded && pause && (
              <Image
                source={SPIcons.icPlay}
                style={{ width: 30, height: 30 }}
              />
            )}

            {/* 풀스크린 버튼 */}
            {isVideoLoaded && (
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
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

export default SPSingleVideo;
