import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';

function Ellipse(props) {
  return (
    <Svg width={4} height={5} viewBox="0 0 4 5" fill="none" {...props}>
      <Circle
        cx={2}
        cy={2.5}
        r={2}
        fill={props.fill || '#878D96'}
        fillOpacity={0.22}
      />
    </Svg>
  );
}

export default React.memo(Ellipse);
