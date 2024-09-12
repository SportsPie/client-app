import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SPSvgs } from '../../../assets/svg';

import SPModal from '../../../components/SPModal';
import { handleError } from '../../../utils/HandleError';
import { apiGetEventApplyType } from '../../../api/RestAPI';
import { useAppState } from '../../../utils/AppStateContext';

function EventApplyType({ route }) {
  /**
   * state
   */
  const { eventIdx, eventInfo } = route.params;
  const noParamReset = route?.params?.noParamReset;
  const { applyData, setApplyData, resetApplyData } = useAppState();
  const [selectedId, setSelectedId] = useState(null); // 선택된 항목 ID 저장
  const [modalVisible, setModalVisible] = useState(false);
  const [typeList, setTypeList] = useState([]);

  /**
   * api
   */
  const getApplyType = async () => {
    try {
      const { data } = await apiGetEventApplyType(eventIdx);
      setTypeList(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * function
   */

  // 모달 열기
  const openModal = () => setModalVisible(true);

  // 모달 닫기
  const closeModal = () => setModalVisible(false);

  // 확인 버튼을 누르면 home 페이지로 이동
  const handleConfirm = () => {
    closeModal();
    NavigationService.navigate(navName.eventDetail, { eventIdx }); // home 페이지로 이동
  };

  /**
   * useEffect
   */
  useEffect(() => {
    resetApplyData();
    setApplyData(prev => {
      return { ...prev, eventIdx, eventInfo };
    });
  }, []);

  useEffect(() => {
    if (applyData.eventIdx) getApplyType();
  }, [applyData.eventIdx]);

  /**
   * render
   */

  const renderItem = ({ item }) => {
    const isSelected = item.targetIdx === selectedId; // 선택된 항목 여부

    return (
      <Pressable
        style={[
          styles.ageGroupItem,
          isSelected && styles.selectedItem, // 선택된 항목 스타일
        ]}
        onPress={() => {
          setApplyData(prev => {
            return {
              ...prev,
              targetIdx: item.targetIdx,
              targetName: item.targetName,
            };
          });
          setSelectedId(item.targetIdx);
        }} // 항목 클릭 시 ID 저장
      >
        <Text style={[styles.ageGroupText, isSelected && styles.selectedText]}>
          {item.targetName}
        </Text>
        {isSelected ? <SPSvgs.CheckOrange /> : <SPSvgs.CheckGray />}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="이벤트 접수 신청"
        rightContent={
          <Pressable style={{ padding: 10 }} onPress={openModal}>
            <Text style={styles.headerText}>취소</Text>
          </Pressable>
        }
      />
      <SPModal
        visible={modalVisible}
        title="취소 안내"
        contents={`입력한 정보가 모두 사라집니다.\n다시 신청하려면 처음부터 입력해야 해요.`}
        cancelButtonText="취소"
        confirmButtonText="확인"
        onCancel={closeModal} // 취소 버튼: 모달 닫기
        onConfirm={handleConfirm} // 확인 버튼: 홈 페이지로 이동
        cancelButtonStyle={{
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        }} // 취소 버튼 스타일
        confirmButtonStyle={{
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        }} // 확인 버튼 스타일
        cancelButtonTextStyle={{ color: '#002672' }} // 취소 버튼 텍스트 스타일
        confirmButtonTextStyle={{ color: '#002672' }} // 확인 버튼 텍스트 스타일
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.eventTopBox}>
          <Text style={styles.eventTopTitle}>참가 부문</Text>
          <Text style={styles.eventTopText}>1/8</Text>
        </View>
        {/* FlatList를 사용한 참가 부문 */}
        <View style={styles.ageGroupBox}>
          <FlatList
            data={typeList} // 데이터
            renderItem={renderItem} // 렌더링할 항목
            keyExtractor={item => item.targetIdx} // 키 추출
            extraData={selectedId} // 선택 상태 갱신
            scrollEnabled={false} // 스크롤 비활성화
          />
        </View>
      </ScrollView>

      {/* 버튼: 선택이 안 된 상태에서는 비활성화 */}
      <View style={styles.bottomButtonWrap}>
        <PrimaryButton
          onPress={() => {
            NavigationService.navigate(navName.eventApplyPrevInformation, {
              eventIdx,
            });
          }}
          buttonStyle={selectedId ? styles.button : styles.disabledButton} // 선택 상태에 따른 버튼 스타일
          text="다음"
          disabled={!selectedId} // 선택되지 않은 상태에서는 비활성화
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  eventTopBox: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTopTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  eventTopText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  ageGroupBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  ageGroupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 24,
    paddingRight: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)', // 기본 border 색상
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedItem: {
    borderColor: '#FF7C10', // 선택된 항목 border 색상
    borderWidth: 2,
    paddingVertical: 15,
  },
  ageGroupText: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)', // 기본 텍스트 색상
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  selectedText: {
    fontWeight: 600,
    color: '#FF7C10', // 선택된 텍스트 색상
  },
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#FF7C10', // 기본 활성화된 버튼 색상
  },
  disabledButton: {
    backgroundColor: '#ccc', // 비활성화된 버튼 색상
  },
});

export default EventApplyType;
