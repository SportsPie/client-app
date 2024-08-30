import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
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
} from '../../api/RestAPI';
import { MATCH_GENDER } from '../../common/constants/matchGender';
import fontStyles from '../../styles/fontStyles';
import SPLoading from '../../components/SPLoading';
import SPHeader from '../../components/SPHeader';
import SPIcons from '../../assets/icon';
import { GENDER } from '../../common/constants/gender';
import SPModal from '../../components/SPModal';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IS_YN } from '../../common/constants/isYN';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../redux/store';
import { academyRecruitmentForAdminListAction } from '../../redux/reducers/list/academyRecruitmentForAdminListSlice';

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
  const dispatch = useDispatch();
  /**
   * state
   */
  const listName = 'academyRecruitmentForAdminList';
  const {
    page,
    list: academyRecruitList,
    refreshing,
    noRecruitmentRefreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const action = academyRecruitmentForAdminListAction;
  const noParamReset = route?.params?.noParamReset;

  const academyIdx = route.params?.academyIdx;
  const [activeTab, setActiveTab] = useState(tabs.notice.value);

  // modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedJoinIdx, setSelectedJoinIdx] = useState();

  const flatListRef = useRef();
  const [size, setSize] = useState(30);

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

  const focus = () => {
    if (!noParamReset) {
      setActiveTab(tabs.notice.value);
      dispatch(action.reset());
      NavigationService.replace(navName.academyRecruitmentForAdmin, {
        ...(route?.params ?? {}),
        noParamReset: true,
      });
    } else {
      onRefresh();
    }
  };

  /**
   * useEffect
   */
  useEffect(() => {
    focus();
  }, [noParamReset]);

  useEffect(() => {
    if (noRecruitmentRefreshing) {
      setRefresh(prev => !prev);
      dispatch(action.setNoRecruitmentRefreshing(false));
    }
  }, [noRecruitmentRefreshing]);

  useEffect(() => {
    if (noParamReset) getNoRecuirtList();
  }, [refresh, noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if (refreshing || (!refreshing && page > 1)) {
        getRecruitList();
      }
    }
  }, [page, refreshing, noParamReset]);

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
          <View
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 24,
            }}>
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
        )}
        {activeTab === tabs.noNotice.value && (
          // 가입신청 회원 탭 내용
          <View style={{ flex: 1 }}>
            <View style={styles.joinList}>
              <View style={styles.joinListTop}>
                <Text style={styles.joinListTitle}>가입 신청 리스트</Text>
                <Text style={[styles.joinListTitle, { color: '#FF7C10' }]}>
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
                                {item.memberNickName}
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
                          <Pressable
                            hitSlop={{
                              top: 8,
                              bottom: 8,
                              left: 8,
                              right: 8,
                            }}
                            style={styles.subRefuseBtn}
                            onPress={() => {
                              openRejectModal(item.joinIdx);
                            }}>
                            <Text style={styles.subRefuseText}>거절</Text>
                          </Pressable>
                          <Pressable
                            hitSlop={{
                              top: 8,
                              bottom: 8,
                              left: 8,
                              right: 8,
                            }}
                            style={styles.subApprovalBtn}
                            onPress={() => {
                              openConfirmModal(item.joinIdx);
                            }}>
                            <Text style={styles.subApprovalText}>승인</Text>
                          </Pressable>
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
    // paddingTop: 24,
    paddingBottom: 8,
  },
  recruitmentBox: {
    flex: 1,
    gap: 8,
    paddingVertical: 16,
  },
  recruitmentGender: {
    backgroundColor: 'rgba(0, 38, 114, 0.10)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitmentGenderText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#002672',
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
    // paddingVertical: 8,
    paddingTop: 18,
    paddingBottom: 8,
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
    color: '#FF7C10',
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
    backgroundColor: '#FF7C10',
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
    backgroundColor: '#FF7C10',
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
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitEndText: {
    ...fontStyles.fontSize11_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  recruitingBox: {
    borderWidth: 1,
    backgroundColor: 'rgba(255, 124, 16, 0.15)',
    borderColor: 'transparent',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  recruitingText: {
    ...fontStyles.fontSize11_Semibold,
    color: '#FF7C10',
  },
};
