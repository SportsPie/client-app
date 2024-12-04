/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';
import { PARTICIPATION_STATE } from '../../../common/constants/ParticipationState';
import { TOURNAMENT_STATE_TYPE } from '../../../common/constants/TournamentStateType';

const initialState = {
  page: 1,
  list: [],
  totalCnt: 0,
  refreshing: false,
  loading: true,
  isLast: false,
  type: null,
};

export const academyMatchingRegistrationListSlice = createSlice({
  name: 'academyMatchingRegistrationList',
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
    setType: (state, actions) => {
      state.type = actions.payload;
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
    refreshAndTypeReset: (state, actions) => {
      if (actions.payload) {
        state.loading = !actions.payload;
      } else {
        state.loading = true;
      }
      state.page = 1;
      state.totalCnt = 0;
      state.isLast = false;
      state.list = [];
      state.type = null;
      state.refreshing = true;
    },
    reset: state => {
      state.loading = true;
      state.page = 1;
      state.totalCnt = 0;
      state.isLast = false;
      state.list = [];
      state.type = null;
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
            item[idxName] =
              typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
            return item;
          }
          return v;
        });
      }
    },
    modifyItemForApply: (state, actions) => {
      if (state.list && state.list.length > 0) {
        const { idxName, idx, item } = actions.payload;

        state.list = state.list.map(v => {
          if (Number(v[idxName]) === Number(idx)) {
            const obj = {
              ...v,
              ...item,
              reviewWrited: v.reviewWrited,
              twoDaysBeforeStart: v.twoDaysBeforeStart,
              trnState: v.trnState,
            };
            obj[idxName] =
              typeof v[idxName] === 'string' ? Number(idx) : `${idx}`;
            return obj;
          }
          return v;
        });
      }
    },
    reviewWrited: (state, actions) => {
      if (state.list && state.list.length > 0) {
        const tournamentIdx = actions.payload;
        state.list = state.list.map(v => {
          if (
            Number(v.tournamentIdx) === Number(tournamentIdx) &&
            v.prtState === PARTICIPATION_STATE.CONFIRMED.value &&
            v.trnState === TOURNAMENT_STATE_TYPE.FINISHED.code
          ) {
            const obj = {
              ...v,
              reviewWrited: true,
            };
            obj.prtIdx =
              typeof v.prtIdx === 'string' ? Number(v.prtIdx) : `${v.prtIdx}`;
            return obj;
          }
          return v;
        });
      }
    },
  },
});
export const academyMatchingRegistrationListAction =
  academyMatchingRegistrationListSlice.actions;

export default academyMatchingRegistrationListSlice.reducer;
