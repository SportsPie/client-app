import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Share from 'react-native-share';
import { useSelector } from 'react-redux';
import {
  apiDeleteAcademyConfigMngAcademy,
  apiDeleteAcademyLeave,
  apiDeleteCommunity,
  apiDeleteCommunityComment,
  apiPatchCommunityMngFix,
  apiPatchCommunityMngUnFix,
} from '../api/RestAPI';
import SPIcons from '../assets/icon';
import { MODAL_CLOSE_EVENT } from '../common/constants/modalCloseEvent';
import { navName } from '../common/constants/navName';
import { REPORT_TYPE } from '../common/constants/reportType';
import NavigationService from '../navigation/NavigationService';
import DynamicLinkUtils from '../utils/DynamicLinkUtils';
import { handleError } from '../utils/HandleError';
import Utils from '../utils/Utils';
import SPModal from './SPModal';
import { ACTIVE_OPACITY } from '../common/constants/constants';

export const MODAL_MORE_TYPE = {
  // 아카데미
  ACADEMY: 'ACADEMY', // "아카데미"
  RECRUIT: 'RECRUIT', // "아카데미 회원 모집",
  FEED: 'FEED', // "아카데미 커뮤티니 게시글"
  FEED_COMMENT: 'FEED_COMMENT', // "아카데미 커뮤티니 게시글 댓글"
  VIDEO: 'VIDEO', // "영상"
  VIDEO_COMMENT: 'VIDEO_COMMENT', // "영상 댓글"

  // PIE 트래이닝 > 마스터 & 챌린지 > 영상, 댓글
  MASTER_VIDEO: 'MASTER_VIDEO', // "마스터 영상"
  MASTER_VIDEO_COMMENT: 'MASTER_VIDEO_COMMENT', // "마스터 영상 댓글"
  CHALLENGE_VIDEO: 'CHALLENGE_VIDEO', // "챌린지 영상"
  CHALLENGE_VIDEO_COMMENT: 'CHALLENGE_VIDEO_COMMENT', // "챌린지 영상 댓글"
};

export const MODAL_MORE_BUTTONS = {
  REPORT: 'REPORT', // 신고하기
  REMOVE: 'REMOVE', // 삭제하기
  SHARE: 'SHARE', // 공유하기
  EDIT: 'EDIT', // 수정하기
  LEAVE: 'LEAVE', // 탈퇴하기
  FIX: 'FIX', // 고정하기
  UNFIX: 'UNFIX', // 고정해제
};

function SPMoreModal({
  visible,
  onClose,
  isAdmin,
  type,
  idx,
  adminButtons = [],
  memberButtons = [],
  onReport,
  onDelete,
  onConfirm,
  onModify,
  transparent = true,
  shareLink,
  shareTitle,
  shareDescription,
}) {
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const trlRef = useRef({ current: { disabled: false } });

  const [showRemoveCheckModal, setShowRemoveCheckModal] = useState(false);
  const [showLeaveCheckModal, setShowLeaveCheckModal] = useState(false);
  const [showFixCheckModal, setShowFixCheckModal] = useState(false);
  const [showUnFixCheckModal, setShowUnFixCheckModal] = useState(false);

  // 삭제
  const remove = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      switch (type) {
        case MODAL_MORE_TYPE.ACADEMY: {
          await apiDeleteAcademyConfigMngAcademy();
          Utils.openModal({
            title: '삭제 완료',
            body: '삭제 처리가 완료되었어요',
            closeEvent: MODAL_CLOSE_EVENT.moveAcademy,
          });
          break;
        }

        case MODAL_MORE_TYPE.RECRUIT:
          break;
        case MODAL_MORE_TYPE.FEED:
          await apiDeleteCommunity(idx);
          Utils.openModal({
            title: '성공',
            body: '삭제되었습니다.',
          });
          if (onConfirm) onConfirm();
          break;
        case MODAL_MORE_TYPE.FEED_COMMENT:
          await apiDeleteCommunityComment(idx);
          Utils.openModal({
            title: '성공',
            body: '삭제되었습니다.',
          });
          if (onConfirm) onConfirm();
          break;
        case MODAL_MORE_TYPE.VIDEO:
          if (onDelete) onDelete();
          if (onConfirm) onConfirm();
          break;
        case MODAL_MORE_TYPE.VIDEO_COMMENT:
          if (onDelete) onDelete();
          if (onConfirm) onConfirm();
          break;
        case MODAL_MORE_TYPE.MASTER_VIDEO_COMMENT:
          if (onDelete) onDelete();
          if (onConfirm) onConfirm();
          break;
        case MODAL_MORE_TYPE.CHALLENGE_VIDEO:
          if (onDelete) onDelete();
          break;
        case MODAL_MORE_TYPE.CHALLENGE_VIDEO_COMMENT:
          if (onDelete) onDelete();
          if (onConfirm) onConfirm();
          break;
        default:
          break;
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  // 탈퇴 :: 아카데미
  const leave = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const { data } = await apiDeleteAcademyLeave(idx);
      Utils.openModal({
        title: '탈퇴 완료',
        body: '탈퇴 처리가 완료되었어요.',
        closeEvent: MODAL_CLOSE_EVENT.moveAcademy,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  // 수정
  const modify = () => {
    switch (type) {
      case MODAL_MORE_TYPE.ACADEMY:
        NavigationService.navigate(navName.academyEdit, {
          academyIdx: idx,
        });
        break;
      case MODAL_MORE_TYPE.RECRUIT:
        NavigationService.navigate(navName.academyRecruitmentEdit, {
          recruitIdx: idx,
        });
        break;
      case MODAL_MORE_TYPE.FEED:
        NavigationService.navigate(navName.communityEdit, {
          feedIdx: idx,
        });
        break;
      case MODAL_MORE_TYPE.FEED_COMMENT:
        if (onModify) onModify();
        break;
      case MODAL_MORE_TYPE.VIDEO:
        NavigationService.navigate(navName.editDetails, {
          videoIdx: idx,
        });
        break;
      case MODAL_MORE_TYPE.VIDEO_COMMENT:
        if (onModify) onModify();
        break;
      case MODAL_MORE_TYPE.MASTER_VIDEO_COMMENT:
        if (onModify) onModify();
        break;
      case MODAL_MORE_TYPE.CHALLENGE_VIDEO:
        if (onModify) onModify();
        break;
      case MODAL_MORE_TYPE.CHALLENGE_VIDEO_COMMENT:
        if (onModify) onModify();
        break;
      default:
        break;
    }
  };
  // 신고
  const report = () => {
    if (onReport) onReport();
    if (onClose) onClose();
    NavigationService.navigate(navName.report, {
      reportType: type,
      reportIdx: idx,
    });
  };

  // 공유
  const share = async () => {
    if (onClose) onClose();
    const link = await DynamicLinkUtils.createDynamicLink({
      uri: shareLink,
      title: shareTitle,
      description: shareDescription,
    });
    await Share.open({
      url: link,
    });
  };

  // 고정
  const fix = async () => {
    if (onClose) onClose();
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;

    try {
      switch (type) {
        case MODAL_MORE_TYPE.ACADEMY:
          break;
        case MODAL_MORE_TYPE.RECRUIT:
          break;
        case MODAL_MORE_TYPE.FEED: {
          await apiPatchCommunityMngFix(idx);
          Utils.openModal({ title: '성공', body: '게시글이 고정되었습니다.' });
          if (onConfirm) onConfirm();
          break;
        }
        default:
          break;
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  // 고정 해제
  const unFix = async () => {
    if (onClose) onClose();
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      switch (type) {
        case MODAL_MORE_TYPE.ACADEMY:
          break;
        case MODAL_MORE_TYPE.RECRUIT:
          break;
        case MODAL_MORE_TYPE.FEED: {
          await apiPatchCommunityMngUnFix(idx);
          Utils.openModal({
            title: '성공',
            body: '게시글이 고정해제 되었습니다.',
          });
          if (onConfirm) onConfirm();
          break;
        }
        default:
          break;
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  // 삭제 확인 모달
  const showCheckRemove = () => {
    if (onClose) onClose();
    setShowRemoveCheckModal(true);
  };

  // 탈퇴 확인 모달
  const showCheckLeave = () => {
    if (onClose) onClose();
    setShowLeaveCheckModal(true);
  };

  // 고정 확인 모달
  const showCheckFix = () => {
    if (onClose) onClose();
    setShowFixCheckModal(true);
  };

  // 고정 해제 확인 모달
  const showCheckUnFix = () => {
    if (onClose) onClose();
    setShowUnFixCheckModal(true);
  };

  const hideCheckModal = () => {
    setShowRemoveCheckModal(false);
    setShowLeaveCheckModal(false);
    setShowFixCheckModal(false);
    setShowUnFixCheckModal(false);
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={transparent}
        visible={visible}
        onRequestClose={() => {
          if (onClose) onClose();
        }}>
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          style={styles.overlay}
          onPress={() => {
            if (onClose) onClose();
          }}>
          <View style={styles.modalContainer}>
            {isAdmin && (
              <>
                {adminButtons.includes(MODAL_MORE_BUTTONS.EDIT) && (
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.button}
                    onPress={() => {
                      if (onClose) onClose();
                      modify();
                    }}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icEdit} />
                      <Text style={styles.modalText}>
                        {type === REPORT_TYPE.ACADEMY
                          ? '아카데미 수정하기'
                          : '수정하기'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {adminButtons.includes(MODAL_MORE_BUTTONS.REMOVE) && (
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.button}
                    onPress={() => {
                      showCheckRemove();
                    }}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icDelete} />
                      <Text style={styles.modalText}>삭제하기</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {adminButtons.includes(MODAL_MORE_BUTTONS.SHARE) && (
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.button}
                    onPress={() => {
                      onClose();
                      setTimeout(() => {
                        share();
                      }, 0);
                    }}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icShare} />
                      <Text style={styles.modalText}>공유하기</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {adminButtons.includes(MODAL_MORE_BUTTONS.FIX) && (
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.button}
                    onPress={showCheckFix}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icPinFill} />
                      <Text style={styles.modalText}>고정하기</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {adminButtons.includes(MODAL_MORE_BUTTONS.UNFIX) && (
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.button}
                    onPress={showCheckUnFix}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icPinFill} />
                      <Text style={styles.modalText}>고정해제</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
            {!isAdmin && (
              <>
                {isLogin && memberButtons.includes(MODAL_MORE_BUTTONS.EDIT) && (
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.button}
                    onPress={() => {
                      if (onClose) onClose();
                      modify();
                    }}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icEdit} />
                      <Text style={styles.modalText}>
                        {type === REPORT_TYPE.ACADEMY
                          ? '아카데미 수정하기'
                          : '수정하기'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {isLogin &&
                  memberButtons.includes(MODAL_MORE_BUTTONS.REMOVE) && (
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      style={styles.button}
                      onPress={() => {
                        showCheckRemove();
                      }}>
                      <View style={styles.modalBox}>
                        <Image source={SPIcons.icDelete} />
                        <Text style={styles.modalText}>삭제하기</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                {isLogin &&
                  memberButtons.includes(MODAL_MORE_BUTTONS.REPORT) && (
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      style={styles.button}
                      onPress={() => {
                        report();
                        onClose();
                      }}>
                      <View style={styles.modalBox}>
                        <Image source={SPIcons.icWarning} />
                        <Text style={styles.modalText}>신고하기</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                {isLogin &&
                  memberButtons.includes(MODAL_MORE_BUTTONS.LEAVE) && (
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      style={styles.button}
                      onPress={() => {
                        showCheckLeave();
                      }}>
                      <View style={styles.modalBox}>
                        <Image source={SPIcons.icBan} />
                        <Text style={styles.modalText}>탈퇴하기</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                {memberButtons.includes(MODAL_MORE_BUTTONS.SHARE) && (
                  <TouchableOpacity
                    activeOpacity={ACTIVE_OPACITY}
                    style={styles.button}
                    onPress={() => {
                      onClose();
                      setTimeout(() => {
                        share();
                      }, 0);
                    }}>
                    <View style={styles.modalBox}>
                      <Image source={SPIcons.icShare} />
                      <Text style={styles.modalText}>공유하기</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      <SPModal
        title={
          type === MODAL_MORE_TYPE.FEED_COMMENT ||
          type === MODAL_MORE_TYPE.VIDEO_COMMENT ||
          type === MODAL_MORE_TYPE.MASTER_VIDEO_COMMENT ||
          type === MODAL_MORE_TYPE.CHALLENGE_VIDEO_COMMENT
            ? '댓글 삭제'
            : '삭제 확인'
        }
        contents={
          type === MODAL_MORE_TYPE.FEED_COMMENT ||
          type === MODAL_MORE_TYPE.VIDEO_COMMENT ||
          type === MODAL_MORE_TYPE.MASTER_VIDEO_COMMENT ||
          type === MODAL_MORE_TYPE.CHALLENGE_VIDEO_COMMENT
            ? '댓글을 삭제할까요?'
            : '삭제하시겠습니까?'
        }
        visible={showRemoveCheckModal}
        onConfirm={() => {
          remove();
        }}
        onCancel={hideCheckModal}
        onClose={hideCheckModal}
      />
      <SPModal
        title="탈퇴 확인"
        contents="탈퇴하시겠습니까?"
        visible={showLeaveCheckModal}
        onConfirm={() => {
          leave();
        }}
        onCancel={hideCheckModal}
        onClose={hideCheckModal}
      />
      <SPModal
        title="고정하기"
        contents={`게시물을 최대 3개까지만 고정할 수 있습니다. \n이 게시물을 고정하면 가장 오래된 \n고정 게시물이 해제됩니다.`}
        visible={showFixCheckModal}
        onConfirm={() => {
          fix();
        }}
        onCancel={hideCheckModal}
        onClose={hideCheckModal}
      />
      <SPModal
        title="고정해제"
        contents="고정해제 하시겠습니까?"
        visible={showUnFixCheckModal}
        onConfirm={() => {
          unFix();
        }}
        onCancel={hideCheckModal}
        onClose={hideCheckModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
  },
  modalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalText: {
    // flex: 1,
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
});

export default SPMoreModal;
