import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';
import { SPSvgs } from '../assets/svg';
import { ACTIVE_OPACITY } from '../common/constants/constants';
function SPModal({
  title,
  contents,
  visible,
  animationType,
  transparent,
  onCancel,
  onClose,
  onConfirm,
  cancelButtonText,
  confirmButtonText,
  textInputVisible,
  titleStyle,
  textInputStyle,
  placeholder,
  bodyWrapStyle,
  buttonWrapStyle,
  textCancelButton,
  textAlign,
  maxLength,
  value,
  onChangeText,
}) {
  const [showModal, setShowModal] = useState(visible);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setShowModal(visible);
    if (value !== undefined) {
      setInputText(value);
    }
  }, [visible, value]);

  const handleOnRequestCloseEvent = e => {
    setShowModal(false);
    setTimeout(() => {
      if (onClose) {
        onClose(false);
      }
    }, 0);
  };

  const handleCloseEvent = e => {
    setShowModal(false);
    setTimeout(() => {
      if (onClose) {
        onClose(false);
      }
      if (textInputVisible) setInputText('');
    }, 0);
  };

  const handleOkEvent = e => {
    setShowModal(false);
    setTimeout(async () => {
      if (onConfirm) {
        if (textInputVisible) {
          await onConfirm(inputText);
        } else {
          await onConfirm();
        }
      }
      if (onClose) {
        await onClose(false);
      }
      if (textInputVisible) setInputText('');
    }, 0);
  };
  const handleCancelEvent = e => {
    setShowModal(false);
    setTimeout(async () => {
      if (onCancel) {
        await onCancel();
      }
      if (onClose) {
        await onClose(false);
      }
      if (textInputVisible) setInputText('');
    }, 0);
  };

  const isConfirmDisabled = textInputVisible && !inputText;

  return (
    <View>
      <Modal
        transparent={transparent !== false}
        animationType={animationType || 'fade'}
        visible={visible !== undefined ? visible : showModal}
        onRequestClose={handleOnRequestCloseEvent}>
        <TouchableOpacity
          style={[styles.modalBackGroud]}
          activeOpacity={1}
          onPress={handleOnRequestCloseEvent}>
          <TouchableOpacity
            style={[styles.modalContainer]}
            activeOpacity={1}
            onPress={e => {
              e.stopPropagation();
            }}>
            <View style={[styles.bodyWrap, bodyWrapStyle]} activeOpacity={1}>
              {title && (
                <View>
                  <Text style={[styles.title, titleStyle]}>
                    {title || '제목'}
                  </Text>
                  {/* <TouchableOpacity
                  style={[closeButtonWrapStyle]}
                  onPress={handleCloseEvent}>
                  <Image
                    source={SPIcons.icNavCancle}
                    style={[closeButtonStyle]}
                  />
                </TouchableOpacity> */}
                </View>
              )}
              <View style={[styles.contentsWrap]}>
                {textInputVisible ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      textAlign={textAlign || 'left'}
                      style={[styles.textInput, textInputStyle]} // textInputStyle을 스타일 배열에 추가
                      placeholder={placeholder || '텍스트 입력'}
                      value={value || inputText}
                      onChangeText={text => {
                        if (text?.length > maxLength) return;
                        setInputText(text);
                        if (onChangeText) onChangeText(text);
                      }}
                    />

                    {/* x 표시를 포함한 TouchableOpacity */}
                    {textCancelButton && (
                      <TouchableOpacity
                        activeOpacity={ACTIVE_OPACITY}
                        onPress={() => onChangeText('')}
                        style={{ position: 'absolute', right: 10 }}>
                        <SPSvgs.InputClose />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <Text style={[styles.contents]}>{contents || '내용'}</Text>
                )}
              </View>
            </View>
            <View style={[styles.buttonWrap, buttonWrapStyle]}>
              {onCancel && (
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  onPress={handleCancelEvent}
                  style={[styles.cancleButton]}>
                  <Text style={[styles.cancelButtonText]}>
                    {cancelButtonText || '취소'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={handleOkEvent}
                disabled={isConfirmDisabled}
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor: isConfirmDisabled ? '#E3E2E1' : '#FF671F',
                    borderColor: isConfirmDisabled ? '#E3E2E1' : '#FF671F',
                  },
                ]}>
                <Text
                  style={[
                    styles.confirmButtonText,
                    {
                      color: isConfirmDisabled
                        ? 'rgba(46, 49, 53, 0.28)'
                        : '#FFF',
                    },
                  ]}>
                  {confirmButtonText || '확인'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackGroud: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    paddingVertical: 24,
    width: 312,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  bodyWrap: { justifyContent: 'center', alignItems: 'center', gap: 16 },
  title: {
    ...fontStyles.fontSize20_Semibold,
    letterSpacing: -0.24,
    color: '#1D1B20',
  },
  contentsWrap: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contents: {
    ...fontStyles.fontSize14_Regular,
    textAlign: 'center',
    lineHeight: 22,
    color: COLORS.labelNeutral,
  },
  buttonWrap: {
    paddingHorizontal: 24,
    width: '100%',
    gap: 8,
    flexDirection: 'row',
  },
  cancleButton: {
    flex: 1,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  cancelButtonText: {
    ...fontStyles.fontSize15_Semibold,
    color: COLORS.darkBlue,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orange,
  },
  confirmButtonText: {
    ...fontStyles.fontSize15_Semibold,
    color: COLORS.white,
  },
  textInput: {
    flexGrow: 1,
    height: 48,
  },
});

export default SPModal;
