import React, { memo, useCallback, useState, useRef } from 'react';
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SPHeader from '../../components/SPHeader';
import SPIcons from '../../assets/icon';
import SPModal from '../../components/SPModal';
import {
  apiDeleteAcademyConfigMngGroups,
  apiGetAcademyConfigMngGroups,
  apiPostAcademyConfigMngGroups,
  apiPutAcademyConfigMngGroups,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACTIVE_OPACITY } from '../../common/constants/constants';

function AcademyGroup({ route }) {
  /**
   * state
   */
  const [addGroupModalShow, setAddGroupModalShow] = useState(false);
  const [deleteGroupModalShow, setDeleteGroupModalShow] = useState(false);
  const [editGroupModalShow, setEditGroupModalShow] = useState(false);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const trlRef = useRef({ current: { disabled: false } });
  const [refresh, setRefresh] = useState(false);

  // modal
  const [modalShow, setModalShow] = useState(false);

  /**
   * api
   */
  const getGroupList = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngGroups();
      setGroupList(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const addGroup = async groupNm => {
    setAddGroupModalShow(false);
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const params = {
        groupName: groupNm,
      };
      const { data } = await apiPostAcademyConfigMngGroups(params);
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const editGroup = async groupNm => {
    setEditGroupModalShow(false);
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const params = {
        groupIdx: selectedGroupIdx,
        groupName: groupNm,
      };
      const { data } = await apiPutAcademyConfigMngGroups(params);
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const deleteGroup = async groupNm => {
    setDeleteGroupModalShow(false);
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const { data } = await apiDeleteAcademyConfigMngGroups(selectedGroupIdx);
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const openModal = idx => {
    setSelectedGroupIdx(idx);
    setModalShow(true);
  };
  const closeModal = () => {
    setModalShow(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getGroupList();
    }, [refresh]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <SPHeader
        title="그룹 관리"
        noLeftLogo
        rightBasicAddButton={SPIcons.icAddBlack}
        onPressAddRightIcon={() => setAddGroupModalShow(true)}
      />

      <View style={{ flex: 1 }}>
        {groupList && groupList.length > 0 ? (
          groupList.map((item, index) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <View key={index} style={styles.contentsBox}>
                <Text style={styles.contentsTitle}>{item.groupName}</Text>
                <Pressable
                  hitSlop={{
                    top: 14,
                    bottom: 14,
                    left: 14,
                    right: 14,
                  }}
                  activeOpacity={ACTIVE_OPACITY}
                  onPress={() => {
                    openModal(item.groupIdx);
                  }}>
                  <Image
                    source={SPIcons.icOptionsVertical}
                    style={{ width: 20, height: 20 }}
                  />
                </Pressable>
              </View>
            );
          })
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>등록된 그룹이 존재하지 않습니다.</Text>
          </View>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={modalShow}
        onRequestClose={() => {
          closeModal();
        }}>
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          style={styles.overlay}
          onPress={() => {
            closeModal();
          }}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              style={styles.button}
              onPress={() => {
                setModalShow(false);
                setEditGroupModalShow(true);
              }}>
              <View style={styles.modalBox}>
                <Image source={SPIcons.icEdit} />
                <Text style={styles.modalText}>수정하기</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              style={styles.button}
              onPress={() => {
                setModalShow(false);
                setDeleteGroupModalShow(true);
              }}>
              <View style={styles.modalBox}>
                <Image source={SPIcons.icDelete} />
                <Text style={styles.modalText}>삭제하기</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 그룹 추가 모달 */}
      <SPModal
        title="그룹 추가"
        contents=""
        textInputVisible
        visible={addGroupModalShow}
        onConfirm={value => {
          addGroup(value);
        }}
        onCancel={() => {
          setAddGroupModalShow(false);
        }}
        onClose={() => {
          setAddGroupModalShow(false);
        }}
        cancelButtonText="취소"
        confirmButtonText="추가"
        bodyWrapStyle={{
          width: '100%',
          alignItems: 'flex-start',
          gap: 24,
          paddingHorizontal: 16,
        }}
        titleStyle={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1A1C1E',
          lineHeight: 26,
          letterSpacing: -0.004,
        }}
        textInputStyle={{
          borderWidth: 1,
          borderColor: 'rgba(135, 141, 150, 0.22)',
          borderRadius: 10,
          paddingVertical: 14,
          paddingLeft: 16,
          paddingRight: 10,
          alignSelf: 'stretch',
        }}
        buttonWrapStyle={{
          paddingHorizontal: 16,
        }}
        placeholder="그룹명을 입력해주세요."
        maxLength={45}
      />

      {/* 그룹 수정 모달 */}
      <SPModal
        title="그룹 수정"
        contents=""
        textInputVisible
        visible={editGroupModalShow}
        onConfirm={value => {
          editGroup(value);
        }}
        onCancel={() => {
          setEditGroupModalShow(false);
        }}
        onClose={() => {
          setEditGroupModalShow(false);
        }}
        cancelButtonText="취소"
        confirmButtonText="수정"
        bodyWrapStyle={{
          width: '100%',
          alignItems: 'flex-start',
          gap: 24,
          paddingHorizontal: 16,
        }}
        titleStyle={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1A1C1E',
          lineHeight: 26,
          letterSpacing: -0.004,
        }}
        textInputStyle={{
          borderWidth: 1,
          borderColor: 'rgba(135, 141, 150, 0.22)',
          borderRadius: 10,
          paddingVertical: 14,
          paddingLeft: 16,
          paddingRight: 10,
          alignSelf: 'stretch',
        }}
        buttonWrapStyle={{
          paddingHorizontal: 16,
        }}
        placeholder="그룹명을 입력해주세요."
        maxLength={45}
      />

      {/* 그룹 삭제 모달 */}
      <SPModal
        title="그룹 삭제"
        contents="그룹을 삭제하시겠습니까?"
        textInputVisible={false} // 수정: 텍스트 입력 비활성화
        visible={deleteGroupModalShow} // 수정: 그룹 삭제 모달 표시 여부
        onConfirm={() => {
          deleteGroup();
        }}
        onCancel={() => {
          setDeleteGroupModalShow(false);
        }}
        onClose={() => {
          setDeleteGroupModalShow(false);
        }}
        cancelButtonText="취소"
        confirmButtonText="삭제"
        bodyWrapStyle={{
          width: '100%',
          alignItems: 'center',
          gap: 16,
        }}
        titleStyle={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1A1C1E',
          lineHeight: 28,
          letterSpacing: -0.24,
        }}
      />
    </SafeAreaView>
  );
}

export default memo(AcademyGroup);

const styles = {
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
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  contentsTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
};
