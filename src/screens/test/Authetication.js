import React from 'react';
import { View, Button } from 'react-native';

// Services
import NavigationService from '../../navigation/NavigationService';

// Constants
import { navName } from '../../common/constants/navName';

// =======================================================================
// [ 테스트 > 본인인증 ]
// =======================================================================
export default function Authetication() {
  const navigation = NavigationService;

  // --------------------------------------------------
  // [ return ]
  // --------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      {/* NICE 모바일 인증하기 */}
      <Button
        title="NICE 모바일 인증하기"
        onPress={() => navigation.navigate(navName.niceMobileMain)}
      />
    </View>
  );
}
