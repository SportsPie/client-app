import { useRoute } from '@react-navigation/native';
import React, { memo, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { apiGetEncDataFromNice, apiVerifyId } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import { CustomException } from '../../common/exceptions';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';

function MobileAuthenticationMain() {
  const webviewRef = useRef(null);
  const [encData, setEncData] = useState('');
  const route = useRoute();
  const { loginType, snsKey, userLoginId, codeType } = route.params;

  console.log('wd', loginType);
  const onMessage = async e => {
    const parsedData = JSON.parse(e.nativeEvent.data);
    console.log('개인정보', parsedData);
    try {
      if (parsedData?.result) {
        let params;
        if (loginType === 'EMAIL') {
          params = {
            userName: parsedData.name,
            userBirth: parsedData.birthdate,
            userGender: parsedData.gender === '0' ? 'F' : 'M',
            userPhoneNo: parsedData.mobileNo,
          };
          console.log('params', params);
          const memberData = await apiVerifyId(params);
          if (memberData !== null) {
            NavigationService.navigate(navName.alreadySign, { memberData });
          }
        } else {
          params = {
            userName: parsedData.name,
            userBirth: parsedData.birthdate,
            userGender: parsedData.gender === '0' ? 'F' : 'M',
            userPhoneNo: parsedData.mobileNo,
            loginType,
            snsKey,
            userLoginId,
            codeType,
          };
          NavigationService.navigate(navName.userInfo, params);
        }
      }
    } catch (error) {
      if (error instanceof CustomException) {
        handleError(error);
      } else {
        let params;
        if (loginType === 'EMAIL') {
          params = {
            userName: parsedData.name,
            userBirth: parsedData.birthdate,
            userGender: parsedData.gender === '0' ? 'F' : 'M',
            userPhoneNo: parsedData.mobileNo,
            loginType,
          };
          NavigationService.navigate(navName.inputEmail, params);
        }
      }
    }
  };
  // NICE 본인인증 요청 암호화 데이터 생성
  const apiGetNiceEncData = async () => {
    try {
      const { data } = await apiGetEncDataFromNice();

      if (data) {
        setEncData(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // 본인인증 WebView 활성화
  useEffect(() => {
    apiGetNiceEncData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      {/* 웹 뷰 - NICE 모바일 본인인증 */}
      {encData && (
        <WebView
          key={encData}
          ref={webviewRef}
          source={{
            uri: process.env.AUTH_NICE_MOBILE_MAIN,
            method: 'POST',
            body: `m=checkplusService&EncodeData=${encData}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onMessage={onMessage}
          onLoadStart={() => console.log('WebView onLoadStart')}
          onLoadEnd={() => console.log('WebView onLoadEnd')}
          onError={error => console.log('WebView onError', error)}
        />
      )}
    </SafeAreaView>
  );
}

export default memo(MobileAuthenticationMain);
