import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../styles/colors';
import FontStyles from '../styles/fontStyles';
import { ACTIVE_OPACITY } from '../common/constants/constants';

export default function CBButton({
  text,
  onPress,
  imageButton,
  imageUrl,
  whiteButton,
  greenButton,
  textRegular,
  smallText,
  squareButton,
  disabled,
  noBorder,
  btnStyle,
  textStyle,
  blackButton,
  ...props
}) {
  // 기본 스타일
  const styleObj = {
    touchableOpacity: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.darkGray,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
    },
    text: {
      ...FontStyles.fontSize18_Semibold,
      textAlign: 'center',
    },
  };

  // 텍스트 크기 굵기 조절
  if (smallText)
    styleObj.text = { ...styleObj.text, ...FontStyles.fontSize16_Semibold };
  if (textRegular) {
    if (smallText) {
      styleObj.text = { ...styleObj.text, ...FontStyles.fontSize16_Regular };
    } else {
      styleObj.text = { ...styleObj.text, ...FontStyles.fontSize18_Regular };
    }
  }

  // 색상 조절
  if (greenButton) {
    styleObj.touchableOpacity.backgroundColor = COLORS.primary;
    styleObj.text.color = COLORS.white;
  }
  if (blackButton) {
    styleObj.touchableOpacity.backgroundColor = '#000';
    styleObj.text.color = COLORS.white;
    styleObj.touchableOpacity.borderWidth = 0;
  }
  // border 여부
  if (noBorder) {
    styleObj.touchableOpacity.borderWidth = 0;
  }

  // disabled 여부 확인
  if (disabled) {
    styleObj.touchableOpacity.borderWidth = 0;

    if (greenButton || blackButton) {
      styleObj.touchableOpacity.backgroundColor = COLORS.gray10;
      styleObj.text.color = COLORS.gray50;
    } else {
      styleObj.touchableOpacity.backgroundColor = COLORS.gray;
      styleObj.text.color = COLORS.darkGray;
    }
  }

  // 버튼의 둥근 정도 조절 :: 높이 / 2
  const [height, setHeight] = useState(0);
  const handleLayout = event => {
    const { height: layoutHeight } = event.nativeEvent.layout;
    setHeight(layoutHeight);
  };
  const borderRadius = height > 0 ? 16 : 0;
  if (!squareButton) styleObj.touchableOpacity.borderRadius = borderRadius;

  const styles = StyleSheet.create(styleObj);
  return (
    <TouchableOpacity
      activeOpacity={ACTIVE_OPACITY}
      onPress={onPress}
      onLayout={handleLayout}
      style={[styles.touchableOpacity, btnStyle]}
      disabled={disabled}
      {...props}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
}
