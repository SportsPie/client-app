import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
function Copy(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M2 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4H4a2 2 0 0 1-2-2zm8 12v4h10V10h-4v4a2 2 0 0 1-2 2zm4-2V4H4v10z"
        fill={props.fill || '#313779'}
      />
    </Svg>
  );
}

export default React.memo(Copy);
