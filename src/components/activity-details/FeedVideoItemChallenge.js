import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React, { memo } from 'react';
import { SPSvgs } from '../../assets/svg';
import moment from 'moment';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

function FeedVideoItem({ item, hideTitle }) {
  const { width } = useWindowDimensions();
  let imageWidth = 153;
  let imageHeight = 86;

  if (width > 480) {
    imageWidth = (width * 153) / 480;
    const aspectRatio = 16 / 9;
    imageHeight = imageWidth / aspectRatio;
  }

  return (
    <View style={[styles.container, styles.iconContainer]}>
      <Pressable
        onPress={() => {
          NavigationService.navigate(navName.challengeDetail, {
            videoIdx: item.videoIdx,
            videoTitle: item.title,
            videoContents: item.contents,
            thumbPath: item.thumbPath,
          });
        }}
        style={{ borderRadius: 12 }}>
        {item?.thumbPath && (
          <Image
            source={{
              uri: item?.thumbPath,
            }}
            style={{
              width: imageWidth,
              height: imageHeight,
              borderRadius: 12,
            }}
          />
        )}
      </Pressable>

      <View style={{ flex: 1, rowGap: 4 }}>
        {!hideTitle && (
          <Text
            style={[
              fontStyles.fontSize12_Medium,
              {
                color: COLORS.labelNeutral,
                letterSpacing: 0.3,
              },
            ]}>
            {item?.title}
          </Text>
        )}

        <Text
          style={[
            fontStyles.fontSize14_Semibold,
            {
              color: '#121212',
              letterSpacing: 0.2,
            },
          ]}
          numberOfLines={hideTitle ? 2 : 1}>
          {item?.title}
        </Text>

        <View style={styles.dateWrapper}>
          <Text
            style={[
              fontStyles.fontSize11_Medium,
              {
                color: COLORS.labelAlternative,
                letterSpacing: 0.3,
              },
            ]}>
            조회수 {item?.cntVideo}
          </Text>
          <SPSvgs.Ellipse width={4} height={4} />
          <Text
            style={[
              fontStyles.fontSize11_Medium,
              {
                color: COLORS.labelAlternative,
                letterSpacing: 0.3,
              },
            ]}>
            {moment(item?.regDate).format('YYYY.MM.DD')}
          </Text>
        </View>

        {item?.showYn === 'Y' ? (
          <View style={[styles.iconWrapper]}>
            <SPSvgs.PeopleGroup width={20} height={20} />
            <View style={styles.reactWrapper}>
              <SPSvgs.HeartOutline width={20} height={20} />
              <Text
                style={[
                  fontStyles.fontSize12_Semibold,
                  {
                    color: COLORS.labelNeutral,
                  },
                ]}>
                {item?.cntLike}
              </Text>
            </View>
            <View style={styles.reactWrapper}>
              <SPSvgs.BubbleChatOutline width={20} height={20} />
              <Text
                style={[
                  fontStyles.fontSize12_Semibold,
                  {
                    color: COLORS.labelNeutral,
                  },
                ]}>
                {item?.cntComment}
              </Text>
            </View>
            <View style={styles.iconWrapper}>
              <SPSvgs.EllipsesVertical
                width={20}
                height={20}
                onPress={() => {
                  NavigationService.navigate(navName.moreModifyChallenge, {
                    videoIdx: item.videoIdx,
                    videoTitle: item.title,
                    videoContents: item.contents,
                    thumbPath: item.thumbPath,
                  });
                }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.iconWrapper}>
            <SPSvgs.Block width={20} height={20} />
            <View style={styles.iconWrapper}>
              <SPSvgs.EllipsesVertical
                width={20}
                height={20}
                onPress={() => {
                  NavigationService.navigate(navName.moreModifyChallenge, {
                    videoIdx: item.videoIdx,
                    videoTitle: item.title,
                    videoContents: item.contents,
                    thumbPath: item.thumbPath,
                  });
                }}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export default memo(FeedVideoItem);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    columnGap: 8,
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
});
