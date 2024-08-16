import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function LetterA(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#a)" fill="#FF7C10">
        <Path d="M10.581 13.329h2.787l-1.375-4.282z" />
        <Path d="M12 .75C5.787.75.75 5.787.75 12S5.787 23.25 12 23.25 23.25 18.213 23.25 12 18.213.75 12 .75m2.688 16.69-.718-2.236H9.963l-.738 2.236H6.847L10.73 6.56h2.572l3.85 10.88z" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default React.memo(LetterA);
