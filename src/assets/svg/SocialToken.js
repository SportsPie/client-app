import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SocialToken(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path
          d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12"
          fill="#FF671F"
        />
        <Path
          d="M12 1.345c5.875 0 10.655 4.78 10.655 10.655S17.875 22.655 12 22.655 1.345 17.875 1.345 12 6.125 1.345 12 1.345M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0"
          fill="#FFD100"
        />
        <Path
          d="M9.192 7.066h3.932c2.663 0 3.96 1.483 3.562 3.745s-2.222 3.768-4.885 3.768h-1.646l-.482 2.726H7.387zm2.864 5.49c1.27 0 2.142-.602 2.344-1.745s-.463-1.722-1.733-1.722h-1.544l-.61 3.468z"
          fill="#FFD100"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default React.memo(SocialToken);
