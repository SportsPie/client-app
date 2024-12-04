export const TOURNAMENT_STATE_TYPE = {
  APPLY_WAIT: { code: 'APPLY_WAIT', desc: '접수 예정', listDesc: '접수예정' },
  APPLY_OPEN: { code: 'APPLY_OPEN', desc: '접수 중', listDesc: '접수 중' },
  APPLY_CLOSED: {
    code: 'APPLY_CLOSED',
    desc: '접수 종료',
    listDesc: '접수종료',
  },
  ONGOING: { code: 'ONGOING', desc: '대회 중', listDesc: '대회진행 중' },
  FINISHED: { code: 'FINISHED', desc: '대회 종료', listDesc: '대회종료' },
  CANCELED: { code: 'CANCELED', desc: '대회 취소', listDesc: '대회취소' },
  ERROR: { code: 'ERROR', desc: '에러', listDesc: '에러' },
};
