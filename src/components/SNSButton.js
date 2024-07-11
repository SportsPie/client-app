import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { SPSvgs } from '../assets/svg';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import { LOGIN_TYPES } from '../common/constants/loginTypes';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { ACTIVE_OPACITY, CONSTANTS } from '../common/constants/constants';
import Utils from '../utils/Utils';
import auth from '@react-native-firebase/auth';
import { getProfile, login } from '@react-native-seoul/kakao-login';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { apiPostAuthAppleInfo } from '../api/RestAPI';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  LoginManager,
  AccessToken,
  Profile,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk-next';
import { CustomException } from '../common/exceptions';

function SNSButton({ type, onPress }) {
  const trlRef = useRef({ current: { disabled: false } });
  const renderButtonText = useMemo(() => {
    switch (type) {
      case LOGIN_TYPES.KAKAO.code:
        return '카카오로 로그인';
      case LOGIN_TYPES.APPLE.code:
        return 'Apple로 로그인';
      case LOGIN_TYPES.GOOGLE.code:
        return 'Google로 로그인';
      case LOGIN_TYPES.FACEBOOK.code:
        return 'Facebook으로 로그인';
      default:
        break;
    }
  }, [type]);

  const renderIcon = useMemo(() => {
    switch (type) {
      case LOGIN_TYPES.KAKAO.code:
        return <SPSvgs.KakaoTalk width={18} height={18} />;
      case LOGIN_TYPES.APPLE.code:
        return <SPSvgs.Apple width={18} height={18} />;
      case LOGIN_TYPES.GOOGLE.code:
        return <SPSvgs.Google width={18} height={18} />;
      case LOGIN_TYPES.FACEBOOK.code:
        return <SPSvgs.Facebook width={18} height={18} />;
      default:
        break;
    }
  }, [type]);

  const backgroundValue = useMemo(() => {
    switch (type) {
      case LOGIN_TYPES.KAKAO.code:
        return COLORS.kakaoTalk;
      case LOGIN_TYPES.APPLE.code:
      case LOGIN_TYPES.GOOGLE.code:
        return COLORS.white;
      case LOGIN_TYPES.FACEBOOK.code:
        return COLORS.facebook;
      default:
        break;
    }
  }, [type]);

  const borderColorvalue = useMemo(() => {
    switch (type) {
      case LOGIN_TYPES.KAKAO.code:
        return COLORS.kakaoTalk;
      case LOGIN_TYPES.APPLE.code:
        return COLORS.black;
      case LOGIN_TYPES.GOOGLE.code:
        return '#747775';
      case LOGIN_TYPES.FACEBOOK.code:
        return COLORS.facebook;
      default:
        break;
    }
  }, [type]);

  const textColorValue = useMemo(() => {
    switch (type) {
      case LOGIN_TYPES.FACEBOOK.code:
        return COLORS.white;
      case LOGIN_TYPES.KAKAO.code:
      case LOGIN_TYPES.APPLE.code:
      case LOGIN_TYPES.GOOGLE.code:
        return COLORS.labelNormal;
      default:
        break;
    }
  }, [type]);

  const googleLogin = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const user = await GoogleSignin.signIn();
      // setUserInfo(user);

      const { idToken } = user || {};
      // console.log('idToekn : ', idToken);

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const res = await auth().signInWithCredential(googleCredential);

      if (
        res.user.email &&
        res.user.displayName &&
        res.additionalUserInfo.profile.sub
      ) {
        onPress(type, res.additionalUserInfo.profile.sub, res.user.email);
      } else {
        Utils.openModal({
          title: '에러',
          body: '확인되지 않은 오류입니다. 잠시 후 다시 시도해주세요.',
        });
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log('user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
        console.log('operation (f.e. sign in) is in progress already');
        Utils.openModal({
          title: '에러',
          body: '확인되지 않은 오류입니다. 잠시 후 다시 시도해주세요.',
        });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        console.log('play services not available or outdated');
        Utils.openModal({
          title: '에러',
          body: '확인되지 않은 오류입니다. 잠시 후 다시 시도해주세요.',
        });
      } else {
        // some other error happened
        // console.log('login error :: ', error);
        Utils.openModal({
          title: '에러',
          body: '확인되지 않은 오류입니다. 잠시 후 다시 시도해주세요.',
        });
      }
    }
    trlRef.current.disabled = false;
  };

  const kakaoLogin = async () => {
    try {
      const token = await login();
      const profile = await getProfile();
      onPress(type, profile.id, profile.email);
    } catch (error) {
      // Utils.openModal({
      //   title: '에러',
      //   body: '확인되지 않은 오류입니다. 잠시 후 다시 시도해주세요.',
      // });
      console.info(error);
    }
  };

  const appleLogin = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const params = {
        identityToken: appleAuthRequestResponse.identityToken,
      };
      const { data } = await apiPostAuthAppleInfo(params);
      onPress(type, data.data.snsKey, data.data.email);
    } catch (error) {
      // Utils.openModal({
      //   title: '에러',
      //   body: '확인되지 않은 오류입니다. 잠시 후 다시 시도해주세요.',
      // });
    }
  };

  const getEmail = accessToken => {
    return new Promise((resolve, reject) => {
      const infoRequest = new GraphRequest(
        '/me',
        {
          accessToken,
          parameters: {
            fields: {
              string: 'email',
            },
          },
        },
        (error, result) => {
          if (error) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(`Error fetching data: ${error.toString()}`);
          } else {
            resolve(result.email);
          }
        },
      );

      new GraphRequestManager().addRequest(infoRequest).start();
    });
  };

  const faceBookLogin = async () => {
    try {
      // TODO :: 추후 페이스북 콘솔에서 앱 검토 완료 후 준비중 메시지 제거 필요
      if (true) {
        Utils.openModal({
          title: '준비중',
          body: '현재 기능을 준비중입니다.',
        });
        return;
      }
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        console.log('User cancelled the login process');
        return;
      }

      // Once signed in, get the users AccesToken
      const data = await AccessToken.getCurrentAccessToken();
      // const profile = await Profile.getCurrentProfile();
      if (data) {
        const email = await getEmail(data.accessToken);
        if (email) {
          onPress(type, data.userID, email);
        } else {
          throw new CustomException('이메일 정보를 가져오지 못했습니다.');
        }
      } else {
        throw new CustomException('유저 정보를 가져오지 못했습니다.');
      }
    } catch (error) {
      // Utils.openModal({
      //   title: '에러',
      //   body: '확인되지 않은 오류입니다. 잠시 후 다시 시도해주세요.',
      // });
    }
  };

  const handlePress = () => {
    switch (type) {
      case LOGIN_TYPES.FACEBOOK.code:
        faceBookLogin();
        break;
      case LOGIN_TYPES.KAKAO.code:
        kakaoLogin();
        break;
      case LOGIN_TYPES.APPLE.code:
        appleLogin();
        break;
      case LOGIN_TYPES.GOOGLE.code:
        googleLogin();
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: CONSTANTS.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: backgroundValue,
          borderColor: borderColorvalue,
        },
      ]}
      onPress={e => {
        handlePress();
      }}
      activeOpacity={ACTIVE_OPACITY}>
      {renderIcon}
      <Text
        style={[
          styles.buttonText,
          {
            color: textColorValue,
          },
        ]}>
        {renderButtonText}
      </Text>
    </TouchableOpacity>
  );
}

export default memo(SNSButton);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    columnGap: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonText: {
    ...fontStyles.fontSize16_Medium,
    letterSpacing: 0.091,
  },
});
