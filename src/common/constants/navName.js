// authPage : 로그인 후 갈 수 있는 페이지
const authPage = {
  socialToken: 'socialToken',
  socialTokenDetail: 'socialTokenDetail',
  createWallet: 'createWallet',
  walletPwd: 'walletPwd',
  checkWalletPwd: 'checkWalletPwd',
  walletBackupCheck: 'walletBackupCheck',
  walletBackup: 'walletBackup',
  walletDetail: 'walletDetail',
  restoreWallet: 'restoreWallet',
  walletReceive: 'walletReceive',
  walletSetting: 'walletSetting',
  walletSend: 'walletSend',
  walletSendClear: 'walletSendClear',
  walletSending: 'walletSending',
  restoreSeedConfirm: 'restoreSeedConfirm',
  privateKeyConfirm: 'privateKeyConfirm',
  academyRegist: 'academyRegist',
  academyManagement: 'academyManagement',
  academyDetailSetting: 'academyDetailSetting',
  report: 'report',
  academyEdit: 'academyEdit',
  communityWrite: 'communityWrite',
  communityEdit: 'communityEdit',

  moreQuestion: 'moreQuestion',
  moreInquiry: 'moreInquiry',
  moreInquiryRegist: 'moreInquiryRegist',
  moreInquiryDetail: 'moreInquiryDetail',
  academyRecruitmentRegist: 'academyRecruitmentRegist',
  academyRecruitmentEdit: 'academyRecruitmentEdit',
  moreModifyChallenge: 'moreModifyChallenge',
  academyGroup: 'academyGroup',
  academyAdmin: 'academyAdmin',
  academyCompany: 'academyCompany',
  academyCompanyManagement: 'academyCompanyManagement',
  academyReportDetails: 'academyReportDetails',
  academyReportDetailsView: 'academyReportDetailsView',
  academyPlayerDetail: 'academyPlayerDetail',
  academyPlayerProfileEdit: 'academyPlayerProfileEdit',
  academyGroupMove: 'academyGroupMove',
  academyMachingRegistration: 'academyMachingRegistration',
  matchingCancel: 'matchingCancel',
  matchingRegistReview: 'matchingRegistReview',
  matchingReject: 'matchingReject',
  matchingScore: 'matchingScore',
  matchingSelectAcademy: 'matchingSelectAcademy',
  matchingSelectScorer: 'matchingSelectScorer',
  matchingRegist: 'matchingRegist',
  academyScheduleWrite: 'academyScheduleWrite',
  academyScheduleEdit: 'academyScheduleEdit',
  moreMyInfo: 'moreMyInfo',
  moreProfile: 'moreProfile',
  moreMyDetail: 'moreMyDetail',
  moreMyDetailModify: 'moreMyDetailModify',
  moreMyDetailEdit: 'moreMyDetailEdit',
  moreCheckPhoneNo: 'moreCheckPhoneNo',
  moreSetting: 'moreSetting',
  moreNotification: 'moreNotification',
  moreStat: 'moreStat',
  moreStatModify: 'moreStatModify',
  moreCouponRegister: 'moreCouponRegister',
  moreCouponComplete: 'moreCouponComplete',
  moreArticle: 'moreArticle',
  moreArticleDetail: 'moreArticleDetail',
  moreGameSchedule: 'moreGameSchedule',
  moreMatchDetail: 'moreMatchDetail',
  moreActiveHistory: 'moreActiveHistory',
  moreTermsService: 'moreTermsService',
  academyRecruitmentForAdmin: 'academyRecruitmentForAdmin',
  matchingChatRoomListScreen: 'matchingChatRoomListScreen',
  matchingChatRoomScreen: 'matchingChatRoomScreen',
  moreAccountManage: 'moreAccountManage',
  swap: 'swap',
  swapTranfer: 'swapTranfer',
  tournamentApplyComplete: 'tournamentApplyComplete',
  traningVideoDetail: 'traningVideoDetail',
  traningRegistering: 'traningRegistering',
  traningClear: 'traningClear',
  trainingDetail: 'trainingDetail',
  videoPlayer: 'videoPlayer',
  addDetails: 'addDetails',
  masterVideoDetail: 'masterVideoDetail',
  masterVideoDetailPlayer: 'masterVideoDetailPlayer',
  challengeDetail: 'challengeDetail',
  challengeAddDetails: 'challengeAddDetails',
  challengeEditDetails: 'challengeEditDetails',
  challengeRegistering: 'challengeRegistering',
  challengeRegistrationComplete: 'challengeRegistrationComplete',
  challengeContentPlayer: 'challengeContentPlayer',
  challengeVideoPlayer: 'challengeVideoPlayer',
  moreNotice: 'moreNotice',
  moreNoticeDetail: 'moreNoticeDetail',
  unsubscribe: 'Unsubscribe',

  // 아래는 테스트용
  signedTestPage: 'signedTestPage',
  signedTestPage2: 'signedTestPage2',
};

// noAuthPage : 로그인과 상관없이 갈 수 있는 페이지
const noAuthPage = {
  login: 'login',
  termsService: 'termsService',
  identifyVerification: 'identifyVerification',
  alreadySign: 'alreadySign',
  inputEmail: 'inputEmail',
  inputPassword: 'inputPassword',
  userInfo: 'userInfo',
  performanceInfo: 'performanceInfo',
  completeSign: 'completeSign',
  findUser: 'findUser',
  findUserId: 'findUserId',
  findPassword: 'findPassword',
  resetPassword: 'resetPassword',
  mobileAuthenticationMain: 'mobileAuthenticationMain',
  mobileAuthenticationId: 'mobileAuthenticationId',
  mobileAuthenticationPassword: 'mobileAuthenticationPassword',
  moreMobileAuthenticationMyInfo: 'moreMobileAuthenticationMyInfo',
  nearbyAcademy: 'nearbyAcademy',
  academyMatchSchedule: 'academyMatchSchedule',
  academyMatchDetail: 'academyMatchDetail',
  academyDetail: 'academyDetail',
  academyIntroduction: 'academyIntroduction',
  academyPlayer: 'academyPlayer',
  academyRecruitment: 'academyRecruitment',
  academyRecruitmentDetail: 'academyRecruitmentDetail',
  academySchedule: 'academySchedule',
  academyCommunity: 'academyCommunity',
  academyCommunityDetail: 'academyCommunityDetail',
  searchAcademy: 'searchAcademy',
  matchingSchedule: 'matchingSchedule',
  matchingDetail: 'matchingDetail',
  matchingHistory: 'matchingHistory',
  matchingReview: 'matchingReview',
  tournamentDetail: 'tournamentDetail',
  alarmPage: 'alarmPage',
  communityDetails: 'communityDetails',
  playgroundDetail: 'playgroundDetail',

  // 아래는 테스트용
  test: 'test',
  pageMoveTest: 'pageMoveTest',
  commonTestPage: 'commonTestPage',
  commonTestPage2: 'commonTestPage2',
  noSignedTestPage: 'noSignedTestPage',
  noSignedTestPage2: 'noSignedTestPage2',
  googleLogin: 'googleLogin',
  geolocation: 'geolocation',
  videoTest: 'videoTest',
  videoTestByCase: 'videoTestByCase',
  videoTestForCompression: 'videoTestForCompression',
  fbLogin: 'fbLogin',
  auth: 'auth',
  niceMobileMain: 'niceMobileMain',
  niceMobileSuccess: 'niceMobileSuccess',
  mqttTest: 'mqttTest',
  chatTest: 'chatTest',
  chatRoomList: 'chatRoomList',
  chatRoom: 'chatRoom',
  chatCreateRoom: 'chatCreateRoom',
  youtubeTest: 'youtubeTest',
  calendarTest: 'calendarTest',
  deviceTest: 'deviceTest',
  instagramTest: 'instagramTest',
  naverMapTest: 'naverMapTest',
  searchAddressTest: 'searchAddressTest',
};

// bottomPage : 하단 네비게이션 페이지
const bottomPage = {
  home: 'home',
  academyMember: 'academyMember',
  matchingSchedule: 'matchingSchedule',
  community: 'community',
  training: 'training',
};

// prefix 연결
export const NAV_PREFIX = {
  auth: 'auth',
  noAuth: 'noAuth',
  bottom: 'bottom',
};

Object.keys(authPage).forEach(key => {
  authPage[key] = `${NAV_PREFIX.auth}-${authPage[key]}`;
});
Object.keys(noAuthPage).forEach(key => {
  noAuthPage[key] = `${NAV_PREFIX.noAuth}-${noAuthPage[key]}`;
});
Object.keys(bottomPage).forEach(key => {
  bottomPage[key] = `${NAV_PREFIX.bottom}-${bottomPage[key]}`;
});

export const navName = {
  ...authPage,
  ...noAuthPage,
  ...bottomPage,
};
