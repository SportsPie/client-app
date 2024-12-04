import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';

// 상품 상세 > 상품 소개
export default function PointProductIntro({ introData }) {
  return (
    <View style={{ rowGap: 16 }}>
      <View style={styles.lineWrapper}>
        <Text style={styles.content}>{introData?.introduction}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
});
