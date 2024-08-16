import React, { memo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { format } from 'date-fns';
import fontStyles from '../../../styles/fontStyles';
import { SPSvgs } from '../../../assets/svg';
import { COLORS } from '../../../styles/colors';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import Utils from '../../../utils/Utils';

function ChallengeContentItem({ challenge, pageKey }) {
  const { width, height } = useWindowDimensions();
  let imageWidth = 153;
  let imageHeight = 86;

  if (width > 480) {
    imageWidth = (width * 153) / 480;
    imageHeight = (imageWidth * 86) / 153;
  }

  // [ return ]
  return (
    <Pressable
      onPress={() =>
        NavigationService.push(navName.challengeDetail, {
          videoIdx: challenge.videoIdx,
          pageKey: pageKey ? `${Number(pageKey) + 1}` : '1',
        })
      }
      style={styles.container}>
      <Image
        style={{
          width: imageWidth,
          height: imageHeight,
          borderRadius: 12,
        }}
        source={{ uri: challenge.thumbPath }}
      />

      <View style={styles.content}>
        <Text style={styles.titleText}>{challenge.title}</Text>

        <View style={styles.dateTextWrapper}>
          <Text style={styles.dateText}>{`조회수 ${Utils.changeNumberComma(
            challenge.cntView,
          )}`}</Text>
          <SPSvgs.Ellipse />
          <Text style={styles.dateText}>
            {format(challenge.regDate, 'yyyy.MM.dd')}
          </Text>
        </View>

        <View style={styles.reactWrapper}>
          <View style={styles.react}>
            {challenge.isLike ? (
              <SPSvgs.Heart width={20} height={20} />
            ) : (
              <SPSvgs.HeartOutline width={20} height={20} />
            )}
            <Text style={styles.reactText}>
              {Utils.changeNumberComma(challenge.cntLike)}
            </Text>
          </View>

          <View style={styles.react}>
            <SPSvgs.BubbleChatOutline width={20} height={20} />
            <Text style={styles.reactText}>{challenge.cntComment}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ChallengeContentItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
  content: {
    rowGap: 8,
    flex: 1,
  },
  dateTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  reactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  react: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  dateText: {
    ...fontStyles.fontSize11_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.342,
  },
  reactText: {
    ...fontStyles.fontSize12_Semibold,
    color: COLORS.labelNeutral,
    letterSpacing: 0.302,
  },
  titleText: {
    ...fontStyles.fontSize14_Semibold,
    flex: 1,
    color: '#121212',
    letterSpacing: 0.203,
  },
});
