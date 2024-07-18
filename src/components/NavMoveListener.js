import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useEffect } from 'react';
import { navName } from '../common/constants/navName';
import NavigationService from '../navigation/NavigationService';
import { useDispatch, useSelector } from 'react-redux';
import { navSliceActions } from '../redux/reducers/navSlice';

function NavMoveListener() {
  const dispatch = useDispatch();
  const moveUrl = useSelector(state => state.nav)?.moveUrl;
  console.log('moveUrl', moveUrl);

  const handleNavigate = async url => {
    console.log('url test', url);
    // NavigationService.navigate(navName.academyDetail, { academyIdx: 10 });

    // switch (pathSegment) {
    //   case 'academy':
    //     NavigationService.navigate(navName.academyDetail, {
    //       academyIdx: id,
    //     });
    //     break;
    //
    //   case 'matching':
    //     NavigationService.navigate(navName.matchingDetail, {
    //       matchIdx: id,
    //     });
    //     break;
    //
    //   case 'academyIntro':
    //     NavigationService.navigate(navName.academyIntroduction, {
    //       academyIdx: id,
    //     });
    //     break;
    //
    //   case 'tournament':
    //     NavigationService.navigate(navName.tournamentDetail, {
    //       tournamentIdx: id,
    //     });
    //     break;
    //
    //   default:
    //     break;
    // }
  };

  const handleDynamicLink = url => {
    if (url) {
      handleNavigate(url);
      dispatch(navSliceActions.changeMoveUrl(''));
    }
  };

  useEffect(() => {
    handleDynamicLink(moveUrl);
  }, [moveUrl]);

  return null;
}

export default NavMoveListener;
