import React, { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { apiValidateEmail } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function FindPassword() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const nextPage = async () => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailPattern.test(email)) {
      setErrorMessage('이메일 형식에 맞게 입력하세요.');
      return;
    }

    try {
      // Assuming apiValidateEmail returns true if email is valid and false if it's duplicate
      const response = await apiValidateEmail(email);
      // 만약 apiValidateEmail 함수가 false를 반환하면(중복된 이메일)
      if (response.data.successReturn === true) {
        setErrorMessage('일치하는 회원정보가 없습니다.');
      }

      // 여기서 다음 단계로 이동할 수 있습니다.
    } catch (error) {
      // 에러 코드가 1102인 경우 모바일 인증 비밀번호 입력 화면으로 이동
      if (error.code === 1102) {
        NavigationService.navigate(navName.mobileAuthenticationPassword, {
          userLoginId: email,
        });
      } else {
        // 그렇지 않은 경우 일반적인 에러 처리 함수를 호출
        handleError(error);
      }
    }
  };

  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="비밀번호 찾기" />

        <View style={styles.container}>
          <Text style={styles.headerText}>
            {'가입 시 입력한\n아이디를 입력해주세요'}
          </Text>

          <SPInput
            placeholder="이메일을 입력하세요"
            value={email}
            onChangeText={setEmail}
            errorText={errorMessage}
            error={errorMessage?.length > 0}
            bottomText={errorMessage}
            onFocus={() => {
              setErrorMessage('');
            }}
          />
          <Text style={styles.subText}>
            ※ 이메일가입 계정만 비밀번호 찾기가 가능합니다.
          </Text>

          <PrimaryButton
            text="휴대폰 본인인증"
            onPress={nextPage}
            buttonStyle={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(FindPassword);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  headerText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.004,
  },
  subText: {
    ...fontStyles.fontSize13_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.004,
  },
  submitButton: {
    marginTop: 'auto',
  },
});
