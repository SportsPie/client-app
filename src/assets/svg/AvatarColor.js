import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';
function Avatar(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 22 22">
      <G id="group1">
        <G id="Group">
          <Path
            id="Vector"
            fill="#002672"
            d="M18.759 0H3.24A3.24 3.24 0 0 0 0 3.241V18.76A3.24 3.24 0 0 0 3.241 22H18.76A3.24 3.24 0 0 0 22 18.759V3.24A3.24 3.24 0 0 0 18.759 0"
          />
          <G id="Group_2">
            <Path
              id="Vector_2"
              fill="#fff"
              d="M2.229 11.48a8.785 8.785 0 0 0 8.29 8.29v-8.29z"
            />
            <Path
              id="Vector_3"
              fill="#fff"
              d="M10.522 2.23a8.785 8.785 0 0 0-8.29 8.29h8.29z"
            />
            <Path
              id="Vector_4"
              fill="#FF7C10"
              d="M19.77 10.524a8.785 8.785 0 0 0-8.29-8.29v8.29z"
            />
          </G>
        </G>
      </G>
    </Svg>
  );
}

export default React.memo(Avatar);
