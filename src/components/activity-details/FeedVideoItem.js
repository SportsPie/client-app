import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import React, { memo, useState } from 'react';
import { SPSvgs } from '../../assets/svg';
import moment from 'moment';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPIcons from '../../assets/icon';

function FeedVideoItem({ item, hideTitle }) {
  const [modalShow, setModalShow] = useState(false);
  const { width } = useWindowDimensions();
  const closeModal = () => {
    setModalShow(false);
  };

  let imageWidth = 153;
  let imageHeight = 86;

  if (width > 480) {
    imageWidth = (width * 153) / 480;
    const aspectRatio = 16 / 9;
    imageHeight = imageWidth / aspectRatio;
  }

  return (
    <View style={[styles.container, styles.iconContainer]}>
      <Pressable
        onPress={() => {
          NavigationService.navigate(navName.masterVideoDetail, {
            videoIdx: item.videoIdx,
            videoTitle: item.title,
            videoContents: item.contents,
            thumbPath: item.thumbPath,
          });
        }}
        style={{ borderRadius: 12 }}>
        {item?.thumbPath && (
          <Image
            source={{
              uri: item?.thumbPath,
            }}
            style={{
              width: imageWidth,
              height: imageHeight,
              borderRadius: 12,
            }}
          />
        )}
      </Pressable>

      <View style={{ flex: 1, rowGap: 4 }}>
        {!hideTitle && (
          <Text
            style={[
              fontStyles.fontSize12_Medium,
              {
                color: COLORS.labelNeutral,
                letterSpacing: 0.3,
              },
            ]}>
            {item?.trainingName}
          </Text>
        )}

        <Text
          style={[
            fontStyles.fontSize14_Semibold,
            {
              color: '#121212',
              letterSpacing: 0.2,
            },
          ]}
          numberOfLines={hideTitle ? 2 : 1}>
          {item?.title}
        </Text>

        <View style={styles.dateWrapper}>
          <Text
            style={[
              fontStyles.fontSize11_Medium,
              {
                color: COLORS.labelAlternative,
                letterSpacing: 0.3,
              },
            ]}>
            조회수 {item?.cntVideo}
          </Text>
          <SPSvgs.Ellipse width={4} height={4} />
          <Text
            style={[
              fontStyles.fontSize11_Medium,
              {
                color: COLORS.labelAlternative,
                letterSpacing: 0.3,
              },
            ]}>
            {moment(item?.regDate).format('YYYY.MM.DD')}
          </Text>
        </View>

        {item?.showYn === 'Y' ? (
          <View style={[styles.iconWrapper]}>
            <SPSvgs.PeopleGroup width={20} height={20} />
            <View style={styles.reactWrapper}>
              <SPSvgs.HeartOutline width={20} height={20} />
              <Text
                style={[
                  fontStyles.fontSize12_Semibold,
                  {
                    color: COLORS.labelNeutral,
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
            <View style={styles.iconWrapper}>
              <Pressable
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => {
                  setModalShow(true);
                }}>
                <SPSvgs.EllipsesVertical width={20} height={20} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.iconWrapper}>
            <SPSvgs.Block width={20} height={20} />
            <View style={styles.iconWrapper}>
              <Pressable
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => {
                  setModalShow(true);
                }}>
                <SPSvgs.EllipsesVertical width={20} height={20} />
              </Pressable>
            </View>
          </View>
        )}
      </View>
      <View>
        <Modal
          animationType="fade"
          transparent
          visible={modalShow}
          onRequestClose={() => {
            closeModal();
          }}>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => {
              closeModal();
            }}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setModalShow(false);
                  NavigationService.navigate(navName.moreModifyChallenge, {
                    videoIdx: item.videoIdx,
                    videoTitle: item.title,
                    videoContents: item.contents,
                    thumbPath: item.thumbPath,
                    showYn: item.showYn,
                    type: 'master',
                  });
                }}>
                <View style={styles.modalBox}>
                  <Image source={SPIcons.icEdit} />
                  <Text style={styles.modalText}>수정하기</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

export default memo(FeedVideoItem);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    columnGap: 8,
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
  },
  modalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalText: {
    // flex: 1,
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
});
