import React, { memo, useCallback } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import PlayCountNumber from '../PlayCountNumber';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import ListEmptyView from '../ListEmptyView';

// PIE 트레이닝 > 상세 > 마스터 영상 리스트
function MasterVideoTab({ title = '', videoList = [] }) {
  const { width } = useWindowDimensions();
  const imageWidth = (width - 40) / 2;
  let imageHeight;

  if (width <= 480) {
    imageHeight = 285;
  } else {
    const aspectRatio = 285 / 160;
    imageHeight = imageWidth / aspectRatio;
  }

  // [ util ] 컴포넌트 렌더
  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <Pressable
          onPress={() =>
            NavigationService.push(navName.masterVideoDetail, {
              videoIdx: item.videoIdx,
            })
          }>
          <ImageBackground
            source={{ uri: item.thumbPath }}
            style={{
              width: imageWidth,
              height: imageHeight,
              marginLeft: index % 2 === 0 ? 0 : 8,
              marginBottom: 8,
              borderRadius: 12,
              overflow: 'hidden',
              justifyContent: 'flex-end',
              padding: 16,
            }}>
            <PlayCountNumber quantity={Utils.changeNumberComma(item.cntView)} />
          </ImageBackground>
        </Pressable>
      );
    },
    [videoList],
  );

  // [ return ]
  return (
    <View style={styles.container}>
      <Text style={fontStyles.fontSize18_Semibold}>{`${title} ${
        videoList.length === 0 ? '' : videoList.length
      }`}</Text>

      {videoList.length > 0 ? (
        <FlatList
          scrollEnabled={false}
          numColumns={2}
          data={videoList}
          renderItem={renderItem}
        />
      ) : (
        <ListEmptyView text="등록된 영상이 없습니다." />
      )}
    </View>
  );
}

export default memo(MasterVideoTab);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    rowGap: 16,
  },
});
