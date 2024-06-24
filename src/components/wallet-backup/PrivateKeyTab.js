import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import fontStyles from '../../styles/fontStyles';
import { PrimaryButton } from '../PrimaryButton';
import { COLORS } from '../../styles/colors';
import Utils from '../../utils/Utils';

function PrivateKeyTab({ keyValue }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={fontStyles.fontSize14_Medium}>{keyValue}</Text>
      </View>

      <PrimaryButton
        text="복사하기"
        outlineButton
        buttonStyle={styles.buttonStyle}
        onPress={() => {
          Utils.copyToClipboard(keyValue);
        }}
      />
    </View>
  );
}

export default memo(PrivateKeyTab);

const styles = StyleSheet.create({
  container: {
    rowGap: 16,
  },
  content: {
    backgroundColor: COLORS.fillNormal,
    padding: 8,
    borderRadius: 8,
  },
  buttonStyle: {
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
});
