import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useEffect } from 'react';
import { navName } from '../common/constants/navName';
import NavigationService from '../navigation/NavigationService';
import { useDispatch, useSelector } from 'react-redux';
import { navSliceActions } from '../redux/reducers/navSlice';
import { apiGetMyInfo, apiGetEventVideo } from '../api/RestAPI';
import WalletUtils from '../utils/WalletUtils';
import Utils from '../utils/Utils';

const LinkType = {
  PLAYER_MANAGE: 'PLAYER_MANAGE', // 선수관리,
  ACADEMY_DETAIL: 'ACADEMY_DETAIL', // 아카데미 상세,
  REPORT: 'REPORT', // 신고내역 관리,
  ACADEMY_FEED_DETAIL: 'ACADEMY_FEED_DETAIL', // 아카데미 게시글 상세,
  FEED_LIST: 'FEED_LIST', // 게시글 리스트,
  FEED_DETAIL: 'FEED_DETAIL', // 게시글 상세,
  FEED_DETAIL_HOLDER: 'FEED_DETAIL_HOLDER', // 게시글 상세(홀더),
  MATCHING_LIST: 'MATCHING_LIST', // 매칭 리스트,
  MATCHING_DETAIL: 'MATCHING_DETAIL', // 매칭 상세,
  TOURNAMENT_LIST: 'TOURNAMENT_LIST', // 대회 리스트,
  TOURNAMENT_DETAIL: 'TOURNAMENT_DETAIL', // 대회 상세,
  WALLET_DETAIL: 'WALLET_DETAIL', // 지갑 상세,
  TOKEN_DETAIL: 'TOKEN_DETAIL', // 토큰 상세,
  NOTICE_LIST: 'NOTICE_LIST', // 공지사항 리스트,
  NOTICE_DETAIL: 'NOTICE_DETAIL', // 공지사항 상세,
  QNA_DETAIL: 'QNA_DETAIL', // 문의 상세,
  TOURNAMENT_QNA: 'TOURNAMENT_QNA', // 대회 문의
  PIE_TRAINING_BASIC: 'PIE_TRAINING_BASIC', // PIE 트레이닝 : 기초튼튼 훈련,
  PIE_TRAINING_CHALLENGE: 'PIE_TRAINING_CHALLENGE', // PIE 트레이닝 : 챌린지,
  CHALLENGE_VIDEO_DETAIL: 'CHALLENGE_VIDEO_DETAIL', // 챌린지 영상 상세,
  MASTER_VIDEO_DETAIL: 'MASTER_VIDEO_DETAIL', // 마스터 영상 상세,
  TRAINING_DETAIL: 'TRAINING_DETAIL', // 기초튼튼 훈련 상세,
  CLASS_VIDEO_DETAIL: 'CLASS_VIDEO_DETAIL', // 클래스 영상 상세,
  EVENT_VIDEO_DETAIL: 'EVENT_VIDEO_DETAIL', // 이벤트 영상 상세,
  INSIGHT_LIST: 'INSIGHT_LIST', // 인사이트 상세
  INSIGHT_DETAIL: 'INSIGHT_DETAIL', // 인사이트 상세
};

function NavMoveListener() {
  const dispatch = useDispatch();
  const moveUrl = useSelector(state => state.nav)?.moveUrl;

  const handleNavigate = async url => {
    const urls = url.split('/');
    const type = urls[1];
    const idx = urls[2];
    try {
      switch (type) {
        case LinkType.PLAYER_MANAGE:
          NavigationService.navigate(navName.academyPlayer);
          break;
        case LinkType.ACADEMY_DETAIL:
          NavigationService.navigate(navName.academyDetail, {
            academyIdx: idx,
          });
          break;
        case LinkType.REPORT:
          NavigationService.navigate(navName.academyReport);
          break;
        case LinkType.ACADEMY_FEED_DETAIL: {
          const { data } = await apiGetMyInfo();
          NavigationService.navigate(navName.academyCommunityDetail, {
            feedIdx: idx,
            academyIdx: data.data.academyIdx,
          });
          break;
        }
        case LinkType.FEED_LIST:
          NavigationService.navigate(navName.community, {
            paramReset: true,
          });
          break;
        case LinkType.FEED_DETAIL:
          NavigationService.navigate(navName.communityDetails, {
            feedIdx: idx,
          });
          break;
        case LinkType.FEED_DETAIL_HOLDER:
          NavigationService.navigate(navName.communityFavPlayerDetails, {
            feedIdx: idx,
          });
          break;
        case LinkType.MATCHING_LIST:
          NavigationService.navigate(navName.matchingSchedule, {
            activeTab: '매칭',
            paramReset: true,
          });
          break;
        case LinkType.MATCHING_DETAIL:
          NavigationService.navigate(navName.matchingDetail, {
            matchIdx: idx,
          });
          break;
        case LinkType.TOURNAMENT_LIST:
          NavigationService.navigate(navName.matchingSchedule, {
            activeTab: '대회',
            paramReset: true,
          });
          break;
        case LinkType.TOURNAMENT_DETAIL:
          NavigationService.navigate(navName.tournamentDetail, {
            tournamentIdx: idx,
          });
          break;
        case LinkType.TOURNAMENT_QNA:
          NavigationService.navigate(navName.tournamentInquiryList, {
            tournamentIdx: idx,
          });
          break;
        case LinkType.WALLET_DETAIL: {
          const walletAddr = await WalletUtils.getWalletAddress();
          if (walletAddr) {
            NavigationService.navigate(navName.walletDetail);
          } else {
            NavigationService.navigate(navName.socialToken);
          }
          break;
        }
        case LinkType.TOKEN_DETAIL:
          NavigationService.navigate(navName.socialTokenDetail);
          break;
        case LinkType.NOTICE_LIST:
          NavigationService.navigate(navName.moreNotice);
          break;
        case LinkType.NOTICE_DETAIL:
          NavigationService.navigate(navName.moreNoticeDetail, {
            boardIdx: idx,
          });
          break;
        case LinkType.QNA_DETAIL:
          NavigationService.navigate(navName.moreInquiryDetail, {
            qnaIdx: idx,
          });
          break;
        case LinkType.PIE_TRAINING_BASIC:
          NavigationService.navigate(navName.training, {
            activeTab: '기초튼튼 훈련',
            paramReset: true,
          });
          break;
        case LinkType.PIE_TRAINING_CHALLENGE:
          NavigationService.navigate(navName.training, {
            activeTab: '챌린지',
            paramReset: true,
          });
          break;
        case LinkType.CHALLENGE_VIDEO_DETAIL:
          NavigationService.navigate(navName.challengeDetail, {
            videoIdx: idx,
          });
          break;
        case LinkType.MASTER_VIDEO_DETAIL:
          NavigationService.navigate(navName.masterVideoDetail, {
            videoIdx: idx,
          });
          break;
        case LinkType.TRAINING_DETAIL:
          NavigationService.navigate(navName.trainingDetail, {
            trainingIdx: idx,
          });
          break;
        case LinkType.CLASS_VIDEO_DETAIL:
          NavigationService.navigate(navName.traningVideoDetail, {
            videoIdx: idx,
            isCurrentStep: true,
          });
          break;
        case LinkType.EVENT_VIDEO_DETAIL: {
          const { data } = await apiGetEventVideo(idx);
          NavigationService.navigate(navName.eventParticipantVideoReels, {
            video: data.data,
          });
          break;
        }
        case LinkType.INSIGHT_LIST:
          NavigationService.navigate(navName.moreArticle);
          break;
        case LinkType.INSIGHT_DETAIL:
          NavigationService.navigate(navName.moreArticleDetail, {
            boardIdx: idx,
          });
          break;
        default:
          Utils.openOrMoveUrl(url);
          break;
      }
    } catch (error) {
      console.log('fcm page move error:', error);
    }
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
