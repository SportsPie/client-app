import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Champion(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M18.5 5h1.202c1.201 0 1.801 0 2.115.377.313.378.183.944-.078 2.077l-.39 1.7C20.76 11.708 18.61 13.608 16 14M5.5 5H4.298c-1.2 0-1.802 0-2.115.377-.313.378-.183.944.078 2.077l.39 1.7c.59 2.554 2.74 4.454 5.35 4.846m4 3c-1.675 0-3.13 1.265-3.883 3.131-.36.892.156 1.869.84 1.869h6.083c.685 0 1.2-.977.841-1.869C15.13 18.265 13.674 17 12 17"
        stroke="#FBA525"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 17c3.02 0 5.565-4.662 6.33-11.01.211-1.754.317-2.632-.243-3.311S16.622 2 14.813 2H9.187c-1.81 0-2.714 0-3.274.679S5.46 4.236 5.67 5.991C6.435 12.338 8.98 17 12 17"
        fill="#FBA525"
        stroke="#FBA525"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(Champion);
