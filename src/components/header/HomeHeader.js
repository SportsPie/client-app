import React, { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SPSvgs } from '../../assets/svg';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { useSelector } from 'react-redux';
import Utils from '../../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { useFocusEffect } from '@react-navigation/native';
import NotificationUtils from '../../utils/notification/NotificationUtils';
import { handleError } from '../../utils/HandleError';
import fontStyles from '../../styles/fontStyles';

function HomeHeader() {
  const { isLogin } = useSelector(selector => selector.auth);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [notReadCnt, setNotReadCnt] = useState(0);
  const showJoinModal = () => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
        data: { from: navName.moreMyInfo },
      });
    } else {
      setJoinModalVisible(true);
    }
  };

  const menuFunction = () => {
    if (!isLogin) {
      showJoinModal();
    } else {
      NavigationService.navigate(navName.moreMyInfo);
    }
  };

  const getNotReadCnt = async () => {
    try {
      const result = await NotificationUtils.getNotReadCnt();
      setNotReadCnt(result);
    } catch (error) {
      handleError(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isLogin) getNotReadCnt();
    }, []),
  );

  const notReacCntRender = () => {
    if (Number(notReadCnt) === 0) {
      return null;
    }
    if (notReadCnt > 99) {
      return '99+';
    }
    return notReadCnt;
  };

  return (
    <View style={styles.container}>
      <SPSvgs.SportsPieLogo />

      <View style={styles.rightContent}>
        {isLogin && (
          <Pressable
            onPress={() => {
              NavigationService.navigate(navName.alarmPage);
            }}
            style={{ padding: 10 }}>
            <SPSvgs.Bell />
            {notReacCntRender() > 0 && (
              <View style={styles.notReadWrap}>
                <View style={styles.notReadTextBox}>
                  <Text style={styles.notReadText}>{notReacCntRender()}</Text>
                </View>
              </View>
            )}
          </Pressable>
        )}

        <Pressable onPress={menuFunction} style={{ padding: 10 }}>
          <SPSvgs.Menu />
        </Pressable>
      </View>
    </View>
  );
}

export default memo(HomeHeader);

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  rightContent: {
    flexDirection: 'row',
    // columnGap: 16,
    marginLeft: 'auto',
  },
  notReadWrap: {
    position: 'absolute',
    top: 6,
    left: 25,
    backgroundColor: 'rgba(195, 0, 2, 1)',
    borderRadius: 100,
    paddingHorizontal: 2,
  },
  notReadTextBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 13,
  },
  notReadText: {
    ...fontStyles.fontSize10_Regular,
    lineHeight: 13,
    color: '#FFF',
  },
});
