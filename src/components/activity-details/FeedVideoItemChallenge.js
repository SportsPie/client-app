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
import React, { memo, useRef, useState } from 'react';
import { SPSvgs } from '../../assets/svg';
import moment from 'moment';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPIcons from '../../assets/icon';
import SPModal from '../SPModal';
import { handleError } from '../../utils/HandleError';
import { apiRemoveChallengeVideo } from '../../api/RestAPI';
import Utils from '../../utils/Utils';

function FeedVideoItem({ item, hideTitle, onDelete }) {
  const trlRef = useRef({ current: { disabled: false } });
  const [modalShow, setModalShow] = useState(false);
  const [showRemoveCheckModal, setShowRemoveCheckModal] = useState(false);
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

  const remove = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const { data } = await apiRemoveChallengeVideo(item.videoIdx);
      Utils.openModal({
        title: '성공',
        body: '영상을 삭제하였습니다.',
      });
      if (onDelete) onDelete();
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  return (
    <View style={[styles.container, styles.iconContainer]}>
      <Pressable
        onPress={() => {
          NavigationService.navigate(navName.challengeDetail, {
            videoIdx: item.videoIdx,
            videoTitle: item.title,
            videoContents: item.contents,
            thumbPath: item.thumbPath,
            fromMorePage: true,
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
        <Text
          style={[
            fontStyles.fontSize14_Semibold,
            {
              minHeight: 40,
              color: '#121212',
              letterSpacing: 0.2,
            },
          ]}
          numberOfLines={2}>
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
                    type: 'challenge',
                  });
                }}>
                <View style={styles.modalBox}>
                  <Image source={SPIcons.icEdit} />
                  <Text style={styles.modalText}>수정하기</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setModalShow(false);
                  setShowRemoveCheckModal(true);
                }}>
                <View style={styles.modalBox}>
                  <Image source={SPIcons.icDelete} />
                  <Text style={styles.modalText}>삭제하기</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        <SPModal
          title="삭제 확인"
          contents="삭제하시겠습니까?"
          visible={showRemoveCheckModal}
          onConfirm={() => {
            remove();
          }}
          onCancel={() => {
            setShowRemoveCheckModal(false);
          }}
          onClose={() => {
            setShowRemoveCheckModal(false);
          }}
        />
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
