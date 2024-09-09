import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { COLORS } from '../../../styles/colors';
import SPModal from '../../../components/SPModal';
import Divider from '../../../components/Divider';
import BoxSelect from '../../../components/BoxSelect';
import DismissKeyboard from '../../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../../components/SPKeyboardAvoidingView';
import { useAppState } from '../../../utils/AppStateContext';

function EventApplyInputDepositInfo() {
  const { applyData, setApplyData } = useAppState();
  const [cancelModalVisible, setCancelModalVisible] = useState(false); // 헤더 취소 모달
  const [depositModalVisible, setDepositModalVisible] = useState(false); // 입금용 번호 생성 모달
  const [depositorName, setDepositorName] = useState(''); // 사용자가 입력한 입금자 이름
  const [finalDepositorName, setFinalDepositorName] = useState(''); // 최종적으로 모달에서 확인한 입금자 이름
  const [isConfirmed, setIsConfirmed] = useState(false); // 입금용 번호 생성 후 확인 여부
  const [selectedBank, setSelectedBank] = useState(''); // 선택된 은행

  // 모달 열기
  const openCancelModal = () => setCancelModalVisible(true);
  const openDepositModal = () => setDepositModalVisible(true);

  // 모달 닫기
  const closeCancelModal = () => setCancelModalVisible(false);
  const closeDepositModal = () => setDepositModalVisible(false);

  // 확인 버튼을 누르면 home 페이지로 이동
  const handleConfirm = () => {
    closeCancelModal();
    NavigationService.navigate(navName.eventDetail, {
      eventIdx: applyData.eventIdx,
    }); // home 페이지로 이동
  };

  // 모달에서 확인 버튼을 눌렀을 때 호출되는 함수
  const handleDepositConfirm = () => {
    setFinalDepositorName(depositorName); // 모달에서 확인된 입금자 이름 저장
    setIsConfirmed(true); // 이름이 확인된 상태로 변경
    closeDepositModal();
  };

  // 은행 선택 옵션 (임시 데이터)
  const bankOptions = [
    { id: 1, label: '국민은행', value: '국민은행' },
    { id: 2, label: '신한은행', value: '신한은행' },
    { id: 3, label: '하나은행', value: '하나은행' },
    { id: 4, label: '우리은행', value: '우리은행' },
    { id: 5, label: '카카오뱅크', value: '카카오뱅크' },
  ];

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
              <Pressable style={{ padding: 10 }} onPress={openCancelModal}>
                <Text style={styles.headerText}>취소</Text>
              </Pressable>
            }
          />
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.eventTopBox}>
              <Text style={styles.eventTopTitle}>입금 정보</Text>
              <Text style={styles.eventTopText}>6/8</Text>
            </View>

            {/* 입금 안내 */}
            <View style={styles.contentsBox}>
              <Text style={styles.contentsTitle}>입금 안내</Text>
              <View style={styles.contentsSubContainer}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>금액</Text>
                  <Text style={styles.contentsSubText}>400,000원</Text>
                </View>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>입금 계좌</Text>
                  <Text style={styles.contentsSubText}>
                    국민은행 1111-11-111111 김하늘
                  </Text>
                </View>
              </View>
            </View>
            <Divider lineHeight={8} lineColor={COLORS.indigo90} />

            {/* 입금자 정보 */}
            {!isConfirmed ? (
              <View style={styles.contentsBox}>
                <Text style={styles.contentsTitle}>입금자 정보</Text>
                <View style={styles.contentsSubContainer}>
                  <View style={styles.contentsSubBox}>
                    <Text style={styles.contentsSubTitle}>
                      입금자 이름 입력
                    </Text>
                    <View style={styles.infoBox}>
                      <TextInput
                        placeholder="입금자 이름 입력"
                        autoCorrect={false}
                        autoCapitalize="none"
                        style={[styles.box, { flex: 1.2 }]}
                        value={depositorName}
                        onChangeText={setDepositorName} // 입력된 이름을 상태에 저장
                      />
                      <TouchableOpacity
                        style={styles.infoOutlineBtn}
                        onPress={openDepositModal}>
                        <Text style={styles.infoOutlineBtnText}>
                          입금용 번호 생성
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              // 입금자 이름이 확인된 후 보여줄 내용
              <View style={styles.contentsBox}>
                <Text style={styles.contentsTitle}>입금자 정보</Text>
                <View style={styles.contentsSubContainer}>
                  <View style={styles.contentsSubBox}>
                    <Text style={styles.contentsSubTitle}>
                      입금자 이름 입력
                    </Text>
                    <View style={styles.infoBox}>
                      <TextInput
                        value={finalDepositorName} // 확인된 입금자 이름 표시
                        keyboardType="numeric"
                        autoCorrect={false}
                        autoCapitalize="none"
                        editable={false}
                        style={[
                          styles.box,
                          {
                            backgroundColor: 'rgba(135, 141, 150, 0.08)',
                            flex: 1,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.contentsSubBox}>
                    <Text style={styles.contentsSubTitle}>
                      받는 분 통장 표시
                    </Text>
                    <Text style={styles.depositModalBold}>
                      {finalDepositorName} 345
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Divider lineHeight={8} lineColor={COLORS.indigo90} />

            {/* 환불 계좌 정보 */}
            <View style={styles.contentsBox}>
              <Text style={styles.contentsTitle}>환불 계좌 정보</Text>
              <View style={styles.contentsSubContainer}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>예금주</Text>
                  <TextInput
                    placeholder="예금주 입력"
                    autoCorrect={false}
                    autoCapitalize="none"
                    value=""
                    onChangeText=""
                    style={styles.box}
                  />
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>은행</Text>
                  <BoxSelect
                    placeholder="은행 선택"
                    arrayOptions={bankOptions} // 은행 선택 옵션 추가
                    onItemPress={setSelectedBank} // 선택한 은행을 상태에 저장
                    value={selectedBank} // 선택된 은행 표시
                  />
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>계좌번호</Text>
                  <TextInput
                    placeholder="계좌번호 입력"
                    keyboardType="number-pad"
                    autoCorrect={false}
                    autoCapitalize="none"
                    value=""
                    onChangeText=""
                    style={styles.box}
                  />
                </View>
              </View>
            </View>

            <Divider lineHeight={8} lineColor={COLORS.indigo90} />

            {/* 주의 사항 */}
            <View style={styles.contentsBox}>
              <Text style={styles.contentsTitle}>주의 사항</Text>
              <View style={styles.contentsSubContainer}>
                <View>
                  <Text
                    style={[
                      styles.depositModalText,
                      { marginBottom: 16, textAlign: 'left' },
                    ]}>
                    계좌이체 시, {'\n'}
                    <Text style={styles.depositModalBold}>입금자 이름</Text>과
                    <Text style={styles.depositModalBold}> 식별 번호</Text>를
                    정확히 입력해 주세요!
                  </Text>

                  <Text
                    style={[
                      styles.depositModalText,
                      { marginBottom: 16, textAlign: 'left' },
                    ]}>
                    당일 23:59까지 입금이 완료되지 않으면{'\n'}
                    <Text style={styles.depositModalBold}>
                      접수 자동 취소
                    </Text>{' '}
                    됩니다.
                  </Text>

                  <Text
                    style={[styles.depositModalText, { textAlign: 'left' }]}>
                    접수 취소에 대한 책임은 당사에서 지지 않습니다.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* 다음 버튼 */}
          <View style={styles.bottomButtonWrap}>
            <PrimaryButton
              onPress={() => {
                NavigationService.navigate(navName.eventApplyInputCheck);
              }}
              buttonStyle={styles.button}
              text="다음"
            />
          </View>

          {/* Modal */}
          {/* 헤더 취소 모달 */}
          <SPModal
            visible={cancelModalVisible}
            title="취소 안내"
            contents={`입력한 정보가 모두 사라집니다.\n다시 신청하려면 처음부터 입력해야 해요.`}
            cancelButtonText="취소"
            confirmButtonText="확인"
            onCancel={closeCancelModal} // 취소 버튼: 모달 닫기
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

          {/* Modal */}
          {/* 입금용 번호 생성 모달 */}
          <SPModal
            visible={depositModalVisible}
            title="꼭 제대로 확인해주세요!"
            contents={
              <View>
                <Text style={[styles.depositModalText, { marginBottom: 16 }]}>
                  입력한 <Text style={styles.depositModalBold}>이름</Text>을
                  확인해주세요. {'\n'}
                  <Text style={styles.depositModalBold}>
                    확인 후 수정이 불가능
                  </Text>
                  합니다.
                </Text>

                <Text style={[styles.depositModalText, { marginBottom: 8 }]}>
                  계좌이체 시, {'\n'}
                  <Text style={styles.depositModalBold}>
                    {depositorName} 345
                  </Text>
                  정확히 입력해 주세요!
                </Text>

                <Text style={styles.depositModalText}>
                  입금 기한(당일 23:59)까지 미입금 시, {'\n'}
                  접수가 자동으로 취소됩니다.
                </Text>
              </View>
            }
            cancelButtonText="취소"
            confirmButtonText="확인"
            onCancel={closeDepositModal} // 취소 버튼: 모달 닫기
            onConfirm={handleDepositConfirm}
            cancelButtonStyle={{
              backgroundColor: 'transparent',
              borderColor: 'rgba(135, 141, 150, 0.22)',
            }} // 취소 버튼 스타일
            confirmButtonStyle={{
              backgroundColor: '#FF7C10',
              borderColor: 'transparent',
            }} // 확인 버튼 스타일
            cancelButtonTextStyle={{ color: '#002672' }} // 취소 버튼 텍스트 스타일
            confirmButtonTextStyle={{ color: '#FFF' }} // 확인 버튼 텍스트 스타일
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
  contentsBox: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentsTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  contentsSubContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  contentsSubBox: {
    flexDirection: 'column',
    gap: 4,
  },
  contentsSubTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentsSubText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 4,
  },
  infoOutlineBtn: {
    flex: 0.8,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
  },
  infoOutlineBtnText: {
    fontSize: 15,
    fontWeight: 500,
    color: '#002672',
    lineHeight: 22,
    letterSpacing: 0.144,
    textAlign: 'center',
  },
  box: {
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
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  depositModalText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  depositModalBold: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
});

export default EventApplyInputDepositInfo;
