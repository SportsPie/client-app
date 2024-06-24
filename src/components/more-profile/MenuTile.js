import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';

function MenuTile({ title, value, subValue, containerStyle }) {
  return (
    <View style={[styles.menuTileContainer, containerStyle]}>
      <Text
        style={[
          fontStyles.fontSize14_Medium,
          {
            color: COLORS.labelNeutral,
          },
        ]}>
        {title ?? ''}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: 8,
        }}>
        <Text style={fontStyles.fontSize20_Semibold}>{value ?? ''}</Text>
        {subValue && (
          <Text
            style={[
              fontStyles.fontSize13_Regular,
              { color: COLORS.labelNeutral },
            ]}
            numberOfLines={1}>
            {subValue ?? ''}
          </Text>
        )}
      </View>
    </View>
  );
}

export default memo(MenuTile);

const styles = StyleSheet.create({
  menuTileContainer: {
    backgroundColor: COLORS.fillNormal,
    borderRadius: 12,
    padding: 16,
    width: (SCREEN_WIDTH - 40) / 2,
    rowGap: 8,
  },
});
