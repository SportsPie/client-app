import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';

function TournamentCancelApplyTeamSelect({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  const fromSelect = route?.params?.fromSelect;

  return (
    <View style={styles.container}>
      <Header title="접수 취소" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>접수취소_팀확인</Text>
      </View>
      <PrimaryButton
        text="접수취소_정보확인"
        buttonStyle={styles.buttonStyle}
        onPress={() => {
          NavigationService.navigate(navName.tournamentCancelApplyInfo, {
            fromSelect,
          });
        }}
      />
    </View>
  );
}
export default memo(TournamentCancelApplyTeamSelect);

const styles = StyleSheet.create({
  container: { flex: 1 },
});
