import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Check(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M20.664 5.253a1 1 0 0 1 .083 1.411l-10.666 12a1 1 0 0 1-1.495 0l-5.333-6a1 1 0 0 1 1.494-1.328l4.586 5.16 9.92-11.16a1 1 0 0 1 1.411-.083"
        fill={props.fill || '#000'}
      />
    </Svg>
  );
}

export default React.memo(Check);
