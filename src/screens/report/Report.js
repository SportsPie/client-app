import React, { memo, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiPostAcademyReport,
  apiPostCommunityReport,
  apiReportChallenge,
  apiReportTraining,
} from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { REPORT_TYPE } from '../../common/constants/reportType';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import Header from '../../components/header';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import SPModal from '../../components/SPModal';

function Report({ route }) {
  const reasonRef = useRef();
  /**
   * state
   */
  const reportIdx = route?.params?.reportIdx;
  const reportType = route?.params?.reportType; // REPORT_TYPE
  const isReportUser = route?.params?.isReportUser;
  const targetUserIdx = route?.params?.targetUserIdx;
  const [selectedReason, setSelectedReason] = useState();
  const [memo, setMemo] = useState('');
  const trlRef = useRef({ current: { disabled: false } });
  const [showUserReportCheckModal, setShowUserReportCheckModal] =
    useState(false);
  const [userReportParam, setUserReportParam] = useState({});
  const pageTypes = {
    ACADEMY: 'ACADEMY', // 아카데미
    USER: 'USER', // 사용자
    FEED: 'FEED', // 게시글
  };
  let pageType = '';

  if (reportType) {
    switch (reportType) {
      case REPORT_TYPE.CHAT:
      case REPORT_TYPE.ACADEMY:
        pageType = pageTypes.ACADEMY;
        break;
      case REPORT_TYPE.USER:
        pageType = pageTypes.USER;
        break;
      case REPORT_TYPE.FEED:
        pageType = pageTypes.FEED;
        break;
      case REPORT_TYPE.VIDEO:
        pageType = pageTypes.FEED;
        break;
      case REPORT_TYPE.FEED_COMMENT:
        pageType = pageTypes.FEED;
        break;
      case REPORT_TYPE.VIDEO_COMMENT:
        pageType = pageTypes.FEED;
        break;
      case REPORT_TYPE.MASTER_VIDEO:
        pageType = pageTypes.FEED;
        break;
      case REPORT_TYPE.MASTER_VIDEO_COMMENT:
        pageType = pageTypes.FEED;
        break;
      case REPORT_TYPE.CHALLENGE_VIDEO:
        pageType = pageTypes.FEED;
        break;
      case REPORT_TYPE.CHALLENGE_VIDEO_COMMENT:
        pageType = pageTypes.FEED;
        break;
      default:
        break;
    }
  }
  if (isReportUser) {
    pageType = pageTypes.USER;
  }

  const reasons = {
    [pageTypes.ACADEMY]: {
      title: '아카데미를 신고하는 이유를\n선택해주세요.',
      reasonList: [
        '스포츠파이와 맞지 않는 활동',
        '부적절한 이미지 사용',
        '활동하지 않는 아카데미',
        '기타',
      ],
      memo: false,
    },
    [pageTypes.USER]: {
      title: '사용자를 신고하는 이유를\n선택해주세요.',
      reasonList: [
        '스포츠파이와 맞지 않는 활동',
        '폭언, 비속어, 혐오발언',
        '음란성, 선정성 글',
        '부적절한 프로필 이미지와 닉네임',
        '주제와 무관',
        '기타',
      ],
      memo: true,
    },
    [pageTypes.FEED]: {
      title: '이 글을 신고하는 이유를\n선택해주세요.',
      reasonList: [
        '스팸, 광고',
        '폭언, 비속어, 혐오발언',
        '음란성, 선정성 글',
        '개인정보 노출',
        '주제와 무관',
        '기타',
      ],
      memo: false,
    },
  };
  const { title } = reasons[pageType];
  const { reasonList } = reasons[pageType];

  /**
   * api
   */
  const report = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const params = {
        reportType: isReportUser ? REPORT_TYPE.USER : reportType,
        contentsIdx: isReportUser ? targetUserIdx : reportIdx,
        reason:
          selectedReason === reasonList[reasonList.length - 1]
            ? memo
            : selectedReason,
        memo,
      };

      switch (reportType) {
        // PIE 트래이닝 > 마스터 영상
        case REPORT_TYPE.MASTER_VIDEO:
          if (!isReportUser) params.reportType = REPORT_TYPE.VIDEO;
          await apiReportTraining(params);
          break;
        // PIE 트래이닝 > 마스터 댓글
        case REPORT_TYPE.MASTER_VIDEO_COMMENT:
          if (!isReportUser) params.reportType = REPORT_TYPE.VIDEO_COMMENT;
          await apiReportTraining(params);
          break;
        // PIE 트래이닝 > 챌린지 영상
        case REPORT_TYPE.CHALLENGE_VIDEO:
          if (!isReportUser) params.reportType = REPORT_TYPE.VIDEO;
          await apiReportChallenge(params);
          break;
        // PIE 트래이닝 > 챌린지 댓글
        case REPORT_TYPE.CHALLENGE_VIDEO_COMMENT:
          if (!isReportUser) params.reportType = REPORT_TYPE.VIDEO_COMMENT;
          await apiReportChallenge(params);
          break;
        // (아카데미)커뮤니티 > 커뮤니티 신고하기
        case REPORT_TYPE.FEED:
        case REPORT_TYPE.FEED_COMMENT:
          if (isReportUser) {
            setUserReportParam(params);
            setShowUserReportCheckModal(true);
          } else {
            await apiPostCommunityReport(params);
          }
          break;
        // 채팅
        case REPORT_TYPE.CHAT:
          if (isReportUser) {
            setUserReportParam(params);
            setShowUserReportCheckModal(true);
          } else {
            params.reportType = REPORT_TYPE.ACADEMY;
            await apiPostAcademyReport(params);
          }
          break;
        // 기타 > 아카데미
        default:
          await apiPostAcademyReport(params);
          break;
      }
      if (!isReportUser) {
        setTimeout(() => {
          Utils.openModal({
            title: '신고 완료',
            body: '신고 처리가 완료되었어요',
            closeEvent: MODAL_CLOSE_EVENT.goBack,
          });
        }, 0);
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const userReport = async params => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      await apiPostCommunityReport(params);
      setShowUserReportCheckModal(false);
      setTimeout(() => {
        Utils.openModal({
          title: '신고 완료',
          body: '신고 처리가 완료되었어요',
          closeEvent: MODAL_CLOSE_EVENT.goBack,
        });
      }, 0);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * useEffect
   */
  useEffect(() => {
    if (
      selectedReason &&
      selectedReason === reasonList[reasonList.length - 1]
    ) {
      setTimeout(() => reasonRef.current.focus(), 0);
      setMemo('');
    }
  }, [selectedReason]);

  /**
   * return
   */
  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="신고하기" />

        <SPKeyboardAvoidingView
          behavior="padding"
          isResize
          keyboardVerticalOffset={0}
          style={{
            flex: 1,
          }}>
          <View style={styles.container}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}>
              <View
                style={{
                  backgroundColor: COLORS.white,
                }}>
                <Text style={styles.headlineText}>{title}</Text>
              </View>

              {reasonList &&
                reasonList?.map((reason, index) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <Pressable
                      /* eslint-disable-next-line react/no-array-index-key */
                      key={index}
                      onPress={() => {
                        setSelectedReason(reason);
                      }}
                      style={[
                        styles.reasonWrapper,
                        isSelected && {
                          borderColor: COLORS.orange,
                        },
                      ]}>
                      <Text style={styles.reasonText}>{reason}</Text>
                      <SPSvgs.Check
                        fill={isSelected ? COLORS.orange : 'transparent'}
                      />
                    </Pressable>
                  );
                })}

              {selectedReason === reasonList[reasonList.length - 1] && (
                <SPInput
                  inputRef={reasonRef}
                  placeholder="신고 내용을 입력해주세요"
                  numberOfLines={4}
                  value={memo}
                  onChangeText={setMemo}
                />
              )}
            </ScrollView>

            <PrimaryButton
              disabled={
                selectedReason === reasonList[reasonList.length - 1]
                  ? !memo
                  : !selectedReason
              }
              text="신고하기"
              onPress={report}
            />
          </View>
        </SPKeyboardAvoidingView>
        <SPModal
          title="주의"
          noticeIcon
          contents={
            '신고 시, 해당 사용자의 모든 게시글이 차단됩니다.\n' +
            '계속하시겠습니까?'
          }
          visible={showUserReportCheckModal}
          onConfirm={() => {
            userReport(userReportParam);
          }}
          onCancel={() => {
            setShowUserReportCheckModal(false);
          }}
          onClose={() => {
            setShowUserReportCheckModal(false);
          }}
        />
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(Report);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  headlineText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: -0.004,
  },
  content: {
    rowGap: 16,
  },
  reasonText: {
    ...fontStyles.fontSize16_Medium,
    letterSpacing: 0.091,
    flex: 1,
  },
  reasonWrapper: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.fillNormal,
    borderRadius: 12,
    alignItems: 'center',
    columnGap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
