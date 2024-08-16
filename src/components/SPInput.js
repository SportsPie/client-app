import emojiRegex from 'emoji-regex';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SPSvgs } from '../assets/svg';
import { COLORS } from '../styles/colors';
import Utils from '../utils/Utils';
import fontStyles from '../styles/fontStyles';
import { IS_IOS } from '../common/constants/constants';

export default function SPInput({
  value,
  numberOfLines,
  error,
  success,
  onlyNumber,
  onlyDecimal,
  fractionDigits,
  onChange,
  onChangeText,
  onSubmitEditing,
  onEndEditing,
  editable,
  noEditable,
  onKeyPress,
  placeholder,
  subPlaceholder,
  returnKeyType,
  bottomText,
  onFocus,
  onBlur,
  inputRef,
  secureTextEntry,
  textContentType,
  autoFocus,
  autoComplete,
  inputBoxStyle,
  inputStyle,
  bottomTextBoxStyle,
  bottomTextStyle,
  autoCapitalize,
  maxLength,
  noBlank,
  textAlign,
  textAlignVertical,
  title,
  titleStyle,
  containerStyle,
  rightButton,
  checkImage,
  ...props
}) {
  const [keyword, setKeyword] = useState();
  const [focus, setFocus] = useState(false);
  const [plusMaxLength, setPlusMaxLength] = useState(0);

  const style = {
    container: {
      backgroundColor: COLORS.white,
      gap: 4,
    },
    textInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: error ? COLORS.error : COLORS.border0,
      borderWidth: 1,
      paddingHorizontal: 16,
      borderRadius: 10,
      height: numberOfLines
        ? fontStyles.fontSize14_Regular.lineHeight * numberOfLines + 30
        : 48,
      flexGrow: 1,
      columnGap: 4,
      paddingVertical: numberOfLines ? 15 / 2 : 0,
    },
    textInput: {
      flexGrow: 1,
      flexShrink: 1,
      height: '100%',
      letterSpacing: 0.2,
      textAlignVertical: 'center', // Add this line to ensure placeholder is at the top
    },
    title: {
      ...fontStyles.fontSize12_Regular,
      color: COLORS.labelNormal,
      letterSpacing: 0.3,
    },
    subPlaceholder: {
      ...fontStyles.fontSize14_Regular,
      color: COLORS.labelAlternative,
      top: IS_IOS ? 3 : -1,
    },
  };

  const styles = StyleSheet.create(style);

  const handleFocus = e => {
    setFocus(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = e => {
    setFocus(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = e => {
    if (noEditable) return;
    if (
      e.nativeEvent.text.length > maxLength ? maxLength + plusMaxLength : null
    )
      return;
    if (onlyNumber) {
      e.nativeEvent.text = Utils.changeIntegerForInput(e.nativeEvent.text);
    }

    if (onlyDecimal) {
      if (e.nativeEvent.text) {
        // 입력값이 존재하나 소수점 2개 입력 등 잘못된 입력을 할 시에 기존에 입력된 값으로 교체된다.
        const text = Utils.changeDecimalForInput(
          e.nativeEvent.text,
          fractionDigits,
        );
        e.nativeEvent.text = String(text) || keyword;
      }
    }
    if (noBlank) {
      e.nativeEvent.text = Utils.removeBlank(e.nativeEvent.text);
    }

    const regex = emojiRegex();
    const noEmojiText = e.nativeEvent.text?.replace(regex, '');

    e.nativeEvent.text = noEmojiText;
    getPlusMaxLength(noEmojiText);
    setKeyword(noEmojiText);
    if (onChange) onChange(e);
  };

  const handleChangeText = e => {
    if (noEditable) return;
    if (e.length > maxLength ? maxLength + plusMaxLength : null) return;
    const regex = emojiRegex();
    const noEmojiText = e.replace(regex, '');

    let text = noEmojiText;
    if (onlyNumber) text = Utils.changeIntegerForInput(text);
    if (onlyDecimal) {
      if (e) {
        // 입력값이 존재하나 소수점 2개 입력 등 잘못된 입력을 할 시에 기존에 입력된 값으로 교체된다.
        text =
          String(Utils.changeDecimalForInput(e, fractionDigits)) || keyword;
      }
    }
    if (noBlank) {
      text = Utils.removeBlank(text);
    }
    getPlusMaxLength(text);
    setKeyword(text);
    if (onChangeText) onChangeText(text);
  };

  const getPlusMaxLength = text => {
    if (!text) return 0;
    if (!(onlyNumber || onlyDecimal)) return 0;
    const commaText = Utils.changeNumberComma(text, true);
    const commaCount = (commaText.match(/,/g) || []).length; // , 개수 세기
    const dotCount = (commaText.match(/\./g) || []).length; // . 개수 세기
    const plusLength = Math.floor(commaCount + dotCount);
    setPlusMaxLength(plusLength);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View
        style={[
          styles.textInputWrap,
          {
            borderColor: error
              ? COLORS.error
              : focus
              ? '#FF7C10'
              : COLORS.border0,
          },
          inputBoxStyle,
        ]}>
        <TextInput
          ref={inputRef}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={error ? COLORS.error : COLORS.labelAlternative}
          value={
            onlyNumber || onlyDecimal
              ? String(Utils.changeNumberComma(value, true)) ||
                String(Utils.changeNumberComma(keyword, true))
              : value !== undefined
              ? value
              : value || keyword
          }
          style={[fontStyles.fontSize14_Regular, styles.textInput, inputStyle]}
          multiline={!!numberOfLines}
          scrollEnabled={
            !(
              numberOfLines &&
              typeof numberOfLines === 'number' &&
              numberOfLines > 0
            )
          }
          numberOfLines={numberOfLines}
          keyboardType={onlyNumber || onlyDecimal ? 'numeric' : 'default'}
          onChange={handleChange}
          onChangeText={handleChangeText}
          onSubmitEditing={onSubmitEditing}
          onEndEditing={onEndEditing}
          onKeyPress={onKeyPress}
          editable={editable}
          returnKeyType={returnKeyType || 'done'}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          textContentType={textContentType}
          autoCorrect={false}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize || 'none'}
          textAlign={textAlign}
          textAlignVertical={textAlignVertical || 'top'} // Ensure placeholder text is aligned to the top
          {...props}
        />

        {subPlaceholder && (
          <Text style={styles.subPlaceholder}>{subPlaceholder}</Text>
        )}

        {!rightButton && error && <SPSvgs.WarningCircle />}

        {checkImage && (
          <SPSvgs.Check width={20} height={20} fill="rgba(36, 161, 71, 1)" />
        )}
        {rightButton}
      </View>

      {bottomText && (
        <View style={bottomTextBoxStyle}>
          <Text
            style={[
              fontStyles.fontSize12_Regular,
              {
                color: success
                  ? COLORS.positive
                  : error
                  ? COLORS.error
                  : COLORS.labelAlternative,
              },
              bottomTextStyle,
            ]}>
            {bottomText}
          </Text>
        </View>
      )}
    </View>
  );
}
