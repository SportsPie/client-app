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
import SPMultipleVideoForReels from '../../../components/SPMultipleVideoForReels';

function EventParticipantVideoReels() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text>릴스</Text>
        <SPMultipleVideoForReels
          source={[]}
          onReachLast={() => {}}
          onChangeVideo={() => {}}
        />
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

export default EventParticipantVideoReels;
