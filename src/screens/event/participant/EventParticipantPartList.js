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

function EventParticipantPartList() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="참가자 목록" />
      <ScrollView style={{ flex: 1 }}>
        <Text>더보기 페이지입니다.</Text>
        <PrimaryButton
          onPress={() => {
            NavigationService.navigate(navName.eventParticipantDetail);
          }}
          buttonStyle={styles.button}
          text="한 사람 클릭시"
        />
      </ScrollView>
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

export default EventParticipantPartList;
