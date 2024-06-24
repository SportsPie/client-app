import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

// =======================================================================
// [ 테스트 > NICE 본인인증 성공 ]
// =======================================================================
export default function AutheticationMobileSuccess() {
  const route = useRoute();

  // --------------------------------------------------
  // [ state ]
  // --------------------------------------------------

  // --------------------------------------------------
  // [ util ]
  // --------------------------------------------------

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------

  // useEffect(() => {}, []);

  // --------------------------------------------------
  // [ return ]
  // --------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      <Text>성공</Text>
      <Text>이름 : {route.params?.name}</Text>
      <Text>성별 : {route.params?.gender}</Text>
      <Text>전화번호 : {route.params?.mobileNo}</Text>
      <Text>생년월일: {route.params?.birthdate}</Text>
    </View>
  );
}
