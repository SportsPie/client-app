export const TOURNAMENT_STATE_TYPE = {
  APPLY_WAIT: { code: 'APPLY_WAIT', desc: '접수예정' },
  APPLY_OPEN: { code: 'APPLY_OPEN', desc: '접수 중' },
  APPLY_CLOSED: { code: 'APPLY_CLOSED', desc: '접수종료' },
  ONGOING: { code: 'ONGOING', desc: '대회진행중' },
  FINISHED: { code: 'FINISHED', desc: '대회종료' },
  CANCELED: { code: 'CANCELED', desc: '대회취소' },
  ERROR: { code: 'ERROR', desc: '에러' },
};
