/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

export const wifiSlice = createSlice({
  name: 'wifi',
  initialState: {
    useWifi: false,
    canMove: false,
    openNetModal: false,
    movePageName: '',
    movePageParam: {},
  },
  reducers: {
    changeWifiState: (state, action) => {
      state.useWifi = action.payload;
    },
    changeCanMove: (state, action) => {
      state.canMove = action.payload;
    },
    changeNetModalShow: (state, action) => {
      state.openNetModal = action.payload;
    },
    changeMovePageName: (state, action) => {
      state.movePageName = action.payload;
    },
    changeMovePageParam: (state, action) => {
      state.movePageParam = action.payload;
    },
  },
});

export const wifiSliceActions = wifiSlice.actions;

export default wifiSlice.reducer;
