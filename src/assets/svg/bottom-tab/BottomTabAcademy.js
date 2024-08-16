import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function BottomTabAcademy(props) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 12a1 1 0 0 1 1-1h3v9H4a1 1 0 0 1-1-1zm14-1h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3z"
        fill="#FF7C10"
        stroke="#FF7C10"
        strokeWidth={1.5}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.375 6.7A1 1 0 0 0 7 7.481v12.52h10V7.48a1 1 0 0 0-.375-.78l-4-3.2a1 1 0 0 0-1.25 0zM12 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
        fill="#FF7C10"
      />
      <Path
        d="m7.375 6.7.469.586zM7 20h-.75v.75H7zm10 0v.75h.75V20zm-.375-13.3-.469.586zm-4-3.2.468-.585zm-1.25 0 .469.586zM7.75 7.481a.25.25 0 0 1 .094-.195l-.937-1.171A1.75 1.75 0 0 0 6.25 7.48zm0 12.52V7.48h-1.5V20zm9.25-.75H7v1.5h10zm-.75-11.77v12.52h1.5V7.48zm-.094-.195a.25.25 0 0 1 .094.195h1.5a1.75 1.75 0 0 0-.657-1.366zm-4-3.2 4 3.2.937-1.171-4-3.2zm-.312 0a.25.25 0 0 1 .312 0l.937-1.171a1.75 1.75 0 0 0-2.186 0zm-4 3.2 4-3.2-.937-1.171-4 3.2zm6.406 3.715A2.25 2.25 0 0 1 12 13.25v1.5A3.75 3.75 0 0 0 15.75 11zM12 8.75A2.25 2.25 0 0 1 14.25 11h1.5A3.75 3.75 0 0 0 12 7.25zM9.75 11A2.25 2.25 0 0 1 12 8.75v-1.5A3.75 3.75 0 0 0 8.25 11zM12 13.25A2.25 2.25 0 0 1 9.75 11h-1.5A3.75 3.75 0 0 0 12 14.75z"
        fill="#FF7C10"
      />
    </Svg>
  );
}

export default React.memo(BottomTabAcademy);
