import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment/moment';
import { ScrollView } from 'react-native-gesture-handler';
import SPIcons from '../../assets/icon';
import { SPSvgs } from '../../assets/svg';
import AcademyJoinModal from './AcademyJoinModal';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPHeader from '../../components/SPHeader';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import { handleError } from '../../utils/HandleError';
import {
  apiGetAcademyOpenRecruitByIdx,
  apiGetAcademyRecruitByIdx,
  apiGetMyInfo,
  apiPatchAcademyConfigMngConfirm,
  apiPatchAcademyConfigMngReject,
} from '../../api/RestAPI';
import { IS_YN } from '../../common/constants/isYN';
import { GENDER } from '../../common/constants/gender';
import SPModal from '../../components/SPModal';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import fontStyles from '../../styles/fontStyles';
import { academyRecruitmentListAction } from '../../redux/reducers/list/academyRecruitmentListSlice';
import { academyRecruitmentForAdminListAction } from '../../redux/reducers/list/academyRecruitmentForAdminListSlice';

function AcademyRecruitmentDetail({ route, type }) {
  const dispatch = useDispatch();
  /**
   * state
   */
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const recruitIdx = route?.params?.recruitIdx;
  const [firstCall, setFirstCall] = useState(false);
  const [adminCheck, setAdminCheck] = useState(false);
  const [myInfo, setMyInfo] = useState({});
  const [recruitDetail, setRecruitDetail] = useState({});
  const [isJoined, setIsJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [waitList, setWaitList] = useState([]); // 가입 신청 리스트
  const [confirmList, setConfirmList] = useState([]); // 가입확정 리스트
  const [recruitEnd, setRecruitEnd] = useState(false);

  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedJoinIdx, setSelectedJoinIdx] = useState();

  const trlRef = useRef({ current: { disabled: false } });
  const [refresh, setRefresh] = useState(false);

  /**
   * api
   */
  const getUserInfo = async () => {
    if (!isLogin) return;
    try {
      const { data } = await apiGetMyInfo();
      setMyInfo(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const getRecruitDetail = async () => {
    setFirstCall(true);
    try {
      let response = null;
      if (isLogin) {
        response = await apiGetAcademyRecruitByIdx(recruitIdx);
      } else {
        response = await apiGetAcademyOpenRecruitByIdx(recruitIdx);
      }
      const { data } = response;
      setRecruitDetail({
        ...data.data?.recruit,
        classTypeList: data.data?.recruit.classTypeList?.reverse(),
      });
      setRecruitEnd(
        data.data?.recruit?.closeYn === IS_YN.Y || data.data?.recruit?.dday < 0,
      );
      setWaitList(data.data?.waitList);
      setConfirmList(data.data?.confirmList);
      dispatch(
        academyRecruitmentListAction.modifyItem({
          idxName: 'recruitIdx',
          idx: recruitIdx,
          item: data.data?.recruit,
        }),
      );
      dispatch(
        academyRecruitmentForAdminListAction.modifyItem({
          idxName: 'recruitIdx',
          idx: recruitIdx,
          item: data.data?.recruit,
        }),
      );
    } catch (error) {
      if (error.code === 4907 || error.code === 9999) {
        dispatch(academyRecruitmentListAction.refresh());
        dispatch(academyRecruitmentForAdminListAction.refresh());
      }
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

  const handleRecruitEnd = async end => {
    try {
      const { data } = await apiGetAcademyOpenRecruitByIdx(recruitIdx);
      dispatch(academyRecruitmentListAction.refresh());
      dispatch(
        academyRecruitmentForAdminListAction.modifyItem({
          idxName: 'recruitIdx',
          idx: recruitIdx,
          item: data.data?.recruit,
        }),
      );
      setRecruitEnd(end);
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * function
   */

  const checkRecruitEndRender = () => {
    if (recruitEnd) {
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

  // 헤더 우측 모달
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const openRejectModal = idx => {
    setSelectedJoinIdx(idx);
    setRejectModalVisible(true);
  };
  const closeRejectModal = () => {
    setRejectModalVisible(false);
  };
  const openConfirmModal = idx => {
    setSelectedJoinIdx(idx);
    setConfirmModalVisible(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalVisible(false);
  };

  const onFocus = async () => {
    try {
      await getUserInfo();
      await getRecruitDetail();
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, [isJoined, refresh]),
  );

  useEffect(() => {
    setIsAdmin(
      myInfo.academyAdmin && myInfo.academyIdx === recruitDetail.academyIdx,
    );
    if (firstCall) {
      setAdminCheck(true);
    }
  }, [myInfo, recruitDetail]);

  return (
    adminCheck && (
      <SafeAreaView style={styles.container}>
        <SPHeader
          title="아카데미 회원 모집"
          noLeftLogo
          {...(isAdmin
            ? {
                rightBasicButton: SPIcons.icOptionsVertical,
                onPressRightIcon: openModal,
              }
            : {
                rightBasicButton: SPIcons.icMemberShare,
                onPressRightIcon: openModal,
              })}
        />
        <SPMoreModal
          visible={modalVisible}
          onClose={closeModal}
          isAdmin={isAdmin}
          type={MODAL_MORE_TYPE.RECRUIT}
          idx={recruitDetail.recruitIdx}
          adminButtons={[
            recruitEnd ? null : MODAL_MORE_BUTTONS.EDIT,
            MODAL_MORE_BUTTONS.SHARE,
          ]}
          memberButtons={[MODAL_MORE_BUTTONS.SHARE]}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flex: 1 }}>
            <View style={styles.contentsBox}>
              <View style={[styles.recruitmentBox]}>
                {checkRecruitEndRender()}
                <Text style={styles.recruitmentTitle}>
                  {recruitDetail.title}
                </Text>
                <View style={styles.recruitmentTextBox}>
                  <View
                    style={[
                      styles.recruitmentSubBox,
                      { flex: 1, paddingRight: 16 },
                    ]}>
                    <Text style={styles.recruitmentText}>
                      {recruitDetail.academyName}
                    </Text>
                    {recruitDetail.certYn === IS_YN.Y && (
                      <Image
                        source={SPIcons.icCheckBadge}
                        style={{ width: 16, height: 16 }}
                      />
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                    <Text style={styles.recruitmentText}>{`${
                      recruitDetail.addrCity
                    } ${recruitDetail.addrGu ? '・' : ''} ${
                      recruitDetail.addrGu
                    }`}</Text>
                    <View style={styles.VerticalLine} />
                    <Text style={styles.recruitmentText}>
                      {moment(recruitDetail.regDate).format('YYYY.MM.DD')}
                    </Text>
                  </View>
                </View>
                <View style={styles.recruitmentSubBox}>
                  <Image
                    source={SPIcons.icPerson}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  />
                  <Text style={styles.recruitmentSubText}>
                    {recruitDetail.admName}
                  </Text>
                </View>
              </View>
              <View style={styles.recruitmentList}>
                <View
                  style={[
                    styles.recruitmentItem,
                    {
                      borderRightWidth: 1,
                      borderRightColor: 'rgba(135, 141, 150, 0.22)',
                    },
                  ]}>
                  {/* <Image
                    source={SPIcons.icGender}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      overflow: 'hidden',
                    }}
                  /> */}
                  <SPSvgs.Gender />
                  <Text style={styles.subText}>{recruitDetail.genderKo}</Text>
                </View>
                <View style={styles.recruitmentItem}>
                  {/* <Image
                    source={SPIcons.icClassRoom}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      overflow: 'hidden',
                    }}
                  /> */}
                  <SPSvgs.ClassRoom />
                  <Text style={styles.subText}>
                    {recruitDetail?.classTypeList &&
                    recruitDetail?.classTypeList.length > 0
                      ? recruitDetail?.classTypeList
                          .map(item =>
                            item.planTypeCode?.includes('ETC')
                              ? item?.etc
                              : item?.planTypeName,
                          )
                          .join(', ')
                      : ''}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.contentsBox}>
              <Text style={styles.detailTitle}>내용</Text>
              <Text style={styles.detailText}>{recruitDetail.contents}</Text>
            </View>
            <View style={styles.contentsBox}>
              <Text style={styles.detailTitle}>모집기간</Text>
              {recruitDetail.endDate ? (
                <Text style={styles.detailText}>
                  {moment(recruitDetail.startDate).format('YYYY.MM.DD A HH:mm')}{' '}
                  - {moment(recruitDetail.endDate).format('YYYY.MM.DD A HH:mm')}
                </Text>
              ) : (
                <Text style={styles.detailText}>상시모집</Text>
              )}
            </View>
            <View>
              {isJoined && (
                <View style={styles.member}>
                  {recruitDetail.logoPath ? (
                    <Image
                      source={{ uri: recruitDetail.logoPath }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        overflow: 'hidden',
                      }}
                    />
                  ) : (
                    <Image
                      source={SPIcons.icDefaultAcademy}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        overflow: 'hidden',
                      }}
                    />
                  )}
                  <Text style={styles.memberTitle}>
                    {recruitDetail.academyName}
                  </Text>
                  {recruitDetail.certYn === IS_YN.Y && (
                    <Image
                      source={SPIcons.icCheckBadge}
                      style={{ width: 20, height: 20 }}
                    />
                  )}
                </View>
              )}
            </View>

            {/* 운영자 일때 */}
            {/* 가입 신청 리스트 */}
            {isAdmin && !recruitEnd && (
              <View style={styles.joinList}>
                <View style={styles.joinListTop}>
                  <Text style={styles.joinListTitle}>가입 신청 리스트</Text>
                  <Text style={[styles.joinListTitle, { color: '#FF7C10' }]}>
                    {waitList?.length}
                  </Text>
                </View>
                <View style={{ gap: 8 }}>
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
                                    {moment(item.memberBirth).format(
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
                    <View style={styles.joinItem}>
                      <Text style={styles.noneText}>
                        가입신청 내역이 존재하지 않습니다.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* 가입확정 */}
            {isAdmin && (
              <View style={styles.joinList}>
                <View style={styles.joinListTop}>
                  <Text style={styles.joinListTitle}>가입확정</Text>
                  <Text style={[styles.joinListTitle, { color: '#FF7C10' }]}>
                    {confirmList?.length}
                  </Text>
                </View>
                <View style={{ gap: 8 }}>
                  {confirmList && confirmList.length > 0 ? (
                    confirmList.map((item, index) => {
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
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                  }}
                                />
                              ) : (
                                <Image
                                  source={SPIcons.icPerson}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                  }}
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
                                    {moment(item.memberBirth).format(
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
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.joinItem}>
                      <Text>가입 확정 내역이 존재하지 않습니다.</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <AcademyJoinModal
          academyIdx={recruitDetail.academyIdx}
          recruitIdx={recruitIdx}
          setIsJoined={setIsJoined}
          recruitmentEnds={recruitEnd}
          onRecruitmentEnds={handleRecruitEnd}
          showRecruitmentEnd
        />
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
    )
  );
}

export default memo(AcademyRecruitmentDetail);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentsBox: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  recruitmentBox: {
    gap: 8,
    marginBottom: 16,
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
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  VerticalLine: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(135, 141, 150, 0.16)',
  },
  recruitmentSubBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recruitmentSubText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 19,
  },
  recruitmentList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 8,
  },
  recruitmentItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#000',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  memberTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    paddingLeft: 4,
    flexShrink: 1,
  },
  noMemberBtn: {
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
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
