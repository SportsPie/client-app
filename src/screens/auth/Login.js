import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { apiLogin, apiPostSnsLogin } from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { LOGIN_TYPES } from '../../common/constants/loginTypes';
import { navName } from '../../common/constants/navName';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SNSButton from '../../components/SNSButton';
import SPInput from '../../components/SPInput';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { getFcmToken } from '../../utils/FirebaseMessagingService';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import SPLoading from '../../components/SPLoading';
import { SafeAreaView } from 'react-native-safe-area-context';
import Splash from '../Splash';

function Login({ noMove }) {
  /**
   * state
   */
  const navigationInited = NavigationService.getNavigationRef();
  const route = useRoute()?.params;
  const dispatch = useDispatch();
  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const [waitNavigationRef, setWaitNavigationRef] = useState(false);
  const [email, setEmail] = useState(__DEV__ ? 'test@asd.asd' : '');
  const [password, setPassword] = useState(__DEV__ ? 'a' : '');
  const trlRef = useRef({ current: { disabled: false } });
  const [loading, setLoading] = useState(false);
  const login = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      setLoading(true);
      const deviceInfo = await Utils.getDeviceInfo();
      const token = await getFcmToken();
      const params = {
        loginId: email,
        password,
        ...deviceInfo,
        fcmToken: token ?? '',
      };
      const { data } = await apiLogin(params);
      await Utils.login(data.data);

      if (!noMove) {
        if (route?.goBack) {
          NavigationService.goBack();
        } else {
          NavigationService.replace(route?.from || navName.home, route);
        }
      }
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
    trlRef.current.disabled = false;
  };

  const snsLogin = async (type, snsKey, userLoginId) => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const deviceInfo = await Utils.getDeviceInfo();
      const token = await getFcmToken();
      const params = {
        loginType: type,
        snsKey,
        userLoginId,
        ...deviceInfo,
        fcmToken: token ?? '',
      };

      const { data } = await apiPostSnsLogin(params);
      await Utils.login(data.data);

      if (!noMove) {
        NavigationService.replace(route?.from || navName.home, route);
      }
    } catch (error) {
      if (error.code === 1101) {
        NavigationService.navigate(navName.termsService, {
          loginType: type,
          snsKey,
          userLoginId,
          codeType: error.code,
        });
      } else if (error.code === 1205) {
        NavigationService.navigate(navName.termsService, {
          loginType: type,
          snsKey,
          userLoginId,
          codeType: error.code,
        });
      } else {
        handleError(error);
      }

      trlRef.current.disabled = false;
    }
  };

  const awitNavigation = async () => {
    await new Promise(resolve => {
      setTimeout(() => {
        setWaitNavigationRef(prev => !prev);
      }, 100);
    });
  };

  /**
   * useFocusEffect
   */

  useFocusEffect(
    useCallback(() => {
      if (navigationInited) {
        if (isLogin) {
          NavigationService.replace(route?.from || navName.home, route);
        }
      } else {
        awitNavigation();
      }
    }, [navigationInited, waitNavigationRef]),
  );

  if (isLogin || !navigationInited) <SPLoading />;

  return (
    <DismissKeyboard>
      {loading ? (
        <SPLoading />
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}>
            <View style={styles.logo}>
              <SPSvgs.SportPieLogo />
            </View>

            <View style={styles.inputSection}>
              {/* Email */}
              <SPInput
                placeholder="이메일을 입력하세요"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="rgba(46, 49, 53, 0.60)"
              />

              {/* Password */}
              <SPInput
                placeholder="비밀번호를 입력하세요"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="rgba(46, 49, 53, 0.60)"
              />

              <PrimaryButton
                text="로그인"
                onPress={async () => {
                  await login();
                }}
              />

              {/* Help section */}
              <View style={styles.helpSection}>
                {/* Sign up */}
                <Pressable
                  onPress={() => {
                    NavigationService.navigate(navName.termsService, {
                      loginType: 'EMAIL',
                    });
                  }}
                  style={styles.sectionButton}>
                  <Text style={styles.sectionText}>이메일 가입</Text>
                </Pressable>
                {/* Find password */}
                <Pressable
                  onPress={() => {
                    NavigationService.navigate(navName.findPassword);
                  }}
                  style={styles.sectionButton}>
                  <Text style={styles.sectionText}>비밀번호 찾기</Text>
                </Pressable>
                {/* Find ID */}
                <Pressable
                  onPress={() => {
                    NavigationService.navigate(navName.findUser);
                  }}
                  style={styles.sectionButton}>
                  <Text style={styles.sectionText}>아이디 찾기</Text>
                </Pressable>
              </View>
            </View>

            {/* SNS */}
            <View style={styles.inputSection}>
              <SNSButton type={LOGIN_TYPES.KAKAO.code} onPress={snsLogin} />
              <SNSButton type={LOGIN_TYPES.GOOGLE.code} onPress={snsLogin} />
              {Platform.OS !== 'android' && (
                <SNSButton type={LOGIN_TYPES.APPLE.code} onPress={snsLogin} />
              )}
              {/* <SNSButton type={LOGIN_TYPES.FACEBOOK.code} onPress={snsLogin} /> */}
            </View>

            {/* Guest */}
            <Pressable
              onPress={() => {
                NavigationService.replace(navName.home);
              }}
              style={[
                styles.sectionButton,
                {
                  marginVertical: 24,
                },
              ]}>
              <Text
                style={[
                  styles.sectionText,
                  {
                    fontWeight: 600,
                    color: 'rgba(46, 49, 53, 0.60)',
                  },
                ]}>
                둘러보기
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      )}
    </DismissKeyboard>
  );
}

export default memo(Login);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    paddingVertical: 56,
  },
  inputSection: {
    marginVertical: 24,
    rowGap: 8,
    width: '100%',
  },
  helpSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    // paddingVertical: 8,
  },
  sectionButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 4,
    alignItems: 'center',
  },
  sectionText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.darkBlue,
    letterSpacing: 0.203,
  },
});
