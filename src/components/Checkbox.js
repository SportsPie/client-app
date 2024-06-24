import React, { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SPSvgs } from '../assets/svg';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';

function Checkbox({
  label,
  selected,
  boldText,
  onPress,
  viewMore,
  onViewMorePress,
  labelStyle,
  checkBoxStyle,
}) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Pressable
        onPress={onPress}
        style={[
          styles.checkbock,
          {
            borderColor: selected ? COLORS.orange : COLORS.lineBorder,
            backgroundColor: selected ? COLORS.orange : COLORS.white,
          },
          checkBoxStyle,
        ]}
        hitSlop={18}>
        <SPSvgs.Check
          fill={selected ? COLORS.white : 'transparent'}
          width={16}
          height={16}
        />
      </Pressable>
      <Text
        style={[
          styles.label,
          boldText
            ? { ...fontStyles.fontSize16_Semibold }
            : { ...fontStyles.fontSize14_Regular },
          labelStyle,
        ]}>
        {label}
      </Text>
      {viewMore && (
        <Pressable
          onPress={onViewMorePress}
          style={styles.viewMore}
          hitSlop={18}>
          <Text style={styles.viewMoreText}>보기</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export default memo(Checkbox);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    columnGap: 8,
  },
  checkbock: {
    borderWidth: 1,
    width: 20,
    height: 20,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: COLORS.labelNormal,
    flex: 1,
  },
  viewMoreText: {
    ...fontStyles.fontSize14_Medium,
    color: `${COLORS.labelNormal}60`,
  },
});
