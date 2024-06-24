import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
function InputClose(props) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M8.00016 1.33203C4.3135 1.33203 1.3335 4.31203 1.3335 7.9987C1.3335 11.6854 4.3135 14.6654 8.00016 14.6654C11.6868 14.6654 14.6668 11.6854 14.6668 7.9987C14.6668 4.31203 11.6868 1.33203 8.00016 1.33203ZM11.3335 10.392L10.3935 11.332L8.00016 8.9387L5.60683 11.332L4.66683 10.392L7.06016 7.9987L4.66683 5.60536L5.60683 4.66536L8.00016 7.0587L10.3935 4.66536L11.3335 5.60536L8.94016 7.9987L11.3335 10.392Z"
        fill="#ADABA7"
      />
    </Svg>
  );
}
export default React.memo(InputClose);
