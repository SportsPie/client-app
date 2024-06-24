import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Heart(props) {
  return (
    <Svg width={20} height={21} viewBox="0 0 20 21" fill="none" {...props}>
      <Path
        d="M10 4.274a5 5 0 0 0-6.869 7.262l5.69 5.69a1.666 1.666 0 0 0 2.358 0l5.69-5.69A5 5 0 0 0 10 4.274"
        fill="#FF671F"
      />
    </Svg>
  );
}

export default React.memo(Heart);
