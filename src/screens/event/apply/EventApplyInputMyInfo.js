import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Modal,
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
import { SPSvgs } from '../../../assets/svg';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import Utils from '../../../utils/Utils';
import { useAppState } from '../../../utils/AppStateContext';
import { Calendar, LocaleConfig } from 'react-native-calendars/src/index';
import { addMonths, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import moment from 'moment';

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
  const [member, setMember] = useState({});
  const [career, setCareer] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showProfilePhotoSelectModal, setShowProfilePhotoSelectModal] =
    useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().toDate());
  const [selectedGenderType, setSelectedGenderType] = useState(); // 성별
  const [name, setName] = useState('');
  const [guardianName, setGuardianName] = useState(''); // 보호자 이름
  const [guardianPhone, setGuardianPhone] = useState(''); // 보호자 전화번호

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
  const updateProfile = async ({ fileUrl, imageName, imageType }) => {
    // 로고 이미지 상태 업데이트
    setLogoImage({
      uri: fileUrl,
      name:
        imageName.length <= maxFilename
          ? imageName
          : imageName.substring(
              imageName.length - maxFilename,
              imageName.length,
            ),
      type: imageType,
    });
  };

  const handleSelectDate = date => {
    setSelectedDate(date);
    setShowFullCalendar(false);
  };

  // 입력 필드가 모두 입력되었는지 확인하는 함수
  const isFormValid = () => {
    return (
      name !== '' &&
      selectedGenderType !== undefined &&
      selectedDate !== null &&
      guardianName !== '' &&
      guardianPhone !== ''
    );
  };
  // 성별
  const genderList = [
    { label: '남성', value: 'male' },
    { label: '여성', value: 'female' },
  ];
  // const genderList = Object.values(GENDER).map(item => {
  //   return { label: item.desc, value: item.value };
  // });

  // 생년월일 달력 모달
  const renderCustomHeader = () => {
    const header = format(new Date(selectedDate), 'yyyy.MM', { locale: ko });

    const handleArrowPress = direction => {
      const currentSelectedDate = new Date(selectedDate);
      const newDate =
        direction === 'left'
          ? format(addMonths(currentSelectedDate, -1), 'yyyy-MM-dd')
          : format(addMonths(currentSelectedDate, 1), 'yyyy-MM-dd');
      setSelectedDate(newDate);
    };
    return (
      <View style={styles.customHeaderContainer}>
        <TouchableOpacity onPress={() => handleArrowPress('left')}>
          <Image source={SPIcons.icArrowLeft} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.customHeaderText}>{header}</Text>
        <TouchableOpacity onPress={() => handleArrowPress('right')}>
          <Image source={SPIcons.icArrowRight} style={styles.icon} />
        </TouchableOpacity>
      </View>
    );
  };

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
                <Avatar
                  imageSize={56}
                  imageURL={member?.userProfilePath ?? ''}
                  onPress={() => {
                    setShowProfilePhotoSelectModal(true);
                  }}
                />
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
                  // value={applyData?.acdmyName}
                  // onChange={e => {
                  //   if (e.nativeEvent.text?.length > 45) return;
                  //   const text = Utils.removeSymbolAndBlank(e.nativeEvent.text);
                  //   setApplyData({ ...applyData, acdmyName: text });
                  // }}
                  placeholder="이름 입력"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={name}
                  onChangeText={setName}
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
                        setSelectedGenderType(item.value);
                      }}
                      style={[
                        styles.classTypeBtn,
                        {
                          backgroundColor:
                            selectedGenderType === item.value
                              ? '#FF7C10'
                              : 'rgba(135, 141, 150, 0.16)',
                          borderColor:
                            selectedGenderType === item.value
                              ? '#FF7C10'
                              : 'rgba(135, 141, 150, 0.16)',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.classTypeText,
                          {
                            color:
                              selectedGenderType === item.value
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
                    onPress={() => setShowFullCalendar(true)}>
                    <Text style={styles.contentBtnText}>
                      {moment(selectedDate).format('YYYY.MM.DD')}
                    </Text>
                    <View style={{ width: 24, height: 24 }}>
                      <Image source={SPIcons.icCalendar} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 생년월일 달력 모달창 */}
              <Modal
                transparent={true}
                visible={showFullCalendar}
                onRequestClose={() => setShowFullCalendar(false)}>
                <TouchableOpacity
                  style={styles.modalContainer}
                  activeOpacity={1}
                  onPress={() => setShowFullCalendar(false)}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalTitle}>
                      <Text style={styles.modalTitleText}>
                        날짜를 선택해주세요.
                      </Text>
                    </View>
                    {renderCustomHeader()}
                    <View style={styles.calendar}>
                      <Calendar
                        key={selectedDate}
                        current={moment(selectedDate).format('YYYY-MM-DD')}
                        onDayPress={day => handleSelectDate(day.dateString)}
                        markedDates={{
                          [selectedDate]: { selected: true },
                        }}
                        hideArrows={true}
                        renderHeader={() => null}
                        minDate={moment().toDate()}
                        theme={{
                          backgroundColor: '#ffffff',
                          calendarBackground: '#ffffff',
                          selectedDayTextColor: '#ffffff',
                          selectedDayBackgroundColor: '#FF7C10',
                          todayTextColor: '#FF7C10',
                          arrowColor: 'black',
                          dayTextColor: '#1A1C1E',
                          textDisabledColor: 'rgba(46, 49, 53, 0.16)',
                          textDayFontWeight: '500',
                        }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* 보호자 이름 */}
              <View>
                <Text style={styles.subTitle}>보호자 이름</Text>
                <TextInput
                  placeholder="보호자 이름 입력"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={guardianName}
                  onChangeText={setGuardianName}
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
                  value={guardianPhone}
                  onChangeText={setGuardianPhone}
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
                        NavigationService.navigate(
                          navName.eventApplyInputMyInfo,
                        );
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
                    style={[
                      styles.box,
                      { backgroundColor: 'rgba(135, 141, 150, 0.08)', flex: 1 },
                    ]}
                  />

                  <TextInput
                    placeholder="상세주소 입력"
                    autoCorrect={false}
                    autoCapitalize="none"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingTop: 32,
    marginBottom: 9,
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
});

export default EventApplyInputMyInfo;
