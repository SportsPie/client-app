import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { apiTestLogin } from '../../../api/RestAPI';
import { navName } from '../../../common/constants/navName';
import SPHeader from '../../../components/SPHeader';
import NavigationService from '../../../navigation/NavigationService';
import { getFcmToken } from '../../../utils/FirebaseMessagingService';
import { handleError } from '../../../utils/HandleError';
import Utils from '../../../utils/Utils';

export default function ChatTest() {
  const authState = useSelector(selector => selector.auth);
  const [id, setId] = useState('');

  const login = async () => {
    try {
      if (!id) {
        alert('id를 입력해주세요');
        return;
      }
      // mqtt connection
      const { data } = await apiTestLogin({ id });
      await Utils.login(data.data);
    } catch (error) {
      handleError(error);
    }
  };
  const logout = async () => {
    await Utils.logout();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SPHeader title="chatTest" leftButtonMoveName={navName.home} />

      <Text>userIdx : {authState.userIdx}</Text>
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Text>MY ID : </Text>
        <TextInput
          style={{
            padding: 0,
            margin: 10,
            width: 100,
            height: 20,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'black',
            color: 'black',
          }}
          value={id}
          onChangeText={text => {
            if (text) {
              if (/^\d+$/.test(text)) setId(text);
            } else {
              setId(text);
            }
          }}
          placeholder="id : only number"
        />
      </View>
      <Button title="로그인" onPress={login} />
      <Button title="로그아웃" onPress={logout} />
      <Button
        title="채팅 룸으로 이동"
        onPress={() => {
          NavigationService.navigate(navName.chatRoomList);
        }}
      />
      <Button
        title="get fcm token"
        onPress={() => {
          getFcmToken();
        }}
      />
    </SafeAreaView>
  );
}
