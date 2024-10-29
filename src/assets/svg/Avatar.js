import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
function Avatar(props) {
  return (
    <Svg
      width={170}
      height={170}
      viewBox="0 0 170 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <G clipPath="url(#clip0_9591_71537)">
        <Path
          d="M25.0466 0.5H144.953C158.51 0.5 169.5 11.4899 169.5 25.0466V144.953C169.5 158.51 158.51 169.5 144.953 169.5H25.0466C11.4899 169.5 0.5 158.51 0.5 144.953V25.0466C0.5 11.4899 11.4899 0.5 25.0466 0.5Z"
          fill="#444444"
          stroke="#818895"
        />
        <Path
          d="M17.2256 88.7148C19.0878 123.24 46.76 150.912 81.2852 152.774V88.7148H17.2256Z"
          fill="white"
        />
        <Path
          d="M81.3037 17.2266C46.7786 19.0888 19.1063 46.761 17.2441 81.2862H81.3037V17.2266Z"
          fill="white"
        />
        <Path
          d="M152.775 81.3057C150.913 46.7805 123.241 19.1083 88.7158 17.2461V81.3057H152.775Z"
          fill="#999999"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_9591_71537">
          <Rect width={170} height={170} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
export default React.memo(Avatar);
