import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function BookmarksOutline(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}>
      <G>
        <Path
          fill="#1D1B20"
          d="M5 21V5c0-.55.196-1.02.588-1.413A1.926 1.926 0 017 3h10c.55 0 1.02.196 1.413.587C18.803 3.98 19 4.45 19 5v16l-7-3-7 3zm2-3.05l5-2.15 5 2.15V5H7v12.95z"
        />
      </G>
    </Svg>
  );
}

export default React.memo(BookmarksOutline);
