/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';
import training from '../../../screens/training/Training';

const initialState = {
  bannerList: [],
  trainingObj: {},
  refreshing: false,
  loading: true,
  isLast: false,
};

export const trainingListSlice = createSlice({
  name: 'trainingList',
  initialState,
  reducers: {
    setBannerList: (state, actions) => {
      state.bannerList = actions.payload;
    },
    setTrainingObj: (state, actions) => {
      state.trainingObj = actions.payload;
    },
    setRefreshing: (state, actions) => {
      state.refreshing = actions.payload;
    },
    setLoading: (state, actions) => {
      state.loading = actions.payload;
    },
    refresh: (state, actions) => {
      if (actions.payload) {
        state.loading = !actions.payload;
      } else {
        state.loading = true;
      }
      state.isLast = false;
      state.bannerList = [];
      state.trainingObj = {};
      state.refreshing = true;
    },
    reset: state => {
      state.loading = true;
      state.bannerList = [];
      state.trainingObj = {};
      state.refreshing = false;
    },
    modifyItem: (state, actions) => {
      if (state.trainingObj && Object.keys(state.trainingObj).length > 0) {
        const trainingObject = JSON.parse(JSON.stringify(state.trainingObj));
        const { idxName, idx, item } = actions.payload;

        // trainingObject의 각 키에 대해 처리
        Object.keys(trainingObject).forEach(key => {
          trainingObject[key] = trainingObject[key].map(v => {
            if (Number(v[idxName]) === Number(idx)) {
              const obj = { ...v, ...item };
              obj[idxName] =
                typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
              return obj;
            }
            return v;
          });
        });

        // 업데이트된 객체를 상태에 반영
        state.trainingObj = trainingObject;
      }
    },
  },
});
export const trainingListAction = trainingListSlice.actions;

export default trainingListSlice.reducer;
