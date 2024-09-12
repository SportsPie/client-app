import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPSelectVideoModal from '../../components/SPSelectVideoModal';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { VIDEO_UPLOAD_TYPE } from '../../common/constants/VideoUploadType';
import { useAppState } from '../../utils/AppStateContext';
import { PARTICIPATION_STATE } from '../../common/constants/ParticipationState';
import { apiGetEventVideoList } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../redux/store';
import { moreEventVideoListAction } from '../../redux/reducers/list/moreEventVideoListSlice';
import SPLoading from '../../components/SPLoading';
import SPIcons from '../../assets/icon';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';

// 더보기 > 이벤트 영상 목록
function EventParticipantVideoList() {
  /**
   * state
   */
  const screenWidth = Dimensions.get('window').width;
  let imageHeight;

  // 화면 너비에 따른 이미지 높이 동적 계산
  if (screenWidth <= 480) {
    imageHeight = 185; // 고정된 높이
  } else {
    const aspectRatio = 16 / 9; // 가로:세로 비율 설정 (예제로 16:9 사용)
    imageHeight = screenWidth / aspectRatio; // 화면 너비에 따라 비율 유지하며 높이 계산
  }

  const dispatch = useDispatch();
  const listName = 'moreEventVideoList';
  const { page, list, refreshing, loading, isLast } = useSelector(
    selector => selector[listName],
  );
  const action = moreEventVideoListAction;
  const pageSize = 30;

  const { participantInfo, setParticipantInfo } = useAppState();
  const [showSelectModal, setShowSelectModal] = useState(false);

  /**
   * api
   */
  const getEventVideoList = async () => {
    try {
      const params = {
        eventIdx: participantInfo.eventIdx,
        participationIdx: participantInfo.participationIdx,
        page,
        size: pageSize,
      };
      const { data } = await apiGetEventVideoList(params);
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    }
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  /**
   * function
   */
  const handleRefresh = () => {
    dispatch(action.refresh());
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }
    }, 0);
  };

  // [ util ] 이벤트 참여 영상 업로드
  const uploadEventParticipantVideo = (type, fileUrl, videoName, videoType) => {
    switch (type) {
      case 'CAMERA':
        NavigationService.navigate(navName.addVideoDetail, {
          eventIdx: participantInfo?.eventIdx,
          videoURL: fileUrl,
          videoName,
          videoType,
          uploadType: VIDEO_UPLOAD_TYPE.EVENT,
        });
        break;
      case 'ALBUM':
        NavigationService.navigate(navName.videoUploadPlayer, {
          eventIdx: participantInfo?.eventIdx,
          videoURL: fileUrl,
          videoName,
          videoType,
          uploadType: VIDEO_UPLOAD_TYPE.EVENT,
        });
        break;
      default:
        break;
    }
  };

  /**
   * useEffect
   */
  useEffect(() => {
    if (participantInfo?.eventIdx && participantInfo?.participationIdx) {
      handleRefresh();
    }
  }, [participantInfo?.eventIdx, participantInfo?.participationIdx]);

  useEffect(() => {
    if (participantInfo?.eventIdx && participantInfo?.participationIdx) {
      if (refreshing || (!refreshing && page > 1)) {
        getEventVideoList();
      }
    }
  }, [page, refreshing]);

  /**
   * render
   */
  const renderVideoList = () => {
    if (list && list.length > 0) {
      return (
        <View style={{ flex: 1 }}>
          <FlatList
            data={list}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 16,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            onEndReached={() => {
              loadMoreProjects();
            }}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate(
                    navName.eventParticipantVideoReels,
                    {
                      video: item,
                    },
                  );
                }}
                activeOpacity={1}>
                <ImageBackground
                  source={{ uri: item.thumbPath }}
                  style={[
                    styles.image,
                    styles.subBackgroundImage,
                    { height: imageHeight, width: '100%' }, // 너비를 100%로 설정하여 화면 폭에 맞춤
                  ]}>
                  <View style={styles.usersBox}>
                    {item.confirmYn === 'N' && (
                      <View style={styles.confirmBox}>
                        <View style={styles.confirmWrap}>
                          <SPSvgs.IcClock />
                          <Text style={styles.confirmText}>승인대기중</Text>
                        </View>
                      </View>
                    )}
                    {item.confirmYn === 'Y' && item.fixDate && (
                      <View>
                        <Image
                          source={SPIcons.icPinFill}
                          style={{ width: 24, height: 24 }}
                        />
                      </View>
                    )}
                  </View>
                </ImageBackground>
                <View style={{ paddingVertical: 8 }}>
                  <Text style={styles.subText}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={[styles.buttonBox]}>
            <PrimaryButton
              onPress={() => {
                setShowSelectModal(true);
              }}
              text="영상 업로드"
            />
          </View>
        </View>
      );
    }
    return loading ? (
      <SPLoading />
    ) : (
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
        }}>
        <View style={styles.tabItem}>
          <View style={[styles.tabTitle]}>
            <Text style={styles.emptyTitle}>영상을 업로드 해보세요!</Text>
            <Text style={styles.emptyText}>
              {
                '지금 바로 영상을 업로드하고\n나만의 포트폴리오를 공유해 보세요!'
              }
            </Text>
          </View>
          <View style={[styles.buttonBox]}>
            <PrimaryButton
              onPress={() => {
                setShowSelectModal(true);
              }}
              text="영상 업로드"
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {participantInfo?.prtState === PARTICIPATION_STATE.APPLY.value && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {
              '신청이 확정되면 이 페이지를 자유롭게 이용하실 수 있어요.\n조금만 기다려 주세요!'
            }
          </Text>
        </View>
      )}
      {participantInfo?.prtState === PARTICIPATION_STATE.COMPLETE.value && (
        <View style={{ flex: 1 }}>{renderVideoList()}</View>
      )}

      <SPSelectVideoModal
        title="영상 업로드"
        visible={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        setLoading={value => {
          action.setLoading(value);
        }}
        onComplete={({ type, fileUrl, videoName, videoType }) => {
          uploadEventParticipantVideo(type, fileUrl, videoName, videoType);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tabTitle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
    textAlign: 'center',
  },
  buttonBox: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  subBackgroundImage: {
    minWidth: 144,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subText: {
    ...fontStyles.fontSize14_Regular,
  },
  usersBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    padding: 8,
  },
  confirmBox: {
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 38, 114, 0.43)',
    padding: 4,
  },
  confirmWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  confirmText: {
    ...fontStyles.fontSize11_Medium,
    color: '#002672',
  },
});

export default EventParticipantVideoList;
