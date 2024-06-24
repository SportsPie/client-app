/**
 * @format
 */
import React from 'react';
import { AppRegistry, Platform, UIManager } from 'react-native';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import './global';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {
  registerBackgroundAndQuitStateHandler,
  registerBackgroundMessageHandler,
  registerForegroundHandler,
} from './src/utils/FirebaseMessagingService';
import { persistor, store } from './src/redux/store';
import { Provider } from 'react-redux';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
try {
  registerForegroundHandler();
  registerBackgroundMessageHandler();
  registerBackgroundAndQuitStateHandler();
} catch (error) {
  console.log('error', error);
}

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

function Root() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
}

AppRegistry.registerComponent(appName, () => Root);
