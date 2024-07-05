/* eslint-disable react/no-unstable-nested-components */
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import Avatar from '../../Avatar';
import ChallengeCommentSection from './ChallengeCommentSection';
import Utils from '../../../utils/Utils';
import { apiGetChallengeVideoCommentList } from '../../../api/RestAPI';
import { handleError } from '../../../utils/HandleError';
import { format } from 'date-fns';
import { RefreshControl } from 'react-native-gesture-handler';

// 상수값
const PAGE_SIZE = 20; // 페이지 사이즈

// 트레이닝 챌린지 영상 댓글
function ChallengeLastComment({ videoIdx = '' }) {
  const commentSectionRef = useRef();
  const textRef = useRef(null);

  // [ state ] 댓글 리스트, 페이징
  const [commentList, setCommentList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLast, setIsLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCollapseText, setIsCollapseText] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);

  const handleLayout = event => {
    const { height } = event.nativeEvent.layout;
    const lineHeight = 20;
    const maxHeight = 1 * lineHeight;

    if (Math.floor(height) > maxHeight && !showExpandButton) {
      setShowExpandButton(true);
      setIsCollapseText(true);
    }
  };

  // [ util ] 코멘트 페이징
  const getNextPage = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prev => +prev + 1);
      }
    }, 0);
  };

  // [ util ] 코멘트 새로고침
  const onRefresh = () => {
    // setIsLast(false);
    setTimeout(() => {
      setPage(prev => {
        return typeof prev === 'string' ? 1 : '1';
      });
    }, 500);
  };

  // [ api ] 트레이닝 챌린지 영상 댓글 리스트 조회
  const getChallengeVideoCommentList = async () => {
    try {
      setLoading(true);

      const { data } = await apiGetChallengeVideoCommentList({
        videoIdx,
        page: +page,
        size: PAGE_SIZE,
      });

      if (data) {
        setIsLast(data.data.isLast);
        setTotalCount(data.data.totalCnt);

        if (+page > 1) {
          setCommentList([...commentList, ...data.data.list]);
        } else {
          setCommentList([...data.data.list]);
        }
      }

      setLoading(false);
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  // [ useEffect ]
  useEffect(() => {
    if (videoIdx) {
      setPage(prev => (typeof prev === 'string' ? 1 : '1'));
    }
  }, [videoIdx]);

  useEffect(() => {
    if (page) {
      getChallengeVideoCommentList();
    }
  }, [page]);

  // [ return ]
  return (
    <View>
      <Pressable
        onPress={() => commentSectionRef?.current?.show()}
        style={styles.container}>
        <View style={styles.topViewSection}>
          <Text style={styles.viewTitle}>댓글</Text>
          <Text style={styles.viewCountText}>
            {Utils.changeNumberComma(totalCount)}
          </Text>
        </View>

        {commentList.length > 0 && (
          <View style={styles.bottomSection}>
            <Avatar
              disableEditMode
              imageSize={24}
              imageURL={commentList[0].profilePath}
            />
            <View style={styles.commentSection}>
              <View style={styles.userAndDateSection}>
                {commentList[0].memberNickName && (
                  <Text style={styles.memberNameText}>
                    {commentList[0].memberNickName}
                  </Text>
                )}

                <Text style={styles.dateText}>
                  {format(commentList[0].regDate, 'yyyy.MM.dd')}
                </Text>
              </View>

              <Text
                ref={textRef}
                onLayout={handleLayout}
                numberOfLines={isCollapseText ? 1 : undefined}
                style={styles.commentText}>
                {commentList[0].comment}
              </Text>
              {showExpandButton && isCollapseText && (
                <Text
                  onPress={() => {
                    setIsCollapseText(false);
                  }}
                  style={styles.commentText}>
                  더보기
                </Text>
              )}
            </View>
          </View>
        )}
      </Pressable>

      <ChallengeCommentSection
        ref={commentSectionRef}
        videoIdx={videoIdx}
        commentList={commentList}
        onSubmit={onRefresh}
        onEndReached={getNextPage}
        ListFooterComponent={
          loading
            ? () => {
                return (
                  <ActivityIndicator
                    size="small"
                    style={{ marginVertical: 20 }}
                  />
                );
              }
            : null
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

export default memo(ChallengeLastComment);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.fillNormal,
    marginHorizontal: 16,
    borderRadius: 16,
    rowGap: 8,
  },
  topViewSection: {
    flexDirection: 'row',
    columnGap: 4,
  },
  bottomSection: {
    flexDirection: 'row',
    columnGap: 8,
  },
  commentSection: {
    rowGap: 4,
    flex: 1,
  },
  userAndDateSection: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
  viewTitle: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
  },
  viewCountText: {
    ...fontStyles.fontSize13_Semibold,
    color: COLORS.darkBlue,
  },
  dateText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.302,
  },
  commentText: {
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  memberNameText: {
    ...fontStyles.fontSize13_Semibold,
    color: COLORS.labelNormal,
    lineHeight: 18,
    letterSpacing: 0.252,
  },
});
