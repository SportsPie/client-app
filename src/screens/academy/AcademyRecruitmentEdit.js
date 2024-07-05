/* eslint-disable no-shadow */
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars/src/index';
import DatePicker from 'react-native-date-picker';
import { TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiGetAcademyConfigMngRecruitClasses,
  apiGetAcademyConfigMngRecruitsDetail,
  apiPutAcademyConfigMngRecruits,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { GENDER } from '../../common/constants/gender';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import SPModal from '../../components/SPModal';
import { COLORS } from '../../styles/colors';
import { FONTS } from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import Header from '../../components/header';

function AcademyRecruitmentEdit({ route }) {
  /**
   * state
   */
  const recruitIdx = route?.params?.recruitIdx;
  const trlRef = useRef({ current: { disabled: false } });

  // 성별
  const genderList = Object.values(GENDER).map(item => {
    return { label: item.desc, value: item.value };
  });

  // 클래스
  const [classTypeList, setClassTypeList] = useState([]);

  // 모집기간
  const periodTypes = {
    fifteen: '15일',
    oneMonth: '1개월',
    twoMonth: '2개월',
    directly: '직접설정',
    always: '상시모집',
  };

  const recruitmentPeriodList = Object.values(periodTypes).map(item => {
    return { label: item, value: item };
  });

  // 제목
  const [title, setTitle] = useState('');
  // 내용
  const [description, setDescription] = useState('');
  // 성별
  const [selectedGenderType, setSelectedGenderType] = useState();
  // 클래스
  const [selectedClassType, setSelectedClassType] = useState('');
  const [etc, setEtc] = useState('');
  // 모집기간
  const [selectedPeriodType, setSelectedPeriodType] = useState();
  // 모집기간 날짜, 시간
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().toDate());
  const [startTime, setStartTime] = useState(moment().toDate());
  const [endTime, setEndTime] = useState(moment().endOf('day').toDate());
  const [startTempTime, setStartTempTime] = useState(moment().toDate());
  const [endTempTime, setEndTempTime] = useState(
    moment().endOf('day').toDate(),
  );
  // modal
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [openStartTime, setOpenStartTime] = useState(false);
  const [openEndTime, setOpenEndTime] = useState(false);
  const [registModalShow, setRegistModalShow] = useState(false);
  const [spinning, setSpinning] = useState(false); // 시간 선택기 슬라이드중 확인

  // 모집기간 상시모집 클릭시
  const isAlwaysRecruiting = selectedPeriodType === periodTypes.always;

  /**
   * api
   */
  const getRecruitDetail = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngRecruitsDetail(recruitIdx);
      const recruit = data.data?.recruit;
      if (recruit) {
        setTitle(recruit.title);
        setDescription(recruit.contents);
        setSelectedGenderType(recruit.genderCode);
        setSelectedClassType(recruit.classCode);

        if (recruit.endDate) {
          setStartDate(moment(recruit.startDate).toDate());
          setStartTime(moment(recruit.startDate).toDate());
          setEndDate(moment(recruit.endDate).toDate());
          setEndTime(moment(recruit.endDate).toDate());
          setSelectedPeriodType(periodTypes.directly);
        } else {
          // 상시모집
          setStartDate(moment(recruit.startDate).toDate());
          setStartTime(moment(recruit.startDate).toDate());
          setEndDate(moment(recruit.startDate).toDate());
          setEndTime(moment(recruit.startDate).toDate());
          setSelectedPeriodType(periodTypes.always);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getClassTypes = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngRecruitClasses();
      if (data.data && data.data.length > 0) {
        const list = data.data.map(v => {
          return { label: v.planTypeName, value: v.planTypeCode };
        });
        const etcItem = data.data.find(v => v.planTypeCode.includes('ETC'));
        if (etcItem) setEtc(etcItem.etc);
        setClassTypeList(list.reverse());
        setSelectedClassType(list[0].value);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const edit = async () => {
    closeModal();
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const params = {
        recruitIdx,
        title,
        contents: description,
        genderCode: selectedGenderType,
        classCode: selectedClassType,
        startDate: `${moment(startDate).format('YYYY-MM-DD')} ${moment(
          startTime,
        ).format('HH:mm:ss')}`,
        endDate: !isAlwaysRecruiting
          ? `${moment(endDate).format('YYYY-MM-DD')} ${moment(endTime).format(
              'HH:mm:ss',
            )}`
          : null,
      };
      const { data } = await apiPutAcademyConfigMngRecruits(params);
      Utils.openModal({
        title: '성공',
        body: '공고가 수정되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  // 클래스 기타 클릭시 Input
  const checkShowEtcInput = selectedClassType => {
    return selectedClassType?.includes('ETC');
  };

  const handlePeriodTypeChange = () => {
    if (!selectedPeriodType) return;
    if (
      selectedPeriodType !== periodTypes.always &&
      selectedPeriodType !== periodTypes.directly
    ) {
      const start = moment();
      let end = null;
      switch (selectedPeriodType) {
        case periodTypes.fifteen: {
          end = moment().add(15, 'days');
          break;
        }
        case periodTypes.oneMonth: {
          end = moment().add(1, 'months');
          break;
        }
        case periodTypes.twoMonth: {
          end = moment().add(2, 'months');
          break;
        }
        default:
          break;
      }
      const startOfDay = end.clone();
      const endOfDay = end.clone().endOf('day');
      setStartDate(start.toDate());
      setEndDate(end.toDate());
      setStartTime(startOfDay.toDate());
      setEndTime(endOfDay.toDate());
    }

    if (selectedPeriodType === periodTypes.always) {
      setStartDate(moment().toDate());
      setStartTime(moment().startOf('day').toDate());
    }
    if (selectedPeriodType === periodTypes.directly) {
      setStartTempTime(startTime);
      setEndTempTime(endTime);
    }
  };

  const openModal = () => {
    setRegistModalShow(true);
  };
  const closeModal = () => {
    setRegistModalShow(false);
  };

  // 공고 등록 버튼 활성화 조건
  const isFormValid = () => {
    return (
      title &&
      description &&
      description.length > 9 &&
      selectedGenderType &&
      selectedClassType &&
      selectedPeriodType &&
      (isAlwaysRecruiting || (startDate && endDate && startTime && endTime))
    );
  };

  const checkMinDate = (date, time, isStart) => {
    let startDateTime = null;
    let endDateTime = null;
    if (isStart) {
      const startD = moment(date).format('YYYY-MM-DD');
      const startT = moment(time).format('HH:mm:ss');
      const endD = moment(endDate).format('YYYY-MM-DD');
      const endT = moment(endTime).format('HH:mm:ss');
      startDateTime = moment(`${startD} ${startT}`).toDate().getTime();
      endDateTime = moment(`${endD} ${endT}`).toDate().getTime();
    } else {
      const startD = moment(startDate).format('YYYY-MM-DD');
      const startT = moment(startTime).format('HH:mm:ss');
      const endD = moment(date).format('YYYY-MM-DD');
      const endT = moment(time).format('HH:mm:ss');
      startDateTime = moment(`${startD} ${startT}`).toDate().getTime();
      endDateTime = moment(`${endD} ${endT}`).toDate().getTime();
    }
    if (startDateTime <= endDateTime) {
      return true;
    }
    Utils.openModal({
      title: '알림',
      body: '종료일(시간)은 시작일(시간)보다 빠를 수 없습니다.',
    });
    return false;
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getRecruitDetail();
      getClassTypes();
    }, []),
  );

  useEffect(() => {
    handlePeriodTypeChange();
  }, [selectedPeriodType]);

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          padding: 0,
          margin: 0,
        }}>
        <SafeAreaView style={styles.container}>
          <Header title="아카데미 회원 모집 공고" />
          <ScrollView
            style={styles.subContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.subBox}>
              <Text style={styles.mainTitle}>공고 정보</Text>
              {/* 제목 */}
              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>제목</Text>
                <View style={styles.subInputBox}>
                  <TextInput
                    style={styles.subTextInput}
                    placeholder="공고 제목을 입력해주세요."
                    value={title}
                    onChangeText={value => {
                      if (value?.length > 45) return;
                      setTitle(value);
                    }}
                  />
                </View>
              </View>
              {/* 내용 */}
              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>내용</Text>
                <TextInput
                  value={description}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  numberOfLines={6}
                  onChangeText={value => {
                    setDescription(value);
                  }}
                  placeholder="모집에 대한 내용을 10자 이상 입력해주세요."
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={styles.subTextInputBox}
                />
                {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={styles.lengthCount}>{description.length} / 1,000</Text>
          </View> */}
              </View>

              <View style={{ gap: 4 }}>
                <Text style={[styles.subTitle, { marginBottom: 4 }]}>성별</Text>
                <View
                  style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {genderList.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedGenderType(item.value);
                      }}
                      style={[
                        styles.classTypeBtn,
                        {
                          backgroundColor:
                            selectedGenderType === item.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                          borderColor:
                            selectedGenderType === item.value
                              ? '#FF671F'
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
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>클래스</Text>
                <View
                  style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {classTypeList.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedClassType(item.value);
                      }}
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
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {checkShowEtcInput(selectedClassType) && (
                  <TextInput
                    editable={false}
                    style={[styles.checkShowInputBox, { marginTop: 4 }]}
                    value={etc}
                  />
                )}
              </View>
            </View>

            <View style={styles.subBox}>
              <Text style={styles.mainTitle}>모집기간</Text>

              <View>
                <View
                  style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {recruitmentPeriodList.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedPeriodType(item.value);
                      }}
                      style={[
                        styles.classTypeBtn,
                        {
                          backgroundColor:
                            selectedPeriodType === item.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                          borderColor:
                            selectedPeriodType === item.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.classTypeText,
                          {
                            color:
                              selectedPeriodType === item.value
                                ? '#FFF'
                                : 'rgba(46, 49, 53, 0.60)',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.subDateContainer}>
                <View style={styles.subDateList}>
                  <View style={styles.subDateBox}>
                    <Text style={styles.subTitle}>시작일</Text>
                    <TouchableOpacity
                      onPress={() =>
                        !isAlwaysRecruiting && setOpenStartDate(true)
                      }
                      disabled={isAlwaysRecruiting}>
                      <View
                        style={[
                          styles.subDateDetail,
                          isAlwaysRecruiting && { borderWidth: 0 },
                        ]}>
                        <Text
                          style={[
                            styles.subDateText,
                            isAlwaysRecruiting && {
                              color: 'rgba(46, 49, 53, 0.60)',
                            },
                          ]}>
                          {moment(startDate).format('YYYY.MM.DD')}
                        </Text>
                        <Image
                          source={SPIcons.icArrowDown}
                          style={[
                            { width: 20, height: 20 },
                            isAlwaysRecruiting && { opacity: 0.4 },
                          ]} // 여기에서 투명도 설정
                        />
                      </View>
                    </TouchableOpacity>
                    <Modal
                      transparent={true}
                      visible={openStartDate}
                      onRequestClose={() => setOpenStartDate(false)}>
                      <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setOpenStartDate(false)}>
                        <View style={styles.modalContent}>
                          <View style={styles.modalTitle}>
                            <Text style={styles.modalTitleText}>
                              날짜를 선택해주세요.
                            </Text>
                          </View>
                          <View style={styles.calendar}>
                            <Calendar
                              current={moment().format('YYYY-MM-DD')}
                              onDayPress={date => {
                                setOpenStartDate(false);
                                if (
                                  checkMinDate(
                                    moment(date.dateString).toDate(),
                                    startTime,
                                    true,
                                  )
                                ) {
                                  setStartDate(
                                    moment(date.dateString).toDate(),
                                  );
                                  setSelectedPeriodType(periodTypes.directly);
                                }
                              }}
                              markedDates={{
                                [moment(startDate).format('YYYY-MM-DD')]: {
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
                              // minDate={moment().format('YYYY-MM-DD')}
                              maxDate={moment(endDate).format('YYYY-MM-DD')}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>

                  <View style={styles.subDateBox}>
                    <Text style={styles.subTitle}>시간</Text>
                    <TouchableOpacity
                      onPress={() =>
                        !isAlwaysRecruiting && setOpenStartTime(true)
                      }
                      disabled={isAlwaysRecruiting}>
                      <View
                        style={[
                          styles.subDateDetail,
                          isAlwaysRecruiting && { borderWidth: 0 },
                        ]}>
                        <Text
                          style={[
                            styles.subDateText,
                            isAlwaysRecruiting && {
                              color: 'rgba(46, 49, 53, 0.60)',
                            },
                          ]}>
                          {moment(startTime).format('A hh:mm')}
                        </Text>
                        <Image
                          source={SPIcons.icArrowDown}
                          style={[
                            { width: 20, height: 20 },
                            isAlwaysRecruiting && { opacity: 0.4 },
                          ]} // 여기에서 투명도 설정
                        />
                      </View>
                    </TouchableOpacity>
                    <Modal
                      transparent={true}
                      visible={openStartTime}
                      onRequestClose={() => setOpenStartTime(false)}>
                      <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPressOut={() => setOpenStartTime(false)}>
                        <View style={styles.modalContent}>
                          <View style={styles.modalTitle}>
                            <Text style={styles.modalTitleText}>
                              일정 시간을 선택해주세요.
                            </Text>
                          </View>
                          <DatePicker
                            date={startTime}
                            mode="time"
                            minuteInterval={10}
                            open={openStartTime}
                            onDateChange={time => {
                              setStartTempTime(time);
                            }}
                            onCancel={() => setOpenStartTime(false)}
                            locale="ko"
                            is24hourSource="locale"
                            theme="light"
                            onStateChange={state => {
                              setSpinning(state === 'spinning');
                            }}
                          />
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity
                              style={[
                                styles.confirmButton,
                                { opacity: spinning ? 0.38 : 1 },
                              ]}
                              onPress={async e => {
                                e.stopPropagation();
                                if (spinning) return;
                                setOpenStartTime(false);
                                if (
                                  checkMinDate(
                                    startDate,
                                    moment(startTempTime).toDate(),
                                    true,
                                  )
                                ) {
                                  setStartTime(moment(startTempTime).toDate());
                                  setSelectedPeriodType(periodTypes.directly);
                                }
                              }}>
                              <Text style={styles.confirmButtonText}>확인</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>
                </View>

                <View style={styles.subDateList}>
                  <View style={styles.subDateBox}>
                    <Text style={styles.subTitle}>종료일</Text>
                    <TouchableOpacity
                      onPress={() =>
                        !isAlwaysRecruiting && setOpenEndDate(true)
                      }
                      disabled={isAlwaysRecruiting}>
                      <View
                        style={[
                          styles.subDateDetail,
                          isAlwaysRecruiting && { borderWidth: 0 },
                        ]}>
                        <Text
                          style={[
                            styles.subDateText,
                            isAlwaysRecruiting && {
                              color: 'rgba(46, 49, 53, 0.60)',
                            },
                          ]}>
                          {moment(endDate).format('YYYY.MM.DD')}
                        </Text>
                        <Image
                          source={SPIcons.icArrowDown}
                          style={[
                            { width: 20, height: 20 },
                            isAlwaysRecruiting && { opacity: 0.4 },
                          ]} // 여기에서 투명도 설정
                        />
                      </View>
                    </TouchableOpacity>
                    <Modal
                      transparent={true}
                      visible={openEndDate}
                      onRequestClose={() => setOpenEndDate(false)}>
                      <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setOpenEndDate(false)}>
                        <View style={styles.modalContent}>
                          <View style={styles.modalTitle}>
                            <Text style={styles.modalTitleText}>
                              날짜를 선택해주세요.
                            </Text>
                          </View>
                          <View style={styles.calendar}>
                            <Calendar
                              current={moment().format('YYYY-MM-DD')}
                              onDayPress={date => {
                                setOpenEndDate(false);
                                if (
                                  checkMinDate(
                                    moment(date.dateString).toDate(),
                                    endTime,
                                    false,
                                  )
                                ) {
                                  setEndDate(moment(date.dateString).toDate());
                                  setSelectedPeriodType(periodTypes.directly);
                                }
                              }}
                              markedDates={{
                                [moment(endDate).format('YYYY-MM-DD')]: {
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
                              minDate={moment(startDate).format('YYYY-MM-DD')}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>

                  <View style={styles.subDateBox}>
                    <Text style={styles.subTitle}>시간</Text>
                    <TouchableOpacity
                      onPress={() =>
                        !isAlwaysRecruiting && setOpenEndTime(true)
                      }
                      disabled={isAlwaysRecruiting}>
                      <View
                        style={[
                          styles.subDateDetail,
                          isAlwaysRecruiting && { borderWidth: 0 },
                        ]}>
                        <Text
                          style={[
                            styles.subDateText,
                            isAlwaysRecruiting && {
                              color: 'rgba(46, 49, 53, 0.60)',
                            },
                          ]}>
                          {moment(endTime).format('A hh:mm')}
                        </Text>
                        <Image
                          source={SPIcons.icArrowDown}
                          style={[
                            { width: 20, height: 20 },
                            isAlwaysRecruiting && { opacity: 0.4 },
                          ]} // 여기에서 투명도 설정
                        />
                      </View>
                    </TouchableOpacity>
                    <Modal
                      transparent={true}
                      visible={openEndTime}
                      onRequestClose={() => setOpenEndTime(false)}>
                      <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPressOut={() => setOpenEndTime(false)}>
                        <View style={styles.modalContent}>
                          <View style={styles.modalTitle}>
                            <Text style={styles.modalTitleText}>
                              일정 시간을 선택해주세요.
                            </Text>
                          </View>
                          <DatePicker
                            date={endTime}
                            mode="time"
                            minuteInterval={10}
                            onDateChange={time => {
                              setEndTempTime(time);
                            }}
                            onCancel={() => setOpenEndTime(false)}
                            locale="ko"
                            is24hourSource="locale"
                            theme="light"
                            onStateChange={state => {
                              setSpinning(state === 'spinning');
                            }}
                          />
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity
                              style={[
                                styles.confirmButton,
                                { opacity: spinning ? 0.38 : 1 },
                              ]}
                              onPress={async e => {
                                e.stopPropagation();
                                if (spinning) return;
                                setOpenEndTime(false);
                                if (
                                  checkMinDate(
                                    endDate,
                                    moment(endTempTime).toDate(),
                                    false,
                                  )
                                ) {
                                  setEndTime(moment(endTempTime).toDate());
                                  setSelectedPeriodType(periodTypes.directly);
                                }
                              }}>
                              <Text style={styles.confirmButtonText}>확인</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.subBtn,
              {
                backgroundColor: isFormValid() ? '#FF671F' : '#E3E2E1',
              },
            ]}>
            <TouchableOpacity
              style={styles.subBtnBox}
              disabled={!isFormValid()}
              onPress={() => {
                openModal();
              }}>
              <Text
                style={[
                  styles.subBtnText,
                  {
                    color: isFormValid() ? '#FFF' : 'rgba(46, 49, 53, 0.28)',
                  },
                ]}>
                공고 수정
              </Text>
            </TouchableOpacity>
          </View>
          <SPModal
            title="수정 확인"
            contents="공고를 수정하시겠습니까?"
            visible={registModalShow}
            onConfirm={() => {
              edit();
            }}
            onCancel={() => {
              closeModal();
            }}
            onClose={() => {
              closeModal();
            }}
          />
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

export default memo(AcademyRecruitmentEdit);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  subContainer: {
    flex: 1,
    paddingHorizontal: 16,
    // paddingTop: 24,
  },
  subBox: {
    flexDirection: 'column',
    gap: 16,
    paddingVertical: 24,
  },
  mainTitle: {
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
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 15,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
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
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
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
  subDateContainer: {
    gap: 16,
  },
  subDateList: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subDateBox: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
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
    paddingVertical: 14,
  },
  subBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  subBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
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
  buttonContainer: {
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
};
