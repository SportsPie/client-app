import React from 'react';
import { navName } from '../common/constants/navName';
import AcademyDetail from '../screens/academy/AcademyDetail';
import AcademyDetailSetting from '../screens/academy/AcademyDetailSetting';
import AcademyEdit from '../screens/academy/AcademyEdit';
import AcademyIntroduction from '../screens/academy/AcademyIntroduction';
import AcademyPlayer from '../screens/academy/AcademyPlayer';
import AcademySchedule from '../screens/academy/AcademySchedule';
import AcademyScheduleWrite from '../screens/academy/AcademyScheduleWrite';
import AlreadySign from '../screens/auth/AlreadySign';
import CompleteSign from '../screens/auth/CompleteSign';
import FindPassword from '../screens/auth/FindPassword';
import FindUser from '../screens/auth/FindUser';
import FindUserId from '../screens/auth/FindUserId';
import IdentifyVerification from '../screens/auth/IdentifyVerification';
import InputEmail from '../screens/auth/InputEmail';
import InputPassword from '../screens/auth/InputPassword';
import Login from '../screens/auth/Login';
import PerformanceInfo from '../screens/auth/PerformanceInfo';
import ResetPassword from '../screens/auth/ResetPassword';
import TermsService from '../screens/auth/TermsService';
import UserInfo from '../screens/auth/UserInfo';
import ChatCreateRoomScreen from '../screens/chat/ChatCreateRoomScreen';
import ChatRoomListScreen from '../screens/chat/ChatRoomListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import MatchingChatRoomListScreen from '../screens/chat/MatchingChatRoomListScreen';
import MatchingChatRoomScreen from '../screens/chat/MatchingChatRoomScreen';
import CommunityWrite from '../screens/community/CommunityWrite';
import MatchingCancel from '../screens/matching/MatchingCancel';
import MatchingHistory from '../screens/matching/MatchingHistory';
import MatchingRegist from '../screens/matching/MatchingRegist';
import MatchingRegistReview from '../screens/matching/MatchingRegistReview';
import MatchingReject from '../screens/matching/MatchingReject';
import MatchingReview from '../screens/matching/MatchingReview';
import MatchingScore from '../screens/matching/MatchingScore';
import MatchingSelectAcademy from '../screens/matching/MatchingSelectAcademy';
import MatchingSelectScorer from '../screens/matching/MatchingSelectScorer';
import MoreArticle from '../screens/more/MoreArticle';
import MoreArticleDetail from '../screens/more/MoreArticleDetail';
import MoreCheckPhoneNo from '../screens/more/MoreCheckPhoneNo';
import MoreCouponComplete from '../screens/more/MoreCouponComplete';
import MoreCouponRegister from '../screens/more/MoreCouponRegister';
import MoreGameSchedule from '../screens/more/MoreGameSchedule';
import MoreMatchDetail from '../screens/more/MoreMatchDetail';
import MoreMyDetail from '../screens/more/MoreMyDetail';
import MoreMyDetailModify from '../screens/more/MoreMyDetailModify';
import MoreMyInfo from '../screens/more/MoreMyInfo';
import MoreNotification from '../screens/more/MoreNotification';
import MoreProfile from '../screens/more/MoreProfile';
import MoreSetting from '../screens/more/MoreSetting';
import MoreStat from '../screens/more/MoreStat';
import MoreStatModify from '../screens/more/MoreStatModify';
import Report from '../screens/report/Report';
import CalendarTest from '../screens/test/CalendarTest';
import DeviceTest from '../screens/test/DeviceTest';
import FaceBookLogin from '../screens/test/FaceBookLogin';
import GeoLocationTest from '../screens/test/GeoLocationTest';
import GoogleLogin from '../screens/test/GoogleLogin';
import MqttTest from '../screens/test/MqttTest';
import NaverMapTest from '../screens/test/NaverMapTest';
import {
  CommonTestPage,
  CommonTestPage2,
  NoSignedTestPage,
  NoSignedTestPage2,
  PageMoveTest,
  SignedTestPage,
  SignedTestPage2,
} from '../screens/test/PageMoveTest';
import Test from '../screens/test/Test';
import VideoTest from '../screens/test/VideoTest';
import VideoTestByCase from '../screens/test/VideoTestByCase';
import VideoTestForCompression from '../screens/test/VideoTestForCompression';
import YoutubeTest from '../screens/test/YoutubeTest';
import ChatTest from '../screens/test/chat/ChatTest';
import ChallengeDetail from '../screens/training/ChallengeDetail';
import TrainingDetail from '../screens/training/TrainingDetail';
import TraningClear from '../screens/training/TraningClear';
import TraningRegistering from '../screens/training/TraningRegistering';
import SocialToken from '../screens/wallet/SocialToken';
import SocialTokenDetail from '../screens/wallet/SocialTokenDetail';
import CreateWallet from '../screens/wallet/wallet/CreateWallet';
import RestoreWallet from '../screens/wallet/wallet/RestoreWallet';
import WalletBackupCheck from '../screens/wallet/wallet/WalletBackupCheck';
import WalletPwd from '../screens/wallet/wallet/WalletPwd';
import NavigationUtils from '../utils/NavigationUtils';
import { Stack } from './NavigationService';

// 테스트 > NICE 모바일 본인인증
import AuthLayout from '../components/layout/AuthLayout';
import AcademyAdmin from '../screens/academy/AcademyAdmin';
import AcademyCommunity from '../screens/academy/AcademyCommunity';
import AcademyCommunityDetail from '../screens/academy/AcademyCommunityDetail';
import AcademyCompany from '../screens/academy/AcademyCompany';
import AcademyCompanyManagement from '../screens/academy/AcademyCompanyManagement';
import AcademyGroup from '../screens/academy/AcademyGroup';
import AcademyGroupMove from '../screens/academy/AcademyGroupMove';
import AcademyMachingRegistration from '../screens/academy/AcademyMachingRegistration';
import AcademyManagement from '../screens/academy/AcademyManagement';
import AcademyPlayerDetail from '../screens/academy/AcademyPlayerDetail';
import AcademyPlayerProfileEdit from '../screens/academy/AcademyPlayerProfileEdit';
import AcademyRecruitment from '../screens/academy/AcademyRecruitment';
import AcademyRecruitmentDetail from '../screens/academy/AcademyRecruitmentDetail';
import AcademyRecruitmentEdit from '../screens/academy/AcademyRecruitmentEdit';
import AcademyRecruitmentForAdmin from '../screens/academy/AcademyRecruitmentForAdmin';
import AcademyRecruitmentRegist from '../screens/academy/AcademyRecruitmentRegist';
import AcademyRegist from '../screens/academy/AcademyRegist';
import AcademyReportDetails from '../screens/academy/AcademyReportDetails';
import AcademyReportDetailsView from '../screens/academy/AcademyReportDetailsView';
import AcademyScheduleEdit from '../screens/academy/AcademyScheduleEdit';
import NearbyAcademy from '../screens/academy/NearbyAcademy';
import SearchAcademy from '../screens/academy/SearchAcademy';
import AlarmPage from '../screens/auth/AlarmPage';
import MobileAuthenticationId from '../screens/auth/MobileAuthenticationId';
import MobileAuthenticationMain from '../screens/auth/MobileAuthenticationMain';
import MobileAuthenticationPassword from '../screens/auth/MobileAuthenticationPassword';
import BottomTab from '../screens/bottom-tab/BottomTab';
import CommunityDetails from '../screens/community/CommunityDetails';
import CommunityEdit from '../screens/community/CommunityEdit';
import MatchingDetail from '../screens/matching/MatchingDetail';
import PlaygroundDetail from '../screens/matching/PlaygroundDetail';
import MoreAccountManage from '../screens/more/MoreAccountManage';
import MoreActiveHistory from '../screens/more/MoreActiveHistory';
import MoreInquiry from '../screens/more/MoreInquiry';
import MoreInquiryDetail from '../screens/more/MoreInquiryDetail';
import MoreInquiryRegist from '../screens/more/MoreInquiryRegist';
import MoreMobileAuthenticationMyInfo from '../screens/more/MoreMobileAuthenticationMyInfo';
import MoreModifyChallenge from '../screens/more/MoreModifyChallenge';
import MoreNotice from '../screens/more/MoreNotice';
import MoreNoticeDetail from '../screens/more/MoreNoticeDetail';
import MoreQuestion from '../screens/more/MoreQuestion';
import MoreTermsService from '../screens/more/MoreTermsService';
import Authetication from '../screens/test/Authetication';
import AutheticationMobileMain from '../screens/test/AutheticationMobileMain';
import AutheticationSuccess from '../screens/test/AutheticationMobileSuccess';
import SearchAddressTest from '../screens/test/SearchAddressTest';
import TournamentApplyComplete from '../screens/tournament/TournamentApplyComplete';
import TournamentDetail from '../screens/tournament/TournamentDetail';
import AddDetails from '../screens/training/AddDetails';
import ChallengeAddDetails from '../screens/training/ChallengeAddDetails';
import ChallengeContentPlayer from '../screens/training/ChallengeContentPlayer';
import ChallengeEditDetails from '../screens/training/ChallengeEditDetails';
import ChallengeRegistering from '../screens/training/ChallengeRegistering';
import ChallengeRegistrationComplete from '../screens/training/ChallengeRegistrationComplete';
import ChallengeVideoPlayer from '../screens/training/ChallengeVideoPlayer';
import MasterVideoDetail from '../screens/training/MasterVideoDetail';
import MasterVideoDetailPlayer from '../screens/training/MasterVideoDetailPlayer';
import TraningVideoDetail from '../screens/training/TraningVideoDetail';
import VideoPlayer from '../screens/training/VideoPlayer';
import Swap from '../screens/wallet/Swap';
import SwapTranfer from '../screens/wallet/SwapTranfer';
import PrivateKeyConfirm from '../screens/wallet/wallet/PrivateKeyConfirm';
import RestoreSeedConfirm from '../screens/wallet/wallet/RestoreSeedConfirm';
import WalletBackup from '../screens/wallet/wallet/WalletBackup';
import WalletDetail from '../screens/wallet/wallet/WalletDetail';
import WalletReceive from '../screens/wallet/wallet/WalletReceive';
import WalletSend from '../screens/wallet/wallet/WalletSend';
import WalletSendClear from '../screens/wallet/wallet/WalletSendClear';
import WalletSending from '../screens/wallet/wallet/WalletSending';
import WalletSetting from '../screens/wallet/wallet/WalletSetting';
import { COLORS } from '../styles/colors';

function MatchingChatRoomListScreenComponent() {
  return <AuthLayout component={MatchingChatRoomListScreen} />;
}

function MatchingChatRoomScreenComponent() {
  return <AuthLayout component={MatchingChatRoomScreen} />;
}

function ChatTestCompoent() {
  return <AuthLayout component={ChatTest} />;
}

function ChatRoomListScreenComponent() {
  return <AuthLayout component={ChatRoomListScreen} />;
}

function ChatRoomScreenComponent() {
  return <AuthLayout component={ChatRoomScreen} />;
}

function ChatCreateRoomScreenComponent() {
  return <AuthLayout component={ChatCreateRoomScreen} />;
}

export default function Navigation() {
  /* nav */
  return (
    <Stack.Navigator
      screenListeners={{
        focus: item => NavigationUtils.callFocusHandler(item),
        blur: item => NavigationUtils.callBlurHandler(item),
      }}
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.white,
        },
        statusBarStyle: 'dark',
        statusBarColor: COLORS.white,
      }}>
      <Stack.Screen name={navName.login} component={Login} />
      <Stack.Screen name={navName.home} component={BottomTab} />
      <Stack.Screen name={navName.moreMyInfo} component={MoreMyInfo} />
      <Stack.Screen
        name={navName.moreAccountManage}
        component={MoreAccountManage}
      />
      <Stack.Screen name={navName.academyDetail} component={AcademyDetail} />
      <Stack.Screen
        name={navName.academyDetailSetting}
        component={AcademyDetailSetting}
      />
      <Stack.Screen
        name={navName.academyIntroduction}
        component={AcademyIntroduction}
      />
      <Stack.Screen name={navName.academyPlayer} component={AcademyPlayer} />
      <Stack.Screen
        name={navName.academyPlayerDetail}
        component={AcademyPlayerDetail}
      />
      <Stack.Screen
        name={navName.academySchedule}
        component={AcademySchedule}
      />
      <Stack.Screen
        name={navName.academyScheduleWrite}
        component={AcademyScheduleWrite}
      />
      <Stack.Screen
        name={navName.academyScheduleEdit}
        component={AcademyScheduleEdit}
      />
      <Stack.Screen name={navName.report} component={Report} />
      <Stack.Screen name={navName.academyEdit} component={AcademyEdit} />
      <Stack.Screen
        name={navName.academyCommunity}
        component={AcademyCommunity}
      />
      <Stack.Screen
        name={navName.academyCommunityDetail}
        component={AcademyCommunityDetail}
      />
      <Stack.Screen
        name={navName.matchingHistory}
        component={MatchingHistory}
      />
      <Stack.Screen name={navName.matchingReview} component={MatchingReview} />
      <Stack.Screen name={navName.matchingCancel} component={MatchingCancel} />
      <Stack.Screen
        name={navName.matchingRegistReview}
        component={MatchingRegistReview}
      />
      <Stack.Screen name={navName.matchingReject} component={MatchingReject} />
      <Stack.Screen name={navName.matchingScore} component={MatchingScore} />
      <Stack.Screen
        name={navName.matchingSelectAcademy}
        component={MatchingSelectAcademy}
      />
      <Stack.Screen
        name={navName.matchingSelectScorer}
        component={MatchingSelectScorer}
      />
      <Stack.Screen name={navName.matchingRegist} component={MatchingRegist} />
      <Stack.Screen name={navName.communityWrite} component={CommunityWrite} />
      <Stack.Screen name={navName.communityEdit} component={CommunityEdit} />
      <Stack.Screen
        name={navName.communityDetails}
        component={CommunityDetails}
      />
      <Stack.Screen name={navName.trainingDetail} component={TrainingDetail} />
      <Stack.Screen
        name={navName.traningRegistering}
        component={TraningRegistering}
      />
      <Stack.Screen
        name={navName.challengeRegistering}
        component={ChallengeRegistering}
      />
      <Stack.Screen
        name={navName.challengeRegistrationComplete}
        component={ChallengeRegistrationComplete}
      />
      <Stack.Screen name={navName.traningClear} component={TraningClear} />
      <Stack.Screen
        name={navName.challengeDetail}
        component={ChallengeDetail}
      />
      <Stack.Screen name={navName.academyRegist} component={AcademyRegist} />
      <Stack.Screen
        name={navName.academyRecruitment}
        component={AcademyRecruitment}
      />
      <Stack.Screen
        name={navName.academyRecruitmentForAdmin}
        component={AcademyRecruitmentForAdmin}
      />
      <Stack.Screen
        name={navName.academyRecruitmentDetail}
        component={AcademyRecruitmentDetail}
      />
      <Stack.Screen
        name={navName.academyRecruitmentRegist}
        component={AcademyRecruitmentRegist}
      />
      <Stack.Screen
        name={navName.academyRecruitmentEdit}
        component={AcademyRecruitmentEdit}
      />
      <Stack.Screen name={navName.nearbyAcademy} component={NearbyAcademy} />
      <Stack.Screen
        name={navName.academyManagement}
        component={AcademyManagement}
      />
      <Stack.Screen name={navName.academyGroup} component={AcademyGroup} />
      <Stack.Screen name={navName.academyAdmin} component={AcademyAdmin} />
      <Stack.Screen
        name={navName.academyCompanyManagement}
        component={AcademyCompanyManagement}
      />
      <Stack.Screen
        name={navName.academyMachingRegistration}
        component={AcademyMachingRegistration}
      />
      <Stack.Screen name={navName.academyCompany} component={AcademyCompany} />
      <Stack.Screen
        name={navName.academyReportDetails}
        component={AcademyReportDetails}
      />
      <Stack.Screen
        name={navName.academyReportDetailsView}
        component={AcademyReportDetailsView}
      />
      <Stack.Screen
        name={navName.academyGroupMove}
        component={AcademyGroupMove}
      />
      <Stack.Screen
        name={navName.academyPlayerProfileEdit}
        component={AcademyPlayerProfileEdit}
      />
      <Stack.Screen name={navName.matchingDetail} component={MatchingDetail} />
      <Stack.Screen name={navName.searchAcademy} component={SearchAcademy} />
      <Stack.Screen
        name={navName.matchingChatRoomListScreen}
        component={MatchingChatRoomListScreenComponent}
      />
      <Stack.Screen
        name={navName.matchingChatRoomScreen}
        component={MatchingChatRoomScreenComponent}
      />
      <Stack.Screen name={navName.termsService} component={TermsService} />
      <Stack.Screen
        name={navName.identifyVerification}
        component={IdentifyVerification}
      />
      <Stack.Screen name={navName.alreadySign} component={AlreadySign} />
      <Stack.Screen name={navName.inputEmail} component={InputEmail} />
      <Stack.Screen name={navName.inputPassword} component={InputPassword} />
      <Stack.Screen name={navName.userInfo} component={UserInfo} />
      <Stack.Screen
        name={navName.performanceInfo}
        component={PerformanceInfo}
      />
      <Stack.Screen name={navName.completeSign} component={CompleteSign} />
      <Stack.Screen name={navName.findUser} component={FindUser} />
      <Stack.Screen name={navName.findUserId} component={FindUserId} />
      <Stack.Screen name={navName.findPassword} component={FindPassword} />
      <Stack.Screen name={navName.resetPassword} component={ResetPassword} />
      <Stack.Screen name={navName.moreProfile} component={MoreProfile} />
      <Stack.Screen name={navName.moreMyDetail} component={MoreMyDetail} />
      <Stack.Screen
        name={navName.moreMyDetailModify}
        component={MoreMyDetailModify}
      />
      <Stack.Screen
        name={navName.moreCheckPhoneNo}
        component={MoreCheckPhoneNo}
      />
      <Stack.Screen name={navName.socialToken} component={SocialToken} />
      <Stack.Screen
        name={navName.socialTokenDetail}
        component={SocialTokenDetail}
      />
      <Stack.Screen name={navName.createWallet} component={CreateWallet} />
      <Stack.Screen name={navName.walletPwd} component={WalletPwd} />
      <Stack.Screen name={navName.checkWalletPwd} component={WalletPwd} />
      <Stack.Screen name={navName.restoreWallet} component={RestoreWallet} />
      <Stack.Screen
        name={navName.walletBackupCheck}
        component={WalletBackupCheck}
      />
      <Stack.Screen name={navName.walletReceive} component={WalletReceive} />
      <Stack.Screen name={navName.walletSetting} component={WalletSetting} />
      <Stack.Screen name={navName.walletSend} component={WalletSend} />
      <Stack.Screen name={navName.walletSending} component={WalletSending} />
      <Stack.Screen
        name={navName.walletSendClear}
        component={WalletSendClear}
      />
      <Stack.Screen
        name={navName.restoreSeedConfirm}
        component={RestoreSeedConfirm}
      />
      <Stack.Screen
        name={navName.privateKeyConfirm}
        component={PrivateKeyConfirm}
      />
      <Stack.Screen name={navName.moreSetting} component={MoreSetting} />
      <Stack.Screen
        name={navName.moreNotification}
        component={MoreNotification}
      />
      <Stack.Screen name={navName.moreStat} component={MoreStat} />
      <Stack.Screen name={navName.moreStatModify} component={MoreStatModify} />
      <Stack.Screen
        name={navName.moreCouponRegister}
        component={MoreCouponRegister}
      />
      <Stack.Screen
        name={navName.moreCouponComplete}
        component={MoreCouponComplete}
      />
      <Stack.Screen name={navName.moreArticle} component={MoreArticle} />
      <Stack.Screen
        name={navName.moreArticleDetail}
        component={MoreArticleDetail}
      />
      <Stack.Screen
        name={navName.moreGameSchedule}
        component={MoreGameSchedule}
      />
      <Stack.Screen
        name={navName.moreMatchDetail}
        component={MoreMatchDetail}
      />
      <Stack.Screen
        name={navName.moreActiveHistory}
        component={MoreActiveHistory}
      />
      <Stack.Screen
        name={navName.mobileAuthenticationMain}
        component={MobileAuthenticationMain}
      />
      <Stack.Screen
        name={navName.mobileAuthenticationId}
        component={MobileAuthenticationId}
      />
      <Stack.Screen
        name={navName.mobileAuthenticationPassword}
        component={MobileAuthenticationPassword}
      />
      <Stack.Screen
        name={navName.moreMobileAuthenticationMyInfo}
        component={MoreMobileAuthenticationMyInfo}
      />
      <Stack.Screen
        name={navName.searchAddressTest}
        component={SearchAddressTest}
      />
      <Stack.Screen
        name={navName.tournamentDetail}
        component={TournamentDetail}
      />
      <Stack.Screen name={navName.alarmPage} component={AlarmPage} />
      <Stack.Screen
        name={navName.moreTermsService}
        component={MoreTermsService}
      />
      <Stack.Screen name={navName.moreNotice} component={MoreNotice} />
      <Stack.Screen
        name={navName.moreNoticeDetail}
        component={MoreNoticeDetail}
      />
      <Stack.Screen name={navName.moreQuestion} component={MoreQuestion} />
      <Stack.Screen name={navName.moreInquiry} component={MoreInquiry} />
      <Stack.Screen
        name={navName.moreInquiryRegist}
        component={MoreInquiryRegist}
      />
      <Stack.Screen
        name={navName.moreInquiryDetail}
        component={MoreInquiryDetail}
      />
      <Stack.Screen
        name={navName.moreModifyChallenge}
        component={MoreModifyChallenge}
      />
      <Stack.Screen
        name={navName.masterVideoDetail}
        component={MasterVideoDetail}
      />
      <Stack.Screen
        name={navName.masterVideoDetailPlayer}
        component={MasterVideoDetailPlayer}
      />
      <Stack.Screen
        name={navName.challengeContentPlayer}
        component={ChallengeContentPlayer}
      />
      <Stack.Screen name={navName.addDetails} component={AddDetails} />
      <Stack.Screen
        name={navName.challengeAddDetails}
        component={ChallengeAddDetails}
      />
      <Stack.Screen
        name={navName.challengeEditDetails}
        component={ChallengeEditDetails}
      />
      <Stack.Screen name={navName.videoPlayer} component={VideoPlayer} />
      <Stack.Screen
        name={navName.challengeVideoPlayer}
        component={ChallengeVideoPlayer}
      />
      <Stack.Screen
        name={navName.traningVideoDetail}
        component={TraningVideoDetail}
      />
      <Stack.Screen name={navName.swap} component={Swap} />
      <Stack.Screen name={navName.swapTranfer} component={SwapTranfer} />
      <Stack.Screen
        name={navName.playgroundDetail}
        component={PlaygroundDetail}
      />
      <Stack.Screen
        name={navName.tournamentApplyComplete}
        component={TournamentApplyComplete}
      />
      <Stack.Screen name={navName.walletBackup} component={WalletBackup} />
      <Stack.Screen name={navName.walletDetail} component={WalletDetail} />
      {/* 테스트용 ]] 테스트용입니다. 일반 페이지는 테스트 주석 위에 넣어주세요. */}
      <Stack.Screen name={navName.test} component={Test} />
      <Stack.Screen name={navName.pageMoveTest} component={PageMoveTest} />
      <Stack.Screen name={navName.signedTestPage} component={SignedTestPage} />
      <Stack.Screen
        name={navName.signedTestPage2}
        component={SignedTestPage2}
      />
      <Stack.Screen name={navName.commonTestPage} component={CommonTestPage} />
      <Stack.Screen
        name={navName.commonTestPage2}
        component={CommonTestPage2}
      />
      <Stack.Screen
        name={navName.noSignedTestPage}
        component={NoSignedTestPage}
      />
      <Stack.Screen
        name={navName.noSignedTestPage2}
        component={NoSignedTestPage2}
      />
      <Stack.Screen name={navName.googleLogin} component={GoogleLogin} />
      <Stack.Screen name={navName.geolocation} component={GeoLocationTest} />
      <Stack.Screen name={navName.videoTest} component={VideoTest} />
      <Stack.Screen
        name={navName.videoTestByCase}
        component={VideoTestByCase}
      />
      <Stack.Screen
        name={navName.videoTestForCompression}
        component={VideoTestForCompression}
      />
      <Stack.Screen name={navName.fbLogin} component={FaceBookLogin} />
      <Stack.Screen name={navName.auth} component={Authetication} />
      <Stack.Screen
        name={navName.niceMobileMain}
        component={AutheticationMobileMain}
      />
      <Stack.Screen
        name={navName.niceMobileSuccess}
        component={AutheticationSuccess}
      />
      <Stack.Screen name={navName.mqttTest} component={MqttTest} />
      <Stack.Screen name={navName.youtubeTest} component={YoutubeTest} />
      <Stack.Screen name={navName.calendarTest} component={CalendarTest} />
      <Stack.Screen name={navName.deviceTest} component={DeviceTest} />
      <Stack.Screen name={navName.naverMapTest} component={NaverMapTest} />
      <Stack.Screen name={navName.chatTest} component={ChatTestCompoent} />
      <Stack.Screen
        name={navName.chatRoomList}
        component={ChatRoomListScreenComponent}
      />
      <Stack.Screen
        name={navName.chatRoom}
        component={ChatRoomScreenComponent}
      />
      <Stack.Screen
        name={navName.chatCreateRoom}
        component={ChatCreateRoomScreenComponent}
      />
    </Stack.Navigator>
  );
}
