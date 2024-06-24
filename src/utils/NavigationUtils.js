import BackHandlerUtils from './BackHandlerUtils';
import { NAV_PREFIX, navName } from '../common/constants/navName';

const NavigationUtils = {
  authPageFocusHandler: async pageName => {
    // console.log('signedPageFocusHandler', pageName);
  },
  noAuthPageFocusHandler: async pageName => {
    // console.log('signedPageFocusHandler', pageName);
  },
  bottomPageFocusHandler: async pageName => {
    BackHandlerUtils.addRootPageBackHandlerEvent(pageName === navName.home);
    // console.log('bottomPageFocusHandler', pageName);
  },
  authPageBlurHandler: async pageName => {
    // console.log('signedPageFocusHandler', pageName);
  },
  noAuthPageBlurHandler: async pageName => {
    // console.log('signedPageFocusHandler', pageName);
  },
  bottomPageBlurHandler: async pageName => {
    // BackHandlerUtils.addRootPageBackHandlerEvent(!(pageName === navName.home));
    BackHandlerUtils.remove();
    // console.log('bottomPageFocusHandler', pageName);
  },
  callFocusHandler: item => {
    const target = item?.target;
    let type = '';
    let pageName = '';
    if (target) {
      const targetSplit = target.split('-');
      // eslint-disable-next-line prefer-destructuring
      type = targetSplit[0];
      pageName = `${type}-${targetSplit[1]}`;
    }

    switch (type) {
      case NAV_PREFIX.auth:
        return NavigationUtils.authPageFocusHandler(pageName);
      case NAV_PREFIX.noAuth:
        return NavigationUtils.noAuthPageFocusHandler(pageName);
      default:
        return null;
    }
  },
  callBlurHandler: item => {
    const target = item?.target;
    let type = '';
    let pageName = '';
    if (target) {
      const targetSplit = target.split('-');
      // eslint-disable-next-line prefer-destructuring
      type = targetSplit[0];
      pageName = `${type}-${targetSplit[1]}`;
    }

    switch (type) {
      case NAV_PREFIX.auth:
        return NavigationUtils.authPageBlurHandler(pageName);
      case NAV_PREFIX.noAuth:
        return NavigationUtils.noAuthPageBlurHandler(pageName);
      default:
        return null;
    }
  },
};

export default NavigationUtils;
