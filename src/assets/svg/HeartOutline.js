import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function HeartOutline(props) {
  return (
    <Svg width={20} height={21} viewBox="0 0 20 21" fill="none" {...props}>
      <Path
        d="M10 4.274a5 5 0 0 0-6.869 7.262l5.69 5.69a1.666 1.666 0 0 0 2.358 0l5.69-5.69A5 5 0 0 0 10 4.274m-.977 1.37.388.386a.833.833 0 0 0 1.178 0l.388-.386a3.333 3.333 0 1 1 4.713 4.713L10 16.047l-5.69-5.69a3.333 3.333 0 0 1 4.713-4.713"
        fill={props.fill || '#2E3135'}
        fillOpacity={0.8}
      />
    </Svg>
  );
}

export default React.memo(HeartOutline);
