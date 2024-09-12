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
  academyReport: 'academyReportDetails',
  academyReportDetailsView: 'academyReportDetailsView',
  academyPlayerDetail: 'academyPlayerDetail',
  academyPlayerProfileEdit: 'academyPlayerProfileEdit',
  academyGroupMove: 'academyGroupMove',
  academyMatchingRegistration: 'academyMatchingRegistration',
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
  moreArticleBookmarks: 'moreArticleBookmarks',
  moreGameSchedule: 'moreGameSchedule',
  moreMatchDetail: 'moreMatchDetail',
  moreActiveHistory: 'moreActiveHistory',
  moreTermsService: 'moreTermsService',
  academyRecruitmentForAdmin: 'academyRecruitmentForAdmin',
  matchingChatRoomListScreen: 'matchingChatRoomListScreen',
  matchingChatRoomScreen: 'matchingChatRoomScreen',
  moreAccountManage: 'moreAccountManage',
  moreChangePassword: 'moreChangePassword',
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
  communityFavPlayerDetails: 'communityFavPlayerDetails',
  event: 'event',
  eventApplyType: 'eventApplyType', // 접수 유형
  eventApplyPrevInformation: 'eventApplyPrevInformation', // 접수 사전 정보 확인
  eventApplyInputMyInfo: 'eventApplyInputMyInfo', // 접수 내 정보 입력
  eventApplyInputAcademy: 'eventApplyInputAcademy', // 접수 소속 아카데미 입력
  eventApplyInputPerformance: 'eventApplyInputPerformance', // 접수 퍼포먼스 입력
  eventApplyInputDepositInfo: 'eventApplyInputDepositInfo', // 접수 입금 정보 입력
  eventApplyInputCheck: 'eventApplyInputCheck', // 접수 최종 확인
  eventApplyComplete: 'eventApplyComplete', // 접수 최종 확인

  moreEvent: 'moreEvent', // 더보기 > 이벤트 참여 내역
  moreNoneEvent: 'moreNoneEvent', // 더보기 > 이벤트 참여 내역 (참여 내역 없을때)

  addVideoDetail: 'addVideoDetail',
  videoUploadPlayer: 'videoUploadPlayer',
  videoRegistering: 'videoRegistering',
  videoUploadComplete: 'videoUploadComplete',

  // event tab
  eventMyInfo: 'eventMyInfo',
  eventSoccerBee: 'eventSoccerBee',
  eventVideoList: 'eventVideoList',
  eventComment: 'eventComment',
  eventParticipantInfo: 'eventParticipantInfo',
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
  moreArticle: 'moreArticle',
  moreArticleDetail: 'moreArticleDetail',
  eventDetail: 'eventDetail',
  eventNoticeList: 'eventNoticeList',
  eventNoticeDetail: 'eventNoticeDetail',
  eventParticipantList: 'eventParticipantList', // 참가자 목록
  eventParticipantPartList: 'eventParticipantPartList', // 참가자 목록 더보기
  eventParticipantDetail: 'eventParticipantDetail', // 참가자 정보
  eventParticipantVideoReels: 'eventParticipantVideoReels', // 참가자 영상
};

// bottomPage : 하단 네비게이션 페이지
const bottomPage = {
  home: 'home',
  academyMember: 'academyMember',
  matchingSchedule: 'matchingSchedule',
  community: 'community',
  communityFavPlayer: 'communityFavPlayer',
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
