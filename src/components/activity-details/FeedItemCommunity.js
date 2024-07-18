import moment from 'moment';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SPSvgs } from '../../assets/svg';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPIcons from '../../assets/icon';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../SPMoreModal';
import { IS_YN } from '../../common/constants/isYN';
import { apiGetMyInfo } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';

function FeedItem({ item, onDelete }) {
  const [modalShow, setModalShow] = useState(false);
  const [deleteGroupModalShow, setDeleteGroupModalShow] = useState(false);
  const [editGroupModalShow, setEditGroupModalShow] = useState(false);
  const [isMyFeed, setIsMyFeed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [changeEvent, setChangeEvent] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [isAdminFeed, setIsAdminFeed] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const openModal = modalItem => {
    setIsMyFeed(true);
    setIsAdminFeed(item.isAcademyCreator || item.isAcademyAdmin);
    setSelectedItem(modalItem);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const getUserInfo = async () => {
    try {
      const { data } = await apiGetMyInfo();
      setUserInfo(data);
    } catch (error) {
      handleError(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserInfo();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          if (item.academyIdx != null) {
            // `null`과 `undefined`를 동시에 체크
            NavigationService.navigate(navName.academyCommunityDetail, {
              academyIdx: item.academyIdx,
              userIdx: item.userIdx,
              feedIdx: item.feedIdx,
            });
          } else {
            NavigationService.navigate(navName.communityDetails, {
              userIdx: item.userIdx,
              feedIdx: item.feedIdx,
            });
          }
        }}
        style={{ borderRadius: 12 }}>
        <View style={styles.communityFrame}>
          <Text
            style={[
              fontStyles.fontSize12_Semibold,
              {
                color: COLORS.labelAlternative,
                letterSpacing: 0.3,
              },
            ]}>
            {item?.userIdx !== userInfo?.data.userIdx
              ? '내가 댓글 단 글'
              : item?.academyName
              ? `${item.academyName} 커뮤니티에 쓴 글`
              : '커뮤니티에 쓴 글'}
          </Text>
          <Text
            style={[
              fontStyles.fontSize11_Regular,
              {
                color: COLORS.labelAlternative,
                letterSpacing: 0.3,
              },
            ]}>
            {moment(item?.regDate).format('YYYY.MM.DD')}
          </Text>
        </View>

        <Text
          numberOfLines={3}
          style={[
            fontStyles.fontSize14_Medium,
            {
              lineHeight: 22,
              color: COLORS.labelNormal,
              letterSpacing: 0.2,
            },
          ]}>
          {item?.contents}
        </Text>
      </Pressable>
      <View style={[styles.itemWrapper]}>
        <View style={[styles.reactWrapper]}>
          <SPSvgs.HeartOutline width={20} height={20} />
          <Text
            style={[
              fontStyles.fontSize12_Semibold,
              {
                color: COLORS.labelNeutral,
                marginRight: 20,
              },
            ]}>
            {item?.cntLike}
          </Text>
        </View>
        <View style={styles.reactWrapper}>
          <SPSvgs.BubbleChatOutline width={20} height={20} />
          <Text
            style={[
              fontStyles.fontSize12_Semibold,
              {
                color: COLORS.labelNeutral,
              },
            ]}>
            {item?.cntComment}
          </Text>
        </View>
        <View style={styles.communityIcon}>
          <SPMoreModal
            visible={modalVisible}
            onClose={closeModal}
            type={MODAL_MORE_TYPE.FEED}
            idx={selectedItem?.feedIdx}
            targetUserIdx={selectedItem?.userIdx}
            onConfirm={() => {
              setChangeEvent(prev => !prev);
              onDelete(); // 상태 업데이트
            }}
            memberButtons={
              isMyFeed
                ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
                : [MODAL_MORE_BUTTONS.REPORT]
            }
          />
        </View>
        <Pressable
          hitSlop={8}
          style={[
            styles.iconWrapper,
            {
              marginLeft: 'auto',
            },
          ]}
          onPress={() => {
            openModal(item);
          }}>
          <SPSvgs.EllipsesVertical width={20} height={20} />
        </Pressable>
      </View>
    </View>
  );
}

export default memo(FeedItem);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineBorder,
  },
  communityFrame: {
    rowGap: 4,
  },
  communityIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  iconWrapper: {
    flexDirection: 'row',
    columnGap: 4,
    alignItems: 'center',
  },
  reactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
