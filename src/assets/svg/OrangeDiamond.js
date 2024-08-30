import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

function OrangeDiamond(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18">
      <G>
        <G>
          <G>
            <Path
              fill="#F06006"
              stroke="#fff"
              strokeLinejoin="round"
              strokeWidth="0.5"
              d="M13.177 2.823A.25.25 0 0013 2.75H5a.25.25 0 00-.177.073l-4 4a.25.25 0 000 .354l8 8a.25.25 0 00.354 0l8-8a.25.25 0 000-.354l-4-4z"
            />
            <Path fill="#FF7C10" d="M13 3H5L1 7h16l-4-4z" />
            <Path
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 8l2.228 3 4-5"
            />
          </G>
        </G>
      </G>
    </Svg>
  );
}

export default React.memo(OrangeDiamond);
