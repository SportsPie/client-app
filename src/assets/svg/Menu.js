import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Menu(props) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M4.667 8.167A1.167 1.167 0 0 1 5.833 7h16.334a1.166 1.166 0 1 1 0 2.333H5.833a1.167 1.167 0 0 1-1.166-1.166m0 5.833a1.167 1.167 0 0 1 1.166-1.167h16.334a1.166 1.166 0 1 1 0 2.334H5.833A1.167 1.167 0 0 1 4.667 14m0 5.833a1.167 1.167 0 0 1 1.166-1.166h16.334a1.166 1.166 0 1 1 0 2.333H5.833a1.167 1.167 0 0 1-1.166-1.167"
        fill="#0A0B18"
      />
    </Svg>
  );
}

export default React.memo(Menu);
