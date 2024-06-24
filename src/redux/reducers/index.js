import authReducer from './authSlice';
// eslint-disable-next-line import/no-cycle
import modalReducer from './modalSlice';
import chatReducer from './chatSlice';

const modal = modalReducer;
const auth = authReducer;
const chat = chatReducer;

export default {
  auth,
  modal,
  chat,
};
