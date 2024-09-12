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
  TouchableOpacity,
  View,
} from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import SPIcons from '../assets/icon';
import convertToProxyURL from 'react-native-video-cache';

function SPMultipleVideoForReels({
  source = [],
  repeat = true,
  isPaused = false,
  getProgressData,
  disableVolume = true,
  disableTimer = true,
  disableBack = true,
  onLoad,
  onReachLast = () => null,
  onChangeVideo = () => null,
}) {
  // [ css ]
  const { width: windowWidth, height: windowHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();

  // [ ref ]
  const videoRefs = useRef({});

  // [ state ]
  const [viewId, setViewId] = useState(source[0]?.videoIdx || ''); // 타겟 비디오 IDX
  const [pause, setPause] = useState(isPaused); // 영상 일시정지 유무
  const [isVideoLoaded, setIsVideoLoaded] = useState(false); // 영상 로드 유무

  // [ util ] 동영상 로드 완료
  const onVideoLoad = (e, id) => {
    if (onLoad) onLoad();
    setPause(false);
    setIsVideoLoaded(true);
  };

  // [ util ] 영상 재생중 메타데이터
  const onProgress = progressData => {
    if (getProgressData) getProgressData(progressData);
  };

  // [ util ] 다음 비디오 출력 설정
  const viewabilityConfig = useMemo(() => {
    return {
      itemVisiblePercentThreshold: 50, // 항목의 50% 이상이 보일 때만 보이는 것으로 간주
    };
  }, []);

  // [ util ] 재생 비디오 변경 감지
  const onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    const viewItemId = viewableItems?.[0]?.item?.videoIdx;
    setViewId(viewItemId);
  }, []);

  // [ util ] 재생 비디오 변경
  const onViewIdChanged = id => {
    if (id) {
      videoRefs.current[id].seekTo(0);
      setPause(false);
    }
  };

  // [ useEffect ] 조회 동영상 변경
  useEffect(() => {
    if (viewId) {
      onChangeVideo(viewId); // 영상 상세 정보 갱신
      onViewIdChanged(viewId);

      // 마지막 동영상 > 다음 페이지 호출
      if (source.length > 0 && source[source.length - 1].videoIdx === viewId) {
        onReachLast();
      }
    }
  }, [viewId]);

  // [ return ]
  return (
    <FlatList
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      scrollEnabled
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
      }}
      data={source}
      decelerationRate={0.8}
      renderItem={({ item, index }) => {
        return (
          <View
            key={`video-reels-${index}`}
            style={{
              width: windowWidth,
              height: windowHeight,
              // Platform.OS === 'ios'
              //   ? windowHeight - (insets.bottom + insets.top)
              //   : windowHeight,
            }}>
            <VideoPlayer
              ref={ref => {
                videoRefs.current[item.videoIdx] = ref;
              }}
              key={item.videoIdx}
              repeat={repeat}
              source={{
                uri: convertToProxyURL(item.videoPath),
              }}
              onLoad={e => onVideoLoad(e, item.videoIdx)}
              onProgress={progressData => {
                if (item.videoIdx === viewId) onProgress(progressData);
              }}
              showOnStart={true}
              tapAnywhereToPause
              disableFullscreen
              disableBack={disableBack}
              disableVolume={disableVolume}
              disablePlayPause={true}
              disableSeekbar={true}
              disableTimer={disableTimer}
              toggleResizeModeOnFullscreen={false}
              controlTimeout={5000}
              paused={pause || viewId !== item.videoIdx}
            />

            {/* 일시 정지 */}
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
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                }}
                // 터치 이벤트
                onPress={() => setPause(prev => !prev)}>
                {/* 시작/정지 버튼 */}
                {isVideoLoaded && pause && (
                  <Image
                    source={SPIcons.icPlay}
                    style={{ width: 30, height: 30 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
      snapToInterval={windowHeight}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
    />
  );
}

export default SPMultipleVideoForReels;
