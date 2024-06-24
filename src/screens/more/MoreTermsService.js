import { useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useMemo, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import BoxSelect from '../../components/BoxSelect';
import Header from '../../components/header';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';

function MoreTermsService() {
  const route = useRoute();
  const { termsData, type } = route.params;
  const [selectedDate, setSelectedDate] = useState('');

  const headerValue = useMemo(() => {
    switch (type) {
      case 'TERMS_SERVICE':
        return '서비스 이용약관';
      case 'TERMS_LOCATE':
        return '위치기반 서비스 이용 약관';
      case 'TERMS_PRIVATE':
        return '개인정보 처리 동의';
      default:
        return '';
    }
  }, [type]);

  const dateFilterValues = useMemo(() => {
    return termsData?.map(item => {
      return {
        id: Utils.UUIDV4(),
        label: moment(item?.regDate).format('YYYY.MM.DD'),
        value: item?.regDate,
      };
    });
  }, [termsData]);

  const termContentValue = useMemo(() => {
    return termsData?.find(item => item?.regDate === selectedDate)?.contents;
  }, [selectedDate, termsData]);

  // 초기값 설정을 위한 useEffect 추가
  useEffect(() => {
    if (termsData?.length > 0) {
      const latestDate = termsData.reduce((latest, item) => {
        return item.regDate > latest ? item.regDate : latest;
      }, termsData[0].regDate);
      setSelectedDate(latestDate);
    }
  }, [termsData]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title={headerValue} closeIcon />

      <View style={styles.container}>
        <View
          style={{
            alignItems: 'flex-start',
          }}>
          <BoxSelect
            placeholder="날짜를 선택하세요"
            arrayOptions={dateFilterValues}
            onItemPress={setSelectedDate}
            value={
              selectedDate ? moment(selectedDate).format('YYYY.MM.DD') : ''
            }
          />
        </View>

        {termContentValue && (
          <WebView
            source={{
              html: termContentValue,
            }}
            style={{
              flex: 1,
            }}
            textZoom={200}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default memo(MoreTermsService);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    rowGap: 16,
  },
});
