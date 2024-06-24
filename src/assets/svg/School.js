import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

function School(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 12a1 1 0 0 1 1-1h3v9H4a1 1 0 0 1-1-1zm14-1h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3z"
        fill="#CC5219"
        stroke="#CC5219"
        strokeWidth={1.5}
      />
      <Path
        d="M7 7.48a1 1 0 0 1 .375-.78l4-3.2a1 1 0 0 1 1.25 0l4 3.2a1 1 0 0 1 .375.78V20H7z"
        fill="#FF671F"
        stroke="#FF671F"
        strokeWidth={1.5}
      />
      <Circle
        cx={12}
        cy={11}
        r={2}
        fill="#FFC2A5"
        stroke="#FFC2A5"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export default React.memo(School);
