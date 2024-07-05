import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { apiGetMyInfo } from '../../api/RestAPI';
import { LOGIN_TYPES } from '../../common/constants/loginTypes';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import SPModal from '../../components/SPModal';

function MoreAccountManage() {
  const [userInfo, setUserInfo] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getUserInfo = async () => {
    try {
      const { data } = await apiGetMyInfo();
      if (data) {
        setUserInfo(data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserInfo();
    }, []),
  );

  const logout = async () => {
    await Utils.logout(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="계정 관리" />

      <View style={styles.userSection}>
        <Text style={styles.headerText}>계정관리</Text>

        <View style={styles.menuWrapper}>
          <Text style={styles.titleText}>아이디</Text>
          <Text style={styles.valueText}>{userInfo?.userLoginId ?? ''}</Text>
        </View>

        {userInfo?.loginType !== 'EMAIL' && ( // 조건 추가
          <View style={styles.menuWrapper}>
            <Text style={styles.titleText}>간편 로그인</Text>
            <Text style={styles.valueText}>
              {LOGIN_TYPES?.[userInfo?.loginType]?.desc ?? ''}
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={{
          paddingLeft: 16,
          marginTop: 24,
        }}
        onPress={() => {
          setShowLogoutModal(true);
        }}>
        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelAlternative,
              letterSpacing: 0.3,
            },
          ]}>
          로그아웃
        </Text>
      </Pressable>

      <SPModal
        title="확인"
        contents="로그아웃 하시겠습니까?"
        visible={showLogoutModal}
        onConfirm={() => {
          logout();
        }}
        onCancel={() => {
          setShowLogoutModal(false);
        }}
        onClose={() => {
          setShowLogoutModal(false);
        }}
      />
    </SafeAreaView>
  );
}

export default memo(MoreAccountManage);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userSection: {
    paddingHorizontal: 16,
    rowGap: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineBorder,
    paddingVertical: 24,
  },
  menuWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    ...fontStyles.fontSize14_Regular,
    letterSpacing: 0.2,
    color: COLORS.labelNeutral,
  },
  valueText: {
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.2,
    color: COLORS.labelNormal,
  },
  headerText: {
    ...fontStyles.fontSize20_Semibold,
    lineHeight: 28,
    letterSpacing: -0.24,
  },
});
