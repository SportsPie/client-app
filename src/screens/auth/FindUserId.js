import { useRoute } from '@react-navigation/native';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';

function hideEmail(email) {
  const atIndex = email.indexOf('@');
  const [username, domain] = email.split('@');

  const usernameEnd = Math.max(username.length - 3, 1);
  const hiddenUsername = `${username.slice(0, usernameEnd)}${'*'.repeat(
    Math.max(username.length - usernameEnd, 0),
  )}`;
  const spIndex = domain.indexOf('@');
  const dotIndex = domain.indexOf('.');
  const charsCountBetweenAtAndDot = dotIndex - (spIndex + 0);
  const domainStart = Math.min(
    spIndex + charsCountBetweenAtAndDot,
    domain.length,
  );
  const hiddenDomain = `${domain.slice(0, spIndex + 2)}${'*'.repeat(
    Math.max(domainStart - spIndex - 1, 0),
  )}${domain.slice(domainStart)}`;

  return `${hiddenUsername}@${hiddenDomain}`;
}

function FindUserId() {
  const route = useRoute();
  const memberData = route.params?.memberData;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="아이디 찾기" />

      <View style={styles.container}>
        {memberData?.loginType !== 'EMAIL' && (
          <Text style={styles.subText}>
            {memberData?.loginType === 'GOOGLE'
              ? '구글 계정을 통해 인증받았습니다.'
              : memberData?.loginType === 'KAKAO'
              ? '카카오 계정을 통해 인증받았습니다.'
              : memberData?.loginType === 'FACEBOOK'
              ? '페이스북 계정을 통해 인증받았습니다.'
              : memberData?.loginType === 'APPLE'
              ? '애플 계정을 통해 인증받았습니다.'
              : ``}
          </Text>
        )}
        <View style={styles.userIDValue}>
          <Text style={fontStyles.fontSize18_Semibold}>
            {hideEmail(memberData?.userLoginId)}
          </Text>
          <Text style={styles.dateText}>
            {memberData?.regDate.split(' ')[0]}
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <PrimaryButton
            text="로그인"
            onPress={() => {
              NavigationService.navigate(navName.login);
            }}
          />
          <PrimaryButton
            onPress={() => {
              NavigationService.navigate(navName.findPassword);
            }}
            text="비밀번호 찾기"
            outlineButton
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default memo(FindUserId);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    rowGap: 8,
  },
  buttonGroup: {
    marginTop: 'auto',
    rowGap: 8,
  },
  userIDValue: {
    backgroundColor: COLORS.peach,
    padding: 16,
    borderRadius: 8,
    columnGap: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelAlternative,
  },
  dateText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
  },
});
