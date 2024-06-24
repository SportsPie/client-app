import { useRoute } from '@react-navigation/native';
import React, { memo, useEffect, useState, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPassword } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const route = useRoute();
  const { userName, userBirth, userPhoneNo, userGender, userLoginId } =
    route.params;
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);
  const [rePasswordFocused, setRePasswordFocused] = useState(false);
  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const trlRef = useRef({ current: { disabled: false } });
  const validatePassword = passwords => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    return passwordRegex.test(passwords);
  };

  const handleRePasswordBlur = () => {
    setRePasswordFocused(false);
    setShowPasswordRequirements(false);
    setShowPasswordMismatch(false);
    // Check if passwords match
    if (password !== rePassword) {
      setPasswordsMatch(false);
      setShowPasswordMismatch(true);
    } else {
      setPasswordsMatch(true);
    }
  };

  const handlePasswordBlur = () => {
    setShowPasswordRequirements(true);
  };

  useEffect(() => {
    if (!rePasswordFocused) {
      if (!password) {
        setPasswordValid(false);
      } else if (!validatePassword(password)) {
        setPasswordValid(false);
      } else {
        setPasswordValid(true);
      }
    }
  }, [rePasswordFocused, password]);

  useEffect(() => {
    // Enable next button if all conditions are met
    if (passwordValid && passwordsMatch && password && rePassword) {
      setNextButtonEnabled(true);
    } else {
      setNextButtonEnabled(false);
    }
  }, [passwordValid, passwordsMatch, password, rePassword]);

  const nextPage = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const data = {
        userName,
        userBirth,
        userPhoneNo,
        userGender,
        userLoginId,
        newPw: password,
      };

      apiPassword(data)
        .then(response => {
          // 회원가입 성공 시 처리
          Alert.alert('알림', '비밀번호가 변경되었습니다.');
          NavigationService.navigate(navName.login);
        })
        .catch(error => {
          // 회원가입 실패 시 처리
          handleError(error?.message);
        });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="비밀번호 찾기" />

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.mainText}>
            {'재설정할 비밀번호를\n입력해주세요.'}
          </Text>

          <SPInput
            placeholder="새 비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onBlur={handlePasswordBlur}
            bottomText={
              showPasswordRequirements && !passwordValid
                ? '비밀번호는 8~20자의 영문 대소문자, 숫자, 특수문자로 조합하여사용하세요.'
                : ''
            }
            error={showPasswordRequirements && !passwordValid}
            onFocus={() => {
              setShowPasswordRequirements(false);
            }}
          />

          <SPInput
            placeholder="새 비밀번호를 다시 입력하세요"
            value={rePassword}
            onChangeText={setRePassword}
            secureTextEntry
            onBlur={handleRePasswordBlur}
            bottomText={
              showPasswordMismatch && !passwordsMatch
                ? '비밀번호가 일치하지 않습니다.'
                : ''
            }
            error={showPasswordMismatch && !passwordsMatch}
            onFocus={() => {
              setShowPasswordMismatch(false);
            }}
          />
        </ScrollView>

        <PrimaryButton
          text="완료"
          onPress={nextPage}
          buttonStyle={styles.submitButton}
          disabled={!nextButtonEnabled}
        />
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(ResetPassword);

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
