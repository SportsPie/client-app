import { Dimensions, Platform } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';

export const CONSTANTS = {
  KEY_LAUNCH: 'CM_LAUNCHED',
  GOOGLE_WEB_CLIENT_ID:
    '458305965390-nk53o1ddukli1ferhmdog3rkp2p7r6n2.apps.googleusercontent.com',
  KEY_FCM_TOKEN: 'FCM_TOKEN',
  KEY_WALLET_PIN_CODE: 'KEY_WALLET_PIN_CODE',
  DATA_CHECK_MODAL_NEVER_SHOW: 'DATA_CHECK_MODAL_NEVER_SHOW',
};

export const ACTIVE_OPACITY = 0.9;

export const ALBUM_PERMISSION_TEXT =
  Platform.OS === 'android'
    ? '설정 > 애플리케이션 > 스포츠 파이 > 권한 > 사진 및 동영상 접근 권한을 허용해주세요.'
    : '설정 > 개인정보 보호 및 보안 > 사진 > 스포츠 파이 앱에 사진 및 동영상 접근 권한을 허용해주세요.';

export const CAMERA_PERMISSION_TEXT =
  Platform.OS === 'android'
    ? '설정 > 애플리케이션 > 스포츠 파이 > 권한 > 카메라 접근 권한을 허용해주세요.'
    : '설정 > 개인정보 보호 및 보안 > 카메라 > 스포츠 파이 앱에 카메라 접근 권한을 허용해주세요.';

export const LOCATION_PERMISSION_TEXT =
  Platform.OS === 'android'
    ? '설정 > 애플리케이션 > 스포츠 파이 > 권한 > 위치 접근 권한(정확한 위치 권한 포함)을 허용해주세요.'
    : '설정 > 개인정보 보호 및 보안 > 카메라 > 스포츠 파이 앱에 위치 권한(정확한 위치 권한 포함)을 허용해주세요.';

export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';

export function isIphoneX() {
  const dimen = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    (dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.height === 896 ||
      dimen.width === 896)
  );
}

/*

  *********************** ios ************************

  // 앱 추적 투명성에 대한 권한 (앱이 사용자 데이터를 추적하고 공유하는 것을 허용하는 권한)
  APP_TRACKING_TRANSPARENCY: 'ios.permission.APP_TRACKING_TRANSPARENCY',

  // 블루투스 주변 장치에 대한 접근 권한
  BLUETOOTH_PERIPHERAL: 'ios.permission.BLUETOOTH_PERIPHERAL',

  // 캘린더 접근 권한
  CALENDARS: 'ios.permission.CALENDARS',

  // 카메라 접근 권한
  CAMERA: 'ios.permission.CAMERA',

  // 연락처 접근 권한
  CONTACTS: 'ios.permission.CONTACTS',

  // 얼굴 인식(Face ID) 권한
  FACE_ID: 'ios.permission.FACE_ID',

  // 항상 위치 정보 접근 권한
  LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',

  // 앱 사용 시 위치 정보 접근 권한
  LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',

  // 미디어 라이브러리 접근 권한
  MEDIA_LIBRARY: 'ios.permission.MEDIA_LIBRARY',

  // 마이크 접근 권한
  MICROPHONE: 'ios.permission.MICROPHONE',

  // 모션 센서(가속도계, 자이로스코프 등) 접근 권한
  MOTION: 'ios.permission.MOTION',

  // 사진 라이브러리 접근 권한
  PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',

  // 사진 라이브러리에 추가만 가능한 권한
  PHOTO_LIBRARY_ADD_ONLY: 'ios.permission.PHOTO_LIBRARY_ADD_ONLY',

  // 알림(리마인더) 접근 권한
  REMINDERS: 'ios.permission.REMINDERS',

  // Siri 사용 권한
  SIRI: 'ios.permission.SIRI',

  // 음성 인식 권한
  SPEECH_RECOGNITION: 'ios.permission.SPEECH_RECOGNITION',

  // 앱 내 구매에 대한 권한 (StoreKit 사용 권한)
  STOREKIT: 'ios.permission.STOREKIT',

  *********************** anroid ************************

  // 핸드오버를 수락할 수 있는 권한 (전화 애플리케이션이 사용)
  ACCEPT_HANDOVER: 'android.permission.ACCEPT_HANDOVER',

  // 위치 정보에 대한 백그라운드 접근 권한
  ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION',

  // 대략적인 위치 정보 접근 권한
  ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',

  // 정확한 위치 정보 접근 권한
  ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',

  // 사용자의 미디어 위치에 접근하는 권한
  ACCESS_MEDIA_LOCATION: 'android.permission.ACCESS_MEDIA_LOCATION',

  // 사용자의 활동을 인식하는 권한 (예: 걷기, 자전거 타기 등)
  ACTIVITY_RECOGNITION: 'android.permission.ACTIVITY_RECOGNITION',

  // 보이스메일을 추가하는 권한
  ADD_VOICEMAIL: 'com.android.voicemail.permission.ADD_VOICEMAIL',

  // 전화를 받는 권한
  ANSWER_PHONE_CALLS: 'android.permission.ANSWER_PHONE_CALLS',

  // 블루투스 광고를 위한 권한
  BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',

  // 블루투스 연결 권한
  BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',

  // 블루투스 스캔 권한
  BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',

  // 신체 센서(예: 심박수 측정 장치) 접근 권한
  BODY_SENSORS: 'android.permission.BODY_SENSORS',

  // 백그라운드에서 신체 센서 접근 권한
  BODY_SENSORS_BACKGROUND: 'android.permission.BODY_SENSORS_BACKGROUND',

  // 전화를 걸 권한
  CALL_PHONE: 'android.permission.CALL_PHONE',

  // 카메라 접근 권한
  CAMERA: 'android.permission.CAMERA',

  // 사용자 계정 정보 접근 권한
  GET_ACCOUNTS: 'android.permission.GET_ACCOUNTS',

  // 주변 WiFi 기기 검색 권한
  NEARBY_WIFI_DEVICES: 'android.permission.NEARBY_WIFI_DEVICES',

  // 알림 게시 권한
  POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',

  // 전화 걸기 프로세스 권한
  PROCESS_OUTGOING_CALLS: 'android.permission.PROCESS_OUTGOING_CALLS',

  // 캘린더 읽기 권한
  READ_CALENDAR: 'android.permission.READ_CALENDAR',

  // 통화 기록 읽기 권한
  READ_CALL_LOG: 'android.permission.READ_CALL_LOG',

  // 연락처 읽기 권한
  READ_CONTACTS: 'android.permission.READ_CONTACTS',

  // 외부 저장소에서 파일 읽기 권한
  READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',

  // 오디오 미디어 파일 읽기 권한
  READ_MEDIA_AUDIO: 'android.permission.READ_MEDIA_AUDIO',

  // 이미지 미디어 파일 읽기 권한
  READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',

  // 비디오 미디어 파일 읽기 권한
  READ_MEDIA_VIDEO: 'android.permission.READ_MEDIA_VIDEO',

  // 전화번호 읽기 권한
  READ_PHONE_NUMBERS: 'android.permission.READ_PHONE_NUMBERS',

  // 전화 상태 읽기 권한
  READ_PHONE_STATE: 'android.permission.READ_PHONE_STATE',

  // SMS 읽기 권한
  READ_SMS: 'android.permission.READ_SMS',

  // MMS 수신 권한
  RECEIVE_MMS: 'android.permission.RECEIVE_MMS',

  // SMS 수신 권한
  RECEIVE_SMS: 'android.permission.RECEIVE_SMS',

  // WAP 푸시 메시지 수신 권한
  RECEIVE_WAP_PUSH: 'android.permission.RECEIVE_WAP_PUSH',

  // 오디오 녹음 권한
  RECORD_AUDIO: 'android.permission.RECORD_AUDIO',

  // SMS 전송 권한
  SEND_SMS: 'android.permission.SEND_SMS',

  // SIP(인터넷 전화) 사용 권한
  USE_SIP: 'android.permission.USE_SIP',

  // UWB(초광대역) 거리 측정 권한
  UWB_RANGING: 'android.permission.UWB_RANGING',

  // 캘린더 쓰기 권한
  WRITE_CALENDAR: 'android.permission.WRITE_CALENDAR',

  // 통화 기록 쓰기 권한
  WRITE_CALL_LOG: 'android.permission.WRITE_CALL_LOG',

  // 연락처 쓰기 권한
  WRITE_CONTACTS: 'android.permission.WRITE_CONTACTS',

  // 외부 저장소에 파일 쓰기 권한
  WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',

*/
