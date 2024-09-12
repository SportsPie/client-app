import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
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
import { MAIN_FOOT_TYPE } from '../../../common/constants/mainFootType';
import { POSITION_DETAIL_TYPE } from '../../../common/constants/positionDetailType';
import { CAREER_TYPE } from '../../../common/constants/careerType';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

function EventApplyInputPerformance() {
  /**
   * state
   */
  const insets = useSafeAreaInsets();
  const { applyData, setApplyData } = useAppState();
  const [cancelModalVisible, setCancelModalVisible] = useState(false); // 헤더 취소 모달
  const [positionModalVisible, setPositionModalVisible] = useState(false); // 포지션 선택 모달
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [selectedPositions, setSelectedPositions] = useState({
    firstWish: null,
    secondWish: null,
    thirdWish: null,
  });

  /**
   * function
   */

  // 모달 열기
  const openCancelModal = () => setCancelModalVisible(true);
  const openPositionModal = () => {
    setSelectedPositions({
      firstWish: applyData.firstWish,
      secondWish: applyData.secondWish,
      thirdWish: applyData.thirdWish,
    }); // 현재 선택된 포지션을 저장
    setPositionModalVisible(true);
  };

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

  const updatePosition = position => {
    setSelectedPositions(prev => {
      // 1지망이 비어있으면 1지망에 넣고, 아니면 2지망, 그다음 3지망 순서로 채움
      if (!prev.firstWish) return { ...prev, firstWish: position };
      if (!prev.secondWish) return { ...prev, secondWish: position };
      if (!prev.thirdWish) return { ...prev, thirdWish: position };
      return prev; // 3지망까지 모두 선택되면 더 이상 업데이트하지 않음
    });
  };

  // 초기화 함수
  const resetPositions = () => {
    setSelectedPositions({
      firstWish: null,
      secondWish: null,
      thirdWish: null,
    });
  };

  // 저장 버튼 클릭 시 선택된 포지션을 저장
  const handleSavePositions = () => {
    setApplyData({ ...applyData, ...selectedPositions });
    setPositionModalVisible(false); // 모달 닫기
  };

  const handleTallChange = text => {
    const tallValue = Utils.changeDecimalForInput(text, 1);
    setApplyData({ ...applyData, height: tallValue });
  };

  const handleWeightChange = text => {
    const weightValue = Utils.changeDecimalForInput(text, 1);
    setApplyData({ ...applyData, weight: weightValue });
  };

  // 필수 입력 항목 확인 함수
  const checkAllRequiredFieldsFilled = () => {
    return (
      !!applyData?.firstWish && // 포지션 1지망
      !!applyData?.height && // 키
      !!applyData?.weight && // 몸무게
      !!applyData?.shoeSize && // 발 사이즈
      !!applyData?.mainFoot && // 주 사용 발
      !!applyData?.careerList
    );
  };

  /**
   * useEffect
   */

  useEffect(() => {
    // setSelectedPositions({
    //   firstWish: null,
    //   secondWish: null,
    //   thirdWish: null,
    // });
    // setApplyData({
    //   ...applyData,
    //   firstWish: null,
    //   secondWish: null,
    //   thirdWish: null,
    //   height: null,
    //   weight: null,
    //   shoeSize: null,
    //   mainFoot: null,
    //   backNo: null,
    //   careerList: [CAREER_TYPE.NONE.value],
    //   awards: null,
    //   preferredPlay: null,
    // });
    if (!applyData?.careerList) {
      setApplyData({
        ...applyData,
        careerList: [CAREER_TYPE.NONE.value],
      });
    }
  }, []);

  useEffect(() => {
    if (!applyData?.careerList || applyData?.careerList.length === 0) {
      setApplyData({
        ...applyData,
        careerList: [CAREER_TYPE.NONE.value],
      });
    }
  }, [applyData?.careerList]);

  // 필수 입력 항목의 변화를 감지하여 버튼 상태 업데이트
  useEffect(() => {
    const isValid = checkAllRequiredFieldsFilled();
    setIsButtonDisabled(!isValid); // 모든 필수 항목이 채워졌을 때만 버튼 활성화
  }, [
    applyData?.firstWish,
    applyData?.secondWish,
    applyData?.thirdWish,
    applyData?.height,
    applyData?.weight,
    applyData?.shoeSize,
    applyData?.mainFoot,
  ]);

  /**
   * render
   */

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        key="eventApplyInputPerformance"
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

                {!applyData?.firstWish ? (
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
                          {applyData?.firstWish || '-'}
                        </Text>
                      </View>

                      <View
                        style={[styles.positionBox, { borderRightWidth: 0 }]}>
                        <Text style={styles.positionTitle}>2지망(선택)</Text>
                        <Text style={styles.positionText}>
                          {applyData?.secondWish || '-'}
                        </Text>
                      </View>

                      <View
                        style={[styles.positionBox, { borderRightWidth: 0 }]}>
                        <Text style={styles.positionTitle}>3지망(선택)</Text>
                        <Text style={styles.positionText}>
                          {applyData?.thirdWish || '-'}
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
                placeholder="키를 입력해주세요."
                title="키"
                subPlaceholder="cm"
                maxLength={5}
                keyboardType="number-pad"
                value={applyData?.height || ''}
                onChangeText={handleTallChange}
                textAlign="right"
                onlyDecimal
              />

              {/* Weight */}
              <SPInput
                placeholder="몸무게를 입력해주세요."
                title="몸무게"
                subPlaceholder="kg"
                maxLength={5}
                keyboardType="number-pad"
                value={applyData?.weight || ''}
                onChangeText={handleWeightChange}
                textAlign="right"
                onlyDecimal
              />

              {/* Foot size */}
              <SPInput
                placeholder="발 사이즈를 입력해주세요."
                title="발 사이즈"
                subPlaceholder="mm"
                maxLength={3}
                keyboardType="number-pad"
                value={Utils.onlyNumber(applyData?.shoeSize)}
                onChangeText={text => {
                  setApplyData({ ...applyData, shoeSize: text });
                }}
                textAlign="right"
                onlyNumber
              />

              {/* Main foot */}
              <Selector
                title="주 사용발"
                options={Object.values(MAIN_FOOT_TYPE).map(item => {
                  return {
                    id: Utils.UUIDV4(),
                    label: item?.desc,
                    value: item?.name,
                  };
                })}
                onItemPress={value => {
                  setApplyData({ ...applyData, mainFoot: value });
                }}
                selectedOnItem={applyData?.mainFoot}
              />

              {/* Back number */}
              <SPInput
                placeholder="등 번호를 입력해주세요"
                title="등 번호(선택)"
                maxLength={2}
                value={Utils.onlyNumber(applyData?.backNo)}
                onChangeText={text => {
                  setApplyData({ ...applyData, backNo: text });
                }}
                keyboardType="number-pad"
                textAlign="left"
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
                onItemPress={value => {
                  setApplyData({ ...applyData, careerList: value });
                }}
                selectedOnItem={
                  applyData?.careerList
                    ? [...applyData.careerList]
                    : [SCHOOL_LEVEL.NONE.value]
                }
                multiple={true}
              />

              {/* 수상 경력 */}
              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>수상 경력(선택)</Text>
                <TextInput
                  value={applyData?.awards || ''}
                  onChangeText={text => {
                    if (text?.length > 1000) return;
                    setApplyData({ ...applyData, awards: text });
                  }}
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
                  value={applyData?.preferredPlay || ''}
                  onChangeText={text => {
                    if (text?.length > 1000) return;
                    setApplyData({ ...applyData, preferredPlay: text });
                  }}
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
                setApplyData({
                  ...applyData,
                  height: Number(applyData.height),
                  weight: Number(applyData.weight),
                });
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
            <SafeAreaView
              style={[styles.modalContainer, { paddingTop: insets.top }]}>
              <View style={[styles.imageContainer]}>
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
                      onPress={() =>
                        updatePosition(POSITION_DETAIL_TYPE.ST_CF_SS.code)
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[styles.buttonText, styles.whiteText]}>
                        {POSITION_DETAIL_TYPE.ST_CF_SS.enDesc}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.bgButtonGroup, styles.atButtonGroup]}>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.atButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.LWF_LW.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText, styles.whiteText]}>
                          {POSITION_DETAIL_TYPE.LWF_LW.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.mdButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.CAM.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>
                          {POSITION_DETAIL_TYPE.CAM.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.atButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.RWF_RW.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText, styles.whiteText]}>
                          {POSITION_DETAIL_TYPE.RWF_RW.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 미드 버튼 */}
                  <View style={styles.bgButtonGroup}>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.mdButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.LM.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>
                          {POSITION_DETAIL_TYPE.LM.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.mdButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.CM.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>
                          {POSITION_DETAIL_TYPE.CM.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.mdButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.RM.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>
                          {POSITION_DETAIL_TYPE.RM.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.bgButtonBox, styles.mdButtonBox]}>
                    <TouchableOpacity
                      style={[styles.button, styles.mdButton]}
                      onPress={() =>
                        updatePosition(POSITION_DETAIL_TYPE.CDM.code)
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.buttonText}>
                        {POSITION_DETAIL_TYPE.CDM.enDesc}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 수비 버튼  */}
                  <View style={[styles.bgButtonGroup, styles.dfButtonGroup]}>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.dfButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.LB_LWB.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>
                          {POSITION_DETAIL_TYPE.LB_LWB.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.dfButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.CB.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>
                          {POSITION_DETAIL_TYPE.CB.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.bgButtonBox]}>
                      <TouchableOpacity
                        style={[styles.button, styles.dfButton]}
                        onPress={() =>
                          updatePosition(POSITION_DETAIL_TYPE.RB_RWB.code)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.buttonText]}>
                          {POSITION_DETAIL_TYPE.RB_RWB.enDesc}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 골키퍼 버튼 */}
                  <View style={[styles.bgButtonBox, styles.gkButtonBox]}>
                    <TouchableOpacity
                      style={[styles.button, styles.gkButton]}
                      onPress={() =>
                        updatePosition(POSITION_DETAIL_TYPE.GK.code)
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[styles.buttonText, styles.whiteText]}>
                        {POSITION_DETAIL_TYPE.GK.enDesc}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>

                <View style={styles.positionGroup}>
                  <View style={styles.positionBox}>
                    <Text style={styles.positionTitle}>1지망</Text>
                    <Text style={styles.positionText}>
                      {selectedPositions.firstWish || '-'}
                    </Text>
                  </View>

                  <View style={styles.positionBox}>
                    <Text style={styles.positionTitle}>2지망(선택)</Text>
                    <Text style={styles.positionText}>
                      {selectedPositions.secondWish || '-'}
                    </Text>
                  </View>

                  <View style={[styles.positionBox, { borderRightWidth: 0 }]}>
                    <Text style={styles.positionTitle}>3지망(선택)</Text>
                    <Text style={styles.positionText}>
                      {selectedPositions.thirdWish || '-'}
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
            </SafeAreaView>
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
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명한 배경
    backgroundColor: '#fff', // 배경색은 흰색으로 설정
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
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
