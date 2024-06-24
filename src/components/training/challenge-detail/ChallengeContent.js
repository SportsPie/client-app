/* eslint-disable react/no-array-index-key */
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ChallengeContentItem from './ChallengeContentItem';
import fontStyles from '../../../styles/fontStyles';
import { COLORS } from '../../../styles/colors';
import ListEmptyView from '../../ListEmptyView';

// 도전 챌린지 리스트 ( = 챌린지 참여자 영상 )
function ChallengeContent({ videoList = [] }) {
  // [ return ]
  return (
    <View style={styles.container}>
      {/* 타이틀 */}
      <View style={styles.header}>
        <Text style={fontStyles.fontSize18_Semibold}>도전 콘텐츠</Text>
      </View>

      {videoList.length > 0 ? (
        videoList.map((item, index) => (
          <ChallengeContentItem
            key={`challenge-video-list-${index}`}
            challenge={item}
          />
        ))
      ) : (
        <ListEmptyView text="등록된 챌린지 영상이 없습니다." />
      )}
    </View>
  );
}

export default memo(ChallengeContent);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
    rowGap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  headerText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.darkBlue,
  },
});
