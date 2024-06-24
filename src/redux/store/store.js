import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import reducers from '../reducers';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['modal', 'chat'],
};

const rootReducer = combineReducers(reducers);
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const waitForReduxState = async () => {
  return new Promise(resolve => {
    // eslint-disable-next-line no-underscore-dangle
    const isRehydrated = store.getState()?._persist?.rehydrated;
    if (isRehydrated) resolve();
    const unsubscribe = store.subscribe(() => {
      // eslint-disable-next-line no-underscore-dangle
      const rehydrated = store.getState()?._persist?.rehydrated;
      if (rehydrated) {
        unsubscribe(); // Redux 상태가 복원되면 구독 해제
        resolve();
      }
    });
  });
};

export const persistor = persistStore(store);
