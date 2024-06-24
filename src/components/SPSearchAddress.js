import React from 'react';
import Postcode from '@actbase/react-daum-postcode';
import {
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import GeoLocationUtils from '../utils/GeoLocationUtils';
import SPIcons from '../assets/icon';
import { handleError } from '../utils/HandleError';
import { ACTIVE_OPACITY } from '../common/constants/constants';

export default function SPSearchAddress({ show, setShow, onSelect }) {
  const getAddressData = async data => {
    try {
      let defaultAddress = '';
      // console.log(data);

      if (data.buildingName === '') {
        defaultAddress = '';
      } else if (data.buildingName === 'N') {
        defaultAddress = `(${data.apartment})`;
      } else {
        defaultAddress = `(${data.buildingName})`;
      }

      const { latitude, longitude, city, gu, dong, jibunAddress } =
        await GeoLocationUtils.getLngLat(
          data.jibunAddress || data.autoJibunAddress,
        );

      if (onSelect) {
        onSelect({
          zonecode: data.zonecode,
          address: jibunAddress,
          latitude,
          longitude,
          city,
          gu,
          dong,
          defaultAddress,
        });
      }
    } catch (error) {
      handleError(error);
    }
    if (setShow) setShow(false);
  };

  return (
    <Modal
      transparent={false}
      animationType="slide"
      visible={show}
      onRequestClose={() => {
        if (setShow) setShow(false);
      }}>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: StatusBar.currentHeight,
        }}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 16,
          }}>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            onPress={() => {
              if (setShow) setShow(false);
            }}>
            <Image
              source={SPIcons.icNavCancle}
              style={{ height: 24, width: 24 }}
            />
          </TouchableOpacity>
        </View>
        <Postcode
          style={{ width: '100%', height: '100%' }}
          jsOptions={{ animation: true }}
          onSelected={data => getAddressData(data)}
        />
      </SafeAreaView>
    </Modal>
  );
}
