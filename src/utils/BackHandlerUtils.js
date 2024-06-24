import { BackHandler } from 'react-native';
import { SPToast } from '../components/SPToast';
import NavigationService from '../navigation/NavigationService';
import { navName } from '../common/constants/navName';
import { headerProps } from '../components/SPHeader';

let backHandler = null;
let lastPress = null;
const BackHandlerUtils = {
  set(handler) {
    backHandler = handler;
  },
  get() {
    return backHandler;
  },
  add(handler) {
    backHandler = BackHandler.addEventListener('hardwareBackPress', handler);
  },
  remove() {
    if (backHandler) {
      backHandler.remove();
    }
  },
  addRootPageBackHandlerEvent(isHome) {
    lastPress = null;
    BackHandlerUtils.remove();
    BackHandlerUtils.add(() => {
      if (isHome) {
        const now = new Date().getTime();
        if (now - lastPress <= 2000) {
          // 2초 이내에 두 번 눌렀는지 체크
          BackHandler.exitApp(); // 앱 종료
          return true;
        }
        lastPress = now;
        SPToast.show({ text: '한번 더 누르면 앱이 종료됩니다.' });
        return true;
      }
      NavigationService.reset(navName.home);
      return true;
    });
  },
  addDefaultBackHandlerEvent() {
    BackHandlerUtils.remove();
    BackHandlerUtils.add(() => {
      if (!headerProps.noLeftButton) {
        if (headerProps.onPressLeftBtn) {
          headerProps.onPressLeftBtn();
        } else if (headerProps.moveName || headerProps.leftButtonMoveName) {
          NavigationService.navigate(
            headerProps.moveName || headerProps.leftButtonMoveName,
            headerProps.leftButtonMoveParam,
          );
        } else {
          NavigationService.goBack();
        }
        return true; // 뒤로가기 이벤트 막기
      }
      return false; // 뒤로가기 이벤트 실행
    });
  },
};

export default BackHandlerUtils;
