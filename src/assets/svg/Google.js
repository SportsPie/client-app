import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function Google(props) {
  return (
    <Svg width={19} height={19} viewBox="0 0 19 19" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.14 10.023q-.002-.958-.164-1.841H9.5v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616"
        fill="#4285F4"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 18.818c2.43 0 4.467-.806 5.956-2.18l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.583-5.036-3.71H1.457v2.331A9 9 0 0 0 9.5 18.818"
        fill="#34A853"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.464 11.528a5.4 5.4 0 0 1-.282-1.71c0-.593.102-1.17.282-1.71V5.776H1.457A9 9 0 0 0 .5 9.818c0 1.453.348 2.827.957 4.042z"
        fill="#FBBC05"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 4.398c1.321 0 2.508.454 3.44 1.346l2.582-2.582C13.962 1.71 11.926.818 9.5.818a9 9 0 0 0-8.043 4.959l3.007 2.331c.708-2.127 2.692-3.71 5.036-3.71"
        fill="#EA4335"
      />
    </Svg>
  );
}

export default React.memo(Google);
