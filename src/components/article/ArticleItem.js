import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import React, { memo } from 'react';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { handleError } from '../../utils/HandleError';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { COLORS } from '../../styles/colors';
import moment from 'moment';
import fontStyles from '../../styles/fontStyles';

function ArticleItem({ item, containerStyle, onPressHiddenItem }) {
  const { width } = useWindowDimensions();
  const imageWidth = (SCREEN_WIDTH - 40) / 2;
  let imageHeight = 107;
  if (width > 480) {
    imageHeight = (width * 107) / 480;
  }
  const detailPage = async () => {
    try {
      NavigationService.navigate(navName.moreArticleDetail, {
        boardIdx: item.boardIdx,
      });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Pressable
      style={[styles.container, containerStyle]}
      onPress={() => {
        if (!item.deleted && !item.hide) {
          detailPage();
        } else if (onPressHiddenItem) {
          onPressHiddenItem(item);
        }
      }}>
      <View style={{ width: imageWidth, height: imageHeight }}>
        {item.deleted ? (
          <View style={styles.hideArticleBox}>
            <Text style={styles.hideArticleText}>
              삭제된 스포츠파이 인사이트
            </Text>
          </View>
        ) : item.hide ? (
          <View style={styles.hideArticleBox}>
            <Text style={styles.hideArticleText}>
              비공개 스포츠파이 인사이트
            </Text>
          </View>
        ) : (
          item.files &&
          item.files.length > 0 && (
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
          )
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
    // overflow: 'hidden',
  },
  hideArticleBox: {
    flex: 1,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hideArticleText: {
    ...fontStyles.fontSize16_Medium,
    color: COLORS.white,
  },
  image: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    flex: 1,
    padding: 12,
    rowGap: 20,
    justifyContent: 'space-between',
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
