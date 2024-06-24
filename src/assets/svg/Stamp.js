import * as React from 'react';
import Svg, { G, Circle, Path, Defs, ClipPath } from 'react-native-svg';

function Stamp(props) {
  return (
    <Svg width={88} height={89} viewBox="0 0 88 89" fill="none" {...props}>
      <G filter="url(#a)">
        <G clipPath="url(#b)">
          <Circle cx={44} cy={38.5} r={32} fill="#FFF4EE" />
          <Circle
            cx={44}
            cy={38.5}
            r={29.928}
            stroke="#FF671F"
            strokeWidth={4.144}
          />
          <Path
            d="M53.598 41.969 45.49 28.176l9.655-5.676-.493 4.006-4.32 2.54 1.514 2.575 4.618-2.714 1.514 2.575-4.618 2.715 1.833 3.118 5.65-3.321 1.624 2.762zM38.593 32.23l4.138-2.432L50.84 43.59l-4.138 2.433zm-4.375 6.29-3.363 1.977 2.56 4.355 3.363-1.977zm3.122 13.008-3.24 1.905-5.429-9.235.555-2.744-2.802 1.648.46-3.987 6.639-3.903c1.489-.875 2.81-.512 3.597.827l3.237 5.507c.787 1.339.462 2.67-1.027 3.545l-4.29 2.523z"
            fill="#FB8225"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="b">
          <Path fill="#fff" d="M12 6.5h64v64H12z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default React.memo(Stamp);
