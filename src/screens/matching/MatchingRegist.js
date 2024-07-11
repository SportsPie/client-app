import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import moment from 'moment';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars/src/index';
import DatePicker from 'react-native-date-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGetAcdmyFilters, apiSaveMatch } from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { GENDER } from '../../common/constants/gender';
import { navName } from '../../common/constants/navName';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import SPModal from '../../components/SPModal';
import SPSearchAddress from '../../components/SPSearchAddress';
import { SPToast } from '../../components/SPToast';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles, { FONTS } from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';

const MODAL_TYPE_MATCH_DATE = 'MODAL_TYPE_MATCH_DATE';
const MODAL_TYPE_CLOSE_DATE = 'MODAL_TYPE_CLOSE_DATE';

function MatchingRegist() {
  const scrollViewRef = useRef();
  const today = moment(now).format('YYYY-MM-DD');
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const [now] = useState(new Date());
  const trlRef = useRef({ current: { disabled: false } });

  // 모달
  const [modalType, setModalType] = useState();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [checkModalShow, setCheckModalShow] = useState(false);
  const [methodModalVisible, setMethodModalVisible] = useState(false);
  const [showSearchAddressModal, setShowSearchAddressModal] = useState(false);
  const [spinning, setSpinning] = useState(false);

  // 경기일
  const tenDate = moment();
  const remainder = 10 - (tenDate.minute() % 10);
  const closestTen = moment(tenDate).add(remainder, 'minutes').toDate();
  const [matchDate, setMatchDate] = useState(moment().toDate());
  const [matchTime, setMatchTime] = useState(closestTen);
  const [matchTempTime, setMatchTempTime] = useState(closestTen);

  // 신청기간
  const [closeDate, setCloseDate] = useState(moment().toDate());
  const [closeTime, setCloseTime] = useState(closestTen);
  const [closeTempTime, setCloseTempTime] = useState(closestTen);

  // 주소
  const [addrCity, setAddrCity] = useState('');
  const [addrGu, setAddrGu] = useState('');
  const [addrDong, setAddrDong] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [addr, setAddr] = useState('');
  const [detailAddr, setDetailAddr] = useState('');

  // 경기방식
  const [matchMethod, setMatchMethod] = useState(null);
  const [methodCheck, setMethodCheck] = useState(false);

  // 인풋
  const [title, setTitle] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [matchPlace, setMatchPlace] = useState('');
  const [description, setDescription] = useState('');
  const [classTypeList, setClassTypeList] = useState([]);
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedClassType, setSelectedClassType] = useState('');

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getAcademyFilterList = async () => {
    try {
      const { data } = await apiGetAcdmyFilters();
      if (data) {
        const { CLASS } = data.data;
        if (CLASS && CLASS.length > 0) {
          const list = CLASS.map(v => {
            return { label: v.codeName, value: v.codeSub };
          });
          setClassTypeList(list.reverse());
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const saveMatch = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      const matchTimeObj = new Date(matchTime);
      const hours = String(matchTimeObj.getHours()).padStart(2, '0');
      const minutes = String(matchTimeObj.getMinutes()).padStart(2, '0');
      const matchTimeStr = `${hours}:${minutes}:00`;

      const param = {
        title,
        matchDate: moment(matchDate).format('YYYY-MM-DD'),
        matchTime: moment(matchTimeStr).format('HH:mm:ss'),
        closeDate: combineDateTime(closeDate, closeTime),
        addrCity,
        addrGu,
        addrDong,
        addressFull: `${addr} ${detailAddr}`,
        latitude,
        longitude,
        matchPlace,
        matchMethod,
        description,
        genderCode: selectedGender,
        matchClassCode: selectedClassType,
      };

      const { data } = await apiSaveMatch(param);
      if (data) {
        handleSubmit();
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const handleShowCalendar = type => {
    setModalType(type);
    setShowCalendar(true);
  };

  const handleShowTimePicker = type => {
    if (type === MODAL_TYPE_MATCH_DATE) {
      setMatchTempTime(matchTime);
    } else if (type === MODAL_TYPE_CLOSE_DATE) {
      setCloseTempTime(closeTime);
    }
    setModalType(type);
    setShowTimePicker(true);
  };

  const handleSelectDate = (date, type) => {
    switch (type) {
      case MODAL_TYPE_MATCH_DATE: {
        if (!checkEndIsOverNow(date, matchTime)) {
          Utils.openModal({
            title: '알림',
            body: '경기일은 현재 시간 이후이어야 합니다.',
          });
          break;
        }
        if (!checkMinDate(date, matchTime, false)) {
          Utils.openModal({
            title: '알림',
            body: '마감일은 경기일 이전이어야 합니다.',
          });
          break;
        }
        setMatchDate(date);
        break;
      }
      case MODAL_TYPE_CLOSE_DATE: {
        if (!checkEndIsOverNow(date, closeTime)) {
          Utils.openModal({
            title: '알림',
            body: '마감일은 현재 시간 이후이어야 합니다.',
          });
          break;
        }
        if (!checkMinDate(date, closeTime, true)) {
          Utils.openModal({
            title: '알림',
            body: '마감일은 경기일 이전이어야 합니다.',
          });
          break;
        }
        setCloseDate(date);
        break;
      }
      default:
        break;
    }

    setShowCalendar(false);
    setModalType('');
  };

  const handleSelectTempTime = (time, type) => {
    switch (type) {
      case MODAL_TYPE_MATCH_DATE:
        setMatchTempTime(time);
        break;
      case MODAL_TYPE_CLOSE_DATE:
        setCloseTempTime(time);
        break;
      default:
        break;
    }
  };

  const handleSelectTime = type => {
    switch (type) {
      case MODAL_TYPE_MATCH_DATE: {
        if (!checkEndIsOverNow(matchDate, matchTempTime)) {
          Utils.openModal({
            title: '알림',
            body: '경기일은 현재 시간 이후이어야 합니다.',
          });
          break;
        }
        if (!checkMinDate(matchDate, matchTempTime, false)) {
          Utils.openModal({
            title: '알림',
            body: '마감일은 경기일 이전이어야 합니다.',
          });
          break;
        }
        setMatchTime(matchTempTime);
        break;
      }

      case MODAL_TYPE_CLOSE_DATE: {
        if (!checkEndIsOverNow(closeDate, closeTempTime)) {
          Utils.openModal({
            title: '알림',
            body: '마감일은 현재 시간 이후이어야 합니다.',
          });
          break;
        }
        if (!checkMinDate(closeDate, closeTempTime, true)) {
          Utils.openModal({
            title: '알림',
            body: '마감일은 경기일 이전이어야 합니다.',
          });
          break;
        }
        setCloseTime(closeTempTime);
        break;
      }
      default:
        break;
    }
  };

  const handleMethodSelect = number => {
    setMatchMethod(number);
    setMethodModalVisible(false);
    setMethodCheck(false);
  };

  const handleMethodCheck = () => {
    setMethodCheck(!methodCheck);
    if (methodCheck) {
      setMatchMethod(null);
    } else {
      setMatchMethod(0);
    }
  };

  const handleSubmit = () => {
    SPToast.show({ text: '경기 개설이 완료됐어요', visibilityTime: 3000 });
    NavigationService.navigate(navName.matchingSchedule);
  };

  const handleNoteChange = newText => {
    setDescription(newText);
    scrollViewRef.current.scrollToEnd({ animated: true }); // 스크롤을 맨 아래로 이동
  };

  const isDisabled =
    !title ||
    !matchDate ||
    !closeDate ||
    !addr ||
    !detailAddr ||
    !matchPlace ||
    matchMethod == null ||
    !selectedGender ||
    !selectedClassType ||
    !description ||
    (selectedClassType?.includes('ETC') && !classDesc) ||
    description.length < 10;

  const onSelectAddress = data => {
    setAddr(data.address);
    setAddrCity(data.city);
    setAddrGu(data.gu);
    setAddrDong(data.dong);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    setShowSearchAddressModal(false);
  };

  const combineDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const time = new Date(timeString);
    const formattedDate = `${date.getFullYear()}-${`0${
      date.getMonth() + 1
    }`.slice(-2)}-${`0${date.getDate()}`.slice(-2)}`;
    const formattedTime = `${`0${time.getHours()}`.slice(
      -2,
    )}:${`0${time.getMinutes()}`.slice(-2)}:00`;
    return `${formattedDate} ${formattedTime}`;
  };

  const checkEndIsOverNow = (date, time) => {
    const current = `${moment(now).format('YYYY-MM-DD')} ${moment(now).format(
      'HH:mm:ss',
    )}`;
    const end = `${moment(date).format('YYYY-MM-DD')} ${moment(time).format(
      'HH:mm:ss',
    )}`;
    return moment(end).toDate().getTime() >= moment(current).toDate().getTime();
  };

  const checkMinDate = (date, time, isStart) => {
    let startDateTime = null;
    let endDateTime = null;
    if (isStart) {
      const startD = moment(date).format('YYYY-MM-DD');
      const startT = moment(time).format('HH:mm:ss');
      const endD = moment(matchDate).format('YYYY-MM-DD');
      const endT = moment(matchTime).format('HH:mm:ss');
      startDateTime = moment(`${startD} ${startT}`).toDate().getTime();
      endDateTime = moment(`${endD} ${endT}`).toDate().getTime();
    } else {
      const startD = moment(closeDate).format('YYYY-MM-DD');
      const startT = moment(closeTime).format('HH:mm:ss');
      const endD = moment(date).format('YYYY-MM-DD');
      const endT = moment(time).format('HH:mm:ss');
      startDateTime = moment(`${startD} ${startT}`).toDate().getTime();
      endDateTime = moment(`${endD} ${endT}`).toDate().getTime();
    }
    if (startDateTime <= endDateTime) {
      return true;
    }
    return false;
  };

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  const onFocus = async () => {
    try {
      await getAcademyFilterList();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <DismissKeyboard style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="경기개설" />

        <SPKeyboardAvoidingView
          behavior="padding"
          isPan
          isResize
          keyboardVerticalOffset={0}
          style={{
            flex: 1,
            backgroundColor: COLORS.white,
            padding: 0,
            margin: 0,
          }}>
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            <View style={styles.contentBox}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.subTitle}>경기제목</Text>
                    <View style={styles.subInputBox}>
                      <TextInput
                        style={styles.subTextInput}
                        placeholder="경기 제목을 입력하세요"
                        placeholderTextColor="#2E313599"
                        value={title}
                        onChangeText={setTitle}
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.subTitle, { marginBottom: 4 }]}>
                    경기일
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleShowCalendar(MODAL_TYPE_MATCH_DATE)}>
                    <View style={styles.subDateDetail}>
                      <Text style={styles.subDateText}>
                        {matchDate
                          ? format(new Date(matchDate), 'yyyy.MM.dd')
                          : '선택하세요'}
                      </Text>
                      <Image
                        source={SPIcons.icArrowDown}
                        style={styles.dropdownIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subTitle, { marginBottom: 4 }]}>
                    시간
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleShowTimePicker(MODAL_TYPE_MATCH_DATE)}>
                    <View style={styles.subDateDetail}>
                      <Text style={styles.subDateText}>
                        {matchTime
                          ? format(matchTime, 'a hh:mm')
                              .replace('AM', '오전')
                              .replace('PM', '오후')
                          : '선택하세요'}
                      </Text>
                      <Image
                        source={SPIcons.icArrowDown}
                        style={styles.dropdownIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.subTitle, { marginBottom: 4 }]}>
                    마감일
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleShowCalendar(MODAL_TYPE_CLOSE_DATE)}>
                    <View style={styles.subDateDetail}>
                      <Text style={styles.subDateText}>
                        {closeDate
                          ? format(new Date(closeDate), 'yyyy.MM.dd')
                          : '선택하세요'}
                      </Text>
                      <Image
                        source={SPIcons.icArrowDown}
                        style={styles.dropdownIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subTitle, { marginBottom: 4 }]}>
                    시간
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleShowTimePicker(MODAL_TYPE_CLOSE_DATE)}>
                    <View style={styles.subDateDetail}>
                      <Text style={styles.subDateText}>
                        {closeTime
                          ? format(closeTime, 'a hh:mm')
                              .replace('AM', '오전')
                              .replace('PM', '오후')
                          : '선택하세요'}
                      </Text>
                      <Image
                        source={SPIcons.icArrowDown}
                        style={styles.dropdownIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subTitle, { marginBottom: 4 }]}>
                    경기장 주소
                  </Text>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        setShowSearchAddressModal(true);
                      }}>
                      <View
                        style={[
                          styles.box,
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                          },
                        ]}>
                        <Image
                          source={SPIcons.icBlueSearch}
                          style={{ width: 20, height: 20 }}
                        />
                        <Text style={styles.boxText}>
                          {addr || '도로명, 건물명 또는 지번으로 검색하세요'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{ paddingTop: 8 }}>
                    <TextInput
                      placeholder="상세주소를 입력하세요"
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={styles.box}
                      value={detailAddr}
                      onChange={e => {
                        if (e.nativeEvent.text?.length > 50) return;
                        setDetailAddr(e.nativeEvent.text);
                      }}
                      placeholderTextColor="#2E313599"
                    />
                  </View>
                  <SPSearchAddress
                    show={showSearchAddressModal}
                    setShow={setShowSearchAddressModal}
                    onSelect={onSelectAddress}
                  />
                </View>
              </View>

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.subTitle}>경기 장소</Text>
                    <View style={styles.subInputBox}>
                      <TextInput
                        style={styles.subTextInput}
                        placeholder="경기가 진행되는 장소 이름을 입력해주세요"
                        value={matchPlace}
                        onChangeText={setMatchPlace}
                        placeholderTextColor="#2E313599"
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.subTitle}>경기방식</Text>
                    <View style={styles.subInputBox}>
                      <TouchableOpacity
                        style={styles.subTextInput}
                        onPress={() => {
                          setMethodModalVisible(true);
                        }}>
                        <View style={styles.viewDropDown}>
                          <Text style={styles.dropdownTitle}>
                            {!matchMethod && !methodCheck
                              ? '선택'
                              : matchMethod === 0
                              ? '협의 후 결정'
                              : `${matchMethod} : ${matchMethod}`}
                          </Text>
                          <Image
                            source={SPIcons.icArrowDown}
                            style={styles.dropdownIcon}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                      <TouchableOpacity onPress={handleMethodCheck}>
                        <Image
                          source={
                            methodCheck
                              ? SPIcons.icChecked
                              : SPIcons.icOutlineCheck
                          }
                          style={{ width: 32, height: 32 }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleMethodCheck()}>
                        <Text style={styles.checkText}>협의 후 결정</Text>
                      </TouchableOpacity>
                    </View>
                    <Modal
                      animationType="slide"
                      transparent
                      visible={methodModalVisible}
                      onRequestClose={() => {
                        setMethodModalVisible(false);
                      }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          padding: 16,
                        }}
                        onPress={() => setMethodModalVisible(false)}>
                        <View
                          style={{
                            width: '100%',
                            backgroundColor: '#fff',
                            padding: 16,
                            borderRadius: 16,
                          }}>
                          {[...Array(8).keys()].map(number => (
                            <TouchableOpacity
                              key={number}
                              onPress={() => handleMethodSelect(number + 4)}>
                              <Text style={styles.modalText}>{`${number + 4}:${
                                number + 4
                              }`}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>
                </View>
              </View>

              <View>
                <Text style={styles.textStyle}>성별</Text>
                <View
                  style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {Object.values(GENDER).map((gender, index) => (
                    <TouchableOpacity
                      style={[
                        styles.classTypeBtn,
                        {
                          backgroundColor:
                            selectedGender === gender.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                          borderColor:
                            selectedGender === gender.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                        },
                        selectedGender === gender.value &&
                          styles.selectedButton, // 선택된 주 사용발에 대한 스타일 적용
                      ]}
                      onPress={() => setSelectedGender(gender.value)}>
                      <Text
                        style={[
                          styles.classTypeText,
                          {
                            color:
                              selectedGender === gender.value
                                ? '#FFF'
                                : 'rgba(46, 49, 53, 0.60)',
                          },
                        ]}>
                        {gender.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.textStyle}>클래스</Text>
                <View
                  style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {classTypeList &&
                    classTypeList.length > 0 &&
                    classTypeList.map(item => {
                      return (
                        <TouchableOpacity
                          onPress={() => setSelectedClassType(item.value)}
                          style={[
                            styles.classTypeBtn,
                            {
                              backgroundColor:
                                selectedClassType === item.value
                                  ? '#FF671F'
                                  : 'rgba(135, 141, 150, 0.16)',
                              borderColor:
                                selectedClassType === item.value
                                  ? '#FF671F'
                                  : 'rgba(135, 141, 150, 0.16)',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.classTypeText,
                              {
                                color:
                                  selectedClassType === item.value
                                    ? '#FFF'
                                    : 'rgba(46, 49, 53, 0.60)',
                              },
                            ]}>
                            {item?.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
                {selectedClassType === 'CLS_ETC' && (
                  <TextInput
                    value={classDesc}
                    onChange={e => {
                      if (e.nativeEvent.text?.length > 45) return;
                      setClassDesc(e.nativeEvent.text);
                    }}
                    placeholder="기타 내용을 입력해주세요."
                    placeholderTextColor="#2E313599"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={[styles.checkShowInputBox, { marginTop: 8 }]}
                  />
                )}
              </View>

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.textStyle}>내용</Text>
                    <TextInput
                      value={description}
                      multiline
                      textAlignVertical="top"
                      numberOfLines={6}
                      onChange={e => {
                        if (e.nativeEvent.text?.length > 1000) return;
                        handleNoteChange(e.nativeEvent.text);
                      }}
                      placeholder="경기에 대한 내용을 10자 이상 입력해주세요"
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={styles.subTextInputBox}
                      placeholderTextColor="#2E313599"
                      keyboardShouldPersistTaps="handled"
                    />
                    <Text style={styles.textLengthText}>
                      {Utils.changeNumberComma(description?.length ?? 0)} /
                      1,000
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.clearBtn,
              isDisabled ? styles.disabledClearBtn : styles.enabledClearBtn,
            ]}
            onPress={() => saveMatch(true)}
            disabled={isDisabled}>
            <Text
              style={[
                styles.clearBtnText,
                isDisabled
                  ? styles.disabledClearBtnText
                  : styles.enabledClearBtnText,
              ]}>
              경기개설
            </Text>
          </TouchableOpacity>
          {/* 달력 모달창 */}
          <Modal
            transparent={true}
            visible={showCalendar}
            onRequestClose={() => setShowCalendar(false)}>
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={() => setShowCalendar(false)}>
              <View style={styles.modalContent}>
                <View style={styles.modalTitle}>
                  <Text style={styles.modalTitleText}>
                    날짜를 선택해주세요.
                  </Text>
                </View>
                <View style={styles.calendar}>
                  <Calendar
                    current={moment(now).format('YYYY-MM-DD')}
                    onDayPress={day =>
                      handleSelectDate(day.dateString, modalType)
                    }
                    markedDates={{
                      [modalType === MODAL_TYPE_MATCH_DATE
                        ? moment(matchDate).format('YYYY-MM-DD')
                        : moment(closeDate).format('YYYY-MM-DD')]: {
                        selected: true,
                      },
                    }}
                    theme={{
                      backgroundColor: '#ffffff',
                      calendarBackground: '#ffffff',
                      selectedDayTextColor: '#ffffff',
                      selectedDayBackgroundColor: '#FF671F',
                      todayTextColor: '#FF671F',
                      arrowColor: 'black',
                      dayTextColor: '#1A1C1E',
                      textDisabledColor: 'rgba(46, 49, 53, 0.16)',
                      textDayFontWeight: '500',
                      textMonthFontFamily: FONTS.PretendardBold,
                      textMonthFontWeight: '600',
                    }}
                    monthFormat="yyyy년 MM월"
                    minDate={today}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* 시간 모달창 */}
          <Modal
            transparent={true}
            visible={showTimePicker}
            onRequestClose={() => setShowTimePicker(false)}>
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPressOut={() => setShowTimePicker(false)}>
              <View style={styles.modalContent}>
                <View style={styles.modalTitle}>
                  <Text style={styles.modalTitleText}>
                    일정 시간을 선택해주세요.
                  </Text>
                </View>
                <DatePicker
                  date={
                    modalType === MODAL_TYPE_MATCH_DATE
                      ? matchTempTime
                      : closeTempTime
                  }
                  mode="time"
                  onDateChange={time => {
                    handleSelectTempTime(time, modalType);
                  }}
                  minuteInterval={10}
                  onCancel={() => setShowTimePicker(false)}
                  locale="ko"
                  is24hourSource="locale"
                  theme="light"
                  onStateChange={state => {
                    setSpinning(state === 'spinning');
                  }}
                />
                <View style={styles.buttonContainer}>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        spinning
                          ? styles.disabledClearBtn
                          : styles.enabledClearBtn,
                      ]}
                      disabled={spinning}
                      onPress={async e => {
                        e.stopPropagation();
                        if (spinning) return;
                        setShowTimePicker(false);
                        handleSelectTime(modalType);
                      }}>
                      <Text style={styles.confirmButtonText}>확인</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
          <SPModal
            title="확인"
            contents="경기를 등록하시겠습니까?"
            visible={checkModalShow}
            onConfirm={() => {
              saveMatch();
            }}
            onCancel={() => {
              setCheckModalShow(false);
            }}
            onClose={() => {
              setCheckModalShow(false);
            }}
          />
        </SPKeyboardAvoidingView>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(MatchingRegist);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textStyle: {
    width: '100%',
    height: 16,
    marginBottom: 3,
    marginTop: 14,
    fontSize: 12,
  },
  textLengthText: {
    ...fontStyles.fontSize12_Regular,
    textAlign: 'right',
    color: COLORS.labelAlternative,
    letterSpacing: 0.3,
  },
  selectedButton: {
    backgroundColor: '#FF671F',
  },
  buttonContainer: {
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDropDown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  contentBox: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 0,
  },
  subInputBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  subTextInput: {
    flex: 1,
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
  subDateDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  subDateText: {
    fontSize: 14,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  subTextInputBox: {
    minHeight: 98,
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
  checkText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
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
  checkShowInputBox: {
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#FF671F',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  clearBtn: {
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  enabledClearBtn: {
    backgroundColor: '#FF671F',
  },
  disabledClearBtn: {
    backgroundColor: '#E3E2E1',
  },
  enabledClearBtnText: {
    color: '#FFF',
  },
  disabledClearBtnText: {
    color: 'rgba(46, 49, 53, 0.28)',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
    paddingVertical: 16,
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
  picker: {
    width: '100%',
    backgroundColor: '#FFF',
  },
  pickerItem: {
    backgroundColor: '#FFF',
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
    backgroundColor: '#FF671F',
    borderWidth: 1,
    borderColor: '#FF671F',
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
});
