import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function KakaoTalk(props) {
  return (
    <Svg width={18} height={19} viewBox="0 0 18 19" fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path
          opacity={0.902}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 1.763c-4.71 0-9 3.786-9 6.989 0 2.4 1.558 4.517 3.931 5.775l-.998 3.666c-.089.325.28.583.563.396l4.377-2.905A12 12 0 0 0 9 15.74c4.97 0 9-3.13 9-6.99 0-3.202-4.03-6.988-9-6.988"
          fill="#000"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 .818h18v18H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default React.memo(KakaoTalk);
