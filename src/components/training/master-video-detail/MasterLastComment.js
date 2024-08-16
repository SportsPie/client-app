/* eslint-disable react/no-unstable-nested-components */
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
import Utils from '../../../utils/Utils';
import MasterCommentSection from './MasterCommentSection';
import { apiGetMasterVideoCommentList } from '../../../api/RestAPI';
import { handleError } from '../../../utils/HandleError';
import { format } from 'date-fns';
import { RefreshControl } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

// 상수값
const PAGE_SIZE = 20; // 페이지 사이즈

// 트레이닝 마스터 영상 댓글
function MasterLastComment({ videoIdx = '' }) {
  const commentSectionRef = useRef();

  // 댓글 리스트, 페이징
  const [commentList, setCommentList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLast, setIsLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    setRefreshing(true);
    setTimeout(() => {
      setPage(prev => {
        return typeof prev === 'string' ? 1 : '1';
      });
    }, 500);
  };

  const commentModify = (idx, item) => {
    const modifiedComment = commentList.find(v => v.commentIdx === idx);
    if (modifiedComment) {
      const obj = { ...modifiedComment, ...item };
      const index = commentList.findIndex(v => v.commentIdx === obj.commentIdx);
      commentList[index] = obj;
    }
    setCommentList(prev => [...prev]);
  };

  // [ api ] 트레이닝 마스터 영상 댓글 리스트 조회
  const getMasterVideoCommentList = async () => {
    try {
      setLoading(true);

      const { data } = await apiGetMasterVideoCommentList({
        videoIdx,
        page: +page,
        size: PAGE_SIZE,
      });

      if (data) {
        setIsLast(data.data.isLast);
        setTotalCount(data.data.totalCnt);

        if (+page > 1) {
          setCommentList(prev => [...prev, ...data.data.list]);
        } else {
          setCommentList([...data.data.list]);
        }
      }
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // [ useEffect ]
  useFocusEffect(
    useCallback(() => {
      if (videoIdx) {
        setPage(prev => (typeof prev === 'string' ? 1 : '1'));
      }
      return () => {
        setPage(prev => (typeof prev === 'string' ? 1 : '1'));
      };
    }, [videoIdx]),
  );

  useEffect(() => {
    if (page) {
      getMasterVideoCommentList();
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
                <Text style={fontStyles.fontSize13_Semibold}>
                  {commentList[0].memberNickName}
                </Text>
                <Text style={styles.dateText}>
                  {format(commentList[0].regDate, 'yyyy.MM.dd')}
                </Text>
              </View>
              <Text style={styles.commentText}>{commentList[0].comment}</Text>
            </View>
          </View>
        )}
      </Pressable>

      <MasterCommentSection
        ref={commentSectionRef}
        videoIdx={videoIdx}
        commentList={commentList}
        onSubmit={onRefresh}
        onModify={commentModify}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

export default memo(MasterLastComment);

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
    flexShrink: 1,
  },
  userAndDateSection: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
  viewTitle: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  viewCountText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.darkBlue,
    letterSpacing: 0.203,
  },
  dateText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.302,
  },
  commentText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelNeutral,
    lineHeight: 21,
    letterSpacing: -0.12,
  },
});
