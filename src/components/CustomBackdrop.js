import React, { memo, useMemo } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

function CustomBackdrop({ animatedIndex, style }) {
  console.log('🚀 ~ CustomBackdrop ~ animatedIndex:', animatedIndex);
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: '#a8b5eb',
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle],
  );

  return <Animated.View style={containerStyle} />;
}

export default memo(CustomBackdrop);
