import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Avatar(props) {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56" fill="none" {...props}>
      <Path fill="#ADAFC9" d="M0 0h56v56H0z" />
      <Path
        d="M16.333 20.222a11.666 11.666 0 1 1 23.333 0 11.666 11.666 0 0 1-23.333 0M11.07 46.875c.364.365.859.57 1.374.57h31.112A1.945 1.945 0 0 0 45.5 45.5a9.72 9.72 0 0 0-9.722-9.722H20.222A9.72 9.72 0 0 0 10.5 45.5c0 .516.205 1.01.57 1.375"
        fill="#fff"
      />
    </Svg>
  );
}

export default React.memo(Avatar);
