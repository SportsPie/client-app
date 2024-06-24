import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Filter(props) {
  return (
    <Svg
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M9.5 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2M6.67 5a3.001 3.001 0 0 1 5.66 0h7.17a1 1 0 1 1 0 2h-7.17a3 3 0 0 1-5.66 0H5.5a1 1 0 0 1 0-2zm8.83 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2.83 0a3 3 0 0 1 5.66 0h1.17a1 1 0 0 1 0 2h-1.17a3 3 0 0 1-5.66 0H5.5a1 1 0 1 1 0-2zM9.5 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2.83 0a3 3 0 0 1 5.66 0h7.17a1 1 0 0 1 0 2h-7.17a3 3 0 0 1-5.66 0H5.5a1 1 0 1 1 0-2z"
        fill="#0A0B18"
      />
    </Svg>
  );
}

export default React.memo(Filter);
