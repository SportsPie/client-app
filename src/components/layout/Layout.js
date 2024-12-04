import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import { store } from '../../redux/store';
import SPFooter from '../SPBottomNav';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Layout({
  component: Component,
  children,
  footer,
  ...props
}) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Component {...props} />
      {children}
      {footer && <SPFooter />}
    </SafeAreaView>
  );
}
