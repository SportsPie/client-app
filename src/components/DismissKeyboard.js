import React from 'react';
import { Keyboard, View } from 'react-native';

export default function DismissKeyboard({ children }) {
  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponder={evt => {
        Keyboard.dismiss();
      }}>
      {children}
    </View>
  );
}
