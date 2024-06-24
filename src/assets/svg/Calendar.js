import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Calendar(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M9 2a1 1 0 0 1 1 1v1h4V3a1 1 0 0 1 2 0v1h3a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V3a1 1 0 0 1 1-1M8 6H5v3h14V6h-3v1a1 1 0 0 1-2 0V6h-4v1a1 1 0 0 1-2 0zm11 5H5v8h14z"
        fill={props?.fill || '#0A0B18'}
      />
    </Svg>
  );
}

export default React.memo(Calendar);
