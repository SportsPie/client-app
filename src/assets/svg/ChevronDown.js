import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function ChevronDown(props) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M4.411 7.745a.833.833 0 0 1 1.178 0L10 12.155l4.411-4.41a.833.833 0 1 1 1.178 1.178l-5 5a.834.834 0 0 1-1.178 0l-5-5a.833.833 0 0 1 0-1.178"
        fill="#1A1C1E"
      />
    </Svg>
  );
}

export default React.memo(ChevronDown);
