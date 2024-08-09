/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  page: 1,
  list: [],
  totalCnt: 0,
  refreshing: false,
  loading: true,
  isLast: false,
};

export const moreChallengeVideoListSlice = createSlice({
  name: 'moreChallengeVideoList',
  initialState,
  reducers: {
    setList: (state, actions) => {
      state.list = actions.payload;
    },
    setTotalCnt: (state, actions) => {
      state.totalCnt = actions.payload;
    },
    setPage: (state, actions) => {
      state.page = actions.payload;
    },
    setRefreshing: (state, actions) => {
      state.refreshing = actions.payload;
    },
    setLoading: (state, actions) => {
      state.loading = actions.payload;
    },
    setIsLast: (state, actions) => {
      state.isLast = actions.payload;
    },
    refresh: (state, actions) => {
      if (actions.payload) {
        state.loading = !actions.payload;
      } else {
        state.loading = true;
      }
      state.page = 1;
      state.totalCnt = 0;
      state.isLast = false;
      state.list = [];
      state.refreshing = true;
    },
    reset: state => {
      state.loading = true;
      state.page = 1;
      state.totalCnt = 0;
      state.isLast = false;
      state.list = [];
      state.refreshing = false;
    },
    removeItem: (state, actions) => {
      if (state.list && state.list.length > 0) {
        const { idxName, idx } = actions.payload;
        state.list = state.list.filter(item => item[idxName] !== idx);
      }
    },
    modifyItem: (state, actions) => {
      if (state.list && state.list.length > 0) {
        const { idxName, idx, item } = actions.payload;
        state.list = state.list.map(v => {
          if (Number(v[idxName]) === Number(idx)) {
            const obj = { ...v, ...item };
            obj[idxName] =
              typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
            return obj;
          }
          return v;
        });
      }
    },
  },
});
export const moreChallengeVideoListAction = moreChallengeVideoListSlice.actions;

export default moreChallengeVideoListSlice.reducer;
