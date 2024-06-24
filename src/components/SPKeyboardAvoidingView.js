import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { AvoidSoftInput } from 'react-native-avoid-softinput';

function SPKeyboardAvoidingView({
  behavior,
  keyboardVerticalOffset,
  children,
  isResize,
  isPan,
  ...props
}) {
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (isResize) {
        AvoidSoftInput.setAdjustResize();
      } else if (isPan) {
        AvoidSoftInput.setAdjustPan();
      }
      return () => {
        AvoidSoftInput.setAdjustNothing();
      };
    }
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={behavior}
      style={styles.container}
      enabled={Platform.OS === 'ios' ? true : !isResize}
      keyboardVerticalOffset={keyboardVerticalOffset}
      {...props}>
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SPKeyboardAvoidingView;
