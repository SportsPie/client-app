import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Gallery(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M15.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
        fill={props.fill || '#0A0B18'}
      />
      <Path
        d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm16 0H5v7.92l3.375-2.7a1 1 0 0 1 1.25 0l4.3 3.44 1.368-1.367a1 1 0 0 1 1.414 0L19 14.586zM5 19h14v-1.586l-3-3-1.293 1.293a1 1 0 0 1-1.332.074L9 12.28l-4 3.2z"
        fill={props.fill || '#0A0B18'}
      />
    </Svg>
  );
}

export default React.memo(Gallery);
