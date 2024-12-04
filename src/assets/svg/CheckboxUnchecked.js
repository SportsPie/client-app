import * as React from 'react';
import Svg, { Rect } from 'react-native-svg';

function CheckboxUnchecked(props) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
      <Rect
        x={0.75}
        y={0.75}
        width={16.5}
        height={16.5}
        rx={2.25}
        stroke="#878D96"
        strokeOpacity={0.32}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export default React.memo(CheckboxUnchecked);
