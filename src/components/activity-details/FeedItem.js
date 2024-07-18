import moment from 'moment';
import React, { memo, useState, useRef } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SPSvgs } from '../../assets/svg';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPIcons from '../../assets/icon';
import Utils from '../../utils/Utils';
import {
  apiModifyChallengeVideoComment,
  apiRemoveChallengeVideoComment,
} from '../../api/RestAPI';
import { SPToast } from '../SPToast';
import { handleError } from '../../utils/HandleError';
import SPHeader from '../SPHeader';

function FeedItem({ item, onDelete }) {
  const [modalShow, setModalShow] = useState(false);
  const [deleteGroupModalShow, setDeleteGroupModalShow] = useState(false);
  const [editGroupModalShow, setEditGroupModalShow] = useState(false);
  const trlRef = useRef({ current: { disabled: false } });
  const [showCommentModify, setShowCommentModify] = useState(false);
  const [editCommentInput, setEditCommentInput] = useState('');

  const closeModal = () => {
    setModalShow(false);
  };
  const closeModifyCommentModal = () => {
    setEditCommentInput('');
    setShowCommentModify(false);
  };

  const modifyChallengeVideoComment = async () => {
    try {
      if (trlRef.current.disabled) return;

      if (!editCommentInput || !editCommentInput.trim()) {
        Utils.openModal({
          title: '확인 요청',
          content: '댓글을 입력해주세요.',
        });
        return;
      }

      trlRef.current.disabled = true;

      const { data } = await apiModifyChallengeVideoComment({
        videoIdx: item.videoIdx,
        commentIdx: item.commentIdx,
        comment: editCommentInput,
      });

      if (data) {
        Keyboard.dismiss();
        closeModifyCommentModal();

        trlRef.current.disabled = false;

        SPToast.show({ text: '댓글을 수정했어요' });

        if (onDelete) {
          onDelete(item.commentIdx, editCommentInput);
        }
      }
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  const removeChallengeVideoComment = async () => {
    try {
      if (trlRef.current.disabled) return;

      // if (!editCommentInput || !editCommentInput.trim()) {
      //   Utils.openModal({
      //     title: '확인 요청',
      //     content: '댓글을 입력해주세요.',
      //   });
      //   return;
      // }

      trlRef.current.disabled = true;

      const { data } = await apiRemoveChallengeVideoComment(item.commentIdx);

      if (data) {
        Utils.openModal({
          title: '성공',
          body: '삭제되었습니다.',
        });
        if (onDelete) {
          onDelete(item.commentIdx);
        }
      }
      trlRef.current.disabled = false;
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          NavigationService.navigate(navName.masterVideoDetail, {
            videoIdx: item.videoIdx,
          });
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
            {item?.videoTitle}에 쓴 댓글
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
          <Text
            style={[
              fontStyles.fontSize12_Semibold,
              {
                color: COLORS.labelAlternative,
                letterSpacing: 0.3,
              },
            ]}>
            {item?.comment}
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
      <View style={styles.communityIcon}>
        {/* <View style={styles.iconWrapper}> */}
        {/*  <SPSvgs.HeartOutline width={20} height={20} /> */}
        {/*  <Text */}
        {/*    style={[ */}
        {/*      fontStyles.fontSize12_Semibold, */}
        {/*      { */}
        {/*        color: COLORS.labelNeutral, */}
        {/*      }, */}
        {/*    ]}> */}
        {/*    {item?.cntLike} */}
        {/*  </Text> */}
        {/* </View> */}
        {/* <View style={styles.iconWrapper}> */}
        {/*  <SPSvgs.BubbleChatOutline width={20} height={20} /> */}
        {/*  <Text */}
        {/*    style={[ */}
        {/*      fontStyles.fontSize12_Semibold, */}
        {/*      { */}
        {/*        color: COLORS.labelNeutral, */}
        {/*      }, */}
        {/*    ]}> */}
        {/*    {item?.cntReview} */}
        {/*  </Text> */}
        {/* </View> */}
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
                    setShowCommentModify(true);
                    setEditCommentInput(item?.comment);
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
                    removeChallengeVideoComment();
                  }}>
                  <View style={styles.modalBox}>
                    <Image source={SPIcons.icDelete} />
                    <Text style={styles.modalText}>삭제하기</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
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
            setModalShow(true); // 모달을 보이도록 상태 변경
          }}>
          <SPSvgs.EllipsesVertical width={20} height={20} />
        </Pressable>
      </View>
      <Modal
        animationType="fade"
        transparent={false}
        visible={showCommentModify}
        onRequestClose={closeModifyCommentModal}>
        <SafeAreaView style={{ flex: 1, paddingBottom: 24 }}>
          <SPHeader
            title="댓글 수정"
            onPressLeftBtn={closeModifyCommentModal}
            rightCancelText
            rightText="완료"
            rightTextStyle={{
              fontSize: 16,
              fontWeight: '600',
              color: '#313779',
              lineHeight: 24,
              letterSpacing: 0.091,
              minHeight: 28,
            }}
            onPressRightText={modifyChallengeVideoComment}
          />
          <View style={{ flex: 1, padding: 16 }}>
            <TextInput
              style={styles.textInput}
              defaultValue={editCommentInput}
              onChangeText={text => {
                if (text?.length > 1000) return;
                setEditCommentInput(text);
              }}
              multiline={true}
              placeholder="댓글을 남겨보세요(최대 1000자)"
              placeholderTextColor="#1A1C1E"
              autoFocus={true}
              autoCorrect={false}
              autoCapitalize="none"
              textAlignVertical="top"
              retrunKeyType="next"
            />
          </View>
          <Text
            style={{
              ...fontStyles.fontSize14_Regular,
              textAlign: 'right',
            }}>
            {Utils.changeNumberComma(editCommentInput.length)}/1,000
          </Text>
        </SafeAreaView>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  textInput: {
    flexGrow: 1,
    flexShrink: 1,
  },
});
