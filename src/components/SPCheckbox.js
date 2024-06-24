import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import SPIcons from '../assets/icon';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import { ACTIVE_OPACITY } from '../common/constants/constants';

export default function SPCheckbox({
  text,
  onPress,
  checkBoxStyle,
  checkBoxTextStyle,
  checked,
  reverse,
}) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = e => {
    if (checked === false || checked === true) {
      setIsChecked(checked);
    } else {
      setIsChecked(!isChecked);
    }

    onPress(!isChecked);
  };

  useEffect(() => {
    if (checked === false || checked === true) {
      setIsChecked(checked);
    }
  }, [checked]);

  return (
    <TouchableOpacity
      onPress={handleCheckboxChange}
      activeOpacity={ACTIVE_OPACITY}>
      <View style={[styles.defaultCheckBoxStyle, checkBoxStyle]}>
        {reverse && (
          <Text
            style={[
              styles.defaultCheckBoxTextStyle,
              checkBoxTextStyle,
              { flexShrink: 1 },
            ]}>
            {text}
          </Text>
        )}
        {isChecked ? (
          // <Image
          //   source={checkType ? SPIcons.icCheck : SPIcons.cbChecked}
          //   style={{ tintColor: COLORS.primary }}
          // />
          <View
            style={{ height: 24, width: 24, backgroundColor: COLORS.black }}
          />
        ) : (
          // <Image source={checkType ? SPIcons.icUnchecked : SPIcons.cbUncheck} />
          <View
            style={{
              height: 24,
              width: 24,
              borderWidth: 1,
              borderColor: COLORS.darkGray,
            }}
          />
        )}
        {!reverse && (
          <Text
            style={[
              styles.defaultCheckBoxTextStyle,
              checkBoxTextStyle,
              { flexShrink: 1 },
            ]}>
            {text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  defaultCheckBoxStyle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  defaultCheckBoxTextStyle: { ...fontStyles.fontSize24_Semibold },
});
