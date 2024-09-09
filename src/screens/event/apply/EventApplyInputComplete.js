import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useAppState } from '../../../utils/AppStateContext';

function EventApplyInputComplete() {
  const { applyData, setApplyData } = useAppState();
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="이벤트 접수 신청"
        closeIcon
        onLeftIconPress={() => {
          NavigationService.navigate(navName.eventDetail, {
            eventIdx: applyData.eventIdx,
          }); // home 페이지로 이동
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <Text>이벤트 접수완료</Text>
      </ScrollView>
      <View style={styles.bottomButtonWrap}>
        <PrimaryButton
          onPress={() => {
            NavigationService.navigate(navName.eventApplyPrevInformation);
          }}
          buttonStyle={styles.button}
          text="다음"
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

export default EventApplyInputComplete;
