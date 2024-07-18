import authReducer from './authSlice';

import modalReducer from './modalSlice';
import chatReducer from './chatSlice';
import wifiReducer from './wifiSlice';
import navReducer from './navSlice';

const modal = modalReducer;
const auth = authReducer;
const chat = chatReducer;
const wifi = wifiReducer;
const nav = navReducer;

export default {
  auth,
  modal,
  chat,
  wifi,
  nav,
};
