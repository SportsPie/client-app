import { useRoute } from '@react-navigation/native';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiValidateEmail } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import SPHeader from '../../components/SPHeader';

function InputEmail() {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const route = useRoute();
  const {
    userName,
    userBirth,
    userPhoneNo,
    userGender,
    loginType,
    isMarketingAgree,
  } = route.params;
  useEffect(() => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    setIsValidEmail(emailPattern.test(email));
  }, [email]);

  useEffect(() => {
    const checkEmail = async () => {
      try {
        await apiValidateEmail(email);
        // 이메일 유효성 검사가 성공하면 오류 메시지를 초기화
        setErrorMessage('');
      } catch (error) {
        if (error.code === 1102) {
          setErrorMessage('중복된 아이디입니다.');
        }
      }
    };

    // 이메일이 유효성 검사에 필요한 조건 변경 시에만 실행
    if (isValidEmail && isInputFocused && email !== '') {
      checkEmail();
    }
  }, [isValidEmail, isInputFocused, email]);

  const handleBlur = async () => {
    setIsInputFocused(false);
  };

  const handleFocus = () => {
    setIsInputFocused(true);
    setErrorMessage('');
  };

  const getBottomText = useMemo(() => {
    if (!isValidEmail && !isInputFocused && email.trim() !== '') {
      return '잘못된 형식의 이메일 주소입니다.\n이메일 주소를 정확히 입력해주세요.';
    }

    if (errorMessage) {
      return errorMessage;
    }

    if (isValidEmail) {
      return '사용 가능한 아이디입니다.';
    }

    return '추후 아이디로 사용될 이메일을 찾기 위해서는\n실제 사용 중인 이메일 주소를 정확히 입력해 주세요.';
  }, [errorMessage, isValidEmail, isInputFocused, email]);

  const nextPage = async () => {
    if (!isValidEmail) {
      return;
    }
    NavigationService.navigate(navName.inputPassword, {
      userName,
      userBirth,
      userPhoneNo,
      userGender,
      loginType,
      isMarketingAgree,
      userLoginId: email,
    });
  };

  const handleLeftButtonPress = () => {
    NavigationService.navigate(navName.login); // navName.identifyVerification는 실제 네비게이션 이름에 맞게 수정해야 합니다.
  };

  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <SPHeader title="회원 가입" onPressLeftBtn={handleLeftButtonPress} />

        <View style={styles.container}>
          <Text style={fontStyles.fontSize18_Semibold}>
            {'로그인에 사용할\n아이디를 입력해주세요'}
          </Text>

          <SPInput
            placeholder="이메일을 입력하세요"
            value={email}
            onChangeText={setEmail}
            onBlur={handleBlur}
            bottomText={getBottomText}
            error={
              (!isValidEmail && !isInputFocused && email.trim() !== '') ||
              errorMessage
            }
            success={isValidEmail && !errorMessage}
            keyboardType="email-address"
            onFocus={handleFocus}
          />
          <PrimaryButton
            text="다음"
            onPress={nextPage}
            disabled={!isValidEmail || errorMessage !== ''}
            buttonStyle={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(InputEmail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  submitButton: {
    marginTop: 'auto',
  },
});
