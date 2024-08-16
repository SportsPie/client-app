/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

const challengeDetailInit = {
  videoIdx: '',
  title: '',
  contents: '',
  thumbPath: '',
  videoPath: '',
  videoTime: '',
  videoGroupIdx: '',
  videoGroupName: '',
  cntComment: 0,
  cntLike: 0,
  cntView: 0,
  confirmYn: null,
  isLike: false,
  isMine: false,
  memberIdx: '',
  memberName: '',
  profilePath: '',
  parentVideoIdx: '',
  regDate: '',
};

const initialState = {
  data: {
    key: {
      challengeDetail: JSON.parse(JSON.stringify(challengeDetailInit)),
      list: [],
      refreshing: false,
      loading: true,
      pagingKey: 0,
      page: 1,
      isLast: false,
    },
  },
};

export const challengeDetailSlice = createSlice({
  name: 'challengeDetail',
  initialState,
  reducers: {
    setChallengeDetail: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].challengeDetail = data;
    },
    setPage: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].page = data;
    },
    setList: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].list = data;
    },
    setIsLast: (state, actions) => {
      const { key, data } = actions.payload;
      state.data[key].isLast = data;
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
        challengeDetail: JSON.parse(JSON.stringify(challengeDetailInit)),
        list: [],
        refreshing: true,
        pagingKey: 0,
        page: 1,
        isLast: false,
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
          challengeDetail: JSON.parse(JSON.stringify(challengeDetailInit)),
          list: [],
          refreshing: false,
          pagingKey: 0,
          page: 1,
          isLast: false,
        };
        state.data = obj;
      } else {
        state.data[actions.payload] = {
          loading: true,
          challengeDetail: JSON.parse(JSON.stringify(challengeDetailInit)),
          list: [],
          refreshing: false,
          pagingKey: 0,
          page: 1,
          isLast: false,
        };
      }
    },
    plusLikeCnt: (state, actions) => {
      const { idxName, idx } = actions.payload;
      if (state.data && Object.keys(state.data).length > 0) {
        Object.values(state.data).forEach(pv => {
          if (pv.list?.length > 0) {
            pv.list = pv.list.map(v => {
              if (Number(v[idxName]) === Number(idx)) {
                v.isLike = true;
                v.cntLike += 1;
                v[idxName] =
                  typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
                return v;
              }
              return v;
            });
          }
        });
      }
    },
    minusLikeCnt: (state, actions) => {
      const { idxName, idx } = actions.payload;
      if (state.data && Object.keys(state.data).length > 0) {
        Object.values(state.data).forEach(pv => {
          if (pv.list?.length > 0) {
            pv.list = pv.list.map(v => {
              if (Number(v[idxName]) === Number(idx)) {
                v.isLike = true;
                v.cntLike -= 1;
                v[idxName] =
                  typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
                return v;
              }
              return v;
            });
          }
        });
      }
    },
    plusCommentCnt: (state, actions) => {
      const { idxName, idx } = actions.payload;
      if (state.data && Object.keys(state.data).length > 0) {
        Object.values(state.data).forEach(pv => {
          if (pv.list?.length > 0) {
            pv.list = pv.list.map(v => {
              if (Number(v[idxName]) === Number(idx)) {
                v.cntComment += 1;
                v[idxName] =
                  typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
                return v;
              }
              return v;
            });
          }
        });
      }
    },
    minusCommentCnt: (state, actions) => {
      const { idxName, idx } = actions.payload;
      if (state.data && Object.keys(state.data).length > 0) {
        Object.values(state.data).forEach(pv => {
          if (pv.list?.length > 0) {
            pv.list = pv.list.map(v => {
              if (Number(v[idxName]) === Number(idx)) {
                v.cntComment -= 1;
                v[idxName] =
                  typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
                return v;
              }
              return v;
            });
          }
        });
      }
    },
    modifyItem: (state, actions) => {
      const { idxName, idx, item } = actions.payload;
      if (state.data && Object.keys(state.data).length > 0) {
        Object.values(state.data).forEach(pv => {
          if (pv.list?.length > 0) {
            pv.list = pv.list.map(v => {
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
export const challengeDetailAction = challengeDetailSlice.actions;

export default challengeDetailSlice.reducer;
