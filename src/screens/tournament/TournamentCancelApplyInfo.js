import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';

function TournamentCancelApplyInfo({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  const fromSelect = route?.params?.fromSelect;
  return (
    <View style={styles.container}>
      <Header title="접수 취소" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>접수취소_정보확인</Text>
      </View>
      <PrimaryButton
        text="대회_접수취소완료 페이지로 이동"
        buttonStyle={styles.buttonStyle}
        onPress={() => {
          NavigationService.navigate(navName.tournamentCancelApplyComplete, {
            fromSelect,
          });
        }}
      />
    </View>
  );
}
export default memo(TournamentCancelApplyInfo);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
