import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function BottomTabHomeOutline(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M21 19v-6.733a4 4 0 0 0-1.245-2.9L13.378 3.31a2 2 0 0 0-2.755 0L4.245 9.367A4 4 0 0 0 3 12.267V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2"
        stroke="#ADABA7"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 15a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6H9z"
        stroke="#ADABA7"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(BottomTabHomeOutline);
