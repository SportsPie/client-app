import React, { memo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Header from '../components/header';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import ImageSizeGetter from '../components/ImageSizeGetter';
import { WebView } from 'react-native-webview';
import Utils from '../utils/Utils';
import SPLoading from '../components/SPLoading';

function OnlyImage({ route }) {
  const source = route?.params?.source;
  const [loading, setLoading] = useState(false);
  const [imageHeight, setImageHeight] = useState(0);

  const handleLayout = ({ width, height }) => {
    setImageHeight(height);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ImageSizeGetter source={source} getter={handleLayout} />
      {source && (
        <View style={{ flex: 1 }}>
          {loading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
              }}>
              <SPLoading />
            </View>
          )}
          <ScrollView>
            <View style={{ flex: 1 }}>
              <WebView
                style={{ flex: 1, height: imageHeight }}
                source={{
                  html: Utils.getImageHtml(source),
                }}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
              />
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

export default memo(OnlyImage);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  eventImage: {
    width: SCREEN_WIDTH, // 이미지가 화면의 전체 너비에 맞게 설정됨
  },
});
