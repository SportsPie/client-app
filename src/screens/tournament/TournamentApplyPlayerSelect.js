import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';

function TournamentApplyPlayerSelect({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  return (
    <View style={styles.container}>
      <Header title="출전 선수 등록" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>대회_출전선수등록</Text>
      </View>
      <PrimaryButton
        text="대회_대기신청, 대회_결제 페이지로 이동"
        buttonStyle={styles.buttonStyle}
        onPress={() => {
          NavigationService.navigate(navName.tournamentApplyWaitOrPay);
        }}
      />
    </View>
  );
}
export default memo(TournamentApplyPlayerSelect);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
