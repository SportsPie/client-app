import * as React from 'react';
import Svg, {
  G,
  Path,
  Defs,
  ClipPath,
  Pattern,
  Use,
  Image,
} from 'react-native-svg';

function Gift(props) {
  return (
    <Svg width={130} height={130} viewBox="0 0 130 130" fill="none" {...props}>
      <G clipPath="url(#a)">
        <Path fill="#fff" d="M0 0h130v130H0z" />
        <Path fill="url(#b)" d="M0 0h130v130H0z" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h130v130H0z" />
        </ClipPath>
        <Pattern
          id="b"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}>
          <Use xlinkHref="#c" transform="scale(.002)" />
        </Pattern>
        <Image
          id="c"
          width={500}
          height={500}
          xlinkHref="data:image/png;base64,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"
        />
      </Defs>
    </Svg>
  );
}

export default React.memo(Gift);
