/* eslint-disable react/no-unstable-nested-components */
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { apiGetAcademyOpenSchedule } from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { JOIN_TYPE } from '../../common/constants/joinType';
import { navName } from '../../common/constants/navName';
import SPLoading from '../../components/SPLoading';
import SPModal from '../../components/SPModal';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import AcademyJoinModal from './AcademyJoinModal';
import { matchingReviewListAction } from '../../redux/reducers/list/matchingReviewListSlice';
import { academyScheduleListAction } from '../../redux/reducers/list/academyScheduleListSlice';
import { store } from '../../redux/store';
import { COLORS } from '../../styles/colors';

function AcademySchedule({ route }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const listName = 'academyScheduleList';
  const {
    page,
    list: scheduleList,
    refreshing,
    loading,
    isLast,
    totalCnt,
  } = useSelector(selector => selector[listName]);
  const noParamReset = route?.params?.noParamReset;
  const action = academyScheduleListAction;

  const academyIdx = route?.params?.academyIdx;
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const flatListRef = useRef();

  const [isFocus, setIsFocus] = useState(true);
  const [joinType, setJoinType] = useState();
  const [isJoined, setIsJoined] = useState(false);

  // list
  const [size, setSize] = useState(30);

  // modal
  const [checkModalShow, setCheckModalShow] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState({});

  /**
   * api
   */
  const getUserInfo = async () => {
    try {
      const type = await Utils.getUserJoinType(academyIdx);
      setJoinType(type);
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  const getSchedules = async () => {
    // api 쪽에 페이징 없음
    try {
      const params = {
        academyIdx,
        // page,
        page: 1,
        // size,
      };
      const { data } = await apiGetAcademyOpenSchedule(params);
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
    setIsFocus(false);
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  /**
   * function
   */
  const openModal = item => {
    setSelectedSchedule(item);
    setCheckModalShow(true);
  };

  const closeModal = () => {
    setCheckModalShow(false);
  };

  const moveScheduleEdit = () => {
    NavigationService.navigate(navName.academyScheduleEdit, {
      academyIdx,
      scheduleData: selectedSchedule,
    });
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }
    }, 0);
  };

  const onRefresh = async () => {
    // if (flatListRef.current) {
    //   flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    // }
    dispatch(action.refresh());
  };

  /**
   * useEffect
   */

  useEffect(() => {
    if (!noParamReset) {
      setIsFocus(true);
      setIsFocus(true);
      dispatch(action.reset());
      NavigationService.replace(navName.academySchedule, {
        ...(route?.params || {}),
        noParamReset: true,
      });
    } else {
      getSchedules();
    }
  }, [refreshing, noParamReset]);

  useEffect(() => {
    if (noParamReset) getUserInfo();
  }, [isJoined, noParamReset]);

  useEffect(() => {
    if (!isFocus) {
      onRefresh();
    }
  }, [isFocus]);
  // useEffect(() => {
  //   if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
  //     getSchedules();
  //   }
  // }, [page, isFocus, refreshing]);

  /**
   * useEffect
   */

  const renderSchedule = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.contentItem}
        disabled={joinType !== JOIN_TYPE.ACADEMY_ADMIN}
        onLongPress={() => {
          Vibration.vibrate(70);
          openModal(item);
        }}>
        <View style={styles.leftBox}>
          <Text style={styles.leftSubText}>
            {moment(`${item.date} ${item.time}`).format('MMM')}
          </Text>
          <Text style={styles.leftMainText}>
            {moment(`${item.date} ${item.time}`).format('D')}
          </Text>
          <Text style={styles.leftSubText}>
            {moment(`${item.date} ${item.time}`).format('dddd')}
          </Text>
        </View>
        <View style={styles.rightBox}>
          <Text style={styles.rightSubText}>
            {moment(`${item.date} ${item.time}`).format('A hh:mm')}
          </Text>
          <Text style={styles.rightMainText}>{item.contents}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="일정" />
      {scheduleList && scheduleList.length > 0 ? (
        <FlatList
          ref={flatListRef}
          contentContainerStyle={styles.contentList}
          data={scheduleList}
          ListFooterComponent={
            loading
              ? () => {
                  return (
                    <ActivityIndicator
                      size="small"
                      style={{ marginVertical: 20 }}
                    />
                  );
                }
              : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={() => {
            loadMoreProjects();
          }}
          onEndReachedThreshold={0.5}
          renderItem={renderSchedule}
        />
      ) : loading ? (
        <SPLoading />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={styles.noneText}>일정이 존재하지 않습니다.</Text>
        </View>
      )}

      <AcademyJoinModal academyIdx={academyIdx} setIsJoined={setIsJoined} />

      {/* 글쓰기 버튼 */}
      {joinType === JOIN_TYPE.ACADEMY_ADMIN && (
        <TouchableOpacity
          style={styles.wrtieBtn}
          onPress={() => {
            NavigationService.navigate(navName.academyScheduleWrite, {
              academyIdx,
            });
          }}>
          <Image source={SPIcons.icCommunityWrite} />
        </TouchableOpacity>
      )}
      <SPModal
        title="확인"
        contents="해당 일정에 대한 수정/삭제 페이지로 이동하시겠습니까?"
        visible={checkModalShow}
        onConfirm={() => {
          moveScheduleEdit();
        }}
        onCancel={closeModal}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

export default memo(AcademySchedule);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentList: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentItem: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItem: 'center',
    gap: 2,
    backgroundColor: '#FFF4EE',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftSubText: {
    fontSize: 11,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 14,
    letterSpacing: 0.342,
    textAlign: 'center',
  },
  leftMainText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 28,
    letterSpacing: -0.24,
    textAlign: 'center',
  },
  rightBox: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  rightSubText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  rightMainText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  applyBtn: {
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  // wrtieBtn: {
  //   position: 'absolute',
  //   right: 16,
  //   bottom: 16,
  //   backgroundColor: 'white', // 배경색 지정
  //   borderRadius: 50,
  //   ...Platform.select({
  //     ios: {
  //       shadowColor: '#000',
  //       shadowOffset: { width: 0, height: 2 },
  //       shadowOpacity: 0.3,
  //       shadowRadius: 4,
  //     },
  //     android: {
  //       elevation: 4,
  //     },
  //   }),
  // },
  wrtieBtn: {
    position: 'absolute',
    zIndex: 999,
    bottom: 16,
    right: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
};
