import React, { useCallback, useState, useRef, memo } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SPIcons from '../../assets/icon';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import SPModal from '../../components/SPModal';
import { RECRUIT_PAGE_TYPE } from '../../common/constants/recruitPageType';
import Utils from '../../utils/Utils';
import { handleError } from '../../utils/HandleError';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import {
  apiDeleteAcademyConfigMngAcademy,
  apiGetAcademyDetail,
} from '../../api/RestAPI';
import { IS_YN } from '../../common/constants/isYN';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function AcademyManagement({ route }) {
  const academyIdx = route?.params?.academyIdx;
  const [modalVisible, setModalVisible] = useState(false);
  const [academyDetail, setAcademyDetail] = useState({});
  const trlRef = useRef({ current: { disabled: false } });

  /**
   * api
   */
  const getAcademyDetailInfo = async () => {
    try {
      const { data } = await apiGetAcademyDetail(academyIdx);
      setAcademyDetail(data.data.academy);
    } catch (error) {
      handleError(error);
    }
  };

  const remove = async () => {
    setModalVisible(false);
    // 아카데미 삭제 로직 추가
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      await apiDeleteAcademyConfigMngAcademy();
      Utils.openModal({
        title: '삭제 완료',
        body: '삭제 처리가 완료되었어요',
        closeEvent: MODAL_CLOSE_EVENT.moveAcademy,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const handleDeletePress = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getAcademyDetailInfo();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="아카데미 관리" />
      <View style={styles.menuList}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            NavigationService.navigate(navName.academyEdit, { academyIdx });
          }}>
          <View style={styles.menuTitle}>
            <Text style={styles.menuTitleText}>아카데미 수정</Text>
          </View>
          <Image
            source={SPIcons.icArrowRightNoraml}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            NavigationService.navigate(navName.academyPlayer, { academyIdx });
          }}>
          <View style={styles.menuTitle}>
            <Text style={styles.menuTitleText}>선수 관리</Text>
          </View>
          <Image
            source={SPIcons.icArrowRightNoraml}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            NavigationService.navigate(navName.academyGroup, { academyIdx });
          }}>
          <View style={styles.menuTitle}>
            <Text style={styles.menuTitleText}>그룹 관리</Text>
          </View>
          <Image
            source={SPIcons.icArrowRightNoraml}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            NavigationService.navigate(navName.academyAdmin, { academyIdx });
          }}>
          <View style={styles.menuTitle}>
            <Text style={styles.menuTitleText}>운영자 관리</Text>
          </View>
          <Image
            source={SPIcons.icArrowRightNoraml}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            NavigationService.navigate(navName.academyRecruitmentForAdmin, {
              academyIdx,
            });
          }}>
          <View style={styles.menuTitle}>
            <Text style={styles.menuTitleText}>아카데미 회원 모집 관리</Text>
          </View>
          <Image
            source={SPIcons.icArrowRightNoraml}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            NavigationService.navigate(navName.academyMachingRegistration, {
              academyIdx,
            });
          }}>
          <View style={styles.menuTitle}>
            <Text style={styles.menuTitleText}>대회 접수 내역</Text>
          </View>
          <Image
            source={SPIcons.icArrowRightNoraml}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            if (academyDetail.certYn === IS_YN.Y) {
              NavigationService.navigate(navName.academyCompanyManagement, {
                academyIdx,
              });
            } else {
              NavigationService.navigate(navName.academyCompany, {
                academyIdx,
              });
            }
          }}>
          <View style={styles.menuTitle}>
            <Text style={styles.menuTitleText}>아카데미 기업인증 관리</Text>
          </View>
          <Image
            source={SPIcons.icArrowRightNoraml}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            NavigationService.navigate(navName.academyReportDetails, {
              academyIdx,
            });
          }}>
          <View style={styles.menuTitle}>
            <Text style={styles.menuTitleText}>신고내역 관리</Text>
          </View>
          <Image
            source={SPIcons.icArrowRightNoraml}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        {/* 아카데미 삭제 > 취소, 삭제 모달 > 최종 삭제 모달 */}
        <TouchableOpacity style={styles.menuItem} onPress={handleDeletePress}>
          <View style={styles.menuTitle}>
            <Text style={styles.DeleteText}>아카데미 삭제</Text>
          </View>
        </TouchableOpacity>
        <SPModal
          title="아카데미 삭제"
          contents="아카데미를 삭제하시겠습니까?"
          visible={modalVisible}
          onCancel={handleCancel}
          onConfirm={remove}
          cancelButtonText="취소"
          confirmButtonText="삭제"
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(AcademyManagement);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItem: 'center',
    gap: 8,
    padding: 16,
  },
  menuTitle: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  menuTitleText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  DeleteText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
};
