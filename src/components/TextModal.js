import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';
import { ACTIVE_OPACITY } from '../common/constants/constants';

function TextModal({
  title,
  content,
  visible,
  animationType,
  transparent,
  onClose,
  onConfirm,
  confirmButtonText,
  titleStyle,
  bodyWrapStyle,
  buttonWrapStyle,
  confirmButtonStyle,
  confirmButtonTextStyle,
}) {
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    setShowModal(visible);
  }, [visible]);

  const handleOnRequestCloseEvent = () => {
    setShowModal(false);
    setTimeout(() => {
      if (onClose) {
        onClose(false);
      }
    }, 0);
  };

  const handleOkEvent = () => {
    setShowModal(false);
    setTimeout(async () => {
      if (onConfirm) {
        await onConfirm();
      }
      if (onClose) {
        await onClose(false);
      }
    }, 0);
  };

  return (
    <View>
      <Modal
        transparent={transparent !== false}
        animationType={animationType || 'fade'}
        visible={visible !== undefined ? visible : showModal}
        onRequestClose={handleOnRequestCloseEvent}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={handleOnRequestCloseEvent}>
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}>
            <View style={[styles.bodyWrap, bodyWrapStyle]}>
              {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
              <View style={styles.contentsWrap}>{content}</View>
            </View>
            <View style={[styles.buttonWrap, buttonWrapStyle]}>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={handleOkEvent}
                style={[styles.confirmButton, confirmButtonStyle]}>
                <Text
                  style={[styles.confirmButtonText, confirmButtonTextStyle]}>
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
  modalBackground: {
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
  bodyWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    ...fontStyles.fontSize20_Semibold,
    letterSpacing: -0.24,
    color: '#1D1B20',
  },
  contentsWrap: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  contents: {
    ...fontStyles.fontSize14_Regular,
    textAlign: 'center',
    lineHeight: 22,
    color: COLORS.labelNeutral,
  },
  boldText: {
    ...fontStyles.fontSize14_Bold,
    color: COLORS.black,
  },
  buttonWrap: {
    paddingHorizontal: 24,
    width: '100%',
  },
  confirmButton: {
    width: '100%',
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
});

export default TextModal;
