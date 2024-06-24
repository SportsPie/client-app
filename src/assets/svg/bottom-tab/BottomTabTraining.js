import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function BottomTabTraining(props) {
  return (
    <Svg width={24} height={25} viewBox="0 0 24 25" fill="none" {...props}>
      <Path
        d="M17.684 4.173c.521-.659.03-1.603-.836-1.603h-6.716a1.06 1.06 0 0 0-.909.502l-5.082 8.456c-.4.666.103 1.497.908 1.497h3.43l-3.23 8.065c-.468 1.02.794 1.953 1.642 1.215l13.11-12.404h-6.85z"
        fill="#FF671F"
        stroke="#FF671F"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(BottomTabTraining);
