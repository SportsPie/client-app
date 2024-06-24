import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function BottomTabCommunityOutline(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="m16.72 19.752-.64-5.124A3 3 0 0 0 13.1 12h-2.204a3 3 0 0 0-2.976 2.628l-.64 5.124A2 2 0 0 0 9.265 22h5.468a2 2 0 0 0 1.985-2.248"
        stroke="#ADABA7"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm16 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="#ADABA7"
        strokeWidth={1.5}
      />
      <Path
        d="M4 14h-.306a2 2 0 0 0-1.973 1.671l-.333 2A2 2 0 0 0 3.361 20h3.64m13-6h.305a2 2 0 0 1 1.973 1.671l.333 2A2 2 0 0 1 20.64 20H17"
        stroke="#ADABA7"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(BottomTabCommunityOutline);
