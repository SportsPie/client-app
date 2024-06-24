import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React, { memo } from 'react';
import { apiGetArticleDetail } from '../../api/RestAPI';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { handleError } from '../../utils/HandleError';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { COLORS } from '../../styles/colors';
import moment from 'moment';
import fontStyles from '../../styles/fontStyles';

function ArticleItem({ item, containerStyle }) {
  const { width } = useWindowDimensions();
  const imageWidth = (SCREEN_WIDTH - 40) / 2;
  let imageHeight = 107;
  if (width > 480) {
    imageHeight = (width * 107) / 480;
  }
  const detailPage = async () => {
    try {
      const response = await apiGetArticleDetail(item.boardIdx);
      const articleDetail = response.data;
      NavigationService.navigate(navName.moreArticleDetail, {
        articleDetail,
      });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Pressable style={[styles.container, containerStyle]} onPress={detailPage}>
      <View style={{ width: imageWidth, height: imageHeight }}>
        {item.files && item.files.length > 0 && (
          <Image
            source={{ uri: item.files[0].fileUrl }}
            style={[
              styles.image,
              {
                width: imageWidth,
                height: imageHeight,
              },
            ]}
            resizeMode="cover"
          />
        )}
      </View>
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.timeText}>
          {moment(item?.regDate).format('YYYY.MM.DD')}
        </Text>
      </View>
    </Pressable>
  );
}

export default memo(ArticleItem);

const styles = StyleSheet.create({
  container: {
    width: (SCREEN_WIDTH - 41) / 2,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  image: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 12,
    rowGap: 20,
  },
  title: {
    ...fontStyles.fontSize14_Semibold,
    letterSpacing: 0.2,
    color: '#121212',
  },
  timeText: {
    ...fontStyles.fontSize12_Regular,
    letterSpacing: 0.3,
    color: 'rgba(0, 0, 0, 0.60)',
  },
});
