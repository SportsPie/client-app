import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import fontStyles from '../../styles/fontStyles';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import Utils from '../../utils/Utils';

function SocialTokenBalance({ value }) {
  return (
    <Pressable
      onPress={() => {
        NavigationService.navigate(navName.socialTokenDetail);
      }}
      style={styles.container}>
      <View style={styles.topContent}>
        <SPSvgs.SocialToken />
        <Text style={fontStyles.fontSize20_Semibold}>포인트</Text>
      </View>

      <Text style={fontStyles.fontSize28_Bold}>
        {Utils.changeNumberComma(value || 0)} P
      </Text>
    </Pressable>
  );
}

export default memo(SocialTokenBalance);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    width: WINDOW_WIDTH - 32,
    backgroundColor: COLORS.fillNormal,
    padding: 16,
    borderRadius: 16,
    rowGap: 16,
  },
  topContent: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
});
