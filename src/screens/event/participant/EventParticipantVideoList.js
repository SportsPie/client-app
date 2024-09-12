import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import { apiGetEventOpenVideoList } from '../../../api/RestAPI';
import { handleError } from '../../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../../redux/store';
import ListEmptyView from '../../../components/ListEmptyView';
import { eventParticipantVideoListAction } from '../../../redux/reducers/list/eventParticipantVideoListSlice';
import Loading from '../../../components/SPLoading';
import { useAppState } from '../../../utils/AppStateContext';

function EventParticipantVideoList() {
  const { participantInfo, setParticipantInfo } = useAppState();
  const { width } = useWindowDimensions();
  const imageHeight = (width * 9) / 16; // 16:9 비율로 이미지 높이 설정

  const dispatch = useDispatch();
  const listName = 'eventParticipantVideoList';
  const { page, list, refreshing, loading, isLast } = useSelector(
    selector => selector[listName],
  );
  const pageSize = 30;
  const action = eventParticipantVideoListAction;
  const getUserVideoInfo = async () => {
    const params = {
      size: pageSize,
      page,
      participationIdx: participantInfo?.participationIdx,
    };
    try {
      const { data } = await apiGetEventOpenVideoList(params);
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
    } finally {
      dispatch(action.setRefreshing(false));
      dispatch(action.setLoading(false));
    }
  };

  const handleEndReached = () => {
    if (!isLast) {
      setTimeout(() => {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }, 0);
    }
  };

  const handleRefresh = () => {
    dispatch(action.refresh());
  };

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
  }, []);

  useEffect(() => {
    if (participantInfo?.eventIdx && participantInfo?.participationIdx) {
      handleRefresh();
    }
  }, [participantInfo?.eventIdx, participantInfo?.participationIdx]);

  useEffect(() => {
    if (participantInfo?.eventIdx && participantInfo?.participationIdx) {
      if (refreshing || (!refreshing && page > 1)) {
        getUserVideoInfo();
      }
    }
  }, [page, refreshing]);

  const renderParticipantItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        NavigationService.navigate(navName.eventParticipantVideoReels, {
          video: item,
        });
      }}
      key={item.participationIdx}
      style={styles.participantContain}>
      <View style={styles.infoContain}>
        <Image
          source={{ uri: item.thumbPath }}
          style={[styles.image, { width: width - 32, height: imageHeight }]}
          resizeMode="cover"
        />
      </View>
      <View style={styles.contentsTitleBox}>
        <Text style={styles.contentsTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = useCallback(() => {
    return (
      <View
        style={{
          height: '100%',
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}>
        <Text style={styles.contentsTitle}>아직 등록된 영상이 없어요.</Text>
        <ListEmptyView
          text="새로운 영상이 올라오면 여기에 표시됩니다."
          style={{ paddingVertical: 0 }}
        />
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={{ paddingTop: 24, marginBottom: 8 }}>
        {list && list.length > 0 ? (
          <FlatList
            data={list}
            numColumns={1}
            renderItem={renderParticipantItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.content}
          />
        ) : loading ? (
          <Loading />
        ) : (
          renderEmptyList()
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  participantContain: {
    marginBottom: 16,
  },
  contentsTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  infoContain: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  contentsTitleBox: {
    padding: 8,
  },
  // contentsTitle: {
  //   fontSize: 14,
  //   fontWeight: 500,
  //   color: '#1A1C1E',
  //   lineHeight: 20,
  //   letterSpacing: 0.203,
  // },
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});

export default EventParticipantVideoList;
