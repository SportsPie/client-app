import DeviceInfo from 'react-native-device-info';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getSystemName } from 'react-native-device-info/src/index';

function DeviceTest() {
  const [osVersion, setOsVersion] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [deviceBrand, setDeviceBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');

  useEffect(() => {
    const phoneInfo = async () => {
      const version = await DeviceInfo.getSystemVersion();
      const id = await DeviceInfo.getUniqueId();
      const brand = await DeviceInfo.getBrand();
      const model = await DeviceInfo.getSystemName();
      setOsVersion(version);
      setDeviceId(id);
      setDeviceBrand(brand);
      setDeviceModel(model);
    };
    phoneInfo();
  });

  return (
    <View>
      <Text>운영 체제 버전: {osVersion}</Text>
      <Text>기기 ID: {deviceId}</Text>
      <Text>기기 Brand: {deviceBrand}</Text>
      <Text>기기 Model: {deviceModel}</Text>
    </View>
  );
}

export default DeviceTest;
