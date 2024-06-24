import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function Facebook(props) {
  return (
    <Svg width={18} height={19} viewBox="0 0 18 19" fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path
          d="M18 9.818c0-4.968-4.032-9-9-9s-9 4.032-9 9c0 4.356 3.096 7.983 7.2 8.82v-6.12H5.4v-2.7h1.8v-2.25a3.153 3.153 0 0 1 3.15-3.15h2.25v2.7h-1.8c-.495 0-.9.405-.9.9v1.8h2.7v2.7H9.9v6.255A9 9 0 0 0 18 9.818"
          fill="#fff"
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

export default React.memo(Facebook);
