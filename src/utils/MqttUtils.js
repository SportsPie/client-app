import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MQTT_SERVER, MQTT_USER_ID, MQTT_USER_PW, SERVER_TOPIC } from '@env';

import { handleError } from './HandleError';
import { CustomException } from '../common/exceptions';

import ChatUtils from './chat/ChatUtils';
import { store } from '../redux/store';
import { chatSliceActions } from '../redux/reducers/chatSlice';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});
let client = null;
let pendingCount = 0; // 한번에 여러메시지를 받게 될 때 처리 종료를 확인하기 위한 변수
let queue = Promise.resolve();

const mqttStates = {
  CONNECTED: 'CONNECTED',
  NOT_CONNECTED: 'NOT_CONNECTED',
};
let mqttState = mqttStates.NOT_CONNECTED;

export function isMqttConnected() {
  return mqttState === mqttStates.CONNECTED;
}

function onConnect(topic) {
  console.log('onConnect:: topic', topic);
  client.subscribe(topic, { qos: 2 });
  mqttState = mqttStates.CONNECTED;
}
function onFailure(error) {
  mqttState = mqttStates.NOT_CONNECTED;
  try {
    if (
      error?.message?.includes('AMQJS0011E Invalid state already connected')
    ) {
      throw new CustomException('이미 연결되어 있습니다.');
    } else if (
      error?.message?.includes('Invalid state not connecting or connected')
    ) {
      throw new CustomException('MQTT 서버에 연결되어 있지 않습니다.');
    } else if (error?.message?.includes('Invalid state not connected')) {
      throw new CustomException('MQTT 서버에 연결되어 있지 않습니다.');
    }
    throw error;
  } catch (e) {
    console.log('mqtt onFailure :: ', e);
    // handleError(e);
  }
}

function onConnectionLost(responseObject) {
  mqttState = mqttStates.NOT_CONNECTED;
  if (responseObject.errorCode !== 0) {
    setTimeout(() => {
      console.log(`onConnectionLost:${responseObject.errorMessage}`);
      MqttUtils.reconnect();
    }, 2000);
  }
}

function onMessageArrived(message) {
  // eslint-disable-next-line no-plusplus
  pendingCount++;
  store.dispatch(chatSliceActions.setMessageTaskProcessing(true));
  queue = queue
    .then(async () => {
      const topic = message.destinationName;
      let payload = null;
      try {
        payload = JSON.parse(message.payloadString);
      } catch (parseError) {
        payload = message.payloadString;
      }

      // test용 토픽일 경우
      if (topic === '/test') {
        const state = store.getState().chat;
        store.dispatch(
          chatSliceActions.setChatList([...state.chatList, payload]),
        );
        return;
      }
      // eslint-disable-next-line no-useless-catch
      try {
        await ChatUtils.receivedMessage(payload);
      } catch (error) {
        throw error;
      }
    })
    .catch(e => {
      handleError(e);
    })
    .finally(() => {
      // eslint-disable-next-line no-plusplus
      pendingCount--;
      if (pendingCount === 0) {
        store.dispatch(chatSliceActions.setMessageTaskProcessing(false));
      }
    });
}

export const waitConnect = () => {
  onConnectionLost();
  return new Promise((resolve, reject) => {
    let count = 0;
    const interval = setInterval(() => {
      if (isMqttConnected()) {
        clearInterval(interval);
        resolve();
      }
      if (count > 10) {
        clearInterval(interval);
        reject();
      }
      // eslint-disable-next-line no-plusplus
      count++;
    }, 1000);
  });
};

export const MqttUtils = {
  connect: (clientId, topic, reconnect) => {
    // eslint-disable-next-line no-undef
    client = new Paho.MQTT.Client(MQTT_SERVER, 443, `${clientId}`);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    try {
      // 알림 표시 제한 시간 설정
      const timeId = new Date().getTime();
      if (!reconnect) {
        store.dispatch(chatSliceActions.setMessageShowMinTimeId(timeId));
      }

      // 연결
      client.connect({
        onSuccess: () => {
          onConnect(topic);
        },
        onFailure,
        userName: MQTT_USER_ID,
        password: MQTT_USER_PW,
        useSSL: true,
        cleanSession: false,
      });
    } catch (error) {
      onFailure(error);
    }
  },
  reconnect: () => {
    MqttUtils.disconnect();
    const authState = store.getState().auth;
    if (authState.isLogin) {
      const { mqttClientId } = authState;
      const topic = ChatUtils.getTopic(authState.userType, authState.userIdx);
      MqttUtils.connect(mqttClientId, topic, true);
      console.log('mqtt reconnected');
    }
  },
  send: async (topic, payload) => {
    /*
      QoS 0: 메시지는 최대 한 번만 전송됩니다. 메시지가 도착했는지 확인하지 않습니다.
      QoS 1: 메시지는 적어도 한 번 전송되는 것이 보장되지만, 여러 번 전송될 수도 있습니다.
      QoS 2: 메시지는 정확히 한 번만 전송됩니다.

      retained : 마지막 메시지를 저장해두었다가 새로운 구독자가 연결되면 바로 전달할지 여부
     */
    try {
      let message = '';
      try {
        message = JSON.stringify(payload);
      } catch (e) {
        message = payload;
      }
      await client.send(SERVER_TOPIC, message, 2, false); // topic, payload, QoS, retained
      await client.send(topic, message, 2, false); // topic, payload, QoS, retained
    } catch (error) {
      onFailure(error);
    }
  },
  sendToMultipleTopics: async (topics, payload) => {
    try {
      let message = '';
      try {
        message = JSON.stringify(payload);
      } catch (e) {
        message = payload;
      }
      await client.send(SERVER_TOPIC, message, 2, false); // topic, payload, QoS, retained
      // eslint-disable-next-line no-restricted-syntax
      for (const topic of topics) {
        // eslint-disable-next-line no-await-in-loop
        await client.send(topic, message, 2, false); // topic, payload, QoS, retained
      }
    } catch (error) {
      onFailure(error);
    }
  },
  disconnect: () => {
    try {
      if (client) {
        client.disconnect();
        client = null;
        console.log('MQTT : disconnected');
      }
    } catch (error) {
      onFailure(error);
    }
  },
  unsubscribe: topic => {
    try {
      if (client) {
        client.unsubscribe(topic);
        console.log('MQTT : unsubscribed');
      }
    } catch (error) {
      onFailure(error);
    }
  },
};
