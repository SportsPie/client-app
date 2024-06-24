import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SPSvgs } from '../assets/svg';

function Avatar({ imageURL, onPress, disableEditMode, imageSize }) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            width: imageSize ?? 56,
            height: imageSize ?? 56,
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
              },
            ]}
          />
        ) : (
          <SPSvgs.Avatar width={imageSize ?? 56} height={imageSize ?? 56} />
        )}
      </View>

      {!disableEditMode && <SPSvgs.Camera style={styles.camera} />}
    </Pressable>
  );
}

export default memo(Avatar);

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  camera: {
    position: 'absolute',
    bottom: 0,
    left: 56 - 18,
  },
});
