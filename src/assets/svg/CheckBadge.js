import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function CheckBadge(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 6.162a3 3 0 0 1 2.051-2.846l6.317-2.105a2 2 0 0 1 1.265 0l6.316 2.105A3 3 0 0 1 21 6.162v6.557a8 8 0 0 1-3.562 6.656l-4.329 2.886a2 2 0 0 1-2.218 0l-4.329-2.886A8 8 0 0 1 3 12.72z"
        fill="#FF671F"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.08 8.216a.73.73 0 0 1 0 1.04l-5.624 5.514a.8.8 0 0 1-.566.23.8.8 0 0 1-.566-.23l-2.795-2.74a.74.74 0 0 1-.229-.522.72.72 0 0 1 .22-.526.75.75 0 0 1 .537-.216.76.76 0 0 1 .533.225l2.3 2.254 5.129-5.03a.75.75 0 0 1 .53-.215.76.76 0 0 1 .531.216Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth={0.7}
      />
    </Svg>
  );
}

export default React.memo(CheckBadge);
