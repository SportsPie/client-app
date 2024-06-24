import React, { memo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { apiGetTermsList, apiRemoveMember } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import MenuSection from '../../components/MenuSection';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import { handleError } from '../../utils/HandleError';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MoreSetting() {
  const handleLogout = () => {
    Alert.alert(
      '회원탈퇴',
      '탈퇴하시겠습니까?',
      [
        {
          text: '예',
          onPress: async () => {
            try {
              await apiRemoveMember();
              await Utils.logout();

              NavigationService.navigate(navName.login);
            } catch (error) {
              handleError(error);
            }
          },
        },
        {
          text: '아니오',
          onPress: () => console.log('아니오를 선택하셨습니다.'),
          style: 'cancel',
        },
      ],
      { cancelable: false },
    );
  };

  const openTermsScreen = async type => {
    try {
      const response = await apiGetTermsList(type);
      const termsArray = response.data.data; // Assuming response data is an array of terms
      NavigationService.navigate(navName.moreTermsService, {
        termsData: termsArray,
        type,
      });
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="설정" />

      <MenuSection
        title="앱 알림 설정"
        containerStyle={styles.menu}
        onPress={() => {
          NavigationService.navigate(navName.moreNotification);
        }}
      />
      <MenuSection
        title="서비스 이용약관"
        containerStyle={styles.menu}
        onPress={() => openTermsScreen('TERMS_SERVICE')}
      />
      <MenuSection
        title="위치기반 서비스 이용 약관"
        containerStyle={styles.menu}
        onPress={() => openTermsScreen('TERMS_LOCATE')}
      />
      <MenuSection
        title="개인정보 처리 동의"
        containerStyle={styles.menu}
        onPress={() => openTermsScreen('TERMS_PRIVATE')}
      />
      <MenuSection
        title="회원탈퇴"
        containerStyle={styles.menu}
        titleTextStyle={styles.title}
        onPress={handleLogout}
      />
    </SafeAreaView>
  );
}

export default memo(MoreSetting);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menu: {
    borderBottomWidth: 0,
  },
  title: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
  },
});
