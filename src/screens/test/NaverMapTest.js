import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import NaverMapView, { Path, Marker } from 'react-native-nmap/index';
import axios from 'axios';

export default function NaverMapTest() {
  const [camera, setCamera] = useState({
    latitude: 35.182360938,
    longitude: 129.079075027,
  });

  const getAddress = async param => {
    const apiUrl =
      'https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc';
    const lnglat = `${param.longitude},${param.latitude}`;

    const clientId = 'jq459epjgu';
    const clientSecret = 'eH52aonofkqITXqrGM2cGInAJjOu2phrT0J2E6RI';

    const headers = {
      'X-NCP-APIGW-API-KEY-ID': clientId,
      'X-NCP-APIGW-API-KEY': clientSecret,
    };

    const url = `${apiUrl}?coords=${lnglat}&orders=legalcode&output=json`;

    try {
      const response = await axios.get(url, {
        headers,
      });

      const { data } = response;
      const address = data.results[0].region;
      const city = address.area1.name;
      const gu = address.area2.name;
      const dong = address.area3.name;

      console.log(`선택하신 마커의 주소는 "${city} ${gu} ${dong}" 입니다.`);
    } catch (error) {
      console.error('에러 발생:', error);
    }
  };

  useEffect(() => {
    getAddress(camera);
  }, [camera]);

  const locationHandler = e => {
    Alert.alert(
      '',
      '마커를 이동할까요 ?',
      [
        { text: '취소' },
        {
          text: '확인',
          onPress: () => {
            setCamera(e);
            // console.warn('onMapClick', JSON.stringify(e));
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      <NaverMapView
        style={{ width: '100%', height: '100%' }}
        showsMyLocationButton
        center={{ ...camera, zoom: 15 }}
        // onTouch={e => console.warn('onTouch', JSON.stringify(e.nativeEvent))}
        // onCameraChange={e => console.warn('onCameraChange', JSON.stringify(e))}
        // onMapClick={e => console.warn('onMapClick', JSON.stringify(e))}
        // onMapClick={e => locationHandler(e)}
        onMapClick={e => locationHandler(e)}
        useTextureView>
        <Marker coordinate={camera} />
      </NaverMapView>
      {/* <TouchableOpacity */}
      {/*  style={{ position: 'absolute', bottom: '10%', right: 8 }} */}
      {/*  onPress={() => console.log('test')}> */}
      {/*  <View style={{ backgroundColor: 'gray', padding: 4 }}> */}
      {/*    <Text style={{ color: 'white' }}>Chat</Text> */}
      {/*  </View> */}
      {/* </TouchableOpacity> */}
    </View>
  );
}
