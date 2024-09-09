import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function MoreEventParticipantInfo() {
  return (
    <View>
      <Text>내 정보</Text>
    </View>
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

export default MoreEventParticipantInfo;
