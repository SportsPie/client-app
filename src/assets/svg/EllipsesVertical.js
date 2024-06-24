import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function EllipsesVertical(props) {
  return (
    <Svg width={24} height={25} viewBox="0 0 24 25" fill="none" {...props}>
      <Path
        d="M10 12.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0m0-6a2 2 0 1 0 4 0 2 2 0 0 0-4 0m0 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0"
        fill={props.fill || '#000'}
      />
    </Svg>
  );
}

export default React.memo(EllipsesVertical);
