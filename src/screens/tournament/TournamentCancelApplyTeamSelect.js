import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';

function TournamentCancelApplyTeamSelect({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;

  return (
    <View style={styles.container}>
      <Header title="접수 취소" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>접수취소_팀선택</Text>
      </View>
      <PrimaryButton
        text="접수취소_팀확인 페이지로 이동"
        buttonStyle={styles.buttonStyle}
        onPress={() => {
          NavigationService.navigate(navName.tournamentCancelApplyTeamCheck, {
            fromSelect: true,
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
