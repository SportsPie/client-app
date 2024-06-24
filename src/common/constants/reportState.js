export const REPORT_STATE = {
  WAIT: {
    code: 'WAIT',
    desc: '미처리',
  },
  DELETE: {
    code: 'DELETE',
    desc: '미처리',
  },
  FINISH: {
    code: 'FINISH',
    desc: '처리완료', // 콘텐츠 삭제 없이 처리완료
  },
  FINISH_DEL: {
    code: 'FINISH_DEL',
    desc: '처리완료', // 콘텐츠 삭제 후 처리완료
  },
};
