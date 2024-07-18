import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiGetAcademyConfigMngRecruits,
  apiPostAcademyOpenRecruit,
} from '../../api/RestAPI';
import { MATCH_GENDER } from '../../common/constants/matchGender';
import { navName } from '../../common/constants/navName';
import { RECRUIT_PAGE_TYPE } from '../../common/constants/recruitPageType';
import SPLoading from '../../components/SPLoading';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import { IS_YN } from '../../common/constants/isYN';
import fontStyles from '../../styles/fontStyles';

function AcademyRecruitment({ route }) {
  /**
   * state
   */
  const pageType = route.params?.pageType; // ALL, ACADEMY, MANAGEMENT
  const academyIdx = route.params?.academyIdx;

  // modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedJoinIdx, setSelectedJoinIdx] = useState();

  const flatListRef = useRef();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [loading, setLoading] = useState(true);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [academyRecruitList, setAcademyRecruitList] = useState([]);

  // 'N' 항목들을 먼저 정렬
  const closeYNItemsN = academyRecruitList.filter(item => item.closeYn === 'N');

  // 'Y' 항목들을 그 다음에 정렬
  const closeYNItemsY = academyRecruitList.filter(item => item.closeYn === 'Y');

  // 'N' 항목들을 먼저, 그 다음에 'Y' 항목들을 추가하여 순서를 조정
  const sortedAcademyRecruitList = [...closeYNItemsN, ...closeYNItemsY];
  // 가입신청 회원 임시
  const openRejectModal = idx => {
    setSelectedJoinIdx(idx);
    setRejectModalVisible(true);
  };

  const openConfirmModal = idx => {
    setSelectedJoinIdx(idx);
    setConfirmModalVisible(true);
  };

  /**
   * api
   */
  const getRecruitList = async () => {
    try {
      const params = {
        page,
        size,
      };
      let data = null;
      switch (pageType) {
        case RECRUIT_PAGE_TYPE.ALL: {
          const response = await apiPostAcademyOpenRecruit(params);
          data = response.data;
          break;
        }
        case RECRUIT_PAGE_TYPE.ACADEMY: {
          params.academyIdx = academyIdx;
          const response = await apiPostAcademyOpenRecruit(params);
          data = response.data;
          break;
        }
        case RECRUIT_PAGE_TYPE.MANAGEMENT: {
          const response = await apiGetAcademyConfigMngRecruits(params);
          data = response.data;
          break;
        }
        default:
          break;
      }
      setTotalCnt(data.data.totalCnt);
      setIsLast(data.data.isLast);
      if (page === 1) {
        setAcademyRecruitList(data.data.list);
      } else {
        setAcademyRecruitList(prev => [...prev, ...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    }
    setRefreshing(false);
    setLoading(false);
  };

  /**
   * function
   */
  const checkRecruitEndRender = item => {
    if (item.closeYn === IS_YN.Y || item.dday < 0) {
      return (
        <View style={[styles.recruitEndBox, { alignSelf: 'flex-start' }]}>
          <Text style={styles.recruitEndText}>모집종료</Text>
        </View>
      );
    }
    return (
      <View style={[styles.recruitingBox, { alignSelf: 'flex-start' }]}>
        <Text style={styles.recruitingText}>모집중</Text>
      </View>
    );
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const onRefresh = async () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    setLoading(true);
    setAcademyRecruitList([]);
    setPage(1);
    setIsLast(false);
    setRefreshing(true);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      onRefresh();
      return () => {
        setPage(1);
        setRefreshing(true);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (refreshing || (!refreshing && page > 1)) {
        getRecruitList();
      }
    }, [page, refreshing]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="아카데미 회원 모집" />

      <View style={styles.recruitmentContainer}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
          {academyRecruitList && academyRecruitList.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={sortedAcademyRecruitList}
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator
                    size="small"
                    style={{ marginVertical: 20 }}
                  />
                ) : null
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onEndReached={() => {
                loadMoreProjects();
              }}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    NavigationService.navigate(
                      navName.academyRecruitmentDetail,
                      { recruitIdx: item.recruitIdx },
                    );
                  }}>
                  <View
                    style={[
                      styles.recruitmentBox,
                      {
                        borderTopWidth: index > 0 ? 1 : 0,
                        borderTopColor: 'rgba(135, 141, 150, 0.22)',
                      },
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={[
                          styles.recruitmentGender,
                          { alignSelf: 'flex-start' },
                        ]}>
                        <Text style={styles.recruitmentGenderText}>
                          {MATCH_GENDER[item?.genderCode]?.desc}
                        </Text>
                      </View>
                      {checkRecruitEndRender(item)}
                    </View>
                    <Text style={styles.recruitmentTitle}>{item.title}</Text>
                    <View style={styles.recruitmentTextBox}>
                      <View>
                        <Text style={styles.recruitmentText}>
                          {item.academyName}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}>
                        <Text style={styles.recruitmentText}>{`${
                          item.addrCity
                        } ${item.addrGu ? '・' : ''} ${item.addrGu}`}</Text>
                        <View style={styles.VerticalLine} />
                        <Text style={styles.recruitmentText}>
                          {moment(item.startDate).format('YYYY.MM.DD')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
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
              <Text style={styles.noneText}>모집 내역이 없습니다.</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(AcademyRecruitment);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  recruitmentContainer: {
    flex: 1,
    // paddingHorizontal: 16,
    // paddingTop: 24,
    paddingBottom: 8,
  },
  recruitmentBox: {
    flex: 1,
    gap: 8,
    paddingVertical: 16,
  },
  recruitmentGender: {
    backgroundColor: 'rgba(49, 55, 121, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitmentGenderText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  recruitmentTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  recruitmentTextBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  recruitmentText: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  VerticalLine: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabButtonBox: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FB8225',
  },
  activeTabText: {
    color: '#FF671F',
  },
  joinList: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  joinListTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  joinListTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  joinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinDetailTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  recruitEndBox: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitEndText: {
    ...fontStyles.fontSize11_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  recruitingBox: {
    borderWidth: 1,
    backgroundColor: 'rgba(255, 103, 31, 0.08)',
    borderColor: 'transparent',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitingText: {
    ...fontStyles.fontSize11_Semibold,
    color: '#FF671F',
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
