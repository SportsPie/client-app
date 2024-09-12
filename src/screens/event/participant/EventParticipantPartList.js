import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { COLORS } from '../../../styles/colors';
import Avatar from '../../../components/Avatar';
import { SPSvgs } from '../../../assets/svg';
import { apiGetEventApplicantList } from '../../../api/RestAPI';
import { store } from '../../../redux/store';
import { handleError } from '../../../utils/HandleError';
import { useDispatch, useSelector } from 'react-redux';
import { eventParticipantPartListAction } from '../../../redux/reducers/list/eventParticipantPartListSlice';
import Loading from '../../../components/SPLoading';
import ListEmptyView from '../../../components/ListEmptyView';
import { POSITION_TYPE } from '../../../common/constants/positionType';

function EventParticipantPartList({ route }) {
  const dispatch = useDispatch();
  const listName = 'eventParticipantPartList';
  const {
    page,
    list: participant,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const type = route.params?.type;
  const count = route.params?.count;
  const eventIdx = route.params?.eventIdx;
  const action = eventParticipantPartListAction;
  const pageSize = 30;

  const [isFocus, setIsFocus] = useState(true);

  const getEventParticipantList = async () => {
    const params = {
      size: pageSize,
      page,
      eventIdx,
      positionType: type,
    };
    try {
      const { data } = await apiGetEventApplicantList(params);
      if (Array.isArray(data.data.list)) {
        dispatch(action.setTotalCnt(data.data.totalCnt));
        dispatch(action.setIsLast(data.data.isLast));
        if (page === 1) {
          dispatch(action.setList(data.data.list));
        } else {
          const prevList = store.getState()[listName].list;
          dispatch(action.setList([...prevList, ...data.data.list]));
        }
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

  const onRefresh = useCallback(async () => {
    dispatch(action.refresh());
  }, []);

  useEffect(() => {
    if (!noParamReset) {
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.eventParticipantPartList, {
        ...(route?.params || {}),
        noParamReset: true,
      });
      return;
    }
    dispatch(action.refresh());
    setIsFocus(false);
  }, [noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
        getEventParticipantList();
      }
    }
  }, [page, refreshing, isFocus, noParamReset]);

  const renderParticipantItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        NavigationService.navigate(navName.eventParticipantDetail, {
          participantIdx: item.participationIdx,
        });
      }}
      key={item.participationIdx}
      style={styles.participantContain}>
      <Avatar imageSize={56} disableEditMode imageURL="" />
      <View style={styles.infoContain}>
        <Text style={styles.nameText}>{item.participationName}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.positionText}>{item.position}</Text>
          <View style={styles.reactionsContainer}>
            <View style={styles.reactWrapper}>
              <SPSvgs.HeartOutline width={20} height={20} />
              <Text
                style={[
                  fontStyles.fontSize12_Semibold,
                  { color: COLORS.labelNeutral },
                ]}>
                {item.cntLike}
              </Text>
            </View>
            <View style={styles.reactWrapper}>
              <SPSvgs.BubbleChatOutline width={20} height={20} />
              <Text
                style={[
                  fontStyles.fontSize12_Semibold,
                  { color: COLORS.labelNeutral },
                ]}>
                {item.cntComment}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = useCallback(() => {
    return <ListEmptyView text="해당 포지션에 지원자가 없습니다." />;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="참가자 목록" />

      <View style={styles.header}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text style={styles.contentsTitle}> {POSITION_TYPE[type]?.desc}</Text>
          <Text style={styles.contentsText}>{count}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {participant && participant.length > 0 ? (
          <FlatList
            data={participant}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  participantContain: {
    flexDirection: 'row',
    alignItems: 'center', // Adjust width to match screen width
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoContain: {
    flex: 1,
    marginLeft: 16,
    width: '100%', // Adjust width to match container
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    alignItems: 'center', // 가운데 정렬 추가
  },
  contentsTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  contentsText: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#000',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  positionText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
});

export default EventParticipantPartList;
