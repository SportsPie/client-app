import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, TextInput } from 'react-native';
import { Settings } from 'react-native-fbsdk-next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AlertModal from './src/components/AlertModal';
import DynamicLinksListener from './src/components/DynamicLinksListener';
import ForceUpdateModal from './src/components/ForceUpdateModal';
import SPGlobalModal from './src/components/SPGlobalModal';
import { CBToastProvider } from './src/components/SPToast';
import Navigation from './src/navigation/Navigation';
import NavigationService from './src/navigation/NavigationService';
import { chatSliceActions } from './src/redux/reducers/chatSlice';
import Splash from './src/screens/Splash';
import { COLORS } from './src/styles/colors';
import { AppStateProvider } from './src/utils/AppStateContext';
import { onTokenRefresh } from './src/utils/FirebaseMessagingService';
import { MqttUtils } from './src/utils/MqttUtils';
import { PermissionsProvider } from './src/utils/PermissionsContext';
import SqlLite from './src/utils/SqlLite/SqlLite';
import { TranslationProvider } from './src/utils/TranslationContext';
import web3Utils from './src/utils/Web3Utils';
import ChatUtils from './src/utils/chat/ChatUtils';

Settings.initializeSDK();

// Text 적용
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

// TextInput 적용
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

function App() {
  const authState = useSelector(selector => selector.auth);
  const appState = AppState.currentState;
  const dispatch = useDispatch();
  const [splashVisible, setSplashVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackground, setIsBackground] = useState(true);
  const [useSafeArea, setUseSafeArea] = useState(true);

  const handleSplashTimeout = () => {
    setSplashVisible(false);
  };

  const setDefaultStyle = () => {
    // 기본 폰트 적용
    const sourceRender = Text.render;
    Text.render = function render(props, ref) {
      return sourceRender.apply(this, [
        {
          ...props,
        },
        ref,
      ]);
    };
  };

  const createTable = async () => {
    try {
      await ChatUtils.createChatTable();
      await SqlLite.createNotification();
    } catch (error) {
      console.log('error', error);
    }
  };

  const init = () => {
    setTimeout(async () => {
      await createTable();
      if (
        authState.isLogin &&
        appState !== 'background' &&
        appState !== 'inactive'
      ) {
        // mqtt 연결 및 이전 데이터 가져오기
        await MqttUtils.connect(
          authState.mqttClientId,
          ChatUtils.getTopic(authState.userType, authState.userIdx),
        );
      }
      setDefaultStyle();
      onTokenRefresh();
      web3Utils.web3Connect();
      setIsLoading(false);
    }, 0);
  };

  const screenTracking = state => {
    if (state) {
      const route = state?.routes[state.index];
      if (route.state) {
        screenTracking(route?.state);
        return;
      }
      console.log(`====== NAVIGATING to > ${route?.name}`);
    }
  };

  const handleAppStateChange = nextAppState => {
    // 앱 접근 시간설정
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      setIsBackground(true);
    } else {
      dispatch(chatSliceActions.setMessageShowMinTimeId(new Date().getTime()));
      setIsBackground(false);
    }
  };

  useEffect(() => {
    init();
    setTimeout(handleSplashTimeout, 1000); // 3초 후에 스플래시 페이지를 숨깁니다.
    if (appState === 'background' || appState === 'inactive') {
      AppState.addEventListener('change', handleAppStateChange);
    }

    // 리스너의 해제도 잊지 마세요
    return () => {
      if (appState === 'background' || appState === 'inactive') {
        AppState.removeEventListener('change', handleAppStateChange);
      }
    };
  }, []);

  useEffect(() => {
    if (AppState.currentState) {
      if (appState === 'background' || appState === 'inactive') {
        console.log('app : background!');
        setIsBackground(true);
      } else {
        dispatch(
          chatSliceActions.setMessageShowMinTimeId(new Date().getTime()),
        );
        setIsBackground(false);
        console.log('app : foreground!');
      }
    }
  }, [appState]);

  if (isLoading || splashVisible || isBackground) {
    return <Splash />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <TranslationProvider>
        <BottomSheetModalProvider>
          <AppStateProvider>
            <CBToastProvider>
              <PermissionsProvider>
                <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                  <NavigationContainer
                    onStateChange={screenTracking}
                    ref={NavigationService.setNavigationRef}>
                    <ForceUpdateModal />
                    <Navigation />
                    <SPGlobalModal />
                    <AlertModal />
                    <DynamicLinksListener />
                  </NavigationContainer>
                </SafeAreaProvider>
              </PermissionsProvider>
            </CBToastProvider>
          </AppStateProvider>
        </BottomSheetModalProvider>
      </TranslationProvider>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});
