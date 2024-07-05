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
  const { loginType, snsKey, userLoginId, codeType, isMarketingAgree } =
    route.params;

  const onMessage = async e => {
    const parsedData = JSON.parse(e.nativeEvent.data);
    if (parsedData?.result) {
      let params;
      if (loginType === 'EMAIL') {
        params = {
          userName: parsedData.name,
          userBirth: parsedData.birthdate,
          userGender: parsedData.gender === '0' ? 'F' : 'M',
          userPhoneNo: parsedData.mobileNo,
        };
      } else {
        params = {
          userName: parsedData.name,
          userBirth: parsedData.birthdate,
          userGender: parsedData.gender === '0' ? 'F' : 'M',
          userPhoneNo: parsedData.mobileNo,
        };
      }
      try {
        const { data } = await apiVerifyId(params);
        if (data.data !== null) {
          NavigationService.navigate(navName.alreadySign, {
            memberData: data.data,
          });
        }
      } catch (error) {
        if (error.code === 1101) {
          if (loginType === 'EMAIL') {
            params = {
              ...params,
              loginType,
              isMarketingAgree,
            };
            NavigationService.navigate(navName.inputEmail, params);
          } else {
            params = {
              ...params,
              loginType,
              snsKey,
              userLoginId,
              codeType,
              isMarketingAgree,
            };
            NavigationService.navigate(navName.userInfo, params);
          }
        } else {
          handleError(error);
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
