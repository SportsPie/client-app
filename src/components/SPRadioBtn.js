/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import { ACTIVE_OPACITY } from '../common/constants/constants';

function SPRadioBtn({
  options,
  onSelect,
  radioBoxStyle,
  radioBoxTextStyle,
  disabled,
  nullable,
  value,
  title,
}) {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleCheckboxChange = selectedOption => {
    if (nullable && selectedValue === selectedOption.value) {
      setSelectedValue(null);
      onSelect(null);
    } else {
      setSelectedValue(selectedOption.value);
      onSelect(selectedOption.value);
    }
  };

  useEffect(() => {
    if (value) {
      setSelectedValue(value);
    }
  }, [value]);

  return (
    <View>
      {title && <Text style={styles.selectText}>{title}</Text>}
      {options.map((option, index) => (
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          key={index}
          onPress={() => handleCheckboxChange(option)}>
          <View style={[styles.defaultRadioBoxStyle, radioBoxStyle]}>
            <View
              style={[
                styles.iconWrapper,
                {
                  borderColor:
                    selectedValue === option.value
                      ? COLORS.primary
                      : COLORS.gray50,
                },
              ]}>
              <View
                style={[
                  styles.selectedIcon,
                  {
                    backgroundColor:
                      selectedValue === option.value ? COLORS.primary : null,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.defaultRadioBoxTextStyle,
                {
                  fontWeight: selectedValue === option.value ? '600' : '400',
                },
                radioBoxTextStyle,
              ]}>
              {option.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultRadioBoxStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  defaultRadioBoxTextStyle: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.gray85,
  },
  iconWrapper: {
    width: 18,
    aspectRatio: 1,

    borderWidth: 1.5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    width: 10,
    aspectRatio: 1,
    borderRadius: 20,
  },
  selectText: {
    color: '#707684',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 10,
  },
});

export default SPRadioBtn;
