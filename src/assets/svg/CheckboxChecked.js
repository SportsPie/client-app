import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

function CheckboxChecked(props) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
      <Rect
        x={0.75}
        y={0.75}
        width={16.5}
        height={16.5}
        rx={2.25}
        fill="#FF7C10"
      />
      <Rect
        x={0.75}
        y={0.75}
        width={16.5}
        height={16.5}
        rx={2.25}
        stroke="#FF7C10"
        strokeWidth={1.5}
      />
      <Path
        d="M14.1132 5.38726C14.4516 5.72572 14.4516 6.27446 14.1132 6.61292L8.11316 12.6129C7.77471 12.9514 7.22596 12.9514 6.88751 12.6129L3.88751 9.61292C3.54905 9.27446 3.54905 8.72572 3.88751 8.38726C4.22596 8.04881 4.77471 8.04881 5.11316 8.38726L7.50034 10.7744L12.8875 5.38726C13.226 5.04881 13.7747 5.04881 14.1132 5.38726Z"
        fill="white"
      />
    </Svg>
  );
}

export default React.memo(CheckboxChecked);
