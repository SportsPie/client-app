import React, { memo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SPSvgs } from '../../assets/svg';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import NavigationService from '../../navigation/NavigationService';

function SearchHeader({ value, onChangeText, placeholder, onSubmitEditing }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          NavigationService.goBack();
        }}>
        <SPSvgs.Back />
      </Pressable>

      <View style={styles.searchSection}>
        <SPSvgs.Search width={20} height={20} fill={COLORS.labelAlternative} />
        <TextInput
          placeholder={placeholder ?? ''}
          placeholderTextColor={COLORS.labelAlternative}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

export default memo(SearchHeader);

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    backgroundColor: COLORS.peach,
    flex: 1,
    flexGrow: 1,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  input: {
    ...fontStyles.fontSize14_Medium,
    height: 40,
    flex: 1,
  },
});
