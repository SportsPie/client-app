import * as React from 'react';
import Svg, { Mask, Path, G } from 'react-native-svg';

function EyeShow(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M12 16.877a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke={props.stroke || '#000'}
        strokeWidth={2}
      />
      <Path
        d="M21 13.877s-1-8-9-8-9 8-9 8"
        stroke={props.stroke || '#000'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(EyeShow);
