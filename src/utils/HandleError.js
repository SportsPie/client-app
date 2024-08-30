/* eslint-disable no-case-declarations */
import {
  AccessDeniedException,
  CustomException,
  InvalidUserException,
  NetworkException,
} from '../common/exceptions';

// Util

import Utils from './Utils';

// Constant
// @ts-ignore
import resultCode from '../common/constants/resultCode';
import { MODAL_CLOSE_EVENT } from '../common/constants/modalCloseEvent';

export const handleError = (error, callback) => {
  console.log('error', error);
  switch (true) {
    // CustomException || NetworkException
    case error instanceof CustomException:
    case error instanceof NetworkException:
      Utils.openModal({
        body: error.message,
        closeEvent:
          +error.code === 9999 || +error.code === 4906 || +error.code === 4907
            ? MODAL_CLOSE_EVENT.goBack
            : MODAL_CLOSE_EVENT.nothing,
      });
      break;
    // InvalidUserException
    case error instanceof InvalidUserException:
      Utils.openModal({
        body: error.message,
        closeEvent: MODAL_CLOSE_EVENT.moveHome,
      });
      break;
    // AccessDeniedException
    case error instanceof AccessDeniedException:
      Utils.openModal({
        body: error.message,
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
      break;
    // default
    default:
      const message = error?.message || resultCode.CODE_500;
      // SPToast.show({ text: message || 'error' });
      Utils.openModal({
        body: message,
        closeEvent: MODAL_CLOSE_EVENT.nothing,
      });
  }
};
