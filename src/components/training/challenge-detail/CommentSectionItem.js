import React, { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../Avatar';
import fontStyles from '../../../styles/fontStyles';
import { SPSvgs } from '../../../assets/svg';
import { COLORS } from '../../../styles/colors';
import { format } from 'date-fns';

function CommentSectionItem({ item, onPressMore = () => null }) {
  return (
    <View style={styles.container}>
      {/* 작성자 프로필 */}
      <Avatar disableEditMode imageSize={24} imageURL={item.profilePath} />

      <View style={styles.content}>
        <View style={styles.userWrapper}>
          {/* 작성자 */}
          {item?.memberNickName && (
            <Text style={styles.memberNameText}>{item?.memberNickName}</Text>
          )}

          {/* 작성일 */}
          <Text style={styles.dateText}>
            {format(item.regDate, 'yyyy.MM.dd')}
          </Text>

          {/* 더보기 */}
          <Pressable
            style={{
              marginLeft: 'auto',
            }}
            onPress={() => {
              onPressMore({
                idx: item.commentIdx,
                isMine: item.isMine,
                comment: item.comment,
                memberIdx: item.memberIdx,
              });
            }}>
            <SPSvgs.EllipsesVertical />
          </Pressable>
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    </View>
  );
}

export default memo(CommentSectionItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    columnGap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  content: {
    rowGap: 7,
    flexShrink: 1,
  },
  userWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    flexGrow: 1,
  },
  dateText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.302,
  },
  memberNameText: {
    ...fontStyles.fontSize13_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.252,
    lineHeight: 18,
  },
  commentText: {
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNormal,
    letterSpacing: 0.203,
  },
});
