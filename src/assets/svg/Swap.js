import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Swap(props) {
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14" fill="none" {...props}>
      <Path
        d="M3.71 1.22a.75.75 0 0 1 1.061 0l3 3a.75.75 0 0 1-1.06 1.06L4.99 3.56v8.69a.75.75 0 1 1-1.5 0V3.56L1.77 5.28A.75.75 0 0 1 .71 4.22zm7.28 9.22V1.75a.75.75 0 1 1 1.5 0v8.69l1.72-1.72a.75.75 0 0 1 1.061 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06z"
        fill={props.fill || '#000'}
      />
    </Svg>
  );
}

export default React.memo(Swap);
