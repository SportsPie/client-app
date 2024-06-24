import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import NavigationService from '../../navigation/NavigationService';
import fontStyles from '../../styles/fontStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function FindUser() {
  const nextPage = foundUserId => {
    NavigationService.navigate(navName.mobileAuthenticationId);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="아이디 찾기" />

      <View style={styles.container}>
        <Text style={fontStyles.fontSize18_Semibold}>
          {'휴대폰번호 본인인증이\n필요해요'}
        </Text>

        <PrimaryButton onPress={nextPage} text="휴대폰 본인인증" />
      </View>
    </SafeAreaView>
  );
}

export default memo(FindUser);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
});
