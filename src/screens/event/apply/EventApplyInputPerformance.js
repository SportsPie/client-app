import React, { useEffect, useState, memo } from 'react';
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
import { MAIN_FOOT } from '../../../common/constants/mainFoot';
import { SCHOOL_LEVEL } from '../../../common/constants/schoolLevel';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { COLORS } from '../../../styles/colors';
import DismissKeyboard from '../../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../../components/SPKeyboardAvoidingView';
import { useAppState } from '../../../utils/AppStateContext';
import SPModal from '../../../components/SPModal';
import SPImages from '../../../assets/images';
import SPInput from '../../../components/SPInput';
import Selector from '../../../components/Selector';
import Utils from '../../../utils/Utils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

function EventApplyInputPerformance() {
  const { applyData, setApplyData } = useAppState();
  const [cancelModalVisible, setCancelModalVisible] = useState(false); // 헤더 취소 모달
  const [positionModalVisible, setPositionModalVisible] = useState(false); // 포지션 선택 모달
  const [isPositionSaved, setIsPositionSaved] = useState(false); // 포지션이 저장되었는지 여부
  const [tall, setTall] = useState('');
  const [footSize, setFootSize] = useState('');
  const [weight, setWeight] = useState('');
  const [backNumber, setBackNumber] = useState('');
  const [career, setCareer] = useState([]);
  const [mainFoot, setMainFoot] = useState('');
  const [memo, setMemo] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // 모달 열기
  const openCancelModal = () => setCancelModalVisible(true);
  const openPositionModal = () => setPositionModalVisible(true);

  // 모달 닫기
  const closeCancelModal = () => setCancelModalVisible(false);
  const closePositionModal = () => setPositionModalVisible(false);

  // 확인 버튼을 누르면 home 페이지로 이동
  const handleConfirm = () => {
    closeCancelModal();
    NavigationService.navigate(navName.eventDetail, {
      eventIdx: applyData.eventIdx,
    }); // home 페이지로 이동
  };

  const [selectedPositions, setSelectedPositions] = useState({
    first: null,
    second: null,
    third: null,
  });

  const [savedPositions, setSavedPositions] = useState({
    first: null,
    second: null,
    third: null,
  }); // 저장된 포지션 상태

  const updatePosition = position => {
    setSelectedPositions(prev => {
      // 1지망이 비어있으면 1지망에 넣고, 아니면 2지망, 그다음 3지망 순서로 채움
      if (!prev.first) return { ...prev, first: position };
      if (!prev.second) return { ...prev, second: position };
      if (!prev.third) return { ...prev, third: position };
      return prev; // 3지망까지 모두 선택되면 더 이상 업데이트하지 않음
    });
  };

  // 초기화 함수
  const resetPositions = () => {
    setSelectedPositions({
      first: null,
      second: null,
      third: null,
    });
  };

  // 저장 버튼 클릭 시 선택된 포지션을 저장
  const handleSavePositions = () => {
    setSavedPositions(selectedPositions);
    setIsPositionSaved(true); // 포지션이 저장되었음을 나타냄
    setPositionModalVisible(false); // 모달 닫기
  };

  const handleTallChange = text => {
    const tallValue = Utils.changeDecimalForInput(text, 1);
    setTall(tallValue);
  };

  const handleWeightChange = text => {
    const weightValue = Utils.changeDecimalForInput(text, 1);
    setWeight(weightValue);
  };

  // 필수 입력 항목 확인 함수
  const checkAllRequiredFieldsFilled = () => {
    return (
      !!savedPositions.first && // 포지션 1지망
      !!tall && // 키
      !!weight && // 몸무게
      !!footSize && // 발 사이즈
      !!mainFoot // 주 사용 발
    );
  };

  // 필수 입력 항목의 변화를 감지하여 버튼 상태 업데이트
  useEffect(() => {
    const isValid = checkAllRequiredFieldsFilled();
    setIsButtonDisabled(!isValid); // 모든 필수 항목이 채워졌을 때만 버튼 활성화
  }, [savedPositions, tall, weight, footSize, mainFoot]);

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
              <Text style={styles.eventTopTitle}>퍼포먼스</Text>
              <Text style={styles.eventTopText}>5/8</Text>
            </View>

            <View style={styles.contentsList}>
              <View>
                <Text style={styles.subTitle}>포지션</Text>

                {!isPositionSaved ? (
                  // 포지션이 저장되지 않았다면 포지션 선택 버튼만 표시
                  <TouchableOpacity
                    style={styles.openButton}
                    onPress={openPositionModal}>
                    <Text style={styles.openButtonText}>포지션 선택</Text>
                  </TouchableOpacity>
                ) : (
                  // 포지션이 저장되었다면 선택된 포지션을 표시
                  <View style={styles.positionHiddenBox}>
                    <View style={[styles.positionGroup, { marginVertical: 0 }]}>
                      <View
                        style={[styles.positionBox, { borderRightWidth: 0 }]}>
                        <Text style={styles.positionTitle}>1지망</Text>
                        <Text style={styles.positionText}>
                          {savedPositions.first || '-'}
                        </Text>
                      </View>

                      <View
                        style={[styles.positionBox, { borderRightWidth: 0 }]}>
                        <Text style={styles.positionTitle}>2지망(선택)</Text>
                        <Text style={styles.positionText}>
                          {savedPositions.second || '-'}
                        </Text>
                      </View>

                      <View
                        style={[styles.positionBox, { borderRightWidth: 0 }]}>
                        <Text style={styles.positionTitle}>3지망(선택)</Text>
                        <Text style={styles.positionText}>
                          {savedPositions.third || '-'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.openButton}
                      onPress={openPositionModal}>
                      <Text style={styles.openButtonText}>포지션 선택</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Tall */}
              <SPInput
                placeholder=""
                title="키"
                subPlaceholder="cm"
                maxLength={5}
                keyboardType="number-pad"
                value={tall}
                onChangeText={handleTallChange}
                textAlign="right"
                onlyDecimal
              />

              {/* Weight */}
              <SPInput
                placeholder=""
                title="몸무게"
                subPlaceholder="kg"
                maxLength={5}
                keyboardType="number-pad"
                value={weight}
                onChangeText={handleWeightChange}
                textAlign="right"
                onlyDecimal
              />

              {/* Foot size */}
              <SPInput
                placeholder=""
                title="발 사이즈"
                subPlaceholder="mm"
                maxLength={3}
                keyboardType="number-pad"
                value={Utils.onlyNumber(footSize)}
                onChangeText={setFootSize}
                textAlign="right"
                onlyNumber
              />

              {/* Main foot */}
              <Selector
                title="주 사용발"
                options={Object.values(MAIN_FOOT).map(item => {
                  return {
                    id: Utils.UUIDV4(),
                    label: item?.desc,
                    value: item?.value,
                  };
                })}
                onItemPress={setMainFoot}
                selectedItem={mainFoot}
              />

              {/* Back number */}
              <SPInput
                placeholder=""
                title="등 번호(선택)"
                maxLength={2}
                value={Utils.onlyNumber(backNumber)}
                onChangeText={setBackNumber}
                keyboardType="number-pad"
                textAlign="right"
                onlyNumber
              />

              {/* 선수경력 */}
              <Selector
                title="선수경력"
                options={Object.values(SCHOOL_LEVEL).map(item => ({
                  id: Utils.UUIDV4(),
                  label: item?.desc,
                  value: item?.value,
                }))}
                onItemPress={setCareer}
                selectedItem={career}
                multiple={true}
              />

              {/* 수상 경력 */}
              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>수상 경력(선택)</Text>
                <TextInput
                  value={memo}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  numberOfLines={3}
                  placeholder="수상 경력이 있을 경우 입력해주세요"
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={[styles.box, { minHeight: 80 }]}
                />
              </View>

              {/* 선호 플레이 */}
              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>선호 플레이(선택)</Text>
                <TextInput
                  value={memo}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  numberOfLines={3}
                  placeholder="선호 플레이가 있을 경우 입력해주세요"
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={[styles.box, { minHeight: 80 }]}
                />
              </View>
            </View>
          </ScrollView>

          {/* 다음 버튼 */}
          <View style={styles.bottomButtonWrap}>
            <PrimaryButton
              onPress={() => {
                NavigationService.navigate(navName.eventApplyInputDepositInfo);
              }}
              buttonStyle={styles.button}
              text="다음"
              disabled={isButtonDisabled}
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
          {/* 포지션 선택 모달 */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={positionModalVisible}
            onRequestClose={closePositionModal}>
            <View style={styles.modalContainer}>
              <View style={styles.imageContainer}>
                <View style={styles.titleGroup}>
                  <Text style={styles.titleText}>포지션 선택</Text>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetPositions}>
                    <Text style={styles.resetButtonText}>초기화</Text>
                  </TouchableOpacity>
                </View>
                <ImageBackground
                  source={SPImages.positionImg}
                  style={styles.imageBackground}
                  resizeMode="contain">
                  {/* 공격 버튼 */}
                  <View style={[styles.bgButtonBox, styles.atButtonBox]}>
                    <TouchableOpacity
                      style={[styles.button, styles.atButton]}
                      onPress={() => updatePosition('ST/CF/SS')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[styles.buttonText, styles.whiteText]}>
                        ST/CF/SS
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.bgButtonGroup, styles.atButtonGroup]}>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.atButton]}
                        onPress={() => updatePosition('RWF/RW')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText, styles.whiteText]}>
                          RWF/RW
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.mdButton]}
                        onPress={() => updatePosition('CAM')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>CAM</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.atButton]}
                        onPress={() => updatePosition('LWF/LW')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText, styles.whiteText]}>
                          LWF/LW
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 미드 버튼 */}
                  <View style={styles.bgButtonGroup}>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.mdButton]}
                        onPress={() => updatePosition('RM')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>RM</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.mdButton]}
                        onPress={() => updatePosition('CM')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>CM</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.mdButton]}
                        onPress={() => updatePosition('LM')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>LM</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.bgButtonBox, styles.mdButtonBox]}>
                    <TouchableOpacity
                      style={[styles.button, styles.mdButton]}
                      onPress={() => updatePosition('CDM')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.buttonText}>CDM</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 수비 버튼  */}
                  <View style={[styles.bgButtonGroup, styles.dfButtonGroup]}>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.dfButton]}
                        onPress={() => updatePosition('RB/RWB')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>RB/RWB</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.dfButton]}
                        onPress={() => updatePosition('CB')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>CB</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.dfButton]}
                        onPress={() => updatePosition('LB/LWB')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>LB/LWB</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 골키퍼 버튼 */}
                  <View style={[styles.bgButtonBox, styles.gkButtonBox]}>
                    <TouchableOpacity
                      style={[styles.button, styles.gkButton]}
                      onPress={() => updatePosition('GK')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[styles.buttonText, styles.whiteText]}>
                        GK
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>

                <View style={styles.positionGroup}>
                  <View style={styles.positionBox}>
                    <Text style={styles.positionTitle}>1지망</Text>
                    <Text style={styles.positionText}>
                      {selectedPositions.first || '-'}
                    </Text>
                  </View>

                  <View style={styles.positionBox}>
                    <Text style={styles.positionTitle}>2지망(선택)</Text>
                    <Text style={styles.positionText}>
                      {selectedPositions.second || '-'}
                    </Text>
                  </View>

                  <View style={[styles.positionBox, { borderRightWidth: 0 }]}>
                    <Text style={styles.positionTitle}>3지망(선택)</Text>
                    <Text style={styles.positionText}>
                      {selectedPositions.third || '-'}
                    </Text>
                  </View>
                </View>
                <View style={styles.buttonGroup}>
                  {/* 모달을 닫는 버튼 */}
                  <TouchableOpacity
                    style={styles.buttonBox}
                    onPress={closePositionModal}>
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonBox}
                    onPress={handleSavePositions}>
                    <Text style={styles.saveButtonText}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  contentsList: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 4,
  },
  openButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 8,
  },
  openButtonText: {
    fontSize: 15,
    fontWeight: 500,
    color: '#002672',
    lineHeight: 22,
    letterSpacing: 0.144,
    textAlign: 'center',
  },
  positionHiddenBox: {
    flexDirection: 'column',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 12,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명한 배경
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff', // 배경색은 흰색으로 설정
    padding: 24,
    // borderRadius: 16,
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 400,
    color: '#1D1B20',
    lineHeight: 32,
  },
  resetButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF7C10',
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#FF7C10',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  buttonBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'rgba(46, 49, 53, 0.60)',
    fontSize: 14,
  },
  saveButtonText: {
    color: '#FF7C10',
    fontSize: 14,
  },
  button: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1D1B20',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  bgButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  bgButtonBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  dfButtonGroup: {
    position: 'absolute',
    bottom: '14%',
  },
  atButtonGroup: {
    position: 'absolute',
    top: '28%',
  },
  gkButtonBox: {
    position: 'absolute',
    bottom: '0.5%',
  },
  atButtonBox: {
    position: 'absolute',
    top: '16%',
  },
  whiteText: {
    color: '#FFF',
  },
  gkButton: {
    backgroundColor: '#002672',
  },
  dfButton: {
    backgroundColor: '#97D59D',
  },
  //   mdButtonGroup: {
  //     paddingBottom: 11,
  //   },
  mdButtonBox: {
    position: 'absolute',
    bottom: '28%',
  },
  mdButton: {
    backgroundColor: '#FC0',
  },
  atButton: {
    backgroundColor: '#E01D1D',
  },

  positionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginVertical: 12,
  },
  positionBox: {
    flex: 1, // 동일한 크기로 차지
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: 'rgba(135, 141, 150, 0.22)',
  },
  positionTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  positionText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
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
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});

export default EventApplyInputPerformance;
