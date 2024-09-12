import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import { PrimaryButton } from '../../../components/PrimaryButton';
import Avatar from '../../../components/Avatar';
import SPSelectPhotoModal from '../../../components/SPSelectPhotoModal';
import DismissKeyboard from '../../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../../components/SPKeyboardAvoidingView';
import SPModal from '../../../components/SPModal';
import SPIcons from '../../../assets/icon';
import { COLORS } from '../../../styles/colors';
import Utils from '../../../utils/Utils';
import { useAppState } from '../../../utils/AppStateContext';
import { LocaleConfig } from 'react-native-calendars/src/index';
import { addMonths, addYears, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import moment from 'moment';
import SPSearchAddress from '../../../components/SPSearchAddress';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import fontStyles from '../../../styles/fontStyles';
import DatePicker from 'react-native-date-picker';

// 생년월일 달력 모달 정보
LocaleConfig.locales.fr = {
  monthNames: [
    '01월',
    '02월',
    '03월',
    '04월',
    '05월',
    '06월',
    '07월',
    '08월',
    '09월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '01월',
    '02월',
    '03월',
    '04월',
    '05월',
    '06월',
    '07월',
    '08월',
    '09월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};

function EventApplyInputMyInfo() {
  const { applyData, setApplyData } = useAppState();
  const [modalVisible, setModalVisible] = useState(false);
  const [showProfilePhotoSelectModal, setShowProfilePhotoSelectModal] =
    useState(false);
  const [showSearchAddressModal, setShowSearchAddressModal] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // 프로필 이미지 수정
  const maxFilename = 60;
  const updateProfile = async ({ fileUrl, imageName, imageType }) => {
    // 로고 이미지 상태 업데이트
    setApplyData({
      ...applyData,
      profileImage: {
        uri: fileUrl,
        name:
          imageName.length <= maxFilename
            ? imageName
            : imageName.substring(
                imageName.length - maxFilename,
                imageName.length,
              ),
        type: imageType,
      },
    });
  };

  // 입력 필드가 모두 입력되었는지 확인하는 함수
  const isFormValid = () => {
    return (
      applyData?.participationName &&
      applyData?.participationGender &&
      applyData?.participationBirth &&
      applyData?.guardianName &&
      applyData?.guardianContact &&
      applyData?.address &&
      applyData?.postCode &&
      applyData?.addressDetail
    );
  };
  // 성별
  const genderList = [
    { label: '남성', value: 'M' },
    { label: '여성', value: 'F' },
  ];
  // const genderList = Object.values(GENDER).map(item => {
  //   return { label: item.desc, value: item.value };
  // });

  const onSelectAddress = data => {
    setApplyData({
      ...applyData,
      address: data.address,
      postCode: data.zonecode,
    });
  };

  // useEffect(() => {
  //   setApplyData({
  //     ...applyData,
  //     profileImage: null,
  //     guardianName: null,
  //     guardianRelationship: null,
  //     guardianContact: null,
  //     address: null,
  //     addressDetail: null,
  //     postCode: null,
  //   });
  // }, []);

  // 생년월일 달력 모달
  const renderCustomHeader = () => {
    const year = format(
      new Date(applyData?.participationBirth || moment().format('YYYY-MM-DD')),
      'yyyy',
      {
        locale: ko,
      },
    );
    const month = format(
      new Date(applyData?.participationBirth || moment().format('YYYY-MM-DD')),
      'MM',
      {
        locale: ko,
      },
    );

    const handleArrowPress = (direction, isYear) => {
      const currentSelectedDate = new Date(
        applyData?.participationBirth || moment().format('YYYY-MM-DD'),
      );
      let newDate;
      if (isYear) {
        newDate =
          direction === 'left'
            ? format(addYears(currentSelectedDate, -1), 'yyyy-MM-dd')
            : format(addYears(currentSelectedDate, 1), 'yyyy-MM-dd');
      } else {
        newDate =
          direction === 'left'
            ? format(addMonths(currentSelectedDate, -1), 'yyyy-MM-dd')
            : format(addMonths(currentSelectedDate, 1), 'yyyy-MM-dd');
      }
      setApplyData({ ...applyData, participationBirth: newDate });
    };

    return (
      <View
        style={{
          paddingTop: 32,
          gap: 8,
          width: SCREEN_WIDTH - 32 * 2,
          marginBottom: 9,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 16,
          }}>
          <Text style={{ ...fontStyles.fontSize20_Medium }}>Year : </Text>
          <View style={styles.customHeaderContainer}>
            <TouchableOpacity onPress={() => handleArrowPress('left', true)}>
              <Image source={SPIcons.icArrowLeft} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.customHeaderText}>{year}</Text>
            <TouchableOpacity onPress={() => handleArrowPress('right', true)}>
              <Image source={SPIcons.icArrowRight} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 16,
          }}>
          <Text style={{ ...fontStyles.fontSize20_Medium }}>Month : </Text>
          <View style={styles.customHeaderContainer}>
            <TouchableOpacity onPress={() => handleArrowPress('left')}>
              <Image source={SPIcons.icArrowLeft} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.customHeaderText}>{month}</Text>
            <TouchableOpacity onPress={() => handleArrowPress('right')}>
              <Image source={SPIcons.icArrowRight} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        key="eventApplyInputMyInfo"
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

          {/* 취소 안내 모달 */}
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
              <Text style={styles.eventTopTitle}>내 정보</Text>
              <Text style={styles.eventTopText}>3/8</Text>
            </View>

            <View style={styles.contentsList}>
              {/* 프로필 사진 */}
              <View style={styles.avatarWrapper}>
                {applyData?.profileImage?.uri ? (
                  <Avatar
                    imageSize={56}
                    imageURL={applyData.profileImage.uri ?? ''}
                    onPress={() => {
                      setShowProfilePhotoSelectModal(true);
                    }}
                  />
                ) : (
                  <Avatar
                    imageSize={56}
                    imageURL={applyData?.profilePath ?? ''}
                    onPress={() => {
                      setShowProfilePhotoSelectModal(true);
                    }}
                  />
                )}
              </View>

              {/* 프로필 사진 등록 */}
              <SPSelectPhotoModal
                visible={showProfilePhotoSelectModal}
                crop
                cropWithRate={1}
                cropHeightRate={1}
                onClose={async () => {
                  setShowProfilePhotoSelectModal(false);
                }}
                onComplete={data => {
                  updateProfile(data);
                }}
              />

              {/* 이름 */}
              <View>
                <Text style={styles.subTitle}>이름</Text>
                <TextInput
                  value={applyData?.participationName}
                  onChange={e => {
                    if (e.nativeEvent.text?.length > 45) return;
                    const text = Utils.removeSymbolAndBlank(e.nativeEvent.text);
                    setApplyData({ ...applyData, participationName: text });
                  }}
                  placeholder="이름 입력"
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={styles.box}
                />
              </View>

              {/* 성별 */}
              <View style={{ gap: 4 }}>
                <Text style={[styles.subTitle, { marginBottom: 10 }]}>
                  성별
                </Text>
                <View
                  style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                  {genderList.map((item, index) => (
                    <Pressable
                      hitSlop={{
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                      }}
                      key={index}
                      onPress={() => {
                        setApplyData({
                          ...applyData,
                          participationGender: item.value,
                        });
                      }}
                      style={[
                        styles.classTypeBtn,
                        {
                          backgroundColor:
                            applyData?.participationGender === item.value
                              ? '#FF7C10'
                              : 'rgba(135, 141, 150, 0.16)',
                          borderColor:
                            applyData?.participationGender === item.value
                              ? '#FF7C10'
                              : 'rgba(135, 141, 150, 0.16)',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.classTypeText,
                          {
                            color:
                              applyData?.participationGender === item.value
                                ? '#FFF'
                                : 'rgba(46, 49, 53, 0.60)',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 생년월일 */}
              <View>
                <Text style={styles.subTitle}>생년월일</Text>

                {/* 생년월일 버튼 */}
                <View style={styles.contentBtn}>
                  <TouchableOpacity
                    style={styles.contentBtnBox}
                    onPress={() => setShowDatePicker(true)}>
                    {applyData?.participationBirth ? (
                      <Text style={styles.contentBtnText}>
                        {moment(applyData?.participationBirth).format(
                          'YYYY.MM.DD',
                        )}
                      </Text>
                    ) : (
                      <Text
                        style={[styles.contentBtnText, { color: '#757078' }]}>
                        생년월일 선택
                      </Text>
                    )}
                    <View style={{ width: 24, height: 24 }}>
                      <Image source={SPIcons.icCalendar} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 보호자 이름 */}
              <View>
                <Text style={styles.subTitle}>보호자 이름</Text>
                <TextInput
                  placeholder="보호자 이름 입력"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={applyData?.guardianName || ''}
                  onChangeText={text => {
                    if (text?.length > 15) return;
                    setApplyData({ ...applyData, guardianName: text });
                  }}
                  style={styles.box}
                />
              </View>

              {/* 관계 */}
              <View>
                <Text style={styles.subTitle}>관계(선택)</Text>
                <TextInput
                  placeholder="보호자와의 관계 입력"
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={styles.box}
                  value={applyData?.guardianRelationship || ''}
                  onChangeText={text => {
                    if (text?.length > 15) return;
                    setApplyData({ ...applyData, guardianRelationship: text });
                  }}
                />
              </View>

              {/* 보호자 휴대폰 번호 */}
              <View>
                <Text style={styles.subTitle}>보호자 휴대폰 번호</Text>
                <TextInput
                  placeholder="보호자 휴대폰 번호 입력"
                  keyboardType="numeric"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={applyData?.guardianContact || ''}
                  onChangeText={text => {
                    if (text?.length > 15) return;
                    setApplyData({ ...applyData, guardianContact: text });
                  }}
                  style={styles.box}
                />
              </View>

              {/* 본인 휴대폰 번호 */}
              <View>
                <Text style={styles.subTitle}>본인 휴대폰 번호(선택)</Text>
                <TextInput
                  placeholder="휴대폰 번호 입력"
                  keyboardType="numeric"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={applyData?.phoneNumber || ''}
                  onChangeText={text => {
                    if (text?.length > 15) return;
                    setApplyData({ ...applyData, phoneNumber: text });
                  }}
                  style={styles.box}
                />
              </View>

              <View>
                <Text style={styles.subTitle}>주소</Text>
                <View style={styles.addressBox}>
                  <View style={styles.addressButtonBox}>
                    <TextInput
                      placeholder="우편번호"
                      keyboardType="numeric"
                      autoCorrect={false}
                      autoCapitalize="none"
                      editable={false}
                      value={applyData?.postCode || ''}
                      style={[
                        styles.box,
                        {
                          backgroundColor: 'rgba(135, 141, 150, 0.08)',
                          flex: 1,
                        },
                      ]}
                    />

                    <TouchableOpacity
                      style={styles.appealOutlineBtn}
                      onPress={() => {
                        setShowSearchAddressModal(true);
                      }}>
                      <Text style={styles.appealOutlineBtnText}>
                        우편번호 찾기
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    placeholder="주소"
                    keyboardType="numeric"
                    autoCorrect={false}
                    autoCapitalize="none"
                    editable={false}
                    value={applyData?.address || ''}
                    style={[
                      styles.box,
                      { backgroundColor: 'rgba(135, 141, 150, 0.08)', flex: 1 },
                    ]}
                  />

                  <TextInput
                    placeholder="상세주소 입력"
                    autoCorrect={false}
                    autoCapitalize="none"
                    value={applyData?.addressDetail}
                    onChangeText={text => {
                      if (text?.length > 100) return;
                      const txt = Utils.removeSymbolAndBlank(text);
                      setApplyData({ ...applyData, addressDetail: txt });
                    }}
                    style={styles.box}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* 다음 버튼 */}
          <View style={styles.bottomButtonWrap}>
            <PrimaryButton
              onPress={() => {
                NavigationService.navigate(navName.eventApplyInputAcademy);
              }}
              buttonStyle={styles.button}
              disabled={!isFormValid()}
              text="다음"
            />
          </View>
          <SPSearchAddress
            show={showSearchAddressModal}
            setShow={setShowSearchAddressModal}
            onSelect={onSelectAddress}
          />
          <Modal
            transparent={true}
            visible={showDatePicker}
            onRequestClose={() => {
              setSpinning(false);
              setShowDatePicker(false);
            }}>
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPressOut={() => {
                setSpinning(false);
                setShowDatePicker(false);
              }}>
              <View style={styles.modalContent}>
                <View style={styles.modalTitle}>
                  <Text style={styles.modalTitleText}>
                    생년월일을 선택해주세요.
                  </Text>
                </View>
                <DatePicker
                  date={selectedDate}
                  mode="date"
                  onDateChange={date => {
                    setSelectedDate(date);
                  }}
                  onCancel={() => {
                    setSpinning(false);
                    setShowDatePicker(false);
                  }}
                  locale="ko"
                  is24hourSource="locale"
                  onStateChange={state => {
                    setSpinning(state === 'spinning');
                  }}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      { opacity: spinning ? 0.38 : 1 },
                    ]}
                    onPress={e => {
                      e.stopPropagation();
                      if (spinning) return;
                      setApplyData({
                        ...applyData,
                        participationBirth: selectedDate
                          ? moment(selectedDate).format('YYYY-MM-DD')
                          : null,
                      });
                      setShowDatePicker(false);
                    }}>
                    <Text style={styles.confirmButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
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
  avatarWrapper: {
    width: 56,
    height: 56,
  },
  classTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  classTypeText: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(135, 141, 150, 0.22)',
  },
  contentBtnBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contentBtnText: {
    fontSize: 14,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    textAlign: 'left',
  },
  calendar: {
    width: '100%',
  },
  customHeaderContainer: {
    // width: SCREEN_WIDTH - 32 * 2,
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  customHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#000',
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
  addressBox: {
    flexDirection: 'column',
    gap: 4,
  },
  addressButtonBox: {
    flexDirection: 'row',
    gap: 4,
  },
  appealOutlineBtn: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
  },
  appealOutlineBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF7C10',
    borderWidth: 1,
    borderColor: '#FF7C10',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  selectedBackground: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventApplyInputMyInfo;
