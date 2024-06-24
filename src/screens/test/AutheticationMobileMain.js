// import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import WebView from 'react-native-webview';
import intent from 'react-native-send-intent';

// APIs
import { apiGetEncDataFromNice } from '../../api/RestAPI';

// Utils
import { handleError } from '../../utils/HandleError';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { CustomException } from '../../common/exceptions';

// =======================================================================
// [ 테스트 > NICE 본인인증 ]
// =======================================================================
export default function AutheticationMobileMain() {
  const webviewRef = useRef(null);

  // --------------------------------------------------
  // [ state ]
  // --------------------------------------------------

  const [encData, setEncData] = useState('');

  // --------------------------------------------------
  // [ util ]
  // --------------------------------------------------

  // TODO ::: 디바이스별 웹뷰 Load 이벤트
  const _onShouldStartLoadWithRequest = e => {
    // android
    if (Platform.OS === 'android' && e.url.startsWith('intent')) {
      intent
        .openChromeIntent(e.url)
        .then(isOpened => {
          if (!isOpened) {
            // Alert.alert('앱 실행에 실패했습니다');
          }
          return false;
        })
        .catch(err => {
          console.log(err);
        });
      return false;
    }
    // ios
    if (Platform.OS === 'ios') {
      return true;
    }
  };

  // 본인인증 복호화 정보
  const _onMessage = e => {
    try {
      const parsedData = JSON.parse(e.nativeEvent.data);
      console.log(parsedData);

      if (parsedData?.result) {
        NavigationService.navigate(navName.niceMobileSuccess, {
          name: parsedData.name,
          birthdate: parsedData.birthdate,
          gender: parsedData.gender === '0' ? 'F' : 'M', // F = 여성, M = 남성
          mobileNo: parsedData.mobileNo,
        });
      } else {
        throw new CustomException('본인인증에 오류가 발생하였습니다.');
      }
    } catch (error) {
      if (typeof error === CustomException) {
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
    <View style={{ flex: 1 }}>
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
          onMessage={_onMessage}
          onLoadStart={() => console.log('WebView onLoadStart')}
          onLoadEnd={() => console.log('WebView onLoadEnd')}
          onError={error => console.log('WebView onError', error)}
          onShouldStartLoadWithRequest={_onShouldStartLoadWithRequest}
          // onNavigationStateChange={e => {
          //   console.log('onNavigationStateChange');
          //   onShouldStartLoadWithRequest(e);
          // }}
        />
      )}
    </View>
  );
}
