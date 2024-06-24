import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function WarningCircle(props) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path fill="#fff" d="M4 3h8v10H4z" />
      <Path
        fill="#fff"
        style={{
          mixBlendMode: 'multiply',
        }}
        d="M0 0h16v16H0z"
      />
      <Path
        d="M8 1C4.15 1 1 4.15 1 8s3.15 7 7 7 7-3.15 7-7-3.15-7-7-7m-.55 3h1.1v5.5h-1.1zM8 12.5c-.4 0-.75-.35-.75-.75S7.6 11 8 11s.75.35.75.75-.35.75-.75.75"
        fill="#DA1E28"
      />
    </Svg>
  );
}

export default React.memo(WarningCircle);
