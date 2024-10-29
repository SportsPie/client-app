import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { COLORS } from '../styles/colors';
import { ACTIVE_OPACITY } from '../common/constants/constants';

export function BasicButton({
  text,
  onPress,
  disabled,
  outlineButton,
  buttonStyle,
  icon,
  buttonTextStyle,
}) {
  return (
    <TouchableOpacity
      activeOpacity={ACTIVE_OPACITY}
      disabled={disabled}
      style={[
        styles.container,
        {
          backgroundColor: disabled
            ? COLORS.disable
            : outlineButton
            ? COLORS.white
            : COLORS.orange,
          borderColor: outlineButton ? COLORS.lineBorder : 'transparent',
        },
        buttonStyle,
      ]}
      onPress={onPress}>
      {icon}
      <Text
        style={[
          styles.buttonText,
          {
            color: disabled
              ? COLORS.disableText
              : outlineButton
              ? COLORS.darkBlue
              : COLORS.white,
          },
          buttonTextStyle,
        ]}>
        {text ?? ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 6,
    borderWidth: 1,
  },
});
