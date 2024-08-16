/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const masterDetailInit = {
  trainingIdx: '',
  trainingName: '',
  title: '',
  masterIdx: '',
  masterDate: '',
  videoIdx: '',
  videoName: '',
  videoPath: '',
  videoTime: 0,
  thumbPath: '',
  viewDate: '',
  regDate: '',
  memberIdx: '',
  memberName: '',
  profilePath: '',
  cntComment: 0,
  cntLike: 0,
  cntView: 0,
  contents: '',
  isLike: false,
  isMine: false,
};

const initialState = {
  data: {
    key: {
      masterDetail: JSON.parse(JSON.stringify(masterDetailInit)),
      masterVideoList: [],
      refreshing: false,
      loading: true,
      pagingKey: 0,
    },
  },
};

export const masterDetailSlice = createSlice({
  name: 'masterDetail',
  initialState,
  reducers: {
    setMasterDetail: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].masterDetail = data;
    },
    setMasterVideoList: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].masterVideoList = data;
    },
    setRefreshing: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].refreshing = data;
    },
    setLoading: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].loading = data;
    },
    setPagingKey: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].pagingKey = data;
    },
    refresh: (state, actions) => {
      // actions.payload :: key
      state.data[actions.payload] = {
        loading: true,
        masterDetail: JSON.parse(JSON.stringify(masterDetailInit)),
        masterVideoList: [],
        refreshing: true,
        pagingKey: 0,
      };
    },
    allReset: state => {
      state.data = JSON.parse(JSON.stringify(initialState.data));
    },
    reset: (state, actions) => {
      // actions.payload :: key
      if (`${actions.payload}` === '1') {
        const obj = JSON.parse(JSON.stringify(initialState.data));
        obj[actions.payload] = {
          loading: true,
          masterDetail: JSON.parse(JSON.stringify(masterDetailInit)),
          masterVideoList: [],
          refreshing: false,
          pagingKey: 0,
        };
        state.data = obj;
      } else {
        state.data[actions.payload] = {
          loading: true,
          masterDetail: JSON.parse(JSON.stringify(masterDetailInit)),
          masterVideoList: [],
          refreshing: false,
          pagingKey: 0,
        };
      }
    },
    modifyItem: (state, actions) => {
      const { idxName, idx, item } = actions.payload;
      if (state.data && Object.keys(state.data).length > 0) {
        Object.values(state.data).forEach(pv => {
          if (pv.masterVideoList?.length > 0) {
            pv.masterVideoList = pv.masterVideoList.map(v => {
              if (Number(v[idxName]) === Number(idx)) {
                const obj = { ...v, ...item };
                obj[idxName] =
                  typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
                return obj;
              }
              return v;
            });
          }
        });
      }
    },
  },
});
export const masterDetailAction = masterDetailSlice.actions;

export default masterDetailSlice.reducer;
