import React, { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SPSvgs } from '../../assets/svg';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { useSelector } from 'react-redux';
import Utils from '../../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';

function HomeHeader() {
  const { isLogin } = useSelector(selector => selector.auth);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
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

  return (
    <View style={styles.container}>
      <SPSvgs.SportPieLogo />

      <View style={styles.rightContent}>
        {isLogin && (
          <Pressable
            onPress={() => {
              NavigationService.navigate(navName.alarmPage);
            }}
            style={{ padding: 10 }}>
            <SPSvgs.Bell />
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
});
