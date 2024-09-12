import * as React from 'react';
import Svg, { Mask, Path, G, Rect } from 'react-native-svg';
const RightArrow = props => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Mask
      id="mask0_7747_87697"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={21}
      height={20}>
      <Path
        d="M12.7547 6.77803L13.6082 5.92448H12.4011H6.07608C5.89388 5.92448 5.74274 5.77333 5.74274 5.59115C5.74274 5.40896 5.89388 5.25781 6.07608 5.25781H14.4094C14.5916 5.25781 14.7428 5.40896 14.7428 5.59115V13.9245C14.7428 14.1067 14.5916 14.2578 14.4094 14.2578C14.2272 14.2578 14.0761 14.1067 14.0761 13.9245V7.59948V6.39237L13.2226 7.24592L5.82253 14.6459C5.69279 14.7757 5.48437 14.7757 5.35463 14.6459C5.22489 14.5162 5.22489 14.3078 5.35463 14.178L12.7547 6.77803Z"
        fill="black"
        stroke="#fff"
      />
    </Mask>
    <G mask="url(#mask0_7747_87697)">
      <Rect width={20} height={20} fill="#fff" />
    </G>
  </Svg>
);
export default React.memo(RightArrow);
