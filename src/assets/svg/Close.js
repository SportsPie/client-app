import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Close(props) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M6.175 6.175a1.167 1.167 0 0 1 1.65 0L14 12.35l6.175-6.175a1.168 1.168 0 1 1 1.65 1.65L15.65 14l6.175 6.175a1.167 1.167 0 0 1-1.65 1.65L14 15.65l-6.175 6.175a1.167 1.167 0 0 1-1.65-1.65L12.35 14 6.175 7.825a1.167 1.167 0 0 1 0-1.65"
        fill={props.fill || '#000'}
      />
    </Svg>
  );
}
export default React.memo(Close);
