import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import Login from '../../screens/auth/Login';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { store } from '../../redux/store';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import SPFooter from '../SPBottomNav';

export default function AuthLayout({
  component: Component,
  children,
  footer,
  ...props
}) {
  const isLogin = useSelector(state => state.auth)?.isLogin;

  return (
    <View style={{ flex: 1 }}>
      {isLogin ? <Component {...props} /> : <Login noMove {...props} />}
      {isLogin && children}
      {footer && <SPFooter />}
    </View>
  );
}
