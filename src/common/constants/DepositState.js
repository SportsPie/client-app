/*
  DEPOSIT_WAIT("입금 대기"),
    DEPOSIT_COMPLETE("입금 완료"),
    DEPOSIT_CONFIRMED("입금 확인"),
    REFUND_REQUEST("환불 접수"),
    REFUND_COMPLETE("환불 완료"),
 */
export const DEPOSIT_STATE = {
  DEPOSIT_WAIT: {
    code: 'DEPOSIT_WAIT',
    desc: '입금 대기',
  },
  DEPOSIT_COMPLETE: {
    code: 'DEPOSIT_COMPLETE',
    desc: '입금 완료',
  },
  DEPOSIT_CONFIRMED: {
    code: 'DEPOSIT_CONFIRMED',
    desc: '입금 확인',
  },
  REFUND_REQUEST: {
    code: 'REFUND_REQUEST',
    desc: '환불 접수',
  },
  REFUND_COMPLETE: {
    code: 'REFUND_COMPLETE',
    desc: '환불 완료',
  },
};
