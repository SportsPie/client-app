import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform, AppState } from 'react-native';
import {
  checkNotifications,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import { CONSTANTS } from '../common/constants/constants';
import { getStorage, setStorage } from './AsyncStorageUtils';

import { store } from '../redux/store';
import { chatSliceActions } from '../redux/reducers/chatSlice';
import { handleError } from './HandleError';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FCM_TYPE } from '../common/constants/fcmType';
import notificationUtils from './notification/NotificationUtils';
import { MqttUtils } from './MqttUtils';
import { waitForReduxState } from '../redux/store/store';
import NavigationService from '../navigation/NavigationService';
import { navName } from '../common/constants/navName';

// 앱 초기화 코드에 로컬 알림 설정
PushNotification.configure({
  // 알림을 클릭했을 때 호출될 함수
  onNotification: notification => {
    if (notification.userInteraction) {
      try {
        // 알림을 클릭했을 때만 동작하도록 조건 추가
        console.log('Notification clicked:', notification);
        if (notification?.data?.roomId) {
          store.dispatch(
            chatSliceActions.setMoveRoomId(notification.data.roomId),
          );
          NavigationService.navigate(navName.matchingChatRoomScreen, {
            roomId: notification?.data?.roomId,
          });
        }
      } catch (error) {
        console.log('error', error);
      }
    }
  },
  // Android 전용 옵션
  popInitialNotification: false,
  requestPermissions: true,

  // IOS only
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
});

/**
 * 플랫폼(iOS 또는 Android)에 따라 알림 권한 체크
 */

export const checkNotificationPermission = async () => {
  switch (Platform.OS) {
    case 'ios':
      return requestPostNotificationsPermissionIos();
    case 'android':
      return requestPostNotificationsPermissionAndroid();
    default:
      return null;
  }
};

/**
 * 플랫폼(iOS 또는 Android)에 따라 알림 권한 요청
 */
export const requestPostNotificationsPermission = async () => {
  switch (Platform.OS) {
    case 'ios':
      return requestPostNotificationsPermissionIos();
    case 'android':
      return requestPostNotificationsPermissionAndroid();
    default:
      return null;
  }
};

/**
 * iOS를 위한 알림 권한 요청
 * 권한이 허가되면, FCM 토큰을 가져옴
 */
export const requestPostNotificationsPermissionIos = async () => {
  // eslint-disable-next-line no-useless-catch
  try {
    const authStatus = await messaging().requestPermission();
    return `${authStatus}` === `1`
      ? { status: RESULTS.GRANTED }
      : { status: RESULTS.DENIED };
  } catch (error) {
    throw error;
  }
};

/**
 * Android를 위한 알림 권한 요청
 * 권한이 허가되면, FCM 토큰을 가져옴
 */
const requestPostNotificationsPermissionAndroid = async () => {
  try {
    // POST_NOTIFICATIONS 권한이 이미 허가되었는지 확인
    const notificationStatus = await checkNotifications();
    console.log('notificationStatus :: ', notificationStatus);

    // 이미 허가되었다면, 함수를 종료
    if (notificationStatus.status === RESULTS.GRANTED) {
      console.log('이미 PostNotifications 권한이 허가되었습니다.');
      return notificationStatus;
    }

    // 권한이 허가되지 않았다면, 사용자에게 권한을 요청
    const granted = await requestNotifications(['alert', 'sound']);

    // 사용자가 권한을 허가했다면, 허가되었다는 메시지 출력
    if (granted.status !== RESULTS.GRANTED) {
      console.log('PostNotifications 권한이 거부되었습니다.');
    }
    return notificationStatus;
  } catch (err) {
    // 오류가 발생하면 오류 메시지 출력
    console.warn(err);
  }
  return null;
};

/**
 * FCM 토큰을 가져옴
 */
export const getFcmToken = async () => {
  try {
    const authStatus = await messaging().hasPermission();
    if (!authStatus) {
      return false;
    }
    const token = await messaging().getToken();
    if (token) {
      console.log('Fcm token ::', token, ' OS :: ', Platform.OS);
      return token;
    }
    return false;
  } catch (error) {
    console.log('getFcmToken error :: ', error, ' OS :: ', Platform.OS);
    return false;
  }
};

/**
 * Foreground 상태에서의 메시지 처리
 */
export const registerForegroundHandler = async () => {
  messaging().onMessage(async remoteMessage => {
    console.log(
      'remoteMessage foreground :: ',
      remoteMessage,
      ' OS :: ',
      Platform.OS,
    );
    if (remoteMessage) {
      const type = remoteMessage?.data?.type;
      if (!type || type !== FCM_TYPE.CHAT) {
        const authState = store.getState().auth;
        const userWant = await pushNotifPermissionCheck(remoteMessage);
        if (userWant && authState.isLogin) {
          notificationUtils.receivedNotification(remoteMessage);
          pushNotif(remoteMessage);
        }
      }
    }
  });
};

/**
 * 백그라운드(종료)에서 메시지 처리.
 * 앱이 백그라운드 상태일 때 FCM(Firebase Cloud Messaging)으로부터 메시지를 받으면 호출.
 */
export const registerBackgroundMessageHandler = async () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log(
      'remoteMessage background :: ',
      remoteMessage,
      ' OS :: ',
      Platform.OS,
    );
    if (remoteMessage) {
      await waitForReduxState();
      const type = remoteMessage?.data?.type;
      const authState = store.getState().auth;
      const userWant = await pushNotifPermissionCheck(remoteMessage);
      const appState = AppState.currentState;
      if (!type || type !== FCM_TYPE.CHAT) {
        if (userWant && authState.isLogin) {
          notificationUtils.receivedNotification(remoteMessage);
          pushNotif(remoteMessage);
        }
      } else if (appState === 'background' || appState === 'inactive') {
        if (userWant && authState.isLogin) {
          MqttUtils.reconnect();
        }
      }
    }
  });
};

/**
 * 앱이 백그라운드 상태에서 포그라운드로 넘어갈 때(사용자가 알림을 클릭) 혹은
 * 앱이 완전히 종료된 상태에서 알림 클릭을 통해 열릴 때 호출.
 */
export const registerBackgroundAndQuitStateHandler = async () => {
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open:',
          remoteMessage,
          ' OS :: ',
          Platform.OS,
        );
        if (remoteMessage.data.roomId) {
          setTimeout(() => {
            store.dispatch(
              chatSliceActions.setMoveRoomId(remoteMessage.data.roomId),
            );
          }, 0);
        }
      }
    });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage,
      ' OS :: ',
      Platform.OS,
    );
  });
};

export const pushNotifPermissionCheck = async message => {
  try {
    const authState = store.getState().auth;
    if (!authState.isLogin) return;
    const storedNotificationStates = await AsyncStorage.getItem(
      `notificationStates_${authState.userIdx}`,
    );
    let type = message?.data?.type;
    const userNotiPermissions = JSON.parse(storedNotificationStates);

    // 채팅은 경기 활동 알림에 종속된다.
    if (type === FCM_TYPE.CHAT) {
      type = FCM_TYPE.MATCH;
    }
    if (userNotiPermissions?.[type]) {
      return userNotiPermissions[type];
    }
    return false;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * 로컬 알림 생성
 * channelId : 알림 채널의 고유 아이디를 지정합니다. 이 값은 필수입니다.
 * channelName : 사용자에게 보여질 채널의 이름입니다. 이 값도 필수입니다.
 * channelDescription : 사용자에게 보여질 채널의 설명입니다. 선택 사항이며 기본값은 undefined입니다.
 * importance : 알림의 중요도를 설정합니다. 선택 사항이며 기본값은 4입니다. 이 값은 Android의 NotificationManager 클래스에 정의된 상수들을 사용합니다 (0 ~ 5 범위, 5가 가장 높음).
 * vibrate : 이 채널의 알림이 기기를 진동시킬지 여부를 설정합니다. 선택 사항이며 기본값은 true입니다.
 */

export const pushNotif = async message => {
  console.log('message :: ', message);
  let pushAuthStatus = null;
  try {
    pushAuthStatus = await messaging().hasPermission();
  } catch (error) {
    console.log('pushNotif error', error);
  }

  if (!pushAuthStatus) return;

  // const { title } = message.notification;
  // const { body } = message.notification;
  const title = message?.data?.title;
  const body = message?.data?.body;
  PushNotification.createChannel(
    {
      channelId: 'specialid', // (required)
      channelName: 'Special messasge', // (required)
      channelDescription: 'Notification for special message', // (optional) default: undefined.
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
    },
    //   created => console.log(`createChannel  '${created}'returned`), // (optional) callback returns whether the channel was created, false means it already existed.
  );

  PushNotification.localNotification({
    channelId: 'specialid', // this must be same with channelid in createchannel
    title,
    message: body,
    data: message.data,
    userInfo: message.data,
    playSound: true, // (optional) default: true
    soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
  });
};

export const onTokenRefresh = () => {
  messaging().onTokenRefresh(token => {
    console.log('refreshToken', token);
    setStorage(CONSTANTS.KEY_FCM_TOKEN, token);
  });
};
