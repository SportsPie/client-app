import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { COLORS } from '../../../styles/colors';
import DismissKeyboard from '../../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../../components/SPKeyboardAvoidingView';
import EventParticipantInfo from './EventParticipantInfo';
import EventParticipantVideoList from './EventParticipantVideoList';

function EventParticipantDetail() {
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
        <EventParticipantInfo />
        <Text>tab2</Text>
        <EventParticipantVideoList />
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

export default EventParticipantDetail;
