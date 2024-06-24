import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { CLIENT_ID, CLIENT_SECRET } from '@env';
import { handleError } from './HandleError';
import CustomException from '../common/exceptions/CustomException';
import { SP_PERMISSIONS } from '../common/constants/permissions';
import { checkPermission } from './PermissionUtils';
import Utils from './Utils';
import { LOCATION_PERMISSION_TEXT } from '../common/constants/constants';

const GeoLocationUtils = {
  checkPermission: async noAlert => {
    const result = await checkPermission(SP_PERMISSIONS.LOCATION.permission);
    if (!result && !noAlert) {
      Utils.openModal({
        title: '요청',
        body: `${LOCATION_PERMISSION_TEXT} \n 위치 정보 권한이 없을 경우 앱 사용에 제한이 있을 수 있습니다.`,
      });
    }
    return result;
  },
  getLocation: (showAlert = true) => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
          });
        },
        error => {
          if (showAlert) {
            if (error?.message?.includes('Location permission denied')) {
              handleError(
                new CustomException(
                  '위치 정보 조회 권한을 허용해주시기 바랍니다.',
                ),
              );
              return;
            }
          } else {
            return null;
          }
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60 * 1000 },
      );
    });
  },
  watchLocation: setter => {
    const watchId = Geolocation.watchPosition(
      position => {
        const obj = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        };
        console.log('watch position', obj);
        setter(obj);
      },
      error => {
        handleError(error);
      },
      { enableHighAccuracy: true },
    );
    return watchId;
  },
  clearWatch: id => {
    Geolocation.clearWatch(id);
  },
  getAddress: async ({ latitude, longitude, returnGu }) => {
    const apiUrl =
      'https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc';
    const lnglat = `${longitude},${latitude}`;

    const headers = {
      'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
      'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
    };

    const url = `${apiUrl}?coords=${lnglat}&orders=legalcode&output=json`;

    try {
      const response = await axios.get(url, {
        headers,
      });

      const { data } = response;
      const address = data.results?.[0]?.region;
      if (address) {
        const city = address.area1.name;
        const gu = address.area2.name;
        const dong = address.area3.name;

        console.log(`주소 :: "${city} ${gu} ${dong}"`);
        return { city, gu, dong };
      }
    } catch (error) {
      handleError(error);
    }
    return null;
  },
  getLngLat: async address => {
    const apiUrl =
      'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode';
    const headers = {
      'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
      'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
    };

    const url = `${apiUrl}?query=${encodeURI(address)}`;

    try {
      const response = await axios.get(url, { headers });
      const addresses = response.data.addresses[0];

      if (addresses) {
        let city = '';
        let gu = '';
        let dong = '';
        addresses.addressElements.forEach(element => {
          if (element.types.includes('SIDO')) {
            city = element.longName;
          } else if (element.types.includes('SIGUGUN')) {
            gu = element.longName;
          } else if (element.types.includes('DONGMYUN')) {
            dong = element.longName;
          }
        });

        const { x: longitude, y: latitude, jibunAddress } = addresses;
        console.log(`위도: ${latitude}, 경도: ${longitude}`);
        return { latitude, longitude, jibunAddress, city, gu, dong };
      }
    } catch (error) {
      handleError(error);
    }

    return null;
  },
};
export default GeoLocationUtils;
