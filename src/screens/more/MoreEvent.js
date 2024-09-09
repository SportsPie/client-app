import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { PrimaryButton } from '../../components/PrimaryButton';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import MoreEventParticipantInfo from './MoreEventParticipantInfo';
import MoreEventParticipantVideoList from './MoreEventParticipantVideoList';
import MoreEventParticipantSoccerbee from './MoreEventParticipantSoccerbee';

function MoreEvent() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="메가이벤트" closeIcon />
      <View style={{ flex: 1 }}>
        <PrimaryButton
          onPress={() => {
            NavigationService.navigate(navName.eventParticipantVideoReels);
          }}
          buttonStyle={styles.button}
          text="영상 목록의 영상 클릭시"
        />
        <Text>tab1</Text>
        <MoreEventParticipantInfo />
        <Text>tab2</Text>
        <MoreEventParticipantVideoList />
        <Text>tab3</Text>
        <MoreEventParticipantSoccerbee />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  button: {},
});

export default MoreEvent;
