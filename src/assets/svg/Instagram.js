import * as React from 'react';
import Svg, { Rect, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

function Instagram(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect width={24} height={24} rx={6} fill="url(#a)" />
      <Rect width={24} height={24} rx={6} fill="url(#b)" />
      <Rect width={24} height={24} rx={6} fill="url(#c)" />
      <Path
        d="M18 7.285a1.286 1.286 0 1 1-2.571 0 1.286 1.286 0 0 1 2.571 0"
        fill="#fff"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 16.285a4.286 4.286 0 1 0 0-8.572 4.286 4.286 0 0 0 0 8.572m0-1.714a2.571 2.571 0 1 0 0-5.143 2.571 2.571 0 0 0 0 5.143"
        fill="#fff"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.429 11.656c0-2.88 0-4.32.56-5.42a5.14 5.14 0 0 1 2.248-2.248c1.1-.56 2.54-.56 5.42-.56h.686c2.88 0 4.32 0 5.42.56a5.14 5.14 0 0 1 2.248 2.248c.56 1.1.56 2.54.56 5.42v.686c0 2.88 0 4.32-.56 5.42a5.14 5.14 0 0 1-2.247 2.248c-1.1.56-2.54.56-5.421.56h-.686c-2.88 0-4.32 0-5.42-.56a5.14 5.14 0 0 1-2.248-2.248c-.56-1.1-.56-2.54-.56-5.42zm8.228-6.514h.686c1.468 0 2.467.001 3.238.064.752.062 1.136.173 1.404.31.645.328 1.17.853 1.499 1.498.136.268.247.653.309 1.404.063.772.064 1.77.064 3.238v.686c0 1.468-.001 2.467-.064 3.238-.061.752-.173 1.136-.31 1.404a3.43 3.43 0 0 1-1.498 1.499c-.268.136-.652.247-1.404.309-.771.063-1.77.064-3.238.064h-.686c-1.468 0-2.466-.001-3.238-.064-.752-.062-1.136-.173-1.404-.31a3.43 3.43 0 0 1-1.498-1.498c-.137-.268-.248-.652-.31-1.404-.063-.771-.064-1.77-.064-3.238v-.686c0-1.468.001-2.466.064-3.238.062-.751.173-1.136.31-1.404a3.43 3.43 0 0 1 1.498-1.498c.268-.137.652-.248 1.404-.31.772-.063 1.77-.064 3.238-.064"
        fill="#fff"
      />
      <Defs>
        <RadialGradient
          id="a"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(12.4285 -18 18 12.4285 8.571 18)">
          <Stop stopColor="#B13589" />
          <Stop offset={0.793} stopColor="#C62F94" />
          <Stop offset={1} stopColor="#8A3AC8" />
        </RadialGradient>
        <RadialGradient
          id="b"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(-8.13 5.388 9.474)scale(33.335 7.13002)">
          <Stop offset={0.157} stopColor="#406ADC" />
          <Stop offset={0.468} stopColor="#6A45BE" />
          <Stop offset={1} stopColor="#6A45BE" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          id="c"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(-65.136 23.315 6.39)scale(19.3665)">
          <Stop stopColor="#E0E8B7" />
          <Stop offset={0.445} stopColor="#FB8A2E" />
          <Stop offset={0.715} stopColor="#E2425C" />
          <Stop offset={1} stopColor="#E2425C" stopOpacity={0} />
        </RadialGradient>
      </Defs>
    </Svg>
  );
}

export default React.memo(Instagram);
