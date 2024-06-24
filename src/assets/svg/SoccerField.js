import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SoccerField(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9-2v14z"
        fill="#24A147"
      />
      <Path
        d="M12 5v14m0-14H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7m0-14h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7"
        stroke="#24A147"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0M3 9h3v6H3zm15 0h3v6h-3z"
        stroke="#73EB95"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(SoccerField);
