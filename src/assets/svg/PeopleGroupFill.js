import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

function PeopleGroupFill(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16">
      <G clipPath="url(#clip0_7287_108644)">
        <G fill="#F06006">
          <Path
            stroke="#F06006"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M11.146 13.168l-.427-3.416A2 2 0 008.734 8h-1.47A2 2 0 005.28 9.752l-.427 3.416a1.333 1.333 0 001.324 1.499h3.645a1.335 1.335 0 001.324-1.499z"
          />
          <Path
            stroke="#F06006"
            strokeWidth="1.5"
            d="M8 6a2 2 0 100-4 2 2 0 000 4z"
          />
          <Path
            stroke="#F06006"
            strokeWidth="1.5"
            d="M2.666 8a1.333 1.333 0 100-2.667 1.333 1.333 0 000 2.667z"
          />
          <Path
            stroke="#F06006"
            strokeWidth="1.5"
            d="M13.333 8a1.333 1.333 0 100-2.667 1.333 1.333 0 000 2.667z"
          />
          <Path d="M2.056 8.833h1.537a.5.5 0 01.5.5l-.667 4a.5.5 0 01-.5.5H1.834a1.833 1.833 0 01-1.809-2.135l.222-1.333a1.834 1.834 0 011.809-1.532z" />
          <Path d="M13.944 8.833h-1.537a.5.5 0 00-.5.5l.667 4a.5.5 0 00.5.5h1.092a1.834 1.834 0 001.809-2.135l-.222-1.333a1.833 1.833 0 00-1.809-1.532z" />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_7287_108644">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default React.memo(PeopleGroupFill);
