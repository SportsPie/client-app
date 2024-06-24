import React from 'react';
import { Button, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { MqttUtils } from '../../utils/MqttUtils';
import { chatSliceActions } from '../../redux/reducers/chatSlice';

let count = 0;
export default function MqttTest() {
  const dispatch = useDispatch();
  const chatState = useSelector(state => state)?.chat;

  const connect = async () => {
    const uniqueId = await DeviceInfo.getUniqueId();
    MqttUtils.connect(uniqueId, '/test');
  };

  return (
    <View>
      <Button title="connect" onPress={() => connect()} />
      <Button title="disconnect" onPress={() => MqttUtils.disconnect()} />
      <Button
        title="send"
        onPress={() => {
          count += 1;
          MqttUtils.send('/test', `test${count}`);
        }}
      />
      <Button
        title="reset"
        onPress={() => {
          dispatch(chatSliceActions.resetChatList());
        }}
      />
      <Text>{JSON.stringify(chatState.chatList)}</Text>
    </View>
  );
}
