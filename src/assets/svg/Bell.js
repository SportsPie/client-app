import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Bell(props) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M11.837 3.79a2.333 2.333 0 0 1 4.326 0 8.17 8.17 0 0 1 6.004 7.877v5.48l2.137 3.205a1.167 1.167 0 0 1-.97 1.815h-5.291a4.085 4.085 0 0 1-8.086 0h-5.29a1.167 1.167 0 0 1-.971-1.815l2.137-3.206v-5.48a8.17 8.17 0 0 1 6.004-7.877m.513 18.377a1.75 1.75 0 0 0 3.3 0zM14 5.833a5.833 5.833 0 0 0-5.833 5.834V17.5c0 .23-.068.456-.196.647l-1.124 1.686h14.305l-1.124-1.686a1.17 1.17 0 0 1-.195-.647v-5.833A5.834 5.834 0 0 0 14 5.833"
        fill="#0A0B18"
      />
    </Svg>
  );
}
export default React.memo(Bell);
