import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { COLORS } from '../../../styles/colors';
import DismissKeyboard from '../../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../../components/SPKeyboardAvoidingView';
import Utils from '../../../utils/Utils';
import { useAppState } from '../../../utils/AppStateContext';
import SPModal from '../../../components/SPModal';

function EventApplyInputAcademy() {
  const { applyData, setApplyData } = useAppState();
  const [modalVisible, setModalVisible] = useState(false);
  // 모달 열기
  const openModal = () => setModalVisible(true);
  // 모달 닫기
  const closeModal = () => setModalVisible(false);
  // 확인 버튼을 누르면 home 페이지로 이동
  const handleConfirm = () => {
    closeModal();
    NavigationService.navigate(navName.eventDetail, {
      eventIdx: applyData.eventIdx,
    }); // home 페이지로 이동
  };

  useEffect(() => {
    setApplyData({ ...applyData, acdmyName: '' });
  }, []);

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
        }}>
        <SafeAreaView style={styles.container}>
          <Header
            title="이벤트 접수 신청"
            rightContent={
              <Pressable style={{ padding: 10 }} onPress={openModal}>
                <Text style={styles.headerText}>취소</Text>
              </Pressable>
            }
          />
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.eventTopBox}>
              <Text style={styles.eventTopTitle}>소속 아카데미</Text>
              <Text style={styles.eventTopText}>4/8</Text>
            </View>
            <View style={styles.contentsList}>
              <View>
                <Text style={styles.subTitle}>소속 아카데미</Text>
                <TextInput
                  value={applyData?.acdmyName}
                  onChange={e => {
                    if (e.nativeEvent.text?.length > 45) return;
                    const text = Utils.removeSymbolAndBlank(e.nativeEvent.text);
                    setApplyData({ ...applyData, acdmyName: text });
                  }}
                  placeholder="아카데미 이름을 입력하세요"
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={styles.box}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomButtonWrap}>
            <PrimaryButton
              onPress={() => {
                NavigationService.navigate(navName.eventApplyInputPerformance);
              }}
              buttonStyle={styles.button}
              disabled={!applyData?.acdmyName}
              text="다음"
            />
          </View>
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
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
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
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  button: {},
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
  contentsList: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 4,
  },
  box: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  boxText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
});

export default EventApplyInputAcademy;
