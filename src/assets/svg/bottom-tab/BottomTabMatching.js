import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function BottomTabMatching(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0M3 9h3v6H3zm15 0h3v6h-3z"
        fill="#FF671F"
        stroke="#FF671F"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 5v14M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke="#FF671F"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(BottomTabMatching);
