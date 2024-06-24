export const MATCH_STATE = {
  APPLY: {
    code: 'APPLY',
    desc: '접수대기',
  },
  EXPIRE: {
    code: 'EXPIRE',
    desc: '신청기한 만료',
  },
  CANCEL: {
    code: 'CANCEL',
    desc: '경기 취소',
  },
  READY: {
    code: 'READY',
    desc: '경기 예정',
  },
  FINISH: {
    code: 'FINISH',
    desc: '경기완료',
  },
  REJECT: {
    code: 'REJECT',
    desc: '이의신청',
  },
  CONFIRM: {
    code: 'CONFIRM',
    desc: '상대팀 결과 확인',
  },
  REVIEW: {
    code: 'REVIEW',
    desc: '경기완료',
  },
};
