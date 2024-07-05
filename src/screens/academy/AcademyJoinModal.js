import React, {
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, TouchableOpacity, View } from 'react-native';
import SPModal from '../../components/SPModal';
import {
  apiDeleteAcademyJoin,
  apiGetAcademyDetail,
  apiGetMyInfo,
  apiPatchAcademyConfigMngClose,
  apiPostAcademyJoin,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { IS_YN } from '../../common/constants/isYN';
import { navName } from '../../common/constants/navName';

export default function AcademyJoinModal({
  academyIdx,
  recruitIdx,
  setIsJoined,
  recruitmentEnds,
  onRecruitmentEnds,
  showRecruitmentEnd,
}) {
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [recruitmentEndVisible, setRecruitmentEndVisible] = useState(false);
  const trlRef = useRef({ current: { disabled: false } });
  const [refresh, setRefresh] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [joinReqeusted, setJoinReqeusted] = useState(false); // 해당 아카데미에 가입 신청을 했는지에 대한 여부
  const [isAdmin, setIsAdmin] = useState(false);
  const [academyDetail, setAcademyDetail] = useState({});
  const [autoApproval, setAutoApproval] = useState(false);

  const [fstCall, setFstCall] = useState(false);

  const getUserInfo = async () => {
    try {
      if (!isLogin) {
        return;
      }
      if (recruitmentEnds) {
        setShowButton(false);
        return;
      }
      const { data } = await apiGetMyInfo();
      // 이미 아카데미 회원일 경우 가입신청 버튼 숨김
      if (data.data.academyIdx) {
        if (
          data.data.academyMember ||
          data.data.academyAdmin ||
          data.data.academyCreator
        ) {
          // 관리자 여부
          if (data.data.academyAdmin && academyIdx === data.data.academyIdx) {
            setIsAdmin(true);
            setShowButton(true);
          } else {
            setIsAdmin(false);
            setShowButton(false);
          }
          if (setIsJoined) setIsJoined(true); // 아카데미 회원인 경우(해당 아카데미 외 다른 아카데미 포함 아카데미 회원)
        } else if (academyIdx === data.data.academyIdx) {
          setJoinReqeusted(true); // 가입 신청한 경우
          setShowButton(true);
        } else {
          setJoinReqeusted(false); // 다른 곳에 가입 신청한 경우
          setShowButton(false);
        }
      } else {
        // 가입 신청 하지 않은 경우
        setJoinReqeusted(false);
        setShowButton(true);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setFstCall(true);
    }
  };

  const getAcademyDetail = async () => {
    try {
      const { data } = await apiGetAcademyDetail(academyIdx);
      setAcademyDetail(data.data.academy);
      setAutoApproval(data.data?.academy?.autoApprovalYn === IS_YN.Y);
    } catch (error) {
      handleError(error);
    }
  };

  const joinRequest = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const params = { academyIdx, recruitIdx };
      const { data } = await apiPostAcademyJoin(params);
      if (autoApproval) {
        Utils.openModal({
          title: '가입 완료',
          body: '가입이 완료되었습니다.',
        });
      } else {
        Utils.openModal({
          title: '가입신청 완료',
          body: '가입 신청이 완료되었습니다.\n가입이 승인되면 알려두릴게요!',
        });
      }
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const joinCancel = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiDeleteAcademyJoin(academyIdx);
      Utils.openModal({
        title: '가입신청 취소',
        body: '가입 신청이 취소되었습니다.',
      });
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const recruitmentEnd = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiPatchAcademyConfigMngClose(recruitIdx);
      Utils.openModal({
        title: '모집 종료',
        body: '모집을 종료하였습니다.',
      });
      // setRefresh(prev => !prev);
      if (onRecruitmentEnds) onRecruitmentEnds(true);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const showJoinModal = () => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
        data: { goBack: true },
      });
    } else {
      setJoinModalVisible(true);
    }
  };

  const showCancelModal = () => {
    setCancelModalVisible(true);
  };

  const showRecruitmentEndModal = () => {
    setRecruitmentEndVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      getAcademyDetail();
    }, [academyIdx]),
  );

  useFocusEffect(
    useCallback(() => {
      getUserInfo();
    }, [isLogin, academyIdx, refresh]),
  );

  useFocusEffect(
    useCallback(() => {
      if (recruitmentEnds !== undefined) {
        setShowButton(!recruitmentEnds);
      }
    }, [recruitmentEnds]),
  );

  return (
    fstCall && (
      <View>
        {!isAdmin && (!isLogin || showButton) && (
          <View style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
            <TouchableOpacity
              onPress={() => {
                if (!joinReqeusted) {
                  showJoinModal();
                } else {
                  showCancelModal();
                }
              }}
              style={{
                height: 48,
                backgroundColor: '#FF671F',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                paddingHorizontal: 28,
                paddingVertical: 12,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#FFF',
                  lineHeight: 24,
                  letterSpacing: 0.091,
                }}>
                {!joinReqeusted ? '가입신청' : '가입신청 취소'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {isAdmin &&
          isLogin &&
          !recruitmentEnds &&
          showButton &&
          showRecruitmentEnd && (
            <View style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  showRecruitmentEndModal();
                }}
                style={{
                  height: 48,
                  backgroundColor: '#FF671F',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  paddingHorizontal: 28,
                  paddingVertical: 12,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#FFF',
                    lineHeight: 24,
                    letterSpacing: 0.091,
                  }}>
                  모집종료
                </Text>
              </TouchableOpacity>
            </View>
          )}
        <SPModal
          title="가입 신청"
          contents="가입 신청하시겠습니까?"
          visible={joinModalVisible}
          onConfirm={() => {
            joinRequest();
          }}
          onCancel={() => {
            setJoinModalVisible(false);
          }}
          onClose={() => {
            setJoinModalVisible(false);
          }}
        />
        <SPModal
          title="가입 신청 취소"
          contents="가입 신청을 취소하시겠습니까?"
          visible={cancelModalVisible}
          onConfirm={() => {
            joinCancel();
          }}
          onCancel={() => {
            setCancelModalVisible(false);
          }}
          onClose={() => {
            setCancelModalVisible(false);
          }}
        />

        <SPModal
          title="모집 종료"
          contents="모집을 종료하시겠습니까?"
          visible={recruitmentEndVisible}
          onConfirm={() => {
            recruitmentEnd();
          }}
          onCancel={() => {
            setRecruitmentEndVisible(false);
          }}
          onClose={() => {
            setRecruitmentEndVisible(false);
          }}
        />
      </View>
    )
  );
}
