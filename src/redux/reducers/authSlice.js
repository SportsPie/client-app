/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLogin: false,
  accessToken: '',
  refreshToken: '',
  userType: 'MEMBER',
  userIdx: '',
  userName: '',
  mqttClientId: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, actions) => {
      const {
        accessToken,
        refreshToken,
        userType,
        userIdx,
        userName,
        mqttClientId,
      } = actions.payload;
      state.isLogin = !!accessToken;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.userType = userType || 'MEMBER';
      state.userIdx = userIdx;
      state.userName = userName;
      state.mqttClientId = mqttClientId;
    },
    removeAuth: state => {
      state.isLogin = initialState.isLogin;
      state.accessToken = initialState.accessToken;
      state.refreshToken = initialState.refreshToken;
      state.userType = initialState.userType;
      state.userIdx = initialState.userIdx;
      state.mqttClientId = initialState.mqttClientId;
    },
  },
});

export const { setAuth, removeAuth } = authSlice.actions;
export const authAction = authSlice.actions;

export default authSlice.reducer;
