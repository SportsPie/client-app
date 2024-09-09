import { CommonActions, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { NAV_PREFIX, navName } from '../common/constants/navName';
import { store } from '../redux/store';
import Utils from '../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../common/constants/modalCloseEvent';
import GeoLocationUtils from '../utils/GeoLocationUtils';
import { wifiSliceActions } from '../redux/reducers/wifiSlice';

let navigationRef;
export const Stack = createNativeStackNavigator();
// export const Stack = createStackNavigator();

const loginCheck = (routeName, params) => {
  if (routeName?.includes(NAV_PREFIX.auth) && !store.getState().auth.isLogin) {
    Utils.openModal({
      body: '로그인이 필요한 페이지입니다.\n로그인 페이지로 이동하시겠습니까?',
      confirmEvent: MODAL_CLOSE_EVENT.login,
      cancelEvent: MODAL_CLOSE_EVENT.nothing,
      data: { from: routeName, ...params },
    });
    return false;
  }
  return true;
};

const wifiCheckNavList = [
  navName.trainingDetail,
  navName.challengeDetail,
  navName.challengeContentPlayer,
  navName.masterVideoDetail,
  navName.traningVideoDetail,
  navName.masterVideoDetailPlayer,
]; // 해당페이지로 이동하려고 할때 wifi 확인

const checkWifi = (routeName, params) => {
  if (wifiCheckNavList.includes(routeName)) {
    const canMove = store.getState()?.wifi?.canMove;
    if (!canMove) {
      store.dispatch(wifiSliceActions.changeMovePageName(routeName));
      store.dispatch(wifiSliceActions.changeMovePageParam(params));
      store.dispatch(wifiSliceActions.changeNetModalShow(true));
    }
    return canMove;
  }
  return true;
};

const needLocationPermissionNavName = [
  navName.academyMember,
  navName.academyEdit,
  navName.academyRegist,
  navName.matchingRegist,
  navName.searchAcademy,
  navName.nearbyAcademy,
];

const permissionCheck = async routeName => {
  // geo locaion permission
  if (needLocationPermissionNavName.includes(routeName)) {
    const hasPermission = await GeoLocationUtils.checkPermission();
    return hasPermission;
  }
  return true;
};

function setNavigationRef(ref) {
  navigationRef = ref;
}

function getNavigationRef() {
  return navigationRef;
}

function navigate(routeName, params) {
  const canMove = loginCheck(routeName, params);
  const wifiCheck = checkWifi(routeName, params);
  if (canMove && wifiCheck) {
    permissionCheck(routeName).then(res => {
      if (res) {
        navigationRef.dispatch(
          CommonActions.navigate({
            name: routeName,
            params,
          }),
        );
      }
    });
  }
}

function replace(routeName, params) {
  const canMove = loginCheck(routeName, params);
  const wifiCheck = checkWifi(routeName, params);
  if (canMove && wifiCheck) {
    permissionCheck(routeName).then(res => {
      if (res) {
        navigationRef.dispatch(StackActions.replace(routeName, params));
      }
    });
  }
}

function push(routeName, params) {
  const canMove = loginCheck(routeName, params);
  const wifiCheck = checkWifi(routeName, params);
  if (canMove && wifiCheck) {
    permissionCheck(routeName).then(res => {
      if (res) {
        navigationRef.dispatch(StackActions.push(routeName, params));
      }
    });
  }
}

function reset(routeName, params) {
  const canMove = loginCheck(routeName, params);
  const wifiCheck = checkWifi(routeName, params);
  if (canMove && wifiCheck) {
    permissionCheck(routeName).then(res => {
      if (res) {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routeName, params }],
          }),
        );
      }
    });
  }
}

function goBack(num) {
  navigationRef.dispatch(StackActions.pop(num || 1));
}

export default {
  setNavigationRef,
  getNavigationRef,
  navigate,
  replace,
  reset,
  goBack,
  push,
};
