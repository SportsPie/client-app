// import axios from 'axios';
import React, { memo, useEffect, useRef, useState } from 'react';
import WebView from 'react-native-webview';

// APIs
import { apiGetEncDataFromNice, apiVerifyId } from '../../api/RestAPI';

// Utils
import { SafeAreaView } from 'react-native-safe-area-context';
import { navName } from '../../common/constants/navName';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';

function MobileAuthenticationId() {
  const webviewRef = useRef(null);

  // --------------------------------------------------
  // [ state ]
  // --------------------------------------------------

  const [encData, setEncData] = useState('');

  // --------------------------------------------------
  // [ util ]
  // --------------------------------------------------

  // TODO ::: onShouldStartLoadWithRequest

  // 본인인증 복호화 정보
  const onMessage = async e => {
    const parsedData = JSON.parse(e.nativeEvent.data);
    try {
      let params;
      if (parsedData?.result) {
        params = {
          userName: parsedData.name,
          userBirth: parsedData.birthdate,
          userGender: parsedData.gender === '0' ? 'F' : 'M',
          userPhoneNo: parsedData.mobileNo,
        };

        const { data } = await apiVerifyId(params);
        if (data.data !== null) {
          NavigationService.navigate(navName.findUserId, {
            memberData: data.data,
          });
        }
      }
    } catch (error) {
      if (error.code === 1101) {
        NavigationService.goBack(2);
        setTimeout(() => {
          Utils.openModal({
            title: '알림',
            body: '해당 휴대폰 번호로 가입된 \n아이디를 찾지 못하였습니다.',
          });
        }, 0);
      } else {
        handleError(error);
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

export default memo(MobileAuthenticationId);
