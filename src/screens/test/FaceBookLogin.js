import React, { Component } from 'react';
import { View } from 'react-native';
import {
  LoginButton,
  AccessToken,
  LoginManager,
  Profile,
  GraphRequest,
} from 'react-native-fbsdk-next';

export default function FaceBookLogin() {
  const test1 = () => {
    // Attempt a login using the Facebook login dialog asking for default permissions.
    LoginManager.logInWithPermissions(['public_profile']).then(
      result => {
        if (result.isCancelled) {
          console.log('Login cancelled');
        } else {
          console.log(
            `Login success with permissions: ${result.grantedPermissions.toString()}`,
          );
        }
      },
      error => {
        console.log(`Login fail with error: ${error}`);
      },
    );
  };

  const getProfile = () => {
    Profile.getCurrentProfile().then(currentProfile => {
      if (currentProfile) {
        console.log(
          `The current logged user is: ${currentProfile.name}. His profile id is: ${currentProfile.userID}`,
        );
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LoginButton
        onLoginFinished={(error, result) => {
          if (error) {
            console.log(`login has error: ${result.error}`);
          } else if (result.isCancelled) {
            console.log('login is cancelled.');
          } else {
            AccessToken.getCurrentAccessToken().then(data => {
              console.log(data.accessToken.toString());
            });
          }
        }}
        onLogoutFinished={() => console.log('logout.')}
      />
    </View>
  );
}
