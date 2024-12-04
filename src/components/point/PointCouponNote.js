import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';

// 쿠폰 상세 > 유의사항
export default function PointCouponNote({ noteData }) {
  return (
    <View style={{ rowGap: 16 }}>
      <View style={styles.lineWrapper}>
        <Text style={styles.content}>{noteData?.caution}</Text>
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
