import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function BubbleChatOutline(props) {
  return (
    <Svg width={20} height={21} viewBox="0 0 20 21" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.003 2.5a7.995 7.995 0 0 0-7.806 6.233 8 8 0 0 0 4.36 8.989 8 8 0 0 0 6.709.08l3.792.685a.8.8 0 0 0 .89-1.068l-1.067-2.842A8.002 8.002 0 0 0 10.003 2.5M7.221 4.734a6.395 6.395 0 0 1 9.17 6.07 6.4 6.4 0 0 1-1.064 3.24.8.8 0 0 0-.083.725l.711 1.893-2.655-.48a.8.8 0 0 0-.494.068 6.395 6.395 0 0 1-9.042-4.31 6.4 6.4 0 0 1 3.457-7.206"
        fill={props.fill || '#2E3135'}
        fillOpacity={0.8}
      />
    </Svg>
  );
}

export default React.memo(BubbleChatOutline);
