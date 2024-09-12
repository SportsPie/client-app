import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const EventWrite = props => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M2.49902 14.5521V17.0854C2.49902 17.3187 2.68236 17.5021 2.91569 17.5021H5.44902C5.55736 17.5021 5.66569 17.4604 5.74069 17.3771L14.8407 8.28542L11.7157 5.16042L2.62402 14.2521C2.54069 14.3354 2.49902 14.4354 2.49902 14.5521ZM17.2574 5.86875C17.5824 5.54375 17.5824 5.01875 17.2574 4.69375L15.3074 2.74375C14.9824 2.41875 14.4574 2.41875 14.1324 2.74375L12.6074 4.26875L15.7324 7.39375L17.2574 5.86875Z"
      fill="#002672"
    />
  </Svg>
);
export default React.memo(EventWrite);
