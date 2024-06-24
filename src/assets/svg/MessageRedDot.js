import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

function MessageRedDot(props) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M2.334 7a2.333 2.333 0 0 1 2.333-2.334h18.667a2.333 2.333 0 0 1 2.333 2.333v12.834a2.333 2.333 0 0 1-2.334 2.333h-5.35l-3.158 3.158a1.167 1.167 0 0 1-1.65 0l-3.158-3.158h-5.35a2.333 2.333 0 0 1-2.333-2.333zm21 0H4.666v12.833H10.5c.31 0 .606.123.825.341L14 22.85l2.675-2.676c.22-.218.516-.341.825-.341h5.834zM7 11.082a1.167 1.167 0 0 1 1.167-1.167h11.667a1.167 1.167 0 1 1 0 2.333H8.167A1.167 1.167 0 0 1 7 11.083m0 4.666a1.167 1.167 0 0 1 1.167-1.166h7a1.167 1.167 0 1 1 0 2.333h-7A1.167 1.167 0 0 1 7 15.749"
        fill="#fff"
      />
      <Circle cx={24.5} cy={5.834} r={3.5} fill="#FF4242" />
    </Svg>
  );
}

export default React.memo(MessageRedDot);
