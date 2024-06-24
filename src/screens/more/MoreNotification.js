import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { apiGetMyInfo, apiPostAuthAgreeMarketing } from '../../api/RestAPI';
import ButtonSwitch from '../../components/ButtonSwitch';
import { handleError } from '../../utils/HandleError';
import moment from 'moment';
import { CONSTANTS } from '../../common/constants/constants';
import { RESULTS } from 'react-native-permissions';
import {
  getFcmToken,
  requestPostNotificationsPermission,
} from '../../utils/FirebaseMessagingService';
import { getStorage, setStorage } from '../../utils/AsyncStorageUtils';
import { useSelector } from 'react-redux';
import { FCM_TYPE } from '../../common/constants/fcmType';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MoreNotification() {
  /**
   * state
   */
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const [marketingDate, setMarketingDate] = useState();

  const notificationPermissionText =
    Platform.OS === 'android'
      ? '설정 > 애플리케이션 > footballcash > 권한 > 알림 권한을 허용해주세요.'
      : '설정 > footballcash 앱에 알림 권한을 허용해주세요.';

  const [notificationStates, setNotificationStates] = useState({
    [FCM_TYPE.SERVICE]: false,
    [FCM_TYPE.ACADEMY]: false,
    [FCM_TYPE.MATCH]: false,
    [FCM_TYPE.BOARD]: false,
    [FCM_TYPE.TOURNAMENT]: false,
    [FCM_TYPE.WALLET]: false,
    [FCM_TYPE.MARKETING]: false,
    [FCM_TYPE.EMPTY]: false,
  });

  /**
   * api
   */

  const getUserInfo = async () => {
    try {
      const { data } = await apiGetMyInfo();
      setMarketingDate(data.data.marketingDate);
      await getFcmToken();
    } catch (error) {
      handleError(error);
    }
  };
  const updateMarketingDate = async () => {
    try {
      const now = new Date();
      const params = {
        now,
      };
      const { data } = await apiPostAuthAgreeMarketing(params);
      setMarketingDate(now);
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * function
   */
  const loadNotificationStates = useCallback(async () => {
    try {
      const result = await requestPostNotificationsPermission();
      if (result.status !== RESULTS.GRANTED) {
        await setAllFalse();
        return;
      }

      const storedNotificationStates = await getStorage(
        `notificationStates_${userIdx}`,
      );
      if (storedNotificationStates) {
        setNotificationStates(JSON.parse(storedNotificationStates));
      }
    } catch (error) {
      handleError(error);
    }
  }, []);

  const setAllFalse = async () => {
    try {
      const updatedState = {
        [FCM_TYPE.SERVICE]: false,
        [FCM_TYPE.ACADEMY]: false,
        [FCM_TYPE.MATCH]: false,
        [FCM_TYPE.BOARD]: false,
        [FCM_TYPE.TOURNAMENT]: false,
        [FCM_TYPE.WALLET]: false,
        [FCM_TYPE.MARKETING]: false,
        [FCM_TYPE.EMPTY]: false,
      };
      await setStorage(
        `notificationStates_${userIdx}`,
        JSON.stringify(updatedState), // 사용자 ID를 키로 사용하여 저장
      );
      setNotificationStates(updatedState);
    } catch (error) {
      handleError(error);
    }
  };

  const toggleNotification = async key => {
    try {
      const result = await requestPostNotificationsPermission();
      if (result.status !== RESULTS.GRANTED) {
        Utils.openModal({ title: '알림', body: notificationPermissionText });
        return;
      }

      const updatedState = {
        ...notificationStates,
        [key]: !notificationStates[key],
      };
      await setStorage(
        `notificationStates_${userIdx}`,
        JSON.stringify(updatedState), // 사용자 ID를 키로 사용하여 저장
      );
      setNotificationStates(updatedState);
      if (key === FCM_TYPE.MARKETING) {
        await updateMarketingDate();
      }
    } catch (error) {
      // console.error('Error toggling notification state:', error);
      handleError(error);
    }
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getUserInfo();
      loadNotificationStates();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="앱 알림 설정" />

      <ScrollView contentContainerStyle={styles.container}>
        <ButtonSwitch
          title="서비스 알림"
          subTitle="앱 점검 또는 업데이트에 대한 알림 수신"
          isActive={notificationStates[FCM_TYPE.SERVICE]}
          onPress={() => toggleNotification(FCM_TYPE.SERVICE)}
        />

        <ButtonSwitch
          title="아카데미 활동"
          subTitle="아카데미 가입 신청 및 모든 활동에 대한 알림 수신"
          isActive={notificationStates[FCM_TYPE.ACADEMY]}
          onPress={() => toggleNotification(FCM_TYPE.ACADEMY)}
        />

        <ButtonSwitch
          title="경기 활동 알림"
          subTitle="스포츠파이 매칭 관련 알림 수신"
          isActive={notificationStates[FCM_TYPE.MATCH]}
          onPress={() => toggleNotification(FCM_TYPE.MATCH)}
        />

        <ButtonSwitch
          title="게시물 및 댓글"
          subTitle="콘텐츠, 커뮤니티의 댓글 및 기타 활동에 대한 알림 수신"
          isActive={notificationStates[FCM_TYPE.BOARD]}
          onPress={() => toggleNotification(FCM_TYPE.BOARD)}
        />

        <ButtonSwitch
          title="대회 알림"
          subTitle="대회 참가 신청 또는 개최 안내에 대한 알림 수신"
          isActive={notificationStates[FCM_TYPE.TOURNAMENT]}
          onPress={() => toggleNotification(FCM_TYPE.TOURNAMENT)}
        />

        <ButtonSwitch
          title="토큰 알림"
          subTitle="토큰 적립 및 소진에 대한 알림 수신"
          isActive={notificationStates[FCM_TYPE.WALLET]}
          onPress={() => toggleNotification(FCM_TYPE.WALLET)}
        />

        <ButtonSwitch
          title="마케팅 정보 수신 동의"
          subTitle="각종 대회 및 이벤트 알림"
          subTitle2={
            notificationStates[FCM_TYPE.MARKETING] ? marketingDate : null
          }
          isActive={notificationStates[FCM_TYPE.MARKETING]}
          onPress={() => toggleNotification(FCM_TYPE.MARKETING)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MoreNotification);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    rowGap: 16,
  },
});
