import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Block(props) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M10 3.335a2.51 2.51 0 0 1 2.5 2.5v2.5h-5v-2.5a2.51 2.51 0 0 1 2.5-2.5m4.167 5v-2.5A4.177 4.177 0 0 0 10 1.668a4.177 4.177 0 0 0-4.166 4.167v2.5H5A1.667 1.667 0 0 0 3.334 10v6.667A1.667 1.667 0 0 0 5 18.335h10a1.667 1.667 0 0 0 1.667-1.667v-6.667A1.667 1.667 0 0 0 15 8.335zM5 10h10v6.667H5z"
        fill="#2E3135"
        fillOpacity={0.8}
      />
    </Svg>
  );
}
export default React.memo(Block);
