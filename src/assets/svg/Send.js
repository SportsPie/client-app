import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Send(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M2.982 19.485 10.6 3.845a1 1 0 0 1 1.798 0l7.62 15.64c.378.777-.343 1.637-1.175 1.4l-4.281-1.224a1 1 0 0 1-.699-.73l-1.391-5.845c-.244-1.025-1.702-1.025-1.946 0l-1.39 5.844a1 1 0 0 1-.699.73l-4.281 1.223c-.832.238-1.553-.622-1.174-1.4Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default React.memo(Send);
