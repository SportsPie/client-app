import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';

function TournamentCancelApplyComplete({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  const fromSelect = route?.params?.fromSelect;

  return (
    <View style={styles.container}>
      <Header
        closeIcon
        title="접수 취소 완료"
        onLeftIconPress={() => {
          if (fromSelect) {
            NavigationService.goBack(4);
          } else {
            NavigationService.goBack(3);
          }
        }}
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>대회_접수취소완료</Text>
      </View>
    </View>
  );
}
export default memo(TournamentCancelApplyComplete);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
