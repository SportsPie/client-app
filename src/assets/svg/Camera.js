import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

function Camera(props) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
      <Rect width={18} height={18} rx={9} fill="#FF671F" />
      <Path
        d="M7.147 5.147A.5.5 0 0 1 7.5 5h3a.5.5 0 0 1 .354.146l.853.854H13a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.293zm.56.853-.853.854A.5.5 0 0 1 6.5 7H5v5h8V7h-1.5a.5.5 0 0 1-.354-.146L10.294 6zM9 8.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0"
        fill="#fff"
      />
    </Svg>
  );
}

export default React.memo(Camera);
