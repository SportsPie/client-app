import * as React from 'react';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

function StampBoost(props) {
  return (
    <Svg width={61} height={63} viewBox="0 0 61 63" fill="none" {...props}>
      <Circle cx={33} cy={35} r={28} fill="url(#a)" />
      <Path
        d="M35.446 25.314 24.902 7.379l12.555-7.38-.64 5.209-5.619 3.302 1.97 3.35 6.004-3.53 1.968 3.348-6.004 3.53 2.383 4.054 7.346-4.318 2.112 3.591zM15.935 12.656l5.38-3.163 10.543 17.935-5.38 3.163zm-5.689 8.177-4.373 2.57 3.329 5.663 4.373-2.57zm4.06 16.914-4.214 2.477-7.06-12.008.723-3.568-3.644 2.143.6-5.185 8.63-5.074c1.937-1.138 3.655-.666 4.678 1.075l4.21 7.16c1.023 1.741.6 3.472-1.336 4.61l-5.58 3.28z"
        fill="#313779"
      />
      <Defs>
        <LinearGradient
          id="a"
          x1={46.5}
          y1={59}
          x2={16.5}
          y2={7}
          gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FF7C10" />
          <Stop offset={1} stopColor="#FF854C" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

export default React.memo(StampBoost);
