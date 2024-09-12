import * as React from 'react';
import Svg, { Mask, Path, G, Rect } from 'react-native-svg';
const ProfileRightArrow = props => (
  <Svg
    width={21}
    height={21}
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Mask
      id="mask0_7747_97193"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={21}
      height={21}>
      <Path
        d="M14.5026 11.9398L15.3561 11.0862H14.149H4.84066C4.65847 11.0862 4.50732 10.9351 4.50732 10.7529C4.50732 10.5707 4.65847 10.4195 4.84066 10.4195H14.149H15.3526L14.5033 9.5667L10.445 5.4917L10.4442 5.49098C10.3145 5.36124 10.3145 5.15282 10.4442 5.02309C10.5739 4.89341 10.7822 4.89335 10.9119 5.02289C10.912 5.02296 10.9121 5.02302 10.9121 5.02309L16.3949 10.5225L16.3955 10.5231C16.5252 10.6528 16.5252 10.8612 16.3955 10.991L10.9038 16.4826C10.7741 16.6124 10.5656 16.6124 10.4359 16.4826C10.3062 16.3529 10.3062 16.1362 10.4359 16.0064L14.5026 11.9398Z"
        fill="black"
        stroke="#fff"
      />
    </Mask>
    <G mask="url(#mask0_7747_97193)">
      <Rect x={0.5} y={0.753906} width={20} height={20} fill="#002672" />
    </G>
  </Svg>
);
export default React.memo(ProfileRightArrow);
