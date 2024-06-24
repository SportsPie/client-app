import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Share(props) {
  return (
    <Svg
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0m-8 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0m16 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0"
        fill={props.fill || '#000'}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.774 6.006a1 1 0 0 1-.36 1.368l-6.82 3.98a1 1 0 1 1-1.008-1.728l6.82-3.98a1 1 0 0 1 1.368.36m-8.548 7a1 1 0 0 1 1.367-.36l6.83 3.98a1 1 0 1 1-1.006 1.728l-6.83-3.98a1 1 0 0 1-.361-1.367"
        fill={props.fill || '#000'}
      />
    </Svg>
  );
}

export default React.memo(Share);
