import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiGetAcademyConfigMngGroups,
  apiPatchAcademyConfigMngPlayerGroup,
  apiPostAcademyConfigMngGroups,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import SPModal from '../../components/SPModal';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import Header from '../../components/header';

function AcademyGroupMove({ route }) {
  /**
   * state
   */
  const userIdx = route?.params?.userIdx;
  const groupIdx = route?.params?.groupIdx;
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const trlRef = useRef({ current: { disabled: false } });

  // modal
  const [addGroupModalShow, setAddGroupModalShow] = useState(false);

  /**
   *  api
   */
  const getGroupList = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngGroups();
      setGroupList(data.data);
    } catch (error) {
      handleCheck(error);
    }
  };

  const addGroup = async groupNm => {
    setAddGroupModalShow(false);
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
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

  const moveGroup = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const params = {
        groupIdx: selectedGroupIdx,
        playerIdx: userIdx,
      };
      const { data } = await apiPatchAcademyConfigMngPlayerGroup(params);
      Utils.openModal({
        title: '성공',
        body: '그룹 이동이 완료되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   *  function
   */

  const handleCheck = key => {
    setSelectedGroupIdx(key);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      handleCheck(groupIdx);
    }, [groupIdx]),
  );

  useFocusEffect(
    useCallback(() => {
      getGroupList();
    }, [refresh]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="그룹이동" />
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkboxWrapper}
          onPress={() => handleCheck(null)}>
          <Image
            source={
              selectedGroupIdx === null
                ? SPIcons.icChecked
                : SPIcons.icOutlineCheck
            }
            style={{ width: 32, height: 32 }}
          />
          <Text style={styles.checkboxLabel}>지정 안 함</Text>
        </TouchableOpacity>
        {groupList.map((item, index) => (
          <TouchableOpacity
            key={item.groupIdx}
            style={styles.checkboxWrapper}
            onPress={() => handleCheck(item.groupIdx)}>
            <Image
              source={
                selectedGroupIdx === item.groupIdx
                  ? SPIcons.icChecked
                  : SPIcons.icOutlineCheck
              }
              style={{ width: 32, height: 32 }}
            />
            <Text style={styles.checkboxLabel}>{item.groupName}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setAddGroupModalShow(true);
          }}>
          <View>
            <Image
              source={SPIcons.icAddBlue}
              style={{ width: 20, height: 20 }}
            />
          </View>
          <Text style={styles.addText}>그룹 추가</Text>
        </TouchableOpacity>

        <SPModal
          title="그룹 추가"
          contents=""
          textInputVisible
          visible={addGroupModalShow}
          onConfirm={value => {
            addGroup(value);
          }}
          onCancel={inputText => {
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
          placeholder="그룹명을 입력해주세요."
        />
      </View>
      <View style={styles.subBtn}>
        <TouchableOpacity
          style={styles.subBtnBox}
          onPress={() => {
            moveGroup();
          }}>
          <Text style={styles.subBtnText}>완료</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default memo(AcademyGroupMove);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  addText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  subBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  subBtnBox: {},
  subBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
};
