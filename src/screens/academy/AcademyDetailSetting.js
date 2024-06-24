import React, { memo } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function AcademyDetailSetting() {
  return (
    <SafeAreaView>
      <Header title="아카데미 관리" />

      <Text>아카데미 상세 관리(운영자일때 접근)</Text>
    </SafeAreaView>
  );
}

export default memo(AcademyDetailSetting);
