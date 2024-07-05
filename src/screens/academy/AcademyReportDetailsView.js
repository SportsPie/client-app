import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  apiGetAcademyConfigMngReportsDetail,
  apiPatchAcademyConfigMngReportsClose,
  apiPatchAcademyConfigMngReportsComplete,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { REPORT_STATE } from '../../common/constants/reportState';
import { REPORT_TYPE_LABEL } from '../../common/constants/reportType';
import SPModal from '../../components/SPModal';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import AcademyCommunityDetail from './AcademyCommunityDetail';
import Header from '../../components/header';

function AcademyReportDetailsView({ route }) {
  /**
   * state
   */
  const reportType = route?.params?.reportType;
  const reportIdx = route?.params?.reportIdx;
  const [reportDetail, setReportDetail] = useState({});
  const insets = useSafeAreaInsets();

  // modal
  const [changePrivateModalShow, setChangePrivateModalShow] = useState(false);
  const [changeCompleteModalShow, setChangeCompleteModalShow] = useState(false);
  const [modalShow, setModalShow] = useState(false);

  const trlRef = useRef({ current: { disabled: false } });
  const [refresh, setRefresh] = useState(false);

  const openModal = () => {
    if (reportDetail?.deleted) {
      Utils.openModal({ title: '알림', body: '삭제된 게시글입니다.' });
    } else {
      setModalShow(true);
    }
  };

  const closeModal = () => {
    setModalShow(false);
  };

  /**
   * api
   */
  const getReportDetail = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngReportsDetail(
        reportType,
        reportIdx,
      );
      setReportDetail(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const changePrivate = async () => {
    setChangePrivateModalShow(false);
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const { data } = await apiPatchAcademyConfigMngReportsClose(
        reportType,
        reportIdx,
      );
      Utils.openModal({
        title: '성공',
        body: '신고글이 비공개 처리되었습니다.',
      });
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const changeComplete = async () => {
    setChangeCompleteModalShow(false);
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const { data } = await apiPatchAcademyConfigMngReportsComplete(
        reportType,
        reportIdx,
      );
      Utils.openModal({
        title: '성공',
        body: '신고글이 완료처리 되었습니다.',
      });
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getReportDetail();
    }, [refresh]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="신고내역 상세보기" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1 }}>
          {/* 신고 내용 */}
          <View style={styles.contentBox}>
            <View
              style={[
                styles.statusBox,
                reportDetail.state === REPORT_STATE.WAIT.code ||
                reportDetail.state === REPORT_STATE.DELETE.code
                  ? styles.unresolvedStatusBox
                  : styles.resolvedStatusBox,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  reportDetail.state === REPORT_STATE.WAIT.code ||
                  reportDetail.state === REPORT_STATE.DELETE.code
                    ? styles.unresolvedStatusText
                    : styles.resolvedStatusText,
                ]}>
                {REPORT_STATE[reportDetail.state]?.desc}
              </Text>
            </View>
            <Text style={styles.mainTitle}>신고 내용</Text>
            <View style={styles.subList}>
              <View style={styles.subItem}>
                <Text style={styles.subTitle}>신고 유형</Text>
                <Text style={styles.subText}>{reportDetail.reason}</Text>
              </View>
              <View style={styles.subItem}>
                <Text style={styles.subTitle}>신고자</Text>
                <Text style={styles.subText}>
                  {reportDetail.reportUserName}
                </Text>
              </View>
              <View style={styles.subItem}>
                <Text style={styles.subTitle}>신고일시</Text>
                <Text style={styles.subText}>
                  {moment(reportDetail.regDate).format('YYYY.MM.DD HH:mm:ss')}
                </Text>
              </View>
              {/* 기타로 선택했을 시 해당 영역에 글이 보여짐 */}
              <Text style={styles.subDetailText}>{reportDetail.memo}</Text>
            </View>
          </View>

          {/* 신고대상 */}
          <View style={styles.contentBox}>
            <Text style={styles.mainTitle}>신고대상</Text>
            <View style={styles.subList}>
              <View style={styles.subItem}>
                {/* 유형이 게시글이나 댓글로 나눠짐 */}
                <Text style={styles.subTitle}>유형</Text>
                <Text style={styles.subText}>
                  {REPORT_TYPE_LABEL[reportDetail.reportType]}
                </Text>
              </View>
              <View style={styles.subItem}>
                <Text style={styles.subTitle}>작성자</Text>
                <Text style={styles.subText}>
                  {reportDetail.contentsUserName}
                </Text>
              </View>
              <View style={styles.subItem}>
                <Text style={styles.subTitle}>작성일시</Text>
                <Text style={styles.subText}>
                  {reportDetail.contentsRegDate &&
                    moment(reportDetail.contentsRegDate).format(
                      'YYYY.MM.DD HH:mm:ss',
                    )}
                </Text>
              </View>
              <View style={[styles.subItem, { alignItems: 'flex-start' }]}>
                <Text style={styles.subTitle}>내용</Text>
                <Text
                  style={styles.subText}
                  numberOfLines={3}
                  ellipsizeMode="tail">
                  {reportDetail.contents}
                </Text>
              </View>
            </View>
            {/* 신고글 비공개 */}
            {reportDetail.state === REPORT_STATE.WAIT.code && (
              <TouchableOpacity
                style={styles.privateBtn}
                onPress={() => {
                  setChangePrivateModalShow();
                }}>
                <Text style={styles.privateBtnText}>신고글 비공개</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View>
        {/* 게시글 보러가기 */}
        <TouchableOpacity style={styles.postBtn} onPress={openModal}>
          <Text style={styles.postBtnText}>게시글 보러가기</Text>
          <Image
            source={SPIcons.icArrowRightBlue}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        {/* 처리완료 */}
        {reportDetail.state !== REPORT_STATE.FINISH.code &&
          reportDetail.state !== REPORT_STATE.FINISH_DEL.code && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setChangeCompleteModalShow(true);
              }}>
              <Text style={styles.clearBtnText}>처리완료</Text>
            </TouchableOpacity>
          )}
      </View>

      <SPModal
        title="확인"
        contents="비공개 하시겠습니까?"
        visible={changePrivateModalShow}
        onConfirm={() => {
          changePrivate();
        }}
        onCancel={() => {
          setChangePrivateModalShow(false);
        }}
        onClose={() => {
          setChangePrivateModalShow(false);
        }}
      />

      <SPModal
        title="확인"
        contents="완료처리 하시겠습니까?"
        visible={changeCompleteModalShow}
        onConfirm={() => {
          changeComplete();
        }}
        onCancel={() => {
          setChangeCompleteModalShow(false);
        }}
        onClose={() => {
          setChangeCompleteModalShow(false);
        }}
      />

      <Modal
        animationType="fade"
        transparent
        visible={modalShow}
        onRequestClose={closeModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View
            style={{
              marginTop: insets.top,
            }}>
            <TouchableOpacity
              onPress={closeModal}
              style={{
                width: '100%',
                height: 60,
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}>
              <Image
                source={SPIcons.icNavCancle}
                style={[{ height: 28, width: 28 }]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <AcademyCommunityDetail
            showHeader={false}
            showInputBox={false}
            showApplyButton={false}
            type={reportDetail.reportType}
            idx={reportDetail.contentsIdx}
            fromReport={true}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default memo(AcademyReportDetailsView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentBox: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  statusBox: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unresolvedStatusBox: {
    backgroundColor: 'rgba(255, 103, 31, 0.08)',
  },
  resolvedStatusBox: {
    backgroundColor: 'rgba(49, 55, 121, 0.08)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  unresolvedStatusText: {
    color: '#FF671F',
  },
  resolvedStatusText: {
    color: '#313779',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  subList: {
    flexDirection: 'column',
    gap: 8,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subTitle: {
    minWidth: 80,
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  subText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: '#000',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  subDetailText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  privateBtn: {
    marginTop: 'auto',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  privateBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  postBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(135, 141, 150, 0.16)',
    paddingVertical: 8,
  },
  postBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  clearBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
});
