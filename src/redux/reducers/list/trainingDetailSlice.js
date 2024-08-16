/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trainingDetail: {
    trainingName: '',
    bannerPath: '',
    cntLike: 0,
    cntView: 0,
    coachDesc: '',
    coachName: '',
    cntVideo: 0,
    lastViewOrder: '',
    programDesc: '',
    isLike: false,
  },
  masterVideoList: [],
  refreshing: false,
  loading: true,
};

export const trainingDetailSlice = createSlice({
  name: 'trainingDetail',
  initialState,
  reducers: {
    setTrainingDetail: (state, actions) => {
      state.trainingDetail = actions.payload;
    },
    setMasterVideoList: (state, actions) => {
      state.masterVideoList = actions.payload;
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
      state.trainingDetail = { ...initialState.trainingDetail };
      state.masterVideoList = [];
      state.refreshing = true;
    },
    reset: state => {
      state.loading = true;
      state.trainingDetail = { ...initialState.trainingDetail };
      state.masterVideoList = [];
      state.refreshing = false;
    },
    modifyItem: (state, actions) => {
      if (state.masterVideoList && state.masterVideoList.length > 0) {
        const { idxName, idx, item } = actions.payload;
        state.masterVideoList = state.masterVideoList.map(v => {
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
export const trainingDetailAction = trainingDetailSlice.actions;

export default trainingDetailSlice.reducer;
