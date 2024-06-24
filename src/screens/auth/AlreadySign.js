import { useRoute } from '@react-navigation/native';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPHeader from '../../components/SPHeader';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';

function AlreadySign() {
  const route = useRoute();
  const memberData = route?.params?.memberData?.data?.data;

  return (
    <SafeAreaView style={styles.container}>
      <SPHeader LeftButton onPressLeftBtn={() => NavigationService.goBack(2)} />

      <Text style={styles.headerText}>
        {memberData?.loginType === 'GOOGLE'
          ? '구글로 회원가입 되어있습니다.'
          : memberData?.loginType === 'KAKAO'
          ? '카카오로 회원가입 되어있습니다.'
          : memberData?.loginType === 'FACEBOOK'
          ? '페이스북으로 회원가입 되어있습니다.'
          : memberData?.loginType === 'APPLE'
          ? '애플로 회원가입 되어있습니다.'
          : `이미 ${Utils.hideEmail(
              memberData?.userLoginId,
            )} 계정으로 스포츠파이 회원 인증을 받았어요`}
      </Text>
      <Text style={styles.subHeaderText}>
        {
          '로그인을 진행하시거나 비밀번호를 잊으신 경우\n비밀번호 찾기를이용해 주세요'
        }
      </Text>

      <View style={styles.buttonGroup}>
        <PrimaryButton
          text="로그인"
          onPress={() => {
            NavigationService.navigate(navName.login);
          }}
        />
        <PrimaryButton
          text="비밀번호 찾기"
          outlineButton
          onPress={() => {
            NavigationService.navigate(navName.findPassword);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 8,
  },
  headerText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.labelNormal,
  },
  subHeaderText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelAlternative,
  },
  buttonGroup: {
    marginTop: 'auto',
    rowGap: 8,
  },
});

export default memo(AlreadySign);
