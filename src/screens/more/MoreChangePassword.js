import React, { memo, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPatchPassword } from '../../api/RestAPI';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import Header from '../../components/header';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import Utils from '../../utils/Utils';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

function MoreChangePassword() {
  const [prevPassword, setPrevPassword] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const trlRef = useRef({ current: { disabled: false } });
  const validatePassword = passwords => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    return passwordRegex.test(passwords);
  };

  useEffect(() => {
    // 패스워드 체크
    if (!password) {
      setPasswordValid(false);
    } else if (!validatePassword(password)) {
      setPasswordValid(false);
    } else {
      setPasswordValid(true);
    }

    // 새 비밀번호 체크
    if (password !== rePassword) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, rePassword]);

  useEffect(() => {
    // Enable next button if all conditions are met
    if (
      passwordValid &&
      passwordsMatch &&
      password &&
      rePassword &&
      prevPassword
    ) {
      setNextButtonEnabled(true);
    } else {
      setNextButtonEnabled(false);
    }
  }, [passwordValid, passwordsMatch, password, rePassword, prevPassword]);

  const changePw = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const params = {
        prevPw: prevPassword,
        newPw: password,
      };

      const { data } = await apiPatchPassword(params);
      Utils.openModal({
        title: '알림',
        body: '비밀번호가 변경되었습니다.',
      });
      Utils.logout();
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="비밀번호 찾기" />

        <SPKeyboardAvoidingView
          behavior="padding"
          isResize={true}
          keyboardVerticalOffset={0}
          style={{
            flex: 1,
            backgroundColor: COLORS.white,
            padding: 0,
            margin: 0,
          }}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.mainText}>변경할 비밀번호를 입력해주세요.</Text>

            <SPInput
              placeholder="현재 비밀번호를 입력해주세요"
              value={prevPassword}
              onChangeText={setPrevPassword}
              secureTextEntry
            />
            <SPInput
              placeholder="새로운 비밀번호를 입력해주세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              bottomText="8~20자리 영문 대소문자, 숫자, 특수문자포함"
              error={password?.length > 0 && !passwordValid}
            />

            <SPInput
              placeholder="새 비밀번호를 다시 입력해주세요"
              value={rePassword}
              onChangeText={setRePassword}
              secureTextEntry
              bottomText={
                rePassword?.length > 0 && !passwordsMatch
                  ? '비밀번호가 일치하지 않습니다.'
                  : ''
              }
              error={rePassword?.length > 0 && !passwordsMatch}
            />
          </ScrollView>
        </SPKeyboardAvoidingView>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
          <Text>비밀번호를 모르겠어요 </Text>
          <Pressable
            onPress={() => {
              NavigationService.navigate(navName.findPassword);
            }}>
            <Text style={{ textDecorationLine: 'underline' }}>
              비밀번호 재설정
            </Text>
          </Pressable>
        </View>

        <PrimaryButton
          text="완료"
          onPress={changePw}
          buttonStyle={styles.submitButton}
          disabled={!nextButtonEnabled}
        />
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(MoreChangePassword);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  mainText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: -0.004,
  },
  submitButton: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
});
