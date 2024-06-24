import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import {
  apiGetAcademyConfigMngNoRecruit,
  apiGetAcademyConfigMngRecruits,
  apiPatchAcademyConfigMngConfirm,
  apiPatchAcademyConfigMngReject,
  apiPostAcademyOpenRecruit,
} from '../../api/RestAPI';
import { MATCH_GENDER } from '../../common/constants/matchGender';
import fontStyles from '../../styles/fontStyles';
import SPLoading from '../../components/SPLoading';
import SPHeader from '../../components/SPHeader';
import { RECRUIT_PAGE_TYPE } from '../../common/constants/recruitPageType';
import { useFocusEffect } from '@react-navigation/native';
import { REPORT_TYPE } from '../../common/constants/reportType';
import SPIcons from '../../assets/icon';
import { GENDER } from '../../common/constants/gender';
import SPModal from '../../components/SPModal';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IS_YN } from '../../common/constants/isYN';

const tabs = {
  notice: {
    value: 'notice',
    desc: '모집공고',
  },
  noNotice: {
    value: 'noNotice',
    desc: '가입신청 회원',
  },
};

// 탭 컴포넌트 (모집공고, 가입신청 회원)
function TabButton({ tab, activeTab, setActiveTab }) {
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab.value ? styles.activeTab : styles.inactiveTab,
      ]}
      onPress={() => setActiveTab(tab.value)}>
      <Text
        style={[
          styles.tabText,
          activeTab === tab.value ? styles.activeTabText : null,
        ]}>
        {tab.desc}
      </Text>
    </TouchableOpacity>
  );
}

function AcademyRecruitmentForAdmin({ route }) {
  /**
   * state
   */
  const academyIdx = route.params?.academyIdx;
  const [activeTab, setActiveTab] = useState(tabs.notice.value);

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

  const [waitList, setWaitList] = useState([]);

  const trlRef = useRef({ current: { disabled: false } });
  const [refresh, setRefresh] = useState(false);

  // 가입신청 회원 임시
  const openRejectModal = idx => {
    setSelectedJoinIdx(idx);
    setRejectModalVisible(true);
  };

  const openConfirmModal = idx => {
    setSelectedJoinIdx(idx);
    setConfirmModalVisible(true);
  };

  const closeRejectModal = () => {
    setRejectModalVisible(false);
  };

  const closeConfirmModal = () => {
    setConfirmModalVisible(false);
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
      const { data } = await apiGetAcademyConfigMngRecruits(params);
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

  const getNoRecuirtList = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngNoRecruit();
      setWaitList(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const reject = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiPatchAcademyConfigMngReject(selectedJoinIdx);
      Utils.openModal({ title: '성공', body: '거절되었습니다.' });
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };
  const confirm = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiPatchAcademyConfigMngConfirm(selectedJoinIdx);
      Utils.openModal({ title: '성공', body: '승인되었습니다.' });
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
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
        setRefreshing(true);
      }
    }, 0);
  };

  const onRefresh = async () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
    setPage(1);
    setIsLast(false);
    setRefreshing(true);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      return () => {
        setPage(1);
        setRefreshing(true);
        setActiveTab(tabs.notice.value);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      getNoRecuirtList();
    }, [refresh]),
  );

  useFocusEffect(
    useCallback(() => {
      if (refreshing) {
        getRecruitList();
      }
    }, [page, refreshing]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <SPHeader
        title="아카데미 회원 모집"
        rightCancelText
        rightText="등록"
        rightTextStyle={{
          fontSize: 16,
          fontWeight: 600,
          color: '#313779',
          lineHeight: 24,
          letterSpacing: 0.091,
          minHeight: 28,
        }}
        rightTextMoveName={navName.academyRecruitmentRegist}
        rightTextMoveParam={{ academyIdx }}
      />
      <View style={styles.recruitmentContainer}>
        <View style={styles.tabButtonBox}>
          <TabButton
            tab={tabs.notice}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <TabButton
            tab={tabs.noNotice}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </View>
        {activeTab === tabs.notice.value && (
          // 모집공고 내용
          <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
            {academyRecruitList && academyRecruitList.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={academyRecruitList}
                ListFooterComponent={
                  loading ? (
                    <ActivityIndicator
                      size="small"
                      style={{ marginVertical: 20 }}
                    />
                  ) : null
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
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
                        <Text style={styles.recruitmentText}>
                          {item.academyName}
                        </Text>
                        <View style={styles.VerticalLine} />
                        <Text style={styles.recruitmentText}>{`${
                          item.addrCity
                        } ${item.addrGu ? '・' : ''} ${item.addrGu}`}</Text>
                        <View style={styles.VerticalLine} />
                        <Text style={styles.recruitmentText}>
                          {moment(item.startDate).format('YYYY.MM.DD')}
                        </Text>
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
                <Text>모집 내역이 없습니다.</Text>
              </View>
            )}
          </View>
        )}
        {activeTab === tabs.noNotice.value && (
          // 가입신청 회원 탭 내용
          <View style={{ flex: 1 }}>
            <View style={styles.joinList}>
              <View style={styles.joinListTop}>
                <Text style={styles.joinListTitle}>가입 신청 리스트</Text>
                <Text style={[styles.joinListTitle, { color: '#FF671F' }]}>
                  {waitList?.length}
                </Text>
              </View>
              <View style={{ gap: 8, flex: 1 }}>
                {waitList && waitList.length > 0 ? (
                  waitList.map((item, index) => {
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <View key={index} style={styles.joinItem}>
                        <TouchableOpacity
                          style={styles.joinDetailContainer}
                          onPress={() => {
                            NavigationService.navigate(
                              navName.academyPlayerDetail,
                              {
                                userIdx: item.memberIdx,
                                joinIdx: item.joinIdx,
                                showButton: true,
                              },
                            );
                          }}>
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              overflow: 'hidden',
                            }}>
                            {item.memberProfilePath ? (
                              <Image
                                source={{ uri: item.memberProfilePath }}
                                style={{ width: 32, height: 32 }}
                              />
                            ) : (
                              <Image
                                source={SPIcons.icPerson}
                                style={{ width: 32, height: 32 }}
                              />
                            )}
                          </View>
                          <View style={styles.joinDetailBox}>
                            <View style={styles.joinDetailTop}>
                              <Text style={styles.joinName}>
                                {item.memberName}
                              </Text>
                            </View>
                            <View style={styles.joinDetailBottom}>
                              {item.memberBirth && (
                                <Text style={styles.joinDate}>
                                  {moment(item.playerBirthmemberBirth).format(
                                    'YYYY.MM.DD',
                                  )}
                                  ({item.fullAge}세)
                                </Text>
                              )}
                              <View style={styles.joinCircle} />
                              <Text style={styles.joinGender}>
                                {item.memberGender
                                  ? GENDER[item.memberGender].desc
                                  : ''}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.subBtnBox}>
                          <TouchableOpacity
                            style={styles.subRefuseBtn}
                            onPress={() => {
                              openRejectModal(item.joinIdx);
                            }}>
                            <Text style={styles.subRefuseText}>거절</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.subApprovalBtn}
                            onPress={() => {
                              openConfirmModal(item.joinIdx);
                            }}>
                            <Text style={styles.subApprovalText}>승인</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View
                    style={[
                      styles.joinItem,
                      {
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}>
                    <Text style={styles.noneText}>
                      가입신청 내역이 존재하지 않습니다.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
      <SPModal
        title="거절 확인"
        contents="거절하시겠습니까?"
        visible={rejectModalVisible}
        onConfirm={() => {
          reject();
        }}
        onCancel={closeRejectModal}
        onClose={closeRejectModal}
      />
      <SPModal
        title="승인 확인"
        contents="승인하시겠습니까?"
        visible={confirmModalVisible}
        twoButton
        onConfirm={() => {
          confirm();
        }}
        onCancel={closeConfirmModal}
        onClose={closeConfirmModal}
      />
    </SafeAreaView>
  );
}

export default memo(AcademyRecruitmentForAdmin);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  recruitmentContainer: {
    flex: 1,
    // paddingHorizontal: 16,
    paddingTop: 24,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    flex: 1,
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
  numberBox: {
    backgroundColor: '#5A5F94',
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  numberText: {
    fontSize: 11,
    fontWeight: 500,
    color: '#FFF',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  joinName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  joinDetailBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinDate: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  joinCircle: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 8,
  },
  joinGender: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  joinDeadlineBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  joinDeadlineText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.0091,
    textAlign: 'center',
  },
  subBtnBox: {
    flexDirection: 'row',
    gap: 8,
  },
  subRefuseBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    height: 32,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  subRefuseText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  subApprovalBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF671F',
    height: 32,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  subApprovalText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
  recruitEndBox: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    padding: 4,
  },
  recruitEndText: {
    ...fontStyles.fontSize11_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  recruitingBox: {
    borderWidth: 1,
    backgroundColor: 'rgba(255, 103, 31, 0.08)',
    borderColor: 'rgba(255, 103, 31, 0.08)',
    borderRadius: 4,
    padding: 4,
  },
  recruitingText: {
    ...fontStyles.fontSize11_Semibold,
    color: '#FF671F',
  },
};
