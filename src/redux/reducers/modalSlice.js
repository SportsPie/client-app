/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';

import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

const initialState = {
  isOpen: false,
  modalTitle: '',
  modalBody: '',
  data: {},
  cancelEvent: null,
  confirmEvent: null,
  closeEvent: null,
  pageName: '',
};

const moveEvent = (event, data, pgName) => {
  const params = JSON.parse(JSON.stringify(data));
  switch (event) {
    case MODAL_CLOSE_EVENT.moveHome: {
      setTimeout(() => {
        NavigationService.navigate(navName.home, params);
      }, 0);
      break;
    }
    case MODAL_CLOSE_EVENT.moveAcademy: {
      setTimeout(() => {
        NavigationService.navigate(navName.academyMember, params);
      }, 0);
      break;
    }
    case MODAL_CLOSE_EVENT.movePage: {
      setTimeout(() => {
        NavigationService.navigate(pgName, params);
      }, 0);
      break;
    }
    case MODAL_CLOSE_EVENT.replacePage: {
      setTimeout(() => {
        NavigationService.replace(pgName, params);
      }, 0);
      break;
    }
    case MODAL_CLOSE_EVENT.login: {
      setTimeout(() => {
        NavigationService.push(navName.login, params);
      }, 0);
      break;
    }
    case MODAL_CLOSE_EVENT.goBack: {
      setTimeout(() => {
        NavigationService.goBack();
      }, 0);
      break;
    }
    default:
      break;
  }
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, actions) => {
      const {
        modalTitle,
        modalBody,
        data,
        confirmEvent,
        cancelEvent,
        closeEvent,
        pageName,
      } = actions.payload;
      state.modalTitle = modalTitle;
      state.modalBody = modalBody;
      state.data = data;
      state.confirmEvent = confirmEvent;
      state.cancelEvent = cancelEvent;
      state.closeEvent = closeEvent;
      state.pageName = pageName;
      state.isOpen = true;
    },
    confirmModal: (state, actions) => {
      state.modalTitle = initialState.modalTitle;
      state.modalBody = initialState.modalBody;
      if (state.confirmEvent) {
        moveEvent(state.confirmEvent, state.data, state.pageName);
      }
      state.pageName = initialState.pageName;
      state.data = initialState.data;
      state.confirmEvent = initialState.confirmEvent;
      state.isOpen = false;
    },
    cancelModal: (state, actions) => {
      state.modalTitle = initialState.modalTitle;
      state.modalBody = initialState.modalBody;
      if (state.cancelEvent) {
        moveEvent(state.cancelEvent, state.data, state.pageName);
      }
      state.pageName = initialState.pageName;
      state.data = initialState.data;
      state.cancelEvent = initialState.cancelEvent;
      state.isOpen = false;
    },
    closeModal: (state, actions) => {
      state.modalTitle = initialState.modalTitle;
      state.modalBody = initialState.modalBody;
      if (state.closeEvent) {
        moveEvent(state.closeEvent, state.data, state.pageName);
      }
      state.pageName = initialState.pageName;
      state.data = initialState.data;
      state.closeEvent = initialState.closeEvent;
      state.isOpen = false;
    },
  },
});

export const { openModal, confirmModal, cancelModal, closeModal } =
  modalSlice.actions;
export const modalAction = modalSlice.actions;

export default modalSlice.reducer;
