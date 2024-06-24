import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import React, { useEffect } from 'react';
import { Button, ScrollView, Text } from 'react-native';
import { CONSTANTS } from '../../common/constants/constants';

export default function GoogleLogin({ navigation }) {
  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const user = await GoogleSignin.signIn();
      console.log(user);
      // setUserInfo(user);

      const { idToken } = user || {};
      console.log('idToekn : ', idToken);

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const res = await auth().signInWithCredential(googleCredential);
      console.log(res);
    } catch (error) {
      // some other error happened
      console.log('login error :: ', error);
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: CONSTANTS.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  return (
    <ScrollView>
      <Text>googleLogin</Text>
      <Button title="login" onPress={googleLogin} />
    </ScrollView>
  );
}
