import React, { useState, useEffect } from 'react';
import SwitchToggle from 'react-native-switch-toggle';
import { COLORS } from '../styles/colors';
import { Platform, StyleSheet } from 'react-native';

function CBSwitch({
  switchOn,
  onChange,
  containerStyle,
  buttonStyle,
  circleColorOn,
  circleColorOff,
  circleStyle,
  backgroundColorOn,
  backgroundColorOff,
  disabled,
}) {
  const [on, setOn] = useState(false);

  const handleSwitchOnChange = e => {
    if (switchOn === false || switchOn === true) {
      setOn(switchOn);
    } else {
      setOn(!on);
    }

    if (onChange) onChange(!on);
  };

  useEffect(() => {
    if (switchOn === false || switchOn === true) {
      setOn(switchOn);
    }
  }, [switchOn]);

  const circleOncolor = circleColorOn || COLORS.white;
  const circleOffcolor = circleColorOff || COLORS.white;
  const bgOnColor = backgroundColorOn || COLORS.orange;
  const bgOffColor = backgroundColorOff || COLORS.gray50;

  return disabled === true ? (
    <SwitchToggle
      switchOn={false}
      containerStyle={{
        width: 36,
        height: Platform.OS === 'android' ? 20 + StyleSheet.hairlineWidth : 20,
        borderRadius: 16,
        padding: 2,
        ...(containerStyle || {}),
      }}
      buttonStyle={buttonStyle}
      circleColorOff={COLORS.white}
      backgroundColorOn={COLORS.gray}
      backgroundColorOff={COLORS.gray}
      circleStyle={{
        width: 16,
        height: 16,
        borderRadius: 8,
        ...(circleStyle || {}),
      }}
    />
  ) : (
    <SwitchToggle
      switchOn={on}
      onPress={handleSwitchOnChange}
      containerStyle={{
        width: 36,
        height: Platform.OS === 'android' ? 20 + StyleSheet.hairlineWidth : 20,
        borderRadius: 16,
        padding: 2,
        ...(containerStyle || {}),
      }}
      buttonStyle={buttonStyle}
      circleColorOn={circleOncolor}
      circleColorOff={circleOffcolor}
      backgroundColorOn={bgOnColor}
      backgroundColorOff={bgOffColor}
      circleStyle={{
        width: 16,
        height: 16,
        borderRadius: 8,
        ...(circleStyle || {}),
      }}
    />
  );
}
export default CBSwitch;
