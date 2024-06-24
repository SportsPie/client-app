import React, { memo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { SPSvgs } from '../assets/svg';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';
import { apiLikeChallenge, apiUnlikeChallenge } from '../api/RestAPI';
import { handleError } from '../utils/HandleError';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Utils from '../utils/Utils';
import { SPToast } from './SPToast';

function HeartCounter({ heartNum = 0, videoIdx = '', isLike = false }) {
  const isLogin = useSelector(selector => selector.auth)?.isLogin;

  // [ state ] 다중 클릭 방지
  const trlRef = useRef({ current: { disabled: false } });

  // [ state ] 좋아요
  const [cntLike, setCntLike] = useState(heartNum);
  const [isLiked, setIsLiked] = useState(isLike);

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
      }
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  // [ return ]
  return (
    <Pressable style={styles.wrapper} onPress={touchLikeHandler}>
      <View style={styles.container}>
        {isLiked ? <SPSvgs.Heart /> : <SPSvgs.HeartOutline />}
        <Text style={styles.text}>{Utils.changeNumberComma(cntLike)}</Text>
      </View>
    </Pressable>
  );
}

export default memo(HeartCounter);

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
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
