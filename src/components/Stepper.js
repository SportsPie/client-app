import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import Plus from '../assets/svg/Plus';
import Minus from '../assets/svg/Minus';

function Stepper({ value, onChange, minValue = 1, maxValue = 10 }) {
  const handleDecrease = () => {
    onChange(Math.max(minValue, value - 1));
  };

  const handleIncrease = () => {
    onChange(Math.min(maxValue, value + 1));
  };

  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        hitSlop={20}
        style={styles.stepperButton}
        onPress={handleDecrease}
        disabled={value <= minValue}>
        <Minus color={value <= minValue ? '#878D9638' : '#001030'} />
      </TouchableOpacity>
      <View style={styles.stepperValueContainer}>
        <Text style={styles.stepperValue}>{value}</Text>
      </View>
      <TouchableOpacity
        hitSlop={20}
        style={styles.stepperButton}
        onPress={handleIncrease}
        disabled={value >= maxValue}>
        <Plus color={value >= maxValue ? '#878D9638' : '#001030'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lineBorder,
  },
  stepperButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  stepperValueContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#00000014',
    borderRadius: 6,
  },
  stepperValue: {
    minWidth: 42,
    textAlign: 'center',
    ...fontStyles.fontSize16_Semibold,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export default Stepper;
