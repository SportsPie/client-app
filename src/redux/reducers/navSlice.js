/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

export const navSlice = createSlice({
  name: 'nav',
  initialState: {
    navName: '', // 현재 네비게이션 위치 이름
    moveUrl: '', // 이동해야될 네비게이션 위치 이름 :: fcm 알림 클릭, 알림 페이지 에서 아이템 클릭등 페이지 이동 이벤트가 필요할 시 사용
  },
  reducers: {
    changeNavName: (state, action) => {
      state.navName = action.payload;
    },
    changeMoveUrl: (state, action) => {
      state.moveUrl = action.payload;
    },
  },
});

export const navSliceActions = navSlice.actions;

export default navSlice.reducer;
