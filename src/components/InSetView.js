import { memo, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function InsetView({ setHeight }) {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (insets !== null) {
      if (setHeight) setHeight(insets.top);
    }
  }, [insets]);
  return null;
}

export default memo(InsetView);
