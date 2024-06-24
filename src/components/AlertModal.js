import React, { PureComponent } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../styles/colors';
import { PrimaryButton } from './PrimaryButton';
import fontStyles from '../styles/fontStyles';

class AlertModal extends PureComponent {
  static instance;

  static show({
    title,
    subTitle,
    cancelText,
    confirmText,
    onConfirmPress,
    onCancelPress,
  }) {
    if (AlertModal.instance) {
      AlertModal.instance.setState({
        isVisible: true,
        title,
        subTitle,
        cancelText: cancelText ?? '취소',
        confirmText: confirmText ?? '확인',
        onConfirmPress: onConfirmPress ? onConfirmPress : () => {},
        onCancelPress: onCancelPress ? onCancelPress : () => {},
      });
    }
  }

  static hide() {
    if (AlertModal.instance) {
      AlertModal.instance.setState({ isVisible: false });
    }
  }

  constructor(props) {
    super(props);
    AlertModal.instance = this;
    this.state = {
      isVisible: false,
      title: '',
      subTitle: '',
      cancelText: '취소',
      confirmText: '확인',
      onConfirmPress: () => {},
      onCancelPress: () => {},
    };
  }

  hideModal() {
    if (AlertModal.instance) {
      AlertModal.instance.setState({ isVisible: false });
    }
  }

  render() {
    if (!this.state.isVisible) return null;

    return (
      <Modal
        animationType="fade"
        statusBarTranslucent
        transparent
        visible={this.state.isVisible}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text
              style={[
                fontStyles.fontSize20_Semibold,
                {
                  textAlign: 'center',
                },
              ]}>
              {this.state.title}
            </Text>

            <Text
              style={[
                fontStyles.fontSize14_Regular,
                {
                  color: COLORS.labelNeutral,
                  textAlign: 'center',
                },
              ]}>
              {this.state.subTitle}
            </Text>

            <View style={styles.buttonWrapper}>
              <PrimaryButton
                buttonStyle={styles.button}
                text={this.state.cancelText}
                outlineButton
                onPress={() => {
                  this.hideModal();
                  this.state.onCancelPress();
                }}
              />
              <PrimaryButton
                onPress={() => {
                  this.hideModal();
                  this.state.onConfirmPress();
                }}
                text={this.state.confirmText}
                buttonStyle={styles.button}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: `${COLORS.black}80`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    minHeight: 230,
    padding: 24,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 24,
  },
  buttonWrapper: {
    flexDirection: 'row',
    columnGap: 8,
  },
  button: {
    flex: 1,
  },
});

export default AlertModal;
