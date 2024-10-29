import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SPSvgs } from '../assets/svg';
import SPImages from '../assets/images';

function Avatar({
  imageURL,
  onPress,
  disableEditMode,
  imageSize,
  sol,
  borderRadius,
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            width: imageSize ?? 56,
            height: imageSize ?? 56,
            borderRadius: borderRadius ?? 999,
          },
        ]}>
        {imageURL ? (
          <Image
            source={{
              uri: imageURL,
            }}
            style={[
              styles.container,
              {
                width: imageSize ?? 56,
                height: imageSize ?? 56,
                borderRadius: borderRadius ?? 999,
              },
            ]}
          />
        ) : (
          <SPSvgs.Avatar width={imageSize ?? 56} height={imageSize ?? 56} />
        )}
      </View>

      {!disableEditMode && <SPSvgs.Camera style={styles.camera} />}
      {sol && (
        <View style={{ position: 'absolute', right: -8, bottom: -8 }}>
          <Image source={SPImages.solMark} style={{ width: 48, height: 48 }} />
        </View>
      )}
    </Pressable>
  );
}

export default memo(Avatar);

const styles = StyleSheet.create({
  container: {
    // borderRadius: 999,
    overflow: 'hidden',
  },
  camera: {
    position: 'absolute',
    bottom: 0,
    left: 56 - 18,
  },
});
