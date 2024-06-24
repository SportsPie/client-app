import dynamicLinks from '@react-native-firebase/dynamic-links';
import { navName } from '../common/constants/navName';
import NavigationService from '../navigation/NavigationService';
import { Share } from 'react-native';
import { NetworkException } from '../common/exceptions';

// 상수값
const PARAM_ROUTE = 'route';

// 유틸
const DynamicLinkUtils = {
  // 공유하기 ( with 링크생성 )
  share: async ({
    title = '축구파이',
    description = '축구파이 설명',
    route = 'home',
    params = {},
  }) => {
    try {
      // 링크 URI 생성
      let createdUri = process.env.FIREBASE_DYNAMIC_LINK_SHARE_URL;
      createdUri += `/?route=`;
      createdUri += `${route.split('-')[1]}`;

      if (typeof params === 'object' && Object.keys(params).length > 0) {
        Object.keys(params).forEach(key => {
          createdUri += `&${key}=${params[key]}`;
        });
      }

      // console.log('------------------- URI -------------------');
      // console.log(createdUri);

      // 다이나믹 링크 생성
      const link = await DynamicLinkUtils.createDynamicLink({
        uri: createdUri,
        title,
        description,
      });

      if (link) {
        const result = await Share.share({
          url: link, // iOS > 공유 URL
          title, // Android > 타이틀
          message: link, // iOS & Android > 내용
        });

        // console.log('------------------- LINK -------------------');
        // console.log(link);

        // if (result.action === Share.sharedAction) {
        //   // ...
        // } else if (result.action === Share.dismissedAction) {
        //   // ...
        // }
      }
    } catch (error) {
      console.log(error);
      throw new NetworkException('공유 링크 생성에 실패했습니다.');
    }
  },
  // 링크 조회
  initDynamicLink: () => {
    dynamicLinks()
      .getInitialLink()
      .then(initialLink => {
        if (initialLink) {
          DynamicLinkUtils.navigateByUrl(initialLink?.url);
        }
      });
  },

  // 링크 생성
  createDynamicLink: async ({
    uri = process.env.FIREBASE_DYNAMIC_LINK_SHARE_URL,
    title = '축구파이',
    description = 'FootballPie 세계 최초 축구 훈련 리워드 어플',
  }) => {
    const link = await dynamicLinks().buildShortLink({
      link: `${process.env.FIREBASE_DYNAMIC_LINK_SHARE_URL}/${uri}`,
      domainUriPrefix: process.env.FIREBASE_DYNAMIC_LINK_HOST_URL,
      android: {
        packageName: process.env.FIREBASE_DYNAMIC_LINK_ANDROID,
        fallbackUrl: process.env.FIREBASE_DYNAMIC_LINK_ANDROID_FALLBACK_URL,
      },
      ios: {
        bundleId: process.env.FIREBASE_DYNAMIC_LINK_IOS,
        appStoreId: process.env.FIREBASE_DYNAMIC_LINK_IOS_STORE_ID,
        fallbackUrl: process.env.FIREBASE_DYNAMIC_LINK_IOS_FALLBACK_URL,
      },
      social: {
        title,
        descriptionText: description,
        // imageUrl: 'https://example.com/image.png',
      },
      navigation: {
        forcedRedirectEnabled: true,
      },
    });

    // console.log('[ Created Link ] ::: ', link);
    return link;
  },

  // 라우팅
  navigateByUrl: (url = '') => {
    const defaultRoute = navName.home;
    let targetRoute;
    const targetParam = {};

    if (url) {
      const decodedUrl = decodeURI(url);

      const parsedUrl = new URL(decodedUrl);
      const queryParams = new URLSearchParams(parsedUrl.search);

      for (const [key, value] of queryParams.entries()) {
        // console.log(`${key}: ${value}`);

        // 라우트 지정
        if (key === PARAM_ROUTE) {
          targetRoute = value;
        }
        // 기타 파라미터
        else {
          targetParam[key] = value;
        }
      }
    }

    // 이동
    console.log('Link to >>> ' + targetRoute);
    NavigationService.navigate(navName[targetRoute || defaultRoute], {
      ...targetParam,
    });
  },
};

export default DynamicLinkUtils;
