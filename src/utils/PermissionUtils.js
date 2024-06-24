import {
  check,
  checkMultiple,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import { SP_PERMISSIONS } from '../common/constants/permissions';

export const checkPermission = async permission => {
  try {
    const result = await check(permission);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log(
          '해당 기능을 사용할 수 없습니다. (이 기기에서 / 이 문맥에서 사용할 수 없음)',
        );
        return false;
      case RESULTS.DENIED:
        console.log(
          '권한이 요청되지 않았거나, 거부되었지만 다시 요청 가능합니다.',
        );
        return requestPermission(permission);
      case RESULTS.LIMITED:
        console.log('권한이 제한되었습니다. 일부 동작만 가능합니다.');
        return requestPermission(permission);
      case RESULTS.GRANTED:
        console.log('권한이 허용되었습니다.');
        return true;
      case RESULTS.BLOCKED:
        console.log('권한이 거부되었고, 다시 요청할 수 없습니다.');
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.log('권한 체크 중 오류가 발생했습니다. :: ', error);
    return false;
  }
};

export const requestPermission = async permission => {
  try {
    const result = await request(permission);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log(
          '해당 기능을 사용할 수 없습니다. (이 기기에서 / 이 문맥에서 사용할 수 없음)',
        );
        return false;
      case RESULTS.DENIED:
        console.log(
          '권한이 요청되지 않았거나, 거부되었지만 다시 요청 가능합니다.',
        );
        return false;
      case RESULTS.LIMITED:
        console.log('권한이 제한되었습니다. 일부 동작만 가능합니다.');
        return true;
      case RESULTS.GRANTED:
        console.log('권한이 허용되었습니다.');
        return true;
      case RESULTS.BLOCKED:
        console.log('권한이 거부되었고, 다시 요청할 수 없습니다.');
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.log('권한 요청 중 오류가 발생했습니다. :: ', error);
    return false;
  }
};

// 권한 배열을 생성합니다.
const permissionsArray = Object.values(SP_PERMISSIONS).map(item => {
  return item.permission;
});

export const checkPermissions = permission => {
  return check(permission);
};

export const checkMultiplePermissions = () => {
  return checkMultiple(permissionsArray);
};

export const requestMultiplePermissions = () => {
  return requestMultiple(permissionsArray);
};
