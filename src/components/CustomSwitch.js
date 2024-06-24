import {
  StyleSheet,
  Switch,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from 'react-native';
import React, { memo } from 'react';
import { COLORS } from '../styles/colors';

function CustomSwitch({ value, onValueChange, style }) {
  return (
    <View style={[styles.switchContainer, style]}>
      <Switch
        trackColor={{ false: COLORS.disable, true: COLORS.orange }}
        thumbColor={COLORS.white}
        ios_backgroundColor={COLORS.disable}
        onValueChange={onValueChange}
        value={value}
        style={styles.switch}
      />
    </View>
  );
}

export default memo(CustomSwitch);

const styles = StyleSheet.create({
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  switch: {
    transform:
      Platform.OS === 'android'
        ? [{ scaleX: 2.1 }, { scaleY: 2.1 }]
        : [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
});
