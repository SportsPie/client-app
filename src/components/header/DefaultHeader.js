import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SPSvgs } from '../../assets/svg';
import fontStyles from '../../styles/fontStyles';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';

function DefaultHeader({
  title,
  hideLeftIcon,
  closeIcon,
  rightContent,
  onLeftIconPress,
  headerContainerStyle,
  headerTextStyle,
  leftIconColor,
}) {
  return (
    <View style={[styles.container, headerContainerStyle]}>
      {!hideLeftIcon && (
        <Pressable
          onPress={() => {
            if (onLeftIconPress) {
              onLeftIconPress();
            } else {
              NavigationService.goBack();
            }
          }}>
          {closeIcon ? (
            <SPSvgs.Close fill={leftIconColor ?? COLORS.black} />
          ) : (
            <SPSvgs.Back fill={leftIconColor ?? COLORS.black} />
          )}
        </Pressable>
      )}

      <Text numberOfLines={1} style={[styles.headerText, headerTextStyle]}>
        {title}
      </Text>

      <View style={styles.rightContent}>{rightContent}</View>
    </View>
  );
}

export default memo(DefaultHeader);

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
    zIndex: 999,
  },
  headerText: {
    ...fontStyles.fontSize24_Bold,
    flexShrink: 1,
  },
  rightContent: {
    marginLeft: 'auto',
  },
});
