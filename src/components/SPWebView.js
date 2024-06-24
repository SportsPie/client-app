import React from 'react';
import WebView from 'react-native-webview';
import { StyleSheet, View } from 'react-native';

function SPWebView({ route }) {
  const { uri } = route.params;
  return (
    <View style={styles.webviewContainer}>
      <WebView source={{ uri }} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default SPWebView;
