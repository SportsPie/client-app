import api from '../utils/Api';
// API Prefix
const baseURL = process.env.API_SERVER;
const API_VERSION = 'api/v1';
const API_PREFIX = `${baseURL}/${API_VERSION}`;

// API Type
const API_AUTH = `${API_PREFIX}/auth`;
const API_HOME = `${API_PREFIX}/home`;
const API_SEARCH = `${API_PREFIX}/search`;
const API_CHAT = `${API_PREFIX}/chat`;
const API_MORE = `${API_PREFIX}/more`;
const API_COMMON = `${API_PREFIX}/common`;
const API_COMMUNITY = `${API_PREFIX}/community`;
const API_MATCH = `${API_PREFIX}/match`;
const API_TOURNAMENT = `${API_PREFIX}/tournament`;
const API_PLAYGROUND = `${API_PREFIX}/playground`;
const API_TRAINING = `${API_PREFIX}/training`;
const API_CHALLENGE = `${API_PREFIX}/challenge`;
const API_ACADEMY = `${API_PREFIX}/acdmy`;
const API_ACADEMY_CONFIG = `${API_PREFIX}/acdmy-config`;
const API_TEST = `${API_PREFIX}/open/test`;

// Request > Headers > multipart/form-data
export const formDataConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
};
// ----------------------------------------------------------
// [ AUTH ] 공통 / 인증 / 코드 조회
// ----------------------------------------------------------
// SPIC_IF_030 ::  이메일 중복 확인
export const apiValidateEmail = email => {
  return api.get(`${API_COMMON}/validate-email`, { params: { email } });
};
// SPIC_IF_032 ::  현재 약관 타입별 조회
export const apiTermsType = termsType => {
  return api.get(`${API_COMMON}/terms/${termsType}`, { params: { termsType } });
};
// SPIC_IF_033 ::  시/도 리스트 조회
export const apiCityList = () => {
  return api.get(`${API_COMMON}/city-list`);
};

// SPIC_IF_034 ::  시/군/구 리스트 조회
export const apiGuList = cityCode => {
  return api.get(`${API_COMMON}/gu-list?cityCode=${cityCode}`);
};

// SPIC_IF_035 ::  읍/면/동 리스트 조회
export const apiDongList = (cityCode, guCode) => {
  return api.get(
    `${API_COMMON}/dong-list?cityCode=${cityCode}&guCode=${guCode}`,
  );
};
// SPIC_IF_036 :: 아카데미 필터 리스트 조회
export const apiGetAcdmyFilters = () => {
  return api.get(`${API_COMMON}/acdmy-filters`);
};

// SPIC_IF_038 ::  개인정보 처리 동의 약관 날짜 리스트 조회
export const apiGetTermsList = termsType => {
  return api.get(`${API_COMMON}/terms-list/${termsType}`, {
    params: { termsType },
  });
};

// SPIC_IF_041 :: 매치 취소 사유 조회
export const apiMatchCancelReason = () => {
  return api.get(`${API_COMMON}/match-cancel-reason`);
};

// SPIC_IF_042 :: FAQ 카테고리 리스트 조회
export const apiGetFAQCategoryList = () => {
  return api.get(`${API_COMMON}/faq-categories`);
};

// SPIC_IF_043 :: 배너 조회수 갱신
export const apiPatchBannerViewCnt = boardIdx => {
  return api.patch(`${API_COMMON}/view-banner/${boardIdx}`);
};

// ----------------------------------------------------------
// [ AUTH ] 회원인증
// ----------------------------------------------------------

// SPIC_IF_001 ::  로그인
export const apiLogin = data => {
  return api.post(`${API_AUTH}/login`, data);
};

// [ SPIC_IF_XXX ] - NICE 본인인증 요청 암호화 데이터 생성
export const apiGetEncDataFromNice = () => {
  return api.get(`${API_AUTH}/nice/enc-data`);
};

// SPIC_IF_002 ::  아이디 찾기
export const apiVerifyId = data => {
  return api.post(`${API_AUTH}/verify-id`, data);
};

// SPIC_IF_003 ::  패스워드 변경
export const apiPassword = data => {
  return api.patch(`${API_AUTH}/password`, data);
};

// SPIC_IF_004 ::  회원가입
export const apiJoin = data => {
  return api.post(`${API_AUTH}/join`, data, formDataConfig);
};

// SPIC_IF_010 ::  SNS 로그인
export const apiPostSnsLogin = data => {
  return api.post(`${API_AUTH}/sns-login`, data);
};

// SPIC_IF_011 ::  SNS 회원가입
export const apiPostSnsJoin = data => {
  return api.post(`${API_AUTH}/sns-join`, data, formDataConfig);
};

// SPIC_IF_012 ::  추천인 코드 확인
export const apiVerifyReferral = referralCode => {
  return api.get(`${API_AUTH}/verify-referral`, { params: { referralCode } });
};

// SPIC_IF_016 ::  회원 정보 추가 인증
export const apiPutAddInfo = data => {
  return api.put(`${API_AUTH}/add-info`, data, formDataConfig);
};

// SPIC_IF_017 ::  APPLE 로그인 정보
export const apiPostAuthAppleInfo = data => {
  return api.post(`${API_AUTH}/apple-info`, data);
};

// SPIC_IF_018 ::  마케팅 활용 동의 갱신
export const apiPostAuthAgreeMarketing = data => {
  return api.post(`${API_AUTH}/agree-marketing`, data);
};

// ----------------------------------------------------------
// [ HOME ]
// ----------------------------------------------------------
// SPIC_IF_101 ::  메인 조회 (비회원)
export const apiGetHomeOpen = data => {
  return api.get(`${API_HOME}/open`, { params: data });
};
// SPIC_IF_102 ::  메인 조회 (회원)
export const apiGetHomeInit = data => {
  return api.get(`${API_HOME}/init`, { params: data });
};

// ----------------------------------------------------------
// [ SEARCH ]
// ----------------------------------------------------------
// SPIC_IF_150 ::  아카데미 리스트 조회
export const apiGetSearchOpenAcademy = data => {
  return api.get(`${API_SEARCH}/open/academy`, { params: data });
};

// ----------------------------------------------------------
// [ ACADEMY ]
// ----------------------------------------------------------
// SPIC_IF_201 :: 주변 아카데미 리스트 조회
export const apiGetAcademyNearby = data => {
  return api.get(`${API_ACADEMY}/open/nearby`, { params: data });
};

// SPIC_IF_210 :: 메인 조회 (비회원)
export const apiGetAcademyOpen = data => {
  return api.get(`${API_ACADEMY}/open`, { params: data });
};

// SPIC_IF_211 :: 메인 조회 (회원)
export const apiGetAcademyInit = data => {
  return api.get(`${API_ACADEMY}/init`, { params: data });
};

// SPIC_IF_212 :: 아카데미 생성
export const apiPostAcademy = data => {
  return api.post(`${API_ACADEMY}`, data, formDataConfig);
};

// SPIC_IF_213 :: 아카데미 회원 모집 리스트
export const apiPostAcademyOpenRecruit = data => {
  return api.get(`${API_ACADEMY}/open/recruit`, { params: data });
};

// SPIC_IF_214 :: 아카데미 회원 모집 상세 조회 (비회원)
export const apiPostAcademyOpenRecruitByIdx = (recruitIdx, data) => {
  return api.get(`${API_ACADEMY}/open/recruit/${recruitIdx}`, { params: data });
};

// SPIC_IF_215 :: 아카데미 회원 모집 상세 조회 (회원)
export const apiGetAcademyOpenRecruitByIdx = (recruitIdx, data) => {
  return api.get(`${API_ACADEMY}/recruit/${recruitIdx}`, { params: data });
};

// SPIC_IF_216 :: 아카데미 가입 신청
export const apiPostAcademyJoin = data => {
  return api.post(`${API_ACADEMY}/join`, data);
};

// SPIC_IF_217 :: 아카데미 가입 신청 취소
export const apiDeleteAcademyJoin = academyIdx => {
  return api.delete(`${API_ACADEMY}/join/${academyIdx}`);
};

// SPIC_IF_220 :: 아카데미 상세 조회
export const apiGetAcademyDetail = academyIdx => {
  return api.get(`${API_ACADEMY}/open/${academyIdx}`);
};

// SPIC_IF_221 :: 아카데미 경기 일정 조회
export const apiGetAcademyOpenMatches = data => {
  return api.get(`${API_ACADEMY}/open/matches`, { params: data });
};

// SPIC_IF_222 :: 아카데미 탈퇴하기
export const apiDeleteAcademyLeave = (academyIdx, data) => {
  return api.delete(`${API_ACADEMY}/leave/${academyIdx}`, { params: data });
};

// SPIC_IF_223 :: 아카데미 신고하기
export const apiPostAcademyReport = data => {
  return api.post(`${API_ACADEMY}/report`, data);
};

// SPIC_IF_230 :: 아카데미 경기이력 통계 조회
export const apiGetAcademyOpenMatchResultsByIdx = (academyIdx, data) => {
  return api.get(`${API_ACADEMY}/open/match-results/${academyIdx}`, {
    params: data,
  });
};

// SPIC_IF_231 :: 아카데미 경기이력 리스트 조회
export const apiGetAcademyOpenMatchResults = data => {
  return api.get(`${API_ACADEMY}/open/match-results`, { params: data });
};

// SPIC_IF_240 :: 아카데미 경기 리뷰 리스트 조회
export const apiGetAcademyOpenMatchReviews = data => {
  return api.get(`${API_ACADEMY}/open/match-reviews`, { params: data });
};

// SPIC_IF_250 :: 아카데미 일정 리스트 조회
export const apiGetAcademyOpenSchedule = data => {
  return api.get(`${API_ACADEMY}/open/schedule`, { params: data });
};

// SPIC_IF_251 :: 일정 등록
export const apiPostAcademyMngSchedule = data => {
  return api.post(`${API_ACADEMY}/mng/schedule`, data);
};

// SPIC_IF_252 :: 일정 수정
export const apiPutAcademyMngSchedule = data => {
  return api.put(`${API_ACADEMY}/mng/schedule`, data);
};

// SPIC_IF_253 :: 일정 삭제
export const apiDeleteAcademyMngSchedule = scheduleIdx => {
  return api.delete(`${API_ACADEMY}/mng/schedule/${scheduleIdx}`);
};

// ----------------------------------------------------------
// [ ACADEMY_CONFIG ]
// ----------------------------------------------------------

// SPIC_IF_301 :: 아카데미 수정
export const apiPutAcademyConfigMngAcademy = data => {
  return api.put(`${API_ACADEMY_CONFIG}/mng/academy`, data, formDataConfig);
};

// SPIC_IF_302 :: 아카데미 삭제
export const apiDeleteAcademyConfigMngAcademy = () => {
  return api.delete(`${API_ACADEMY_CONFIG}/mng/academy`);
};

// SPIC_IF_310 :: 선수 리스트 조회
export const apiGetAcademyConfigMngPlayers = data => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/players`, { params: data });
};

// SPIC_IF_311 :: 선수 상세 조회
export const apiGetAcademyConfigMngPlayersByUserIdx = userIdx => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/players/${userIdx}`);
};

// SPIC_IF_312 :: 선수 프로필 수정
export const apiPutAcademyConfigMngPlayers = data => {
  return api.put(`${API_ACADEMY_CONFIG}/mng/players`, data);
};

// SPIC_IF_313 :: 선수 내보내기
export const apiDeleteAcademyConfigMngPlayersByUserIdx = userIdx => {
  return api.delete(`${API_ACADEMY_CONFIG}/mng/players/${userIdx}`);
};

// SPIC_IF_314 :: 선수 그룹 이동
export const apiPatchAcademyConfigMngPlayerGroup = data => {
  return api.patch(`${API_ACADEMY_CONFIG}/mng/player-group`, data);
};

// SPIC_IF_315 :: 선수별 경기매칭 참가 이력 조회
export const apiGetAcademyConfigMngPlayerMatchHistory = (userIdx, data) => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/player-match-history/${userIdx}`, {
    params: data,
  });
};

// SPIC_IF_316 :: 선수별 대회 참가 이력 조회
export const apiGetAcademyConfigMngPlayerTournamentHistory = (
  userIdx,
  data,
) => {
  return api.get(
    `${API_ACADEMY_CONFIG}/mng/player-tournament-history/${userIdx}`,
    { params: data },
  );
};

// SPIC_IF_320 :: 그룹 리스트 조회
export const apiGetAcademyConfigMngGroups = data => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/groups`, { params: data });
};

// SPIC_IF_321 :: 그룹 등록
export const apiPostAcademyConfigMngGroups = data => {
  return api.post(`${API_ACADEMY_CONFIG}/mng/groups`, data);
};

// SPIC_IF_322 :: 그룹 수정
export const apiPutAcademyConfigMngGroups = data => {
  return api.put(`${API_ACADEMY_CONFIG}/mng/groups`, data);
};

// SPIC_IF_323 :: 그룹 삭제
export const apiDeleteAcademyConfigMngGroups = groupIdx => {
  return api.delete(`${API_ACADEMY_CONFIG}/mng/groups/${groupIdx}`);
};

// SPIC_IF_330 :: 아카데미 회원 모집 리스트 조회
export const apiGetAcademyConfigMngRecruits = data => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/recruits`, { params: data });
};

// SPIC_IF_331 :: 아카데미 회원 모집 상세 조회
export const apiGetAcademyConfigMngRecruitsDetail = recruitIdx => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/recruits/${recruitIdx}`);
};

// SPIC_IF_332 :: 아카데미 회원 모집 등록
export const apiPostAcademyConfigMngRecruits = data => {
  return api.post(`${API_ACADEMY_CONFIG}/mng/recruits`, data);
};

// SPIC_IF_333 :: 아카데미 회원 모집 수정
export const apiPutAcademyConfigMngRecruits = data => {
  return api.put(`${API_ACADEMY_CONFIG}/mng/recruits`, data);
};

// SPIC_IF_334 :: 아카데미 회원 모집 삭제
export const apiDeleteAcademyConfigMngRecruits = recruitIdx => {
  return api.delete(`${API_ACADEMY_CONFIG}/mng/recruits/${recruitIdx}`);
};

// SPIC_IF_335 :: 아카데미 회원 모집 종료
export const apiPatchAcademyConfigMngClose = (recruitIdx, data) => {
  return api.patch(`${API_ACADEMY_CONFIG}/mng/recruits/close/${recruitIdx}`);
};

// SPIC_IF_336 :: 아카데미 회원 신청 승인
export const apiPatchAcademyConfigMngConfirm = (joinIdx, data) => {
  return api.patch(
    `${API_ACADEMY_CONFIG}/mng/recruits/confirm/${joinIdx}`,
    data,
  );
};

// SPIC_IF_337 :: 아카데미 회원 신청 거절
export const apiPatchAcademyConfigMngReject = (joinIdx, data) => {
  return api.patch(
    `${API_ACADEMY_CONFIG}/mng/recruits/reject/${joinIdx}`,
    data,
  );
};

// SPIC_IF_338 :: 아카데미별 모집 공고 클래스 리스트 조회
export const apiGetAcademyConfigMngRecruitClasses = data => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/recruit-classes`, { params: data });
};

// SPIC_IF_339 :: 아카데미 가입 신청 회원 리스트 조회(미공고 가입신청)
export const apiGetAcademyConfigMngNoRecruit = () => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/no-recruits`);
};

// SPIC_IF_340 :: 사업자 인증 요청
export const apiPostAcademyConfigMngCert = data => {
  return api.post(`${API_ACADEMY_CONFIG}/mng/cert`, data);
};

// SPIC_IF_341 :: 사업자 재인증 요청
export const apiPostAcademyConfigMngRecert = data => {
  return api.post(`${API_ACADEMY_CONFIG}/mng/recert`, data);
};

// SPIC_IF_350 :: 신고내역 리스트 조회
export const apiGetAcademyConfigMngReports = data => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/reports`, { params: data });
};

// SPIC_IF_351 :: 신고내역 상세 조회
export const apiGetAcademyConfigMngReportsDetail = (reportType, reportIdx) => {
  return api.get(
    `${API_ACADEMY_CONFIG}/mng/reports/${reportType}/${reportIdx}`,
  );
};

// SPIC_IF_352 :: 신고글 비공개 처리
export const apiPatchAcademyConfigMngReportsClose = (reportType, reportIdx) => {
  return api.patch(
    `${API_ACADEMY_CONFIG}/mng/reports/close/${reportType}/${reportIdx}`,
  );
};

// SPIC_IF_353 :: 신고 처리완료
export const apiPatchAcademyConfigMngReportsComplete = (
  reportType,
  reportIdx,
) => {
  return api.patch(
    `${API_ACADEMY_CONFIG}/mng/reports/complete/${reportType}/${reportIdx}`,
  );
};

// SPIC_IF_360 :: 운영자 리스트 조회
export const apiGetAcademyConfigMngManagers = data => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/managers`, { params: data });
};

// SPIC_IF_361 :: 아카데미 회원(운영자) 검색 (이름 검색)
export const apiGetAcademyConfigMngManagersFind = data => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/managers/find`, { params: data });
};

// SPIC_IF_362 :: 운영자 등록
export const apiPostAcademyConfigMngManagers = (userIdx, data) => {
  return api.post(`${API_ACADEMY_CONFIG}/mng/managers/${userIdx}`);
};

// SPIC_IF_363 :: 운영자 해제
export const apiDeleteAcademyConfigMngManagers = userIdx => {
  return api.delete(`${API_ACADEMY_CONFIG}/mng/managers/${userIdx}`);
};

// SPIC_IF_370 :: 대회 접수 내역 리스트 조회
export const apiGetMngTournament = data => {
  return api.get(`${API_ACADEMY_CONFIG}/mng/tournament`, { params: data });
};

// ----------------------------------------------------------
// [ Community ]
// ----------------------------------------------------------

// SPIC_IF_401 :: 커뮤니티 리스트 조회
export const apiGetCommunityOpen = data => {
  return api.get(`${API_COMMUNITY}/open`, { params: data });
};

// SPIC_IF_402 :: 커뮤니티 상세 조회 (비회원)
export const apiGetCommunityOpenDetail = (feedIdx, data) => {
  return api.get(`${API_COMMUNITY}/open/${feedIdx}`, { params: data });
};

// SPIC_IF_403 :: 커뮤니티 상세 조회 (회원)
export const apiGetCommunityDetail = feedIdx => {
  return api.get(`${API_COMMUNITY}/${feedIdx}`);
};

// SPIC_IF_404 :: 커뮤니티 댓글 리스트 조회 (비회원)
export const apiGetCommunityOpenCommentList = (feedIdx, data) => {
  return api.get(`${API_COMMUNITY}/open/comment/${feedIdx}`, { params: data });
};

// SPIC_IF_405 :: 커뮤니티 댓글 리스트 조회 (회원)
export const apiGetCommunityCommentList = (feedIdx, data) => {
  return api.get(`${API_COMMUNITY}/comment/${feedIdx}`, { params: data });
};

// SPIC_IF_406 :: 커뮤니티 피드 등록
export const apiPostCommunity = data => {
  return api.post(`${API_COMMUNITY}`, data, formDataConfig);
};

// SPIC_IF_407 :: 커뮤니티 피드 수정
export const apiPutCommunity = data => {
  return api.put(`${API_COMMUNITY}`, data, formDataConfig);
};

// SPIC_IF_408 :: 커뮤니티 피드 삭제
export const apiDeleteCommunity = feedIdx => {
  return api.delete(`${API_COMMUNITY}/${feedIdx}`);
};

// SPIC_IF_409 :: 커뮤니티 댓글 등록
export const apiPostCommunityComment = data => {
  return api.post(`${API_COMMUNITY}/comment`, data);
};

// SPIC_IF_410 :: 커뮤니티 댓글 수정
export const apiPutCommunityComment = data => {
  return api.put(`${API_COMMUNITY}/comment`, data);
};

// SPIC_IF_411 :: 커뮤니티 댓글 삭제
export const apiDeleteCommunityComment = commentIdx => {
  return api.delete(`${API_COMMUNITY}/comment/${commentIdx}`);
};

// SPIC_IF_412 :: 커뮤니티 좋아요 등록
export const apiPatchCommunityLike = (feedIdx, data) => {
  return api.patch(`${API_COMMUNITY}/like/${feedIdx}`, data);
};

// SPIC_IF_413 :: 커뮤니티 좋아요 취소
export const apiPatchCommunityUnLike = (feedIdx, data) => {
  return api.patch(`${API_COMMUNITY}/unlike/${feedIdx}`, data);
};

// SPIC_IF_414 :: 피드 고정하기
export const apiPatchCommunityMngFix = feedIdx => {
  return api.patch(`${API_COMMUNITY}/mng/fix/${feedIdx}`);
};

// SPIC_IF_415 :: 피드 고정하기 취소
export const apiPatchCommunityMngUnFix = (feedIdx, data) => {
  return api.patch(`${API_COMMUNITY}/mng/unfix/${feedIdx}`, data);
};

// SPIC_IF_416 :: 커뮤니티 상세 조회 (댓글 IDX)
export const apiGetCommunityFindFeed = (commentIdx, data) => {
  return api.get(`${API_COMMUNITY}/find-feed/${commentIdx}`, data);
};

// SPIC_IF_490 :: 커뮤니티 필터 리스트 조회
export const apiGetCommunityOpenFilters = data => {
  return api.get(`${API_COMMUNITY}/open/filters`);
};

// ----------------------------------------------------------
// [ Match ]
// ----------------------------------------------------------
// SPIC_IF_501 :: 매칭 리스트 조회
export const apiGetMatchList = data => {
  return api.get(`${API_MATCH}/open`, { params: data });
};

// SCIC_IF_515 :: 경기 참여 선수 리스트 조회
export const apiGetMngPlayers = idx => {
  return api.get(`${API_MATCH}/mng/players/${idx}`);
};

// SPIC_IF_502 :: 매칭 상세 조회
export const apiGetMatchDetail = matchIdx => {
  return api.get(`${API_MATCH}/open/${matchIdx}`);
};

// SPIC_IF_503 ::  경기등록
export const apiSaveMatch = data => {
  return api.post(`${API_MATCH}/mng`, data);
};

// SPIC_IF_505 ::  경기취소
export const apiCancelMatch = data => {
  return api.delete(`${API_MATCH}/mng`, { params: data });
};

// SPIC_IF_508 :: 매칭 신청 아카데미 선택
export const apiSelectAcademy4Match = data => {
  return api.patch(`${API_MATCH}/mng/acdmy/acdmy-pick`, data);
};

// SPIC_IF_509 :: 매칭 신청
export const apiApplyMatch = matchIdx => {
  return api.post(`${API_MATCH}/mng/join/${matchIdx}`);
};

// SPIC_IF_510 :: 매칭 신청 취소
export const apiCancelApplyMatch = matchIdx => {
  return api.delete(`${API_MATCH}/mng/join/${matchIdx}`);
};

// SPIC_IF_511 :: 경기 결과 등록
export const apiSaveResult = data => {
  return api.post(`${API_MATCH}/mng/result`, data);
};

// SPIC_IF_512 :: 경기 결과 이의신청
export const apiRejectResult = data => {
  return api.post(`${API_MATCH}/mng/result/reject`, data);
};

// SPIC_IF_513 :: 경기 결과 승인
export const apiConfirmResult = data => {
  return api.patch(`${API_MATCH}/mng/result`, data);
};

// SPIC_IF_514 :: 경기 리뷰 등록
export const apiSaveReview = data => {
  return api.post(`${API_MATCH}/mng/review`, data);
};

// SPIC_IF_515 :: 경기 참여 선수 리스트 조회
export const apiGetPlayerListByMatchIdx = matchIdx => {
  return api.get(`${API_MATCH}/mng/players/${matchIdx}`);
};

// ----------------------------------------------------------
// [ Tournament ]
// ----------------------------------------------------------

// SPIC_IF_521 :: 대회 리스트 조회
export const apiGetTournamentList = data => {
  return api.get(`${API_TOURNAMENT}/open`, { params: data });
};

// SPIC_IF_522 :: 대회 상세 조회 (비회원)
export const apiGetTournamentDetail = tournamentIdx => {
  return api.get(`${API_TOURNAMENT}/open/${tournamentIdx}`);
};

// SPIC_IF_522 :: 대회 상세 조회 (회원)
export const apiGetTournamentDetailForMember = tournamentIdx => {
  return api.get(`${API_TOURNAMENT}/${tournamentIdx}`);
};

// SPIC_IF_522 :: 대회 신청
export const apiApplyTournament = data => {
  return api.post(`${API_TOURNAMENT}/mng/apply`, data);
};

// ----------------------------------------------------------
// [ Playground ]
// ----------------------------------------------------------

// SPIC_IF_531 :: 구장 리스트 조회
export const apiGetPlaygroundList = data => {
  return api.get(`${API_PLAYGROUND}/open`, { params: data });
};

// SPIC_IF_532 :: 구장 상세 조회
export const apiGetPlaygroundDetail = playgroundIdx => {
  return api.get(`${API_PLAYGROUND}/open/${playgroundIdx}`);
};

// ----------------------------------------------------------
// [ Pie Training ]
// ----------------------------------------------------------

// SPIC_IF_601 :: 기초튼튼 훈련 메인 조회
export const apiGetTrainingList = () => {
  return api.get(`${API_TRAINING}/open`);
};

// SPIC_IF_602 :: 트레이닝 상세 조회
export const apiGetTrainingDetail = trainingIdx => {
  return api.get(`${API_TRAINING}/${trainingIdx}`);
};

// SPIC_IF_603 :: 트레이닝 좋아요 등록
export const apiLikeTraining = trainingIdx => {
  return api.patch(`${API_TRAINING}/like/${trainingIdx}`);
};

// SPIC_IF_604 :: 트레이닝 좋아요 취소
export const apiUnlikeTraining = trainingIdx => {
  return api.patch(`${API_TRAINING}/unlike/${trainingIdx}`);
};

// SPIC_IF_605 :: 트레이닝 클래스 영상 리스트 조회
export const apiGetTrainingVideoList = trainingIdx => {
  return api.get(`${API_TRAINING}/class-vd/${trainingIdx}`);
};

// SPIC_IF_606 :: 트레이닝 클래스 영상 상세 조회
export const apiGetTrainingVideoDetail = videoIdx => {
  return api.get(`${API_TRAINING}/class-info/${videoIdx}`);
};

// SPIC_IF_607 :: 트레이닝 영상 시청 완료
export const apiCompleteWatchTrainingVideo = videoIdx => {
  return api.patch(`${API_TRAINING}/videos/${videoIdx}`);
};

// SPIC_IF_608 :: 마스터 영상 등록
export const apiSaveMasterVideo = data => {
  return api.post(`${API_TRAINING}/master`, data, formDataConfig);
};

// SPIC_IF_609 :: 트레이닝 마스터 영상 리스트 조회
export const apiGetMasterVideoList = data => {
  return api.get(`${API_TRAINING}/master`, { params: data });
};

// SPIC_IF_610 :: 트레이닝 마스터 영상 상세 조회
export const apiGetMasterVideoDetail = videoIdx => {
  return api.get(`${API_TRAINING}/master/${videoIdx}`);
};

// SPIC_IF_611 :: 트레이닝 마스터 영상 댓글 리스트 조회
export const apiGetMasterVideoCommentList = data => {
  return api.get(`${API_TRAINING}/master/comments`, {
    params: data,
  });
};

// SPIC_IF_612 :: 트레이닝 마스터 영상 댓글 등록
export const apiSaveMasterVideoComment = data => {
  return api.post(`${API_TRAINING}/master/comments`, data);
};

// SPIC_IF_613 :: 트레이닝 마스터 영상 댓글 수정
export const apiModifyMasterVideoComment = data => {
  return api.put(`${API_TRAINING}/master/comments`, data);
};

// SPIC_IF_614 :: 트레이닝 마스터 영상 댓글 삭제
export const apiRemoveMasterVideoComment = commentIdx => {
  return api.delete(`${API_TRAINING}/master/comments/${commentIdx}`);
};

// SPIC_IF_691 :: 챌린지 영상 신고
export const apiReportTraining = data => {
  return api.post(`${API_TRAINING}/report`, data);
};

// ----------------------------------------------------------
// [ CHALLENGE ]
// ----------------------------------------------------------

// SPIC_IF_650 :: 챌린지 리스트 조회
export const apiGetChallengeList = data => {
  return api.get(`${API_CHALLENGE}/open`, { params: data });
};

// SPIC_IF_651 :: 챌린지 상세 조회
export const apiGetChallengeDetail = videoIdx => {
  return api.get(`${API_CHALLENGE}/${videoIdx}`);
};

// SPIC_IF_652 :: 챌린지 좋아요 등록
export const apiLikeChallenge = videoIdx => {
  return api.patch(`${API_CHALLENGE}/like/${videoIdx}`);
};

// SPIC_IF_653 :: 챌린지 좋아요 취소
export const apiUnlikeChallenge = videoIdx => {
  return api.patch(`${API_CHALLENGE}/unlike/${videoIdx}`);
};

// SPIC_IF_654 :: 챌린지 참여 영상 리스트 조회
export const apiGetChallengeVideoList = data => {
  return api.get(`${API_CHALLENGE}/videos`, { params: data });
};

// SPIC_IF_655 :: 챌린지 댓글 리스트 조회
export const apiGetChallengeVideoCommentList = data => {
  return api.get(`${API_CHALLENGE}/comments`, { params: data });
};

// SPIC_IF_656 :: 챌린지 댓글 등록
export const apiSaveChallengeVideoComment = data => {
  return api.post(`${API_CHALLENGE}/comments`, data);
};

// SPIC_IF_657 :: 챌린지 댓글 수정
export const apiModifyChallengeVideoComment = data => {
  return api.put(`${API_CHALLENGE}/comments`, data);
};

// SPIC_IF_658 :: 챌린지 댓글 삭제
export const apiRemoveChallengeVideoComment = commentIdx => {
  return api.delete(`${API_CHALLENGE}/comments/${commentIdx}`);
};

// SPIC_IF_659 :: 챌린지 영상 등록
export const apiSaveChallengeVideo = data => {
  return api.post(`${API_CHALLENGE}/videos`, data, formDataConfig);
};

// SPIC_IF_660 :: 챌린지 영상 수정
export const apiModifyChallengeVideo = data => {
  return api.put(`${API_CHALLENGE}/videos`, data);
};

// SPIC_IF_661 :: 챌린지 영상 삭제
export const apiRemoveChallengeVideo = videoIdx => {
  return api.delete(`${API_CHALLENGE}/videos/${videoIdx}`);
};

// SPIC_IF_691 :: 챌린지 영상 신고
export const apiReportChallenge = data => {
  return api.post(`${API_CHALLENGE}/report`, data);
};

// ----------------------------------------------------------
// [ CHAT ]
// ----------------------------------------------------------
// SPIC_IF_801 :: 채팅 방 리스트 조회
export const apiGetChatRoom = data => {
  return api.get(`${API_CHAT}/room`, { params: data });
};
// SPIC_IF_802 :: 채팅 메시지 리스트 조회
export const apiGetChatMessage = data => {
  return api.get(`${API_CHAT}/message`, { params: data });
};
// SPIC_IF_803 :: 아카데미 리스트 조회
export const apiGetChatAcademy = academyIdxList => {
  return api.get(`${API_CHAT}/academy`, { params: { academyIdxList } });
};
// SPIC_IF_804 :: 매치 리스트 조회
export const apiGetChatMatch = matchIdxList => {
  return api.get(`${API_CHAT}/match`, {
    params: { matchIdxList },
  });
};
// SPIC_IF_805 :: 유저 리스트 조회
export const apiGetChatUser = userIdxList => {
  return api.get(`${API_CHAT}/user`, {
    params: { userIdxList },
  });
};
// SPIC_IF_806 :: 유저, 아카데미, 매칭 데이터 조회
export const apiGetChatChatRoomExtraData = data => {
  return api.get(`${API_CHAT}/chatroom-extra-data`, {
    params: data,
  });
};
// ----------------------------------------------------------
// [ MORE ]
// ----------------------------------------------------------

// SPIC_IF_902 :: 메인 조회
export const apiGetMain = data => {
  return api.get(`${API_MORE}/init`);
};

// SPIC_IF_903 :: 본인 프로필 조회
export const apiGetProfile = data => {
  return api.get(`${API_MORE}/profile`);
};

// SPIC_IF_904 :: 내 정보 조회
export const apiGetMyInfo = data => {
  return api.get(`${API_MORE}/my-info`);
};

// SPIC_IF_905 :: 내 정보 수정
export const apiModifyMyInfo = data => {
  return api.put(`${API_MORE}/my-info`, data, formDataConfig);
};

// SPIC_IF_906 :: 회원탈퇴
export const apiRemoveMember = data => {
  return api.delete(`${API_MORE}/withdrawal`);
};

// SPIC_IF_907 :: 내 계정정보 조회
export const apiGetMyAccount = data => {
  return api.get(`${API_MORE}/account`);
};

// SPIC_IF_908 :: 내 퍼포먼스 조회
export const apiGetMyStat = data => {
  return api.get(`${API_MORE}/stats`);
};

// SPIC_IF_909 :: 내 퍼포먼스 수정
export const apiModifyMyStat = data => {
  return api.put(`${API_MORE}/stats`, data);
};

// SPIC_IF_910 :: 아티클 리스트 조회
export const apiGetArticleList = data => {
  return api.get(`${API_MORE}/open/articles`, { params: data });
};

// SPIC_IF_911 :: 아티클 상세 조회
export const apiGetArticleDetail = idx => {
  return api.get(`${API_MORE}/open/articles/${idx}`);
};
// SPIC_IF_920 :: 매칭 내역 리스트 조회
export const apiGetMatches = data => {
  return api.get(`${API_MORE}/matches`, { params: data });
};

// SPIC_IF_921 :: 매칭 내역 상세 조회
export const apiGetMatchesDetail = idx => {
  return api.get(`${API_MORE}/matches/${idx}`);
};

// SPIC_IF_922 :: 대회 내역 리스트 조회
export const apiGetTournaments = data => {
  return api.get(`${API_MORE}/tournaments`, { params: data });
};

// SPIC_IF_930 :: 커뮤니티 내역 리스트 조회
export const apiGetFeeds = data => {
  return api.get(`${API_MORE}/feeds`, { params: data });
};
// SPIC_IF_931 :: 클래스 마스터 내가 쓴 댓글 리스트 조회
export const apiGetTrainingComments = data => {
  return api.get(`${API_MORE}/training/comments`, { params: data });
};
// SPIC_IF_932 :: 클래스 마스터 내가 쓴 댓글 리스트 조회
export const apiGetTrainingVideos = data => {
  return api.get(`${API_MORE}/training/videos`, { params: data });
};
// SPIC_IF_933 :: 챌린지 내가 쓴 댓글 리스트 조회
export const apiGetChallengeComments = data => {
  return api.get(`${API_MORE}/challenge/comments`, { params: data });
};
// SPIC_IF_934 :: 챌린지 내가 올린 영상 리스트 조회
export const apiGetChallengeVideos = data => {
  return api.get(`${API_MORE}/challenge/videos`, { params: data });
};
// SPIC_IF_935 :: 챌린지 내가 올린 영상 수정
export const apiPutModifyChallengeVideo = data => {
  return api.put(`${API_MORE}/modify/challenge/video`, data);
};

// SPIC_IF_940 :: 공지사항 리스트 조회
export const apiGetNotices = data => {
  return api.get(`${API_MORE}/notices`, { params: data });
};
// SPIC_IF_941 :: 공시자항 상세 조회
export const apiGetNoticesDetail = boardIdx => {
  return api.get(`${API_MORE}/notices/${boardIdx}`);
};
// SPIC_IF_942 :: 자주 묻는 질문 리스트 조회
export const apiGetFaq = data => {
  return api.get(`${API_MORE}/faq`, { params: data });
};
// SPIC_IF_943 :: 1:1 문의 리스트 조회
export const apiGetQna = data => {
  return api.get(`${API_MORE}/qna`, { params: data });
};
// SPIC_IF_944 :: 1:1 문의 상세 조회
export const apiGetQnaDetail = qnaIdx => {
  return api.get(`${API_MORE}/qna/${qnaIdx}`);
};
// SPIC_IF_945 :: 1:1 문의 등록
export const apiPostQnaInsert = data => {
  return api.post(`${API_MORE}/qna`, data);
};
// SPIC_IF_946 :: 1:1 문의 수정
export const apiPutQnaModify = data => {
  return api.put(`${API_MORE}/modify/qna`, data);
};
// SPIC_IF_950 :: 소셜 토큰 보유 수량 조회
export const apiGetTokenBalance = (walletAddr, data) => {
  return api.get(`${API_MORE}/token/balance/${walletAddr}`);
};

// SPIC_IF_951 :: 소셜 토큰 사용 리스트 조회
export const apiGetSocialTokenHistoryList = data => {
  return api.get(`${API_MORE}/social-token/histories`, { params: data });
};
// SPIC_IF_952 :: 지갑 등록
export const apiPostWallet = data => {
  return api.post(`${API_MORE}/wallet/reg-wallet`, data);
};
// SPIC_IF_953 :: 수수료 보내기
export const apiPostSendFee = data => {
  return api.post(`${API_MORE}/wallet/send-fee`, data);
};
// SPIC_IF_954 :: 출금 수수료금액 조회
export const apiGetMoreWalletCheckFee = data => {
  return api.get(`${API_MORE}/wallet/check-fee`, { params: data });
};
// SPIC_IF_955 :: PIE 코인 출금 완료
export const apiPostMoreWalletWithdrawComplete = data => {
  return api.post(`${API_MORE}/wallet/withdraw-complete`, data);
};
// SPIC_IF_956 :: PIE 코인 입출금 리스트 조회
export const apiGetMoreWalletPieTokenHistoryList = data => {
  return api.get(`${API_MORE}/wallet/pie-token/histories`, { params: data });
};
// SPIC_IF_957 :: 스왑 비율 확인 (1PIE = ? POINT)
export const apiGetMoreWalletSwapRate = () => {
  return api.get(`${API_MORE}/wallet/swap-rate`);
};
// SPIC_IF_960 :: 쿠폰등록
export const apiPostCoupon = data => {
  return api.post(`${API_MORE}/coupon`, data);
};
// SPIC_IF_958 :: 스왑 실행
export const apiPostMoreWalletMoreWalletSwap = data => {
  return api.post(`${API_MORE}/wallet/swap`, data);
};
// SPIC_IF_959 :: 최소 출금 가능 수량 확인
export const apiGetMoreWalletMinWithdrawAmount = data => {
  return api.get(`${API_MORE}/wallet/min-withdraw-amount`, { params: data });
};

// ----------------------------------------------------------
// [ OPEN ]
// ----------------------------------------------------------
export const apiTestLogin = data => {
  return api.get(`${API_TEST}/login`, { params: data });
};
