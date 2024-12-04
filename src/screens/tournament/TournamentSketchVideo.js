import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import YouTube from 'react-native-youtube-iframe';
import Utils from '../../utils/Utils';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { apiGetTournamentContentList } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { TOURNAMENT_CONTENT_TYPE } from '../../common/constants/TournamentContentType';
import { useSelector } from 'react-redux';
import SPLoading from '../../components/SPLoading';

function TournamentSketchVideo({ route }) {
  /**
   * state
   */
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const tournamentIdx = route?.params?.tournamentIdx;

  const [page, setPage] = useState(1);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoList, setVideoList] = useState([]);
  const [playIdx, setPlayIdx] = useState();

  const pageSize = 100;

  /**
   * api
   */
  const getSketchVideoList = async () => {
    const params = {
      tournamentIdx,
      userIdx,
      contentType: TOURNAMENT_CONTENT_TYPE.YOUTUBE,
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetTournamentContentList(params);
      setTotalCnt(data.data.totalCnt);
      setIsLast(data.data.isLast);
      if (page === 1) {
        setVideoList(data.data.list);
      } else {
        setVideoList(prev => [...prev, ...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setRefreshing(false);
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  };

  /**
   * function
   */

  const loadMoreProjects = () => {
    if (!isLast && videoList?.length > 0) {
      setTimeout(() => {
        setPage(prev => prev + 1);
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setIsLast(false);
    setPage(1);
    setVideoList([]);
    setRefreshing(true);
  }, []);

  /**
   * useEffect
   */
  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getSketchVideoList();
    }
  }, [page, refreshing]);

  /**
   * render
   */
  return (
    <FlatList
      key={loading ? 'loading' : 'loaded'}
      data={videoList}
      onEndReached={loadMoreProjects}
      onEndReachedThreshold={0.5}
      keyExtractor={(item, idx) => `${item.name}_${item.contentsIdx}`}
      contentContainerStyle={styles.videoContentContainer}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.videoContent}>
          <YouTube
            videoId={Utils.getYoutubeVideoId(item.filePath)}
            webViewStyle={{ aspectRatio: 16 / 9 }}
            play={playIdx === item.contentsIdx}
          />
          {playIdx !== item.contentsIdx && (
            <Pressable
              style={styles.videoLink}
              onPress={() => {
                setPlayIdx(prev =>
                  prev !== item.contentsIdx ? item.contentsIdx : null,
                );
              }}
            />
          )}
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListFooterComponent={<View style={{ height: 16 }} />}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyListView}>
            <Text
              style={
                styles.emptyText
              }>{`동영상이 업로드 될 예정입니다.\n잠시만 기다려 주세요.`}</Text>
          </View>
        ) : (
          <SPLoading />
        )
      }
    />
  );
}
export default memo(TournamentSketchVideo);

const styles = StyleSheet.create({
  trnName: {
    padding: 16,
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  emptyListView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...fontStyles.fontSize16_Regular,
    color: 'rgba(46,49,53,0.60)',
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  videoContentContainer: {
    flexGrow: 1,
    rowGap: 16,
    paddingHorizontal: 16,
  },
  videoContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoLink: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoName: {
    padding: 8,
    ...fontStyles.fontSize16_Medium,
    color: COLORS.labelNormal,
    letterSpacing: 0.091,
  },
});
