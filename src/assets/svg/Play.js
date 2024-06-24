import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Play(props) {
  return (
    <Svg width={14} height={15} viewBox="0 0 14 15" fill="none" {...props}>
      <Path
        d="M3.5 2.777v9.334Zm8.167 4.667L3.5 12.111Zm0 0L3.5 2.777Z"
        stroke="#fff"
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(Play);
