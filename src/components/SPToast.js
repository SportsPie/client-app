import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Toast, { BaseToast } from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import shadowStyles from '../styles/shadowStyles';
import SPIcons from '../assets/icon';

const toastConfig = {
  hidden: internalState => {
    const { text } = internalState.props;
    return <View style={{ display: 'none' }} />;
  },
  default: internalState => {
    const { text } = internalState.props;
    return (
      <View style={styles.defaultToastContainer}>
        <View style={styles.defaultToastBodyView}>
          <Image
            source={SPIcons.icToastCheck}
            style={{ width: 24, height: 24 }}
          />
          <Text style={styles.defaultToastText}>{text}</Text>
        </View>
      </View>
    );
  },
  customToast: internalState => {
    const { renderToast } = internalState.props;
    return <View style={styles.defaultToastContainer}>{renderToast()}</View>;
  },
};

export const SPToast = {
  show(options) {
    Toast.show({
      type: 'default',
      visibilityTime: 2000,
      position: 'bottom',
      bottomOffset: 20,
      ...options,
      props: { ...options },
    });
  },
  hide() {
    Toast.hide();
  },
};

export function CBToastProvider({ children }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {children}
      <Toast config={toastConfig} type="hidden" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  defaultToastContainer: {
    // width: '100%',

    paddingHorizontal: 16,
  },
  defaultToastBodyView: {
    // height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 50,
    backgroundColor: '#1D2149',
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...shadowStyles.shadowToast,
  },
  defaultToastText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#E1E3E6',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
});
