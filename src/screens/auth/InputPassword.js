import { useRoute } from '@react-navigation/native';
import React, { memo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { navName } from '../../common/constants/navName';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import NavigationService from '../../navigation/NavigationService';
import fontStyles from '../../styles/fontStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function InputPassword() {
  const route = useRoute();
  const {
    userName,
    userBirth,
    userPhoneNo,
    userGender,
    userLoginId,
    loginType,
    isMarketingAgree,
  } = route.params;

  const [password, setPassword] = useState('');
  const [isPassFocus, setIsPassFocus] = useState(false);
  const [rePassword, setRePassword] = useState('');
  const [isRePassFocus, setIsRePassFocus] = useState(false);

  const validatePassword = testPassword => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    return passwordRegex.test(testPassword);
  };

  const nextPage = () => {
    NavigationService.navigate(navName.userInfo, {
      userName,
      userBirth,
      userPhoneNo,
      userGender,
      userLoginId,
      loginType,
      isMarketingAgree,
      userLoginPassword: password, // Pass the password to the next screen
    });
  };
  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="회원가입" />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}>
          <Text style={fontStyles.fontSize18_Semibold}>
            로그인에 사용할{'\n'}비밀번호를 입력해주세요
          </Text>

          <SPInput
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onBlur={() => setIsPassFocus(false)}
            bottomText={
              !isPassFocus && !validatePassword(password) && password
                ? '비밀번호는 8~20자의 영문 대소문자, 숫자, 특수문자로(!@#$%^&*)\n조합하여 사용하세요.'
                : '8자리 이상, 영문 대소문자, 숫자, 특수문자(!@#$%^&*) 포함'
            }
            success={validatePassword(password)}
            error={!validatePassword(password) && password && !isPassFocus}
            onFocus={() => setIsPassFocus(true)}
          />

          <SPInput
            placeholder="비밀번호를 다시 입력하세요"
            value={rePassword}
            onChangeText={setRePassword}
            onBlur={() => setIsRePassFocus(false)}
            onFocus={() => setIsRePassFocus(true)}
            secureTextEntry
            error={!isRePassFocus && !(rePassword === password) && rePassword}
            bottomText={
              !isRePassFocus && !(rePassword === password) && rePassword
                ? '비밀번호가 일치하지 않습니다.'
                : ''
            }
            success={rePassword === password}
          />
        </ScrollView>

        <PrimaryButton
          disabled={
            !password || !validatePassword(password) || rePassword !== password
          }
          text="다음"
          onPress={nextPage}
          buttonStyle={styles.submitButton}
        />
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(InputPassword);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  submitButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
});
