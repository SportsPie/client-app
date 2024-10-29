import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';

function TournamentApplyWaitOrPay({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  return (
    <View style={styles.container}>
      <Header title="대기 신청, 결제" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>대회_대기신청, 대회_결제</Text>
      </View>
      <PrimaryButton
        text="대회_대기신청완료, 대회_결제완 페이지로 이동"
        buttonStyle={styles.buttonStyle}
        onPress={() => {
          NavigationService.navigate(navName.tournamentApplyComplete);
        }}
      />
    </View>
  );
}
export default memo(TournamentApplyWaitOrPay);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
