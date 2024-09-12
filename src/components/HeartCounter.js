import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SPSvgs } from '../assets/svg';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';
import { apiLikeChallenge, apiUnlikeChallenge } from '../api/RestAPI';
import { handleError } from '../utils/HandleError';
import Utils from '../utils/Utils';
import { SPToast } from './SPToast';
import { store } from '../redux/store';
import { moreClassMaterVideoListAction } from '../redux/reducers/list/moreClassMasterVideoListSlice';
import { moreChallengeVideoListAction } from '../redux/reducers/list/moreChallengeVideoListSlice';
import { challengeListAction } from '../redux/reducers/list/challengeListSlice';
import { useFocusEffect } from '@react-navigation/native';
import { challengeDetailAction } from '../redux/reducers/list/challengeDetailSlice';

function HeartCounter({
  heartNum = 0,
  videoIdx = '',
  isLike = false,
  wrapper = false,
}) {
  const dispatch = useDispatch();
  const isLogin = useSelector(selector => selector.auth)?.isLogin;

  // [ state ] 다중 클릭 방지
  const trlRef = useRef({ current: { disabled: false } });

  // [ state ] 좋아요
  const [cntLike, setCntLike] = useState(heartNum);
  const [isLiked, setIsLiked] = useState(isLike);

  useFocusEffect(
    useCallback(() => {
      setIsLiked(isLike);
    }, [isLike]),
  );

  useFocusEffect(
    useCallback(() => {
      setCntLike(heartNum);
    }, [heartNum]),
  );

  // [ util ] 좋아요 등록/취소
  const touchLikeHandler = e => {
    if (!isLogin) {
      SPToast.show({ text: '로그인이 필요합니다.' });
      return;
    }

    if (!trlRef.current.disabled) {
      trlRef.current.disabled = true;

      if (!isLiked) {
        likeChallenge();
      } else {
        unLikeChallenge();
      }
    }
  };

  // [ api ] 좋아요 등록
  const likeChallenge = async () => {
    try {
      const { data } = await apiLikeChallenge(videoIdx);

      if (data) {
        setCntLike(prev => prev + 1);
        setIsLiked(true);
        trlRef.current.disabled = false;

        const findChallengeVideo = store
          .getState()
          .challengeList.list.find(
            item => Number(item.videoIdx) === Number(videoIdx),
          );
        if (findChallengeVideo) {
          findChallengeVideo.cntLike += 1;
          dispatch(
            challengeListAction.modifyItem({
              idxName: 'videoIdx',
              idx: videoIdx,
              item: findChallengeVideo,
            }),
          );
        }
        dispatch(
          challengeDetailAction.plusLikeCnt({
            idxName: 'videoIdx',
            idx: videoIdx,
          }),
        );

        const moreFindMasterVideo = store
          .getState()
          .moreClassMasterVideoList.list.find(
            item => Number(item.videoIdx) === Number(videoIdx),
          );
        if (moreFindMasterVideo) {
          moreFindMasterVideo.cntLike += 1;
          dispatch(
            moreClassMaterVideoListAction.modifyItem({
              idxName: 'videoIdx',
              idx: videoIdx,
              item: moreFindMasterVideo,
            }),
          );
        }

        const moreFindChallengeVideo = store
          .getState()
          .moreChallengeVideoList.list.find(
            item => Number(item.videoIdx) === Number(videoIdx),
          );
        if (moreFindChallengeVideo) {
          moreFindChallengeVideo.cntLike += 1;
          dispatch(
            moreChallengeVideoListAction.modifyItem({
              idxName: 'videoIdx',
              idx: videoIdx,
              item: moreFindChallengeVideo,
            }),
          );
        }
      }
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  // [ api ] 좋아요 취소
  const unLikeChallenge = async () => {
    try {
      const { data } = await apiUnlikeChallenge(videoIdx);

      if (data) {
        setCntLike(prev => prev - 1);
        setIsLiked(false);
        trlRef.current.disabled = false;

        const findChallengeVideo = store
          .getState()
          .challengeList.list.find(
            item => Number(item.videoIdx) === Number(videoIdx),
          );
        if (findChallengeVideo) {
          findChallengeVideo.cntLike -= 1;
          dispatch(
            challengeListAction.modifyItem({
              idxName: 'videoIdx',
              idx: videoIdx,
              item: findChallengeVideo,
            }),
          );
        }

        dispatch(
          challengeDetailAction.minusLikeCnt({
            idxName: 'videoIdx',
            idx: videoIdx,
          }),
        );

        const moreFindMasterVideo = store
          .getState()
          .moreClassMasterVideoList.list.find(
            item => Number(item.videoIdx) === Number(videoIdx),
          );
        if (moreFindMasterVideo) {
          moreFindMasterVideo.cntLike -= 1;
          dispatch(
            moreClassMaterVideoListAction.modifyItem({
              idxName: 'videoIdx',
              idx: videoIdx,
              item: moreFindMasterVideo,
            }),
          );
        }

        const moreFindChallengeVideo = store
          .getState()
          .moreChallengeVideoList.list.find(
            item => Number(item.videoIdx) === Number(videoIdx),
          );
        if (moreFindChallengeVideo) {
          moreFindChallengeVideo.cntLike -= 1;
          dispatch(
            moreChallengeVideoListAction.modifyItem({
              idxName: 'videoIdx',
              idx: videoIdx,
              item: moreFindChallengeVideo,
            }),
          );
        }
      }
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  // [ return ]
  return (
    <Pressable
      hitSlop={{
        top: 10,
        bottom: 10,
      }}
      style={wrapper ? null : styles.wrapper}
      onPress={touchLikeHandler}>
      <View style={styles.container}>
        {isLiked ? <SPSvgs.Heart /> : <SPSvgs.HeartOutline />}
        <Text style={styles.text}>{Utils.changeNumberComma(cntLike)}</Text>
      </View>
    </Pressable>
  );
}

export default memo(HeartCounter);

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignSelf: 'flex-start' },
  container: {
    width: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderColor: COLORS.lineBorder,
  },
  text: {
    ...fontStyles.fontSize12_Semibold,
    color: COLORS.labelNeutral,
  },
});
