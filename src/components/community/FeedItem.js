import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Avatar from '../Avatar';
import { SPSvgs } from '../../assets/svg';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import Carousel from 'react-native-snap-carousel';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import CustomInnerStyleText from '../CustomInnerStyleText';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import Utils from '../../utils/Utils';
import {
  apiPatchCommunityLike,
  apiPatchCommunityUnLike,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../SPMoreModal';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import Swiper from 'react-native-swiper';

function FeedItem({ item, onDelete, isLogin, onRefresh, fromFavPlayer }) {
  const [isLike, setIsLike] = useState(item.isLike);
  const [cntLike, setCntLike] = useState(item.cntLike);

  const [imageModalShow, setImageModalShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isMyFeed, setIsMyFeed] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openImageModal = index => {
    setSelectedImageIndex(index);
    setImageModalShow(true);
  };

  const closeImageModal = () => {
    setImageModalShow(false);
  };

  const openModal = feed => {
    if (!isLogin) {
      showJoinModal();
      return;
    }
    setIsMyFeed(feed.isMine);
    setSelectedItem(feed);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const deleteFeed = () => {
    onDelete(item.feedIdx);
    closeModal();
  };

  const moveToFeedDetail = () => {
    // if (!isLogin) {
    //   showJoinModal();
    //   return;
    // }
    if (fromFavPlayer) {
      NavigationService.navigate(navName.communityFavPlayerDetails, {
        feedIdx: item.feedIdx,
      });
    } else {
      NavigationService.navigate(navName.communityDetails, {
        feedIdx: item.feedIdx,
      });
    }
  };

  const showJoinModal = () => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
      });
    }
  };

  const changeLike = useCallback(async () => {
    showJoinModal();

    if (isLike) {
      await apiPatchCommunityUnLike(item.feedIdx);
      setCntLike(prev => prev - 1);
    } else {
      await apiPatchCommunityLike(item.feedIdx);
      setCntLike(prev => prev + 1);
    }
    setIsLike(prev => !prev);
  }, [isLike, item.feedIdx]);

  useEffect(() => {
    setIsLike(item.isLike);
    setCntLike(item.cntLike);
  }, [item]);

  const renderUserSection = useMemo(() => {
    return (
      <View style={styles.userInfoContainer}>
        <Avatar disableEditMode imageSize={40} imageURL={item.profilePath} />

        <View style={styles.userNameWrapper}>
          <Text style={styles.userNameText}>{item?.userNickname}</Text>
          <Text style={styles.dateText}>
            {Utils.formatTimeAgo(item?.regDate)}
          </Text>
        </View>
        <Pressable
          hitSlop={12}
          onPress={() => {
            openModal(item);
          }}>
          <SPSvgs.EllipsesVertical width={24} height={24} />
        </Pressable>
      </View>
    );
  }, []);

  const renderImages = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const aspectRatio = 16 / 9; // 이미지의 원본 비율
    const minHeight = 200; // 최소 높이
    const calculatedHeight = screenWidth / aspectRatio; // 디바이스 크기에 비례하는 높이
    const dynamicHeight = Math.max(minHeight, calculatedHeight);

    const renderItem = ({ item: imageItem, index }) => {
      return (
        <Pressable
          onPress={() => {
            setSelectedImageIndex(index);
            openImageModal(index);
            // setSelectedImage(imageItem?.fileUrl);
            // openImageModal();
          }}>
          <Image
            source={{ uri: imageItem?.fileUrl }}
            style={[
              styles.image,
              {
                height: dynamicHeight,
                marginLeft: 8,
              },
            ]}
            resizeMethod="resize"
            resizeMode="cover"
          />
        </Pressable>
      );
    };
    return (
      <Carousel
        sliderWidth={SCREEN_WIDTH}
        itemWidth={SCREEN_WIDTH - 16 - 8}
        data={item?.files}
        renderItem={renderItem}
        activeSlideAlignment="start"
        inactiveSlideScale={1}
        inactiveSlideOpacity={0.7}
        slideStyle={{ paddingHorizontal: 8 }}
        vertical={false}
        enableMomentum={true}
        decelerationRate="fast"
      />
    );
  }, []);

  const renderFeed = useMemo(() => {
    return (
      <View style={styles.feedContainer}>
        <TouchableOpacity
          onPress={() => {
            moveToFeedDetail();
          }}>
          <CustomInnerStyleText
            numberOfLines={10}
            style={styles.feedContentText}>
            {item?.contents}
          </CustomInnerStyleText>
        </TouchableOpacity>

        {item?.files?.length > 0 && renderImages}
        {item.tagsKo?.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tagsKo.map((tag, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <View key={index} style={styles.hashtagWrapper}>
                  <Text style={styles.hashtagText}>#{tag}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }, []);

  const renderReaction = useMemo(() => {
    return (
      <View style={styles.reactionContainer}>
        <TouchableOpacity
          onPress={() => {
            changeLike(item);
          }}>
          <View style={styles.reactItemWrapper}>
            {isLike ? (
              <SPSvgs.HeartFill width={20} height={20} />
            ) : (
              <SPSvgs.HeartOutline width={20} height={20} />
            )}
            <Text style={styles.reactText}>
              {cntLike ? Utils.changeNumberComma(cntLike) : '0'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            moveToFeedDetail();
          }}>
          <View style={styles.reactItemWrapper}>
            <SPSvgs.BubbleChatOutline width={20} height={20} />
            <Text style={styles.reactText}>
              {item?.cntComment
                ? Utils.changeNumberComma(item?.cntComment)
                : '0'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [isLike, cntLike]);

  return (
    <View>
      <Pressable style={styles.container}>
        {renderUserSection}
        {renderFeed}
        {renderReaction}
      </Pressable>
      <Modal
        animationType="fade"
        transparent
        visible={imageModalShow}
        onRequestClose={closeImageModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View>
            <TouchableOpacity
              onPress={closeImageModal}
              style={{
                width: '100%',
                height: 60,
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}>
              <Image
                source={SPIcons.icNavCancleWhite}
                style={[{ height: 28, width: 28 }]}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.searchContainer} />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Swiper
              loop={false}
              index={selectedImageIndex}
              showsPagination={false}>
              {item.files.map((imageItem, index) => (
                <View key={imageItem.fileUrl} style={{ flex: 1 }}>
                  <Image
                    source={{ uri: imageItem.fileUrl }}
                    style={{
                      width: '100%',
                      height: '100%',
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              ))}
            </Swiper>
          </View>
        </SafeAreaView>
      </Modal>
      <SPMoreModal
        visible={modalVisible}
        onClose={closeModal}
        isAdmin={false}
        type={
          fromFavPlayer ? MODAL_MORE_TYPE.HOLDER_FEED : MODAL_MORE_TYPE.FEED
        }
        idx={selectedItem?.feedIdx}
        targetUserIdx={selectedItem.userIdx}
        onConfirm={deleteFeed}
        memberButtons={
          isMyFeed
            ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
            : [MODAL_MORE_BUTTONS.REPORT]
        }
        fromFavPlayer={fromFavPlayer}
      />
    </View>
  );
}

export default memo(FeedItem);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    rowGap: 8,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  userNameWrapper: {
    rowGap: 2,
    marginRight: 'auto',
    flexShrink: 1,
  },
  userNameText: {
    ...fontStyles.fontSize13_Semibold,
    letterSpacing: 0.2,
    lineHeight: 18,
    color: COLORS.labelNormal,
  },
  dateText: {
    ...fontStyles.fontSize11_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.3,
  },
  hashtagWrapper: {
    backgroundColor: '#D6D7E4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  hashtagText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.darkBlue,
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
    paddingHorizontal: 16,
  },
  reactItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  reactText: {
    ...fontStyles.fontSize12_Semibold,
    color: COLORS.labelNeutral,
    letterSpacing: 0.3,
  },
  feedContainer: {
    rowGap: 8,
  },
  feedContentText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNormal,
    letterSpacing: 0.2,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  image: {
    width: '100%',
    borderRadius: 12,
  },
});
