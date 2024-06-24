// import axios from 'axios';
import React, { memo, useEffect, useRef, useState } from 'react';
import WebView from 'react-native-webview';

// APIs
import { useRoute } from '@react-navigation/native';
import { apiGetEncDataFromNice } from '../../api/RestAPI';

// Utils
import { SafeAreaView } from 'react-native-safe-area-context';
import { navName } from '../../common/constants/navName';
import { CustomException } from '../../common/exceptions';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';

function MobileAuthenticationPassword() {
  const webviewRef = useRef(null);
  const route = useRoute();
  const { userLoginId } = route.params;

  const [encData, setEncData] = useState('');

  // 본인인증 복호화 정보
  const onMessage = e => {
    try {
      const parsedData = JSON.parse(e.nativeEvent.data);

      if (parsedData?.result) {
        NavigationService.navigate(navName.resetPassword, {
          userName: parsedData.name,
          userBirth: parsedData.birthdate,
          userGender: parsedData.gender === '0' ? 'F' : 'M', // F = 여성, M = 남성
          userPhoneNo: parsedData.mobileNo,
          userLoginId,
        });
      } else {
        throw new CustomException('본인인증에 오류가 발생하였습니다.');
      }
    } catch (error) {
      if (error instanceof CustomException) {
        handleError(error);
      } else {
        handleError(new CustomException('잘못된 요청입니다.'));
      }
    }
  };

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------

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

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------

  // 본인인증 WebView 활성화
  useEffect(() => {
    apiGetNiceEncData();
  }, []);

  // --------------------------------------------------
  // [ return ]
  // --------------------------------------------------
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
          // onShouldStartLoadWithRequest={e => {
          //   console.log('onShouldStartLoadWithRequest');
          //   onShouldStartLoadWithRequest(e);
          // }}
          // onNavigationStateChange={e => {
          //   console.log('onNavigationStateChange');
          //   onShouldStartLoadWithRequest(e);
          // }}
        />
      )}
    </SafeAreaView>
  );
}

export default memo(MobileAuthenticationPassword);
