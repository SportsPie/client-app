import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import NavigationService from '../../navigation/NavigationService';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { useRoute } from '@react-navigation/native';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function IdentifyVerification() {
  const route = useRoute();
  const { loginType, snsKey, userLoginId, codeType, isMarketingAgree } =
    route.params;
  const nextPage = () => {
    if (loginType === 'EMAIL') {
      NavigationService.navigate(navName.mobileAuthenticationMain, {
        loginType,
        isMarketingAgree,
      });
    } else {
      NavigationService.navigate(navName.mobileAuthenticationMain, {
        loginType,
        snsKey,
        userLoginId,
        codeType,
        isMarketingAgree,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="회원가입" />

      <View style={styles.container}>
        <Text style={styles.headerText}>
          {'휴대폰번호 본인인증이\n필요해요.'}
        </Text>

        <PrimaryButton text="휴대폰 본인인증" onPress={nextPage} />
      </View>
    </SafeAreaView>
  );
}

export default memo(IdentifyVerification);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  headerText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.labelNormal,
  },
});
