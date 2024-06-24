import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Back(props) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M13.658 6.176a1.166 1.166 0 0 1 0 1.65L8.65 12.833h13.517a1.167 1.167 0 0 1 0 2.333H8.65l5.008 5.009a1.166 1.166 0 0 1-1.65 1.65l-7-7a1.166 1.166 0 0 1 0-1.65l7-7a1.167 1.167 0 0 1 1.65 0"
        fill={props.fill || '#000'}
      />
    </Svg>
  );
}

export default React.memo(Back);
