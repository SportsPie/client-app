/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

export const appStateSlice = createSlice({
  name: 'chat',
  initialState: {
    appState: '',
  },
  reducers: {
    setAppState: (state, action) => {
      state.appState = action.payload;
    },
  },
});

export const appStateSliceActions = appStateSlice.actions;

export default appStateSlice.reducer;
