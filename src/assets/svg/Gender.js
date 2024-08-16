import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
function Gender(props) {
  return (
    <Svg
      width={30}
      height={30}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Rect width={30} height={30} rx={15} fill="#FFEFD4" />
      <Path
        d="M21.8248 6.25H18.3862C18.2038 6.25 18.0288 6.32246 17.8999 6.45143C17.7709 6.5804 17.6984 6.75533 17.6984 6.93772C17.6984 7.12012 17.7709 7.29504 17.8999 7.42402C18.0288 7.55299 18.2038 7.62545 18.3862 7.62545H20.1648L18.0027 9.78748C17.3679 9.19586 16.6021 8.76279 15.768 8.52365C14.9338 8.28451 14.0549 8.24609 13.203 8.41151C12.3511 8.57693 11.5505 8.9415 10.8664 9.47546C10.1824 10.0094 9.63435 10.6976 9.26707 11.4838C8.8998 12.27 8.7237 13.132 8.75317 13.9993C8.78265 14.8665 9.01685 15.7145 9.43666 16.474C9.85646 17.2335 10.45 17.8829 11.1687 18.3692C11.8874 18.8555 12.711 19.1648 13.5721 19.2721V20.6922H11.5089C11.3265 20.6922 11.1516 20.7647 11.0226 20.8936C10.8936 21.0226 10.8212 21.1975 10.8212 21.3799C10.8212 21.5623 10.8936 21.7372 11.0226 21.8662C11.1516 21.9952 11.3265 22.0677 11.5089 22.0677H13.5721V24.1308C13.5721 24.3132 13.6445 24.4881 13.7735 24.6171C13.9025 24.7461 14.0774 24.8185 14.2598 24.8185C14.4422 24.8185 14.6171 24.7461 14.7461 24.6171C14.8751 24.4881 14.9475 24.3132 14.9475 24.1308V22.0677H17.0107C17.1931 22.0677 17.368 21.9952 17.497 21.8662C17.626 21.7372 17.6984 21.5623 17.6984 21.3799C17.6984 21.1975 17.626 21.0226 17.497 20.8936C17.368 20.7647 17.1931 20.6922 17.0107 20.6922H14.9475V19.2721C15.8694 19.1569 16.747 18.8099 17.4983 18.2635C18.2496 17.7171 18.8501 16.9892 19.2437 16.1477C19.6373 15.3062 19.8112 14.3787 19.749 13.4517C19.6868 12.5248 19.3907 11.6288 18.8882 10.8474L21.1371 8.59772V10.3763C21.1371 10.5587 21.2095 10.7337 21.3385 10.8626C21.4675 10.9916 21.6424 11.0641 21.8248 11.0641C22.0072 11.0641 22.1821 10.9916 22.3111 10.8626C22.44 10.7337 22.5125 10.5587 22.5125 10.3763V6.93772C22.5125 6.75533 22.44 6.5804 22.3111 6.45143C22.1821 6.32246 22.0072 6.25 21.8248 6.25ZM14.2598 17.9413C13.4437 17.9413 12.6459 17.6993 11.9673 17.2459C11.2888 16.7925 10.7599 16.148 10.4476 15.394C10.1353 14.6401 10.0535 13.8104 10.2128 13.01C10.372 12.2095 10.765 11.4743 11.342 10.8972C11.9191 10.3201 12.6544 9.92712 13.4548 9.76791C14.2552 9.60869 15.0849 9.69041 15.8389 10.0027C16.5929 10.315 17.2373 10.8439 17.6907 11.5225C18.1441 12.2011 18.3862 12.9988 18.3862 13.815C18.385 14.909 17.9499 15.9579 17.1763 16.7315C16.4027 17.5051 15.3538 17.9402 14.2598 17.9413Z"
        fill="#FF7C10"
      />
    </Svg>
  );
}

export default React.memo(Gender);
