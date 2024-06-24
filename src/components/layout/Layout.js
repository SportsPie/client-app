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
  const nav = useNavigation();
  const authState = useSelector(selector => selector.auth);
  const chatState = useSelector(selector => selector.chat);
  const { isLogin } = authState;
  const { moveRoomId } = chatState;

  useEffect(() => {
    if (isLogin && moveRoomId) {
      setTimeout(() => {
        NavigationService.replace(navName.matchingChatRoomScreen, {
          roomId: moveRoomId,
        });
        // NavigationService.navigate(navName.matchingChatRoomListScreen);
        store.dispatch(chatSliceActions.resetMoveRoomId());
      }, 0);
    }
  }, [moveRoomId]);

  if (isLogin && moveRoomId) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Component {...props} />
      {children}
      {footer && <SPFooter />}
    </SafeAreaView>
  );
}
