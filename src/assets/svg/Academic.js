import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

function Academic(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path fill="#ADAFC9" d="M0 0h24v24H0z" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.709 6.625A3.125 3.125 0 0 1 7.834 3.5h8.333c1.726 0 3.125 1.4 3.125 3.125v7.98a4.79 4.79 0 0 1-2.443 4.176l-3.725 2.096a2.29 2.29 0 0 1-2.247 0L7.15 18.78a4.79 4.79 0 0 1-2.442-4.176zM7.834 4.75c-1.036 0-1.875.84-1.875 1.875v7.98c0 1.28.69 2.46 1.805 3.087l3.725 2.095a1.04 1.04 0 0 0 1.022 0l3.726-2.095a3.54 3.54 0 0 0 1.805-3.087v-7.98c0-1.036-.84-1.875-1.875-1.875z"
          fill="#fff"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.375 9.645V7.457h1.25v2.188l1.08.81L15.43 9.42l.643 1.072-1.846 1.108-.308 1.538L15 14.582l-1 .75-1.062-1.417h-1.875L10 15.332l-1-.75 1.083-1.443-.308-1.538-1.846-1.108.643-1.072 1.723 1.034zM12 10.738l-.976.733.239 1.194h1.475l.239-1.194z"
          fill="#fff"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 8.082a3.542 3.542 0 1 0 0 7.083 3.542 3.542 0 0 0 0-7.083m-4.79 3.542a4.792 4.792 0 1 1 9.583 0 4.792 4.792 0 0 1-9.583 0"
          fill="#fff"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Rect width={24} height={24} rx={6} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default React.memo(Academic);
