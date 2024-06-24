/* eslint-disable spaced-comment */
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useEffect } from 'react';
import { navName } from '../common/constants/navName';
import NavigationService from '../navigation/NavigationService';

function DynamicLinksListener() {
  const handleNavigate = async link => {
    //Ex: https://footballcash.page.link/shared/academy?id=1
    const url = new URL(link);
    const pathSegments = url.pathname.split('/');
    const queryParams = new URLSearchParams(url.search);
    const pathSegment = pathSegments[pathSegments.length - 1]; // => "academy"
    const id = queryParams.get('id'); // => 1

    switch (pathSegment) {
      case 'academy':
        NavigationService.navigate(navName.academyDetail, {
          academyIdx: id,
        });
        break;

      case 'matching':
        NavigationService.navigate(navName.matchingDetail, {
          matchIdx: id,
        });
        break;

      case 'academyIntro':
        NavigationService.navigate(navName.academyIntroduction, {
          academyIdx: id,
        });
        break;

      case 'tournament':
        NavigationService.navigate(navName.tournamentDetail, {
          tournamentIdx: id,
        });
        break;

      default:
        break;
    }
  };

  const handleDynamicLink = link => {
    if (link) {
      handleNavigate(link?.url);
    }
  };

  useEffect(() => {
    dynamicLinks().getInitialLink().then(handleDynamicLink);

    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    return () => unsubscribe();
  }, []);

  return null;
}

export default DynamicLinksListener;
