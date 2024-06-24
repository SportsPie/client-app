import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { memo } from 'react';
import { SPSvgs } from '../assets/svg';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import { IS_IOS } from '../common/constants/constants';

function SearchInput({ value, onChangeText, onClearText, containerStyle }) {
  return (
    <View style={[styles.container, containerStyle]}>
      <SPSvgs.Search width={20} height={20} fill="#2E313599" />

      <TextInput
        placeholder="검색어를 입력해주세요"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor="rgba(46, 49, 53, 0.60)"
      />

      {value && (
        <Pressable hitSlop={8} onPress={onClearText}>
          <SPSvgs.CloseCircleFill width={20} height={20} />
        </Pressable>
      )}
    </View>
  );
}

export default memo(SearchInput);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.peach,
    columnGap: 4,
    padding: 8,
    borderRadius: 10,
    height: 36,
  },
  input: {
    ...fontStyles.fontSize14_Medium,
    letterSpacing: 0.2,
    color: COLORS.labelNormal,
    height: 36,
    width: '100%',
    top: IS_IOS ? -2 : 2,
  },
});
