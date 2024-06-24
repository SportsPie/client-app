import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function BottomTabCommunity(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#a)" fill="#FF671F">
        <Path
          d="m16.72 19.752-.64-5.124A3 3 0 0 0 13.1 12h-2.204a3 3 0 0 0-2.976 2.628l-.64 5.124A2 2 0 0 0 9.265 22h5.468a2 2 0 0 0 1.985-2.248"
          stroke="#FF671F"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm16 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
          stroke="#FF671F"
          strokeWidth={1.5}
        />
        <Path d="M3.083 13.25H5.39a.75.75 0 0 1 .75.75l-1 6a.75.75 0 0 1-.75.75H2.75a2.75 2.75 0 0 1-2.713-3.202l.333-2a2.75 2.75 0 0 1 2.713-2.298m17.834 0H18.61a.75.75 0 0 0-.75.75l1 6c0 .414.336.75.75.75h1.639a2.75 2.75 0 0 0 2.713-3.202l-.333-2a2.75 2.75 0 0 0-2.713-2.298" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default React.memo(BottomTabCommunity);
