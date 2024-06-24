import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import { SPSvgs } from '../assets/svg';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';

function MenuSection({
  title,
  label,
  onPress,
  containerStyle,
  titleTextStyle,
}) {
  return (
    <Pressable onPress={onPress} style={[styles.container, containerStyle]}>
      <Text
        style={[
          fontStyles.fontSize16_Medium,
          titleTextStyle,
          {
            color: COLORS.labelNormal,
          },
        ]}>
        {title}
      </Text>

      {label && (
        <Text
          style={[
            fontStyles.fontSize14_Medium,
            { marginLeft: 'auto', color: COLORS.labelAlternative },
          ]}>
          {label}
        </Text>
      )}

      {label && (
        <View style={styles.chevron}>
          <SPSvgs.ChevronDown />
        </View>
      )}
    </Pressable>
  );
}

export default memo(MenuSection);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineBorder,
    paddingVertical: 16,
  },
  chevron: {
    transform: [
      {
        rotate: '-90deg',
      },
    ],
  },
});
