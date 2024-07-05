/* eslint-disable no-unused-expressions */
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  WINDOW_HEIGHT,
} from '@gorhom/bottom-sheet';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SPSvgs } from '../assets/svg';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isIphoneX } from '../common/constants/constants';

function BoxSelect({
  title,
  placeholder,
  value,
  onItemPress,
  arrayOptions,
  containerStyle,
  boxStyle,
  onPressBox,
  disabled,
}) {
  const insets = useSafeAreaInsets();
  const bottomRef = useRef();

  const renderText = useMemo(() => {
    if (value) {
      return value;
    }
    return placeholder;
  }, [value, placeholder]);

  const renderItem = useCallback(
    item => {
      return (
        <Pressable
          style={styles.itemContainer}
          key={item?.id}
          onPress={() => {
            onItemPress(item?.value ?? '');
            bottomRef?.current?.close();
          }}>
          <Text style={styles.itemText}>{item?.label}</Text>
        </Pressable>
      );
    },
    [onItemPress],
  );

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {title && <Text style={fontStyles.fontSize14_Regular}>{title}</Text>}
      <Pressable
        disabled={disabled}
        onPress={() => {
          onPressBox ? onPressBox() : bottomRef?.current?.present();
        }}
        style={[styles.boxWrapper, boxStyle]}>
        <Text
          style={[
            styles.text,
            {
              color: value ? COLORS.labelNormal : COLORS.labelAlternative,
            },
          ]}>
          {renderText}
        </Text>
        <SPSvgs.ChevronDown />
      </Pressable>

      <BottomSheetModal
        backdropComponent={renderBackdrop}
        enableDynamicSizing
        index={0}
        handleComponent={null}
        bottomInset={isIphoneX() ? insets.bottom : 16}
        style={{
          marginHorizontal: 16,
        }}
        backgroundComponent={null}
        ref={bottomRef}>
        <BottomSheetView style={styles.backgroundContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {arrayOptions?.map(item => renderItem(item))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

export default memo(BoxSelect);

const styles = StyleSheet.create({
  backgroundContainer: {
    maxHeight: WINDOW_HEIGHT / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    paddingBottom: 16,
  },
  container: {
    gap: 4,
    flexGrow: 1,
  },
  boxWrapper: {
    flexDirection: 'row',
    columnGap: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: COLORS.lineBorder,
  },
  text: {
    ...fontStyles.fontSize14_Regular,
  },
  itemContainer: {
    paddingVertical: 16,
  },
  itemText: {
    ...fontStyles.fontSize16_Medium,
    color: COLORS.labelNormal,
    letterSpacing: 0.091,
  },
});
