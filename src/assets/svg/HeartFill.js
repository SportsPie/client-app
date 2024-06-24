import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function HeartFill(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 4.528a6 6 0 0 0-8.243 8.715l6.829 6.828a2 2 0 0 0 2.828 0l6.829-6.828A6 6 0 0 0 12 4.528"
        fill="#FF4242"
      />
    </Svg>
  );
}

export default React.memo(HeartFill);
