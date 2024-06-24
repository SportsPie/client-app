import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Pencil(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M16.293 2.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-13 13A1 1 0 0 1 8 21H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 .293-.707l10-10zM14 7.413l-9 9V19h2.586l9-9zm4 1.173L19.586 7 17 4.414 15.414 6z"
        fill={props.fill || '#0A0B18'}
      />
    </Svg>
  );
}

export default React.memo(Pencil);
