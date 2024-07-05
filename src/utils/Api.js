/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import { API_SERVER } from '@env';
import { Platform } from 'react-native';
import NetworkException from '../common/exceptions/NetworkException';
import { AccessDeniedException } from '../common/exceptions';
import InvalidUserException from '../common/exceptions/InvalidUserException';

import Utils from './Utils';
import { store } from '../redux/store';
import { authAction } from '../redux/reducers/authSlice';

export const formDataConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const qs = require('qs');

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_SERVER,
  timeout: 300000, // 요청이 5분 이상 지연되면 요청 실패로 처리
});

api.defaults.paramsSerializer = params => {
  return qs.stringify(params, { skipNulls: true });
};

const getTrimDatas = params => {
  if (!params) return params;
  if (params instanceof FormData) {
    return params;
  }
  const requestParams = {};
  Object.keys(params).forEach(key => {
    if (typeof params[key] === 'string') {
      requestParams[key] = params[key].trim();
    } else {
      requestParams[key] = params[key];
    }
  });
  return requestParams;
};

// 요청 전에 실행되는 인터셉터
api.interceptors.request.use(
  async originalConfig => {
    const config = { ...originalConfig };
    try {
      const accessToken = store.getState().auth?.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      config.headers.os = Platform.OS;
      config.headers.mobile = true;

      // param trim
      config.params = getTrimDatas(config?.params);
      config.data = getTrimDatas(config?.data);
    } catch (error) {
      console.log('[ ERROR ] HTTP > Interceptor > Request ::: ', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// ***********************************************************
// HTTP Interceptor > Response
// ***********************************************************
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    console.log(
      '[ ERROR ] HTTP > Interceptor > Response ::: ',
      error?.response?.data?.code,
    );
    // 커넥션 에러
    if (!error?.response)
      throw new NetworkException('서버와의 통신을 확인할 수 없습니다.');

    const {
      // data,
      config,
      response: {
        data: { code, message },
      },
    } = error;
    const originalRequest = config;

    // ----------------------------------------
    // 에러 후처리
    // ----------------------------------------

    // [ 토큰 에러 ] 기간 만료 > Access Token 재발급
    if (`${code}` === '1001' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = store.getState().auth?.refreshToken;
        axios.defaults.headers.common.Authorization = `Bearer ${refreshToken}`;

        const { data } = await axios.get(
          `${API_SERVER}/api/v1/auth/refresh-token`,
        );
        if (data) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            data.data;
          const authState = store.getState().auth;
          store.dispatch(
            authAction.setAuth({
              ...authState,
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            }),
          );
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await Utils.logout();
        return Promise.reject(new InvalidUserException(message));
      }
    }
    // [ 토큰 에러 ] 유효하지 않은 권한
    else if (
      `${code}` === '1002' ||
      `${code}` === '1003' ||
      `${code}` === '1098'
    ) {
      return Promise.reject(new AccessDeniedException(message));
    }
    // [ 토큰 에러 ] 잘못된 토큰 > 로그아웃 처리
    else if (
      `${code}` === '1004' ||
      `${code}` === '1005' ||
      `${code}` === '1006' ||
      `${code}` === '1097' ||
      `${code}` === '1099'
    ) {
      if (originalRequest.url.includes('/api/v1/auth/login')) {
        return Promise.reject(new NetworkException(message, code));
      }
      await Utils.logout();
      return Promise.reject(new InvalidUserException(message));
    }

    // [ 그 외 에러 ]
    return Promise.reject(new NetworkException(message, code));
  },
);

export default api;
