import React from 'react';
import { View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function YoutubeTest() {
  return (
    <View style={{ flex: 1 }}>
      <YoutubePlayer
        webViewStyle={{ height: 220 }}
        height={220}
        play
        videoId="dQw4w9WgXcQ" // YouTube 동영상 ID
      />
    </View>
  );
}
