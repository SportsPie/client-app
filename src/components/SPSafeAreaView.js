import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';

function SPSafeAreaView({ useSafeArea = true, style, children }) {
  if (useSafeArea) {
    return <SafeAreaView style={style}>{children}</SafeAreaView>;
  }
  return <View style={style}>{children}</View>;
}
export default SPSafeAreaView;
