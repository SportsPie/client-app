import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Comment(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4.586l-2.707 2.707a1 1 0 0 1-1.414 0L8.586 19H4a2 2 0 0 1-2-2zm4 3.5a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1m0 4a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1"
        fill="#313779"
      />
      <Path
        d="M6.293 8.793A1 1 0 0 0 7 10.5h10a1 1 0 0 0 0-2H7a1 1 0 0 0-.707.293m0 4A1 1 0 0 0 7 14.5h6a1 1 0 0 0 0-2H7a1 1 0 0 0-.707.293"
        fill="#D6D7E4"
      />
    </Svg>
  );
}

export default React.memo(Comment);
