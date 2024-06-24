/* eslint-disable no-param-reassign */

import CustomException from '../common/exceptions/CustomException';

const NullCheckUtils = {
  isNullWithoutField: (exceptionFields, object, zeroIsTrue) => {
    exceptionFields.forEach(v => {
      if (!object[v.key]) {
        if (v.defaultValue) {
          object[v.key] = v.defaultValue;
        } else {
          if (zeroIsTrue && object[v.key] === 0) return;
          throw new CustomException(v.msg);
        }
      }
    });
  },
};
export default NullCheckUtils;
