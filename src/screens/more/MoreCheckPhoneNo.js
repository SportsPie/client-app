import React, { memo, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { apiCityList, apiGuList } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import BoxSelect from '../../components/BoxSelect';
import { PrimaryButton } from '../../components/PrimaryButton';
import NavigationService from '../../navigation/NavigationService';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MoreCheckPhoneNo() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSubRegion, setSelectedSubRegion] = useState('');
  const [regions, setRegions] = useState([]);
  const [subRegions, setSubRegions] = useState([]);

  const handlePhoneVerification = () => {};

  const handleUpdateComplete = () => {
    Alert.alert('수정 완료!', '내용이 수정되었습니다.', [
      {
        text: '확인',
        onPress: () => {
          NavigationService.navigate(navName.moreMyDetail);
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchRegionData = async () => {
      try {
        const response = await apiCityList();
        setRegions(
          response.data.data?.map(item => {
            return {
              id: Utils.UUIDV4(),
              label: item,
              value: item,
            };
          }),
        );
      } catch (error) {
        console.error('Error fetching region data:', error);
      }
    };
    fetchRegionData();
  }, []);

  useEffect(() => {
    const fetchGuListData = async () => {
      try {
        const response = await apiGuList(selectedRegion);
        const result = response.data.data?.map(item => {
          return {
            id: Utils.UUIDV4(),
            label: item,
            value: item,
          };
        });

        setSubRegions(result);
      } catch (error) {
        console.error('Error fetching gu data:', error);
        throw error;
      }
    };

    fetchGuListData();
  }, [selectedRegion]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="내 정보 수정" />

      <View style={styles.container}>
        <View style={{ rowGap: 4 }}>
          <Text style={fontStyles.fontSize12_Regular}>휴대폰번호</Text>
          <PrimaryButton
            text="휴대폰 본인인증"
            onPress={handlePhoneVerification}
            outlineButton
          />
        </View>

        <View style={{ rowGap: 4 }}>
          <Text style={fontStyles.fontSize12_Regular}>해운대</Text>
          <BoxSelect placeholder="부산 해운대" />
        </View>

        <View style={{ rowGap: 4 }}>
          <Text style={fontStyles.fontSize12_Regular}>지역</Text>
          <View
            style={{
              flexDirection: 'row',
              columnGap: 8,
              alignItems: 'flex-end',
            }}>
            <BoxSelect placeholder="부산" />
            <BoxSelect placeholder="해운대" />
          </View>
        </View>

        <PrimaryButton
          text="수정완료"
          onPress={handleUpdateComplete}
          buttonStyle={{ marginTop: 'auto' }}
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(MoreCheckPhoneNo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 16,
  },
});
