import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Record(props) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M22.1667 3.5H5.83333C4.53833 3.5 3.5 4.55 3.5 5.83333V22.1667C3.5 23.45 4.53833 24.5 5.83333 24.5H22.1667C23.45 24.5 24.5 23.45 24.5 22.1667V5.83333C24.5 4.55 23.4617 3.5 22.1667 3.5ZM22.1667 22.1667H5.83333V8.16667H22.1667V22.1667ZM19.8333 14H8.16667V11.6667H19.8333V14ZM15.1667 18.6667H8.16667V16.3333H15.1667V18.6667Z"
        fill="white"
      />
    </Svg>
  );
}

export default React.memo(Record);
