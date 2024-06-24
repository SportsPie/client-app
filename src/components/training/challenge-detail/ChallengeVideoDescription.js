import React, { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import fontStyles from '../../../styles/fontStyles';
import { SPSvgs } from '../../../assets/svg';
import HeartCounter from '../../HeartCounter';
import { COLORS } from '../../../styles/colors';
import Utils from '../../../utils/Utils';
import { format } from 'date-fns';
import Avatar from '../../Avatar';

const MAX_DESC_LENGTH = 100;

function ChallengeVideoDescription({
  videoIdx = '',
  parentVideoIdx = '',
  memberName = '',
  profilePath = '',
  title = '',
  description = '',
  isLike = false,
  like = 0,
  view = 0,
  date = 0,
}) {
  // [ state ] 더보기
  const [collapse, setCollapse] = useState(
    description.length < MAX_DESC_LENGTH,
  );

  // [ return ]
  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        {/* 제목 */}
        <Text style={styles.titleText}>{title}</Text>

        {/* 등록자 프로필 */}
        {parentVideoIdx && (
          <View style={styles.bottomSection}>
            <Avatar disableEditMode imageSize={24} imageURL={profilePath} />
            <View style={styles.userNameSection}>
              <Text style={fontStyles.fontSize13_Semibold}>
                {memberName ?? ''}
              </Text>
            </View>
          </View>
        )}

        {/* 조회수, 등록일 */}
        <View style={styles.videoDate}>
          <Text style={styles.dateText}>
            조회수 {Utils.changeNumberComma(view)}
          </Text>
          <SPSvgs.Ellipse width={4} height={4} />
          <Text style={styles.dateText}>
            {date && format(date, 'yyyy.MM.dd')}
          </Text>
        </View>
      </View>

      {/* 좋아요 */}
      <HeartCounter heartNum={like} videoIdx={videoIdx} isLike={isLike} />

      {/* 내용 */}
      <View style={styles.videoScripWrapper}>
        <Text style={styles.videoScripText}>
          {!collapse && description.length > MAX_DESC_LENGTH
            ? description.substring(0, MAX_DESC_LENGTH) + '...'
            : description}
        </Text>

        {!collapse && (
          <Pressable onPress={() => setCollapse(!collapse)}>
            <Text style={styles.viewMoreText}>더 보기</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default memo(ChallengeVideoDescription);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    rowGap: 16,
  },
  titleWrapper: {
    rowGap: 8,
  },
  videoDate: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
  dateText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.302,
  },
  videoScripWrapper: {
    rowGap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.lineBorder,
  },
  videoScripText: {
    ...fontStyles.fontSize14_Medium,
    lineHeight: 22,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  viewMoreText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelAlternative,
  },
  bottomSection: {
    flexDirection: 'row',
    columnGap: 8,
  },
  userNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    ...fontStyles.fontSize18_Semibold,
    letterSpacing: -0.004,
    color: COLORS.black,
  },
});
