/* eslint-disable operator-assignment */
import Clipboard from '@react-native-clipboard/clipboard';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import moment from 'moment';
import { decodeToken } from 'react-jwt';
import { Alert, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { LoginManager } from 'react-native-fbsdk-next';
import ImageCropPicker from 'react-native-image-crop-picker';
import { RESULTS } from 'react-native-permissions';
import uuid from 'react-native-uuid';
import { apiGetMyInfo } from '../api/RestAPI';
import SPIcons from '../assets/icon';
import { FCM_TYPE } from '../common/constants/fcmType';
import { JOIN_TYPE } from '../common/constants/joinType';
import { navName } from '../common/constants/navName';
import CustomException from '../common/exceptions/CustomException';
import { SPToast } from '../components/SPToast';
import NavigationService from '../navigation/NavigationService';
import { authAction } from '../redux/reducers/authSlice';
import {
  closeModal,
  confirmModal,
  openModal,
} from '../redux/reducers/modalSlice';
import { store } from '../redux/store';
import { getStorage, setStorage } from './AsyncStorageUtils';
import { requestPostNotificationsPermission } from './FirebaseMessagingService';
import { handleError } from './HandleError';
import { MqttUtils } from './MqttUtils';
import { USER_TYPE } from './chat/ChatMapper';
import ChatUtils from './chat/ChatUtils';
import SqlLite from './SqlLite/SqlLite';
import quillCss from '../common/constants/quillCss';
const emojiRegex = require('emoji-regex');
const Utils = {
  // 이메일 체크
  hideEmail(email) {
    const atIndex = email.indexOf('@');
    const [username, domain] = email.split('@');

    const usernameEnd = Math.max(username.length - 3, 1);
    const hiddenUsername = `${username.slice(0, usernameEnd)}${'*'.repeat(
      Math.max(username.length - usernameEnd, 0),
    )}`;
    const spIndex = domain.indexOf('@');
    const dotIndex = domain.indexOf('.');
    const charsCountBetweenAtAndDot = dotIndex - (spIndex + 0);
    const domainStart = Math.min(
      spIndex + charsCountBetweenAtAndDot,
      domain.length,
    );
    const hiddenDomain = `${domain.slice(0, spIndex + 2)}${'*'.repeat(
      Math.max(domainStart - spIndex - 1, 0),
    )}${domain.slice(domainStart)}`;

    return `${hiddenUsername}@${hiddenDomain}`;
  },
  // 숫자 제외 제거
  onlyNumber(str) {
    let result = null;
    if (str) {
      result = str.replace(/[^0-9]/g, '');
    }
    return result;
  },
  onlyNumberOrDot(numberIncludeStr) {
    let result = null;
    if (numberIncludeStr) {
      result = numberIncludeStr.replace(/[^0-9.]/g, '');
    }
    return result;
  },
  getUserInfo: async () => {
    try {
      const { accessToken } = store.getState().auth;
      if (!accessToken) return null;
      // eslint-disable-next-line no-shadow
      const { auth, id } = await decodeToken(accessToken);
      return { auth, id };
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // 인풋 입력숫자 콤마표기
  changeNumberComma: (str, canLastDot, sign) => {
    // null 또는 undefined의 경우
    if (str === null || str === undefined) {
      return '';
    }

    // 숫자 '0'의 경우
    if (str === '0') {
      return 0;
    }
    // eslint-disable-next-line no-param-reassign
    str = `${str}`;
    let minus = false;
    if (sign) {
      if (str.includes('-')) minus = true;
      // eslint-disable-next-line no-param-reassign
      str = str.replace(/[-,+]/g, '');
    }

    // 숫자만 있는 경우 (ex. '1234' 또는 '1234.234')
    if (!canLastDot) {
      if (Utils.isNumber(str)) {
        const [integerPart, fractionPart] = String(str).split('.');
        const integerWithComma = integerPart.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ',',
        );
        let text = fractionPart
          ? `${integerWithComma}.${fractionPart}`
          : integerWithComma;

        if (sign) {
          text = minus ? `-${text}` : `+${text}`;
        }
        return text;
      }
    } else if (/^[0-9.]+$/.test(str)) {
      const [integerPart, fractionPart] = String(str).split('.');
      const integerWithComma = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ',',
      );
      let text =
        String(str).indexOf('.') > -1
          ? `${integerWithComma}.${fractionPart ?? ''}`
          : integerWithComma;

      if (sign) {
        text = minus ? `-${text}` : `+${text}`;
      }
      return text;
    }

    // 그 외의 경우 (숫자가 아닌 경우)
    return '';
  },
  // 숫자 콤마제거, 소수점 3자리까지
  removeComma: str => {
    const result = str.toString().replace(/,/g, '').toLocaleString(undefined, {
      maximumFractionDigits: 3,
    });
    return result;
  },

  calculateRowNumber: (totalCnt, page, size, i) => {
    return totalCnt - (page - 1) * size - i;
  },
  byteCheck: (value, maxByte) => {
    const textVal = value; // 입력한 문자
    const textLen = value.length; // 입력한 문자수
    let totalByte = 0;
    for (let i = 0; i < textLen; i += 1) {
      const eachChar = textVal.charAt(i);
      const uniChar = escape(eachChar); // 유니코드 형식으로 변환
      if (uniChar.length > 4) {
        // 한글 : 2Byte
        totalByte += 2;
      } else {
        // 영문,숫자,특수문자 : 1Byte
        totalByte += 1;
      }
    }
    return maxByte >= totalByte;
  },
  isInteger: value => {
    if (typeof value === 'number' || typeof value === 'string') {
      if (value) {
        return /^\d+$/.test(value);
      }
      return true;
    }
    return false;
  },
  isNumber: value => {
    const regex = /^\d+(\.\d+)?$/;
    return regex.test(value);
  },

  /**
   * 정수형 문자열을 반환
   */
  changeIntegerString(string) {
    let str = string;
    str += '';
    // 숫자 제외 문자열 제거
    str = str.replace(/[^0-9]/g, '');

    // 시작 부분 연속된 "0" 제거
    if (/[1-9]/.test(str)) {
      str = str.replace(/^0+/, '');
    }
    if (/^0+/.test(str)) {
      str = '0';
    }

    // if (str === '' || str === null) {
    //   str = '0';
    // }

    return str;
  },

  changeIntegerForInput(numberStr) {
    let value = Utils.onlyNumber(`${numberStr}`);
    value = Utils.changeIntegerString(value);
    return value;
  },

  /**
   * 소수를 입력 받는 input을 위해 입력값을 소수 형태로 바꿔준다.
   * @param numberStr :: input 입력 값
   * @param commas :: comma 추가 여부
   */
  changeDecimalForInput(numberStr, fraction) {
    // sell mode 코인으로 선택시 최수 운용 금액 설정 :: 최소 운용 금액 = 평균 매수가 * 코인 수량
    const value = Utils.onlyNumberOrDot(`${numberStr}`);

    // value 설정
    let valueStr = `${value}`;
    if (!valueStr) return '';
    const isAllZero = /^0+$/.test(valueStr);
    if (isAllZero) {
      valueStr = '0';
    }
    const count = (valueStr.match(/\./g) || []).length;

    if (count === 0) {
      return Utils.changeIntegerString(valueStr);
    }

    if (count === 1) {
      if (valueStr === '.') {
        return '0.';
      }
      const splitValue = valueStr.split('.');

      if (splitValue[1]) {
        const endIndex = fraction ?? splitValue[1].length;
        splitValue[1] = splitValue[1].substring(0, endIndex);
      }

      return `${Utils.changeIntegerString(splitValue[0])}.${splitValue[1]}`;
    }
    if (count > 1) {
      return '';
    }
    return '';
  },
  chkEmail(email) {
    const emailRegx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return !!emailRegx.test(email);
  },
  chkPw(pw) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[~`!@#$%\\/^&*()-+=])(?!.*\s).{8,}$/;
    return regex.test(pw);
  },
  async alert({ title = '', message = '', onDone, cancelButton, onCancel }) {
    try {
      // const translation = await getTranslation();
      const buttons = [
        {
          text: '확인',
          onPress: () => {
            if (onDone) onDone();
          },
        },
      ];

      if (cancelButton) {
        buttons.unshift({
          text: '취소',
          style: 'cancel',
          onPress: () => {
            if (onCancel) onCancel();
          },
        });
      }

      Alert.alert(title, message, buttons, { cancelable: false });
    } catch (error) {
      handleError(error);
    }
  },
  getLevelIcon: (level, size) => {
    return SPIcons[`icLevel${level}`];
  },
  removeBlank: text => {
    if (!`${text}`) return '';
    return `${text}`.replace(/\s/g, '');
  },
  // 19961104 -> 1996.11.04
  formatDateString(date) {
    if (!date) return '';
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}-${month}-${day}`;
  },
  // 전화번호 포멧팅 ( 010XXXXYYYY > 010-XXXX-YYYY )
  addHypenToPhoneNumber: value => {
    const phoneNum = value || '';
    if (phoneNum.length === 11) {
      const formattedNumber = `${phoneNum.slice(0, 3)}-${phoneNum.slice(
        3,
        7,
      )}-${phoneNum.slice(7)}`;
      return formattedNumber;
    }
    return phoneNum;
  },
  addHypenToBusinessNumber: value => {
    const businessNum = value || '';
    if (businessNum.length === 10) {
      const formattedNumber = `${businessNum.slice(0, 3)}-${businessNum.slice(
        3,
        5,
      )}-${businessNum.slice(5)}`;
      return formattedNumber;
    }
    return businessNum;
  },
  // UTC -> Local Time
  convertUtcToLocalDate(utcTimeStr) {
    if (!utcTimeStr) return '';
    const date = new Date(utcTimeStr);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate;
  },
  // UTC -> Local Time -> string
  convertUtcToLocalDateToString(utcTimeStr, formatStr = 'yyyy.MM.DD HH:mm:ss') {
    if (!utcTimeStr) return '';
    const date = new Date(utcTimeStr);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return moment(localDate).format(formatStr);
  },
  // Local Time -> UTC
  convertLocalToUtcDate(localTimeStr) {
    if (!localTimeStr) return '';
    const date = new Date(localTimeStr);
    const offset = date.getTimezoneOffset() * 60000;
    const utcDate = new Date(date.getTime() + offset);
    return utcDate;
  },
  // Local Time -> UTC -> string
  convertLocalToUtcDateToString(
    localTimeStr,
    formatStr = 'yyyy.MM.DD HH:mm:ss',
  ) {
    if (!localTimeStr) return '';
    const date = new Date(localTimeStr);
    const offset = date.getTimezoneOffset() * 60000;
    const utcDate = new Date(date.getTime() + offset);
    return moment(utcDate).format(formatStr);
  },
  async getDeviceInfo() {
    try {
      const os = await DeviceInfo.getSystemName();
      const osVersion = await DeviceInfo.getSystemVersion();
      const appVersion = await DeviceInfo.getVersion();
      const uniqueId = await DeviceInfo.getUniqueId();
      const deviceModel = await DeviceInfo.getModel();

      let osName = os.toUpperCase();
      if (os.toUpperCase() === 'ANDROID') {
        osName = 'AOS';
      } else if (os.toUpperCase() === 'IOS') {
        osName = 'IOS';
      } else {
        osName = 'ETC';
      }

      return {
        os,
        deviceType: osName,
        osVersion,
        appVersion,
        deviceId: uniqueId,
        deviceModel,
      };
    } catch (error) {
      return false;
    }
  },
  async getDeviceId() {
    const uniqueId = await DeviceInfo.getUniqueId();
    return uniqueId;
  },
  async getDeviceOs() {
    const os = await DeviceInfo.getSystemName();
    return os;
  },
  copyToClipboard: async text => {
    try {
      Clipboard.setString(text);
      SPToast.show({ text: '클립보드에 복사되었습니다.' });
      // const translation = await getTranslation();
      // SPToast.show({ text: translation.copyToClipboard });
    } catch (error) {
      try {
        // const translation = await getTranslation();
        handleError(new CustomException('클립보드에 복사하기가 실패했습니다.'));
        // handleError(new CustomException(translation.failCopyToClipboard));
      } catch (err) {
        handleError(err);
      }
    }
  },
  getTextInClipboard: async () => {
    try {
      const text = await Clipboard.getString();
      return text;
    } catch (error) {
      try {
        handleError(new CustomException('클립보드에 복사하기가 실패했습니다.'));
      } catch (err) {
        handleError(err);
      }
    }
  },
  googleSignout: async () => {
    try {
      const googleLogin = await Utils.checkGoogleLoggedIn();
      if (googleLogin) {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error(error);
    }
  },
  checkGoogleLoggedIn: async () => {
    return new Promise((resolve, reject) => {
      auth().onAuthStateChanged(user => {
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  },
  openInstagram: async url => {
    if (!url) return;
    if (
      !url.toLowerCase().startsWith('http://www.instagram.com') &&
      !url.toLowerCase().startsWith('https://www.instagram.com')
    ) {
      return;
    }

    try {
      const isInstagramInstalled = await Linking.openURL(url); // 앱 URL을 열 수 있는지 확인
      if (isInstagramInstalled) {
        Linking.openURL(url);
      }
    } catch (error) {
      handleError(error);
    }
  },
  addDistanceUnit: distance => {
    // km 단위가 들어올 때 1보다 작을 경우 m 단위로 변환하며 소수점 1자리까지로 표시
    // 1보다 클 경우 소수점 3자리까지 표시
    if (!distance) return '';

    if (distance < 1) {
      return `${Number(`${(distance * 1000).toFixed(1)}`)}m`;
    }
    return `${Number(`${distance.toFixed(2)}`)}km`;
  },
  login: async (data = {}) => {
    try {
      await ChatUtils.createChatTable();
      await SqlLite.createNotification();
      const mqttClientId = new Date().getTime();
      // eslint-disable-next-line no-param-reassign
      data.mqttClientId = mqttClientId;
      store.dispatch(authAction.setAuth(data));
      // 채팅 리스트 조회 및 추가
      await ChatUtils.getRoomListAndInsertFromServer();
      // mqtt connect
      const topic = ChatUtils.getTopic(
        data.userType || USER_TYPE.MEMBER,
        data.userIdx,
      );
      MqttUtils.connect(mqttClientId, topic);

      // 알림 권한 설정 :: 최초 로그인시 확인 후 기본 알림 여부 설정
      const noFirstNotiCheck = await getStorage(
        `noFirstNotiCheck_${data.userIdx}`,
      );
      if (!noFirstNotiCheck) {
        console.log('FirstNotiCheck');
        const result = await requestPostNotificationsPermission();
        const notiObj = {};
        if (result.status !== RESULTS.GRANTED) {
          Object.keys(FCM_TYPE).forEach(key => {
            notiObj[key] = false;
          });
        } else {
          Object.keys(FCM_TYPE).forEach(key => {
            notiObj[key] = true;
          });
        }
        await setStorage(
          `notificationStates_${data.userIdx}`,
          JSON.stringify(notiObj),
        );
        await setStorage('firstNotiCheck', true);
      }
    } catch (error) {
      handleError(error);
    }
  },
  logout: async (showToast, isLeave) => {
    try {
      // await removeStorage('accessToken');
      // await removeStorage('refreshToken');
      // await removeStorage(CONSTANTS.KEY_AUTO_LOGIN);

      await Utils.googleSignout();
      LoginManager.logOut();
      // await SqlLite.deleteAll(TABLES.Notifications);

      await ChatUtils.reCreateChatTable();
      MqttUtils.disconnect();
      store.dispatch(authAction.removeAuth());
      NavigationService.reset(navName.login);
      if (isLeave) {
        setTimeout(() => {
          Utils.openModal({
            title: '성공',
            body: '정상적으로 탈퇴처리가 되셨습니다.',
          });
        }, 0);
        return;
      }
      if (showToast) {
        SPToast.show({ text: '로그아웃 되었습니다.' });
      }
    } catch (error) {
      handleError(error);
    }
  },
  isLogin: async () => {
    const accessToken = store.getState().auth?.accessToken;
    return !!accessToken;
  },
  openModal: ({
    title = '',
    body = '',
    data = {},
    confirmEvent = '',
    cancelEvent = '',
    closeEvent = '',
    pageName = '',
  }) => {
    store.dispatch(
      openModal({
        modalTitle: title,
        modalBody: body,
        confirmEvent,
        cancelEvent,
        closeEvent,
        pageName,
        data,
      }),
    );
  },
  confirmModal: () => {
    store.dispatch(confirmModal());
  },
  cancelModal: () => {
    store.dispatch(closeModal());
  },
  closeModal: () => {
    store.dispatch(closeModal());
  },
  openImagePicker: () => {
    return new Promise((resolve, reject) => {
      ImageCropPicker.openPicker({
        mediaType: 'photo',
      })
        .then(image => {
          resolve(image);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  UUIDV4: () => {
    return uuid.v4();
  },
  capitalizeFirstLetter: text => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
  getUserJoinType: async academyIdx => {
    const { isLogin } = store.getState().auth;
    if (!isLogin) {
      return JOIN_TYPE.NO_LOGIN;
    }
    try {
      const { data } = await apiGetMyInfo();
      if (data.data.academyIdx) {
        if (data.data.academyIdx === academyIdx) {
          if (data.data.academyAdmin || data.data.academyCreator) {
            // 해당 아카데미 관리자/운영자인 경우
            return JOIN_TYPE.ACADEMY_ADMIN;
          }
          if (data.data.academyMember) {
            // 해당 아카데미 회원인 경우
            return JOIN_TYPE.ACADEMY_MEMBER;
          }
          // 가입신청 대기중인 경우
          return JOIN_TYPE.ACADEMY_WAIT;
        }
        if (data.data.academyAdmin || data.data.academyCreator) {
          return JOIN_TYPE.ADMIN;
        }
        // 다른 아카데미에 가입/가입신청한 경우
        return JOIN_TYPE.JOIN_OR_WAIT;
      }
      // 어떤 아카데미에도 소속되지 않은 경우
      return JOIN_TYPE.NO_JOIN;
    } catch (error) {
      handleError(error);
    }
  },
  formatTimeAgo: unitTimeInMillis => {
    // Create a moment object for the current time
    const now = moment();

    // Create a moment object from the time passed in milliseconds
    const past = moment(unitTimeInMillis);

    // Calculate the number of seconds elapsed between the current time and the passed time
    const secondsAgo = now.diff(past, 'seconds');

    if (secondsAgo < 30) {
      return `방금`;
    }

    // If seconds < 60, return seconds ago
    if (secondsAgo < 60) {
      return `${secondsAgo}초 전`;
    }

    // Calculate the number of minutes elapsed between the two times
    const minutesAgo = now.diff(past, 'minutes');

    // If minutes < 60, return minutes ago
    if (minutesAgo < 60) {
      return `${minutesAgo}분 전`;
    }

    // Calculate the number of hours elapsed between the two times
    const hoursAgo = now.diff(past, 'hours');

    // If hours < 24, return hours ago
    if (hoursAgo < 24) {
      return `${hoursAgo}시간 전`;
    }

    // Calculate the number of days elapsed between the two times
    const daysAgo = now.diff(past, 'days');

    // If days <= 7, return days ago
    if (daysAgo <= 7) {
      return `${daysAgo}일 전`;
    }

    // If more than 7 days, return YYYY.MM.DD format
    return past.format('YYYY.MM.DD');
  },
  convertMillisecondsToFormattedDate: milliseconds => {
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(milliseconds);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = daysOfWeek[date.getDay()];

    let hours = date.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const minutes = date.getMinutes();

    return `${year}.${month}.${day}(${dayOfWeek}) ${ampm} ${hours}시 ${minutes}분`;
  },
  getLocationDelta: (lat, long, accuracy) => {
    const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
    const circumference = (40075 / 360) * 1000;

    const latDelta = accuracy * (1 / (Math.cos(lat) * circumference));
    const lonDelta = accuracy / oneDegreeOfLongitudeInMeters;

    return {
      latitude: lat,
      longitude: long,
      latitudeDelta: Math.max(0, latDelta),
      longitudeDelta: Math.max(0, lonDelta),
    };
  },
  isValidUrl: url => {
    try {
      // eslint-disable-next-line no-new
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  },
  isInstagram: instagram => {
    try {
      const urlObj = new URL(instagram);
      const HttpsInstagram = urlObj.origin === 'https://www.instagram.com';
      const HttpInstagram = urlObj.origin === 'http://www.instagram.com';
      return HttpsInstagram || HttpInstagram;
    } catch (error) {
      return false; // Invalid URL format
    }
  },
  removeSymbolAndBlank: str => {
    let text = str.replace(
      /[`~!@#$%^&*()_|₩+\-=?;:'"’”“‘,.<>\{\}\[\]\\\/]/gi,
      '',
    );
    text = text.replace(emojiRegex(), '');
    if (text.trim() === '') {
      text = text.trim();
    } else {
      text = text.replace('  ', ' ');
    }
    return text;
  },
  openOrMoveUrl: url => {
    if (!url) return;

    if (
      url?.toLowerCase()?.startsWith('http') ||
      url?.toLowerCase()?.startsWith('https')
    ) {
      Linking.canOpenURL(url).then(isGranted => {
        if (isGranted) {
          Linking.openURL(url);
        }
      });
      return;
    }
    const [type, idx] = url.split('/');

    if (type?.toLowerCase()?.startsWith('notice')) {
      NavigationService.navigate(navName.moreNoticeDetail, {
        boardIdx: idx,
      });
    } else if (type?.toLowerCase()?.startsWith('article')) {
      NavigationService.navigate(navName.moreArticleDetail, {
        boardIdx: idx,
      });
    } else if (type?.toLowerCase()?.startsWith('academy')) {
      NavigationService.navigate(navName.academyDetail, {
        academyIdx: idx,
      });
    } else if (type?.toLowerCase()?.startsWith('tournament')) {
      NavigationService.navigate(navName.tournamentDetail, {
        tournamentIdx: idx,
      });
    } else if (type?.toLowerCase()?.startsWith('match')) {
      NavigationService.navigate(navName.moreMatchDetail, {
        matchIdx: idx,
      });
    } else if (type?.toLowerCase()?.startsWith('training')) {
      NavigationService.navigate(navName.trainingDetail, { trainingIdx: idx });
    } else if (type?.toLowerCase()?.startsWith('challenge')) {
      NavigationService.navigate(navName.challengeDetail, {
        videoIdx: idx,
      });
    }
  },
  htmlWrap: contents => {
    return `<html>
    <head>
      <style>
      ${quillCss}
      </style>
    </head>
    <body>
    <div class="ql-container">
      <div class="ql-editor ql-snow">
        ${contents}
      </div>
    </div>
    </body>
    </html>`;
  },
};

export default Utils;
