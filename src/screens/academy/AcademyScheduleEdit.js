import { useFocusEffect } from '@react-navigation/native';
import { addMonths, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import moment from 'moment';
import React, { memo, useCallback, useRef, useState } from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars/src/index';
import DatePicker from 'react-native-date-picker';
import { TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiDeleteAcademyMngSchedule,
  apiPutAcademyMngSchedule,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import SPModal from '../../components/SPModal';
import Header from '../../components/header';
import { COLORS } from '../../styles/colors';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { useDispatch } from 'react-redux';
import { academyScheduleListAction } from '../../redux/reducers/list/academyScheduleListSlice';

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
LocaleConfig.defaultLocale = 'fr';

function AcademyScheduleEdit({ route }) {
  /**
   * state
   */
  const dispatch = useDispatch();
  const scheduleData = route?.params?.scheduleData;
  const [contents, setContents] = useState('');
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().toDate());
  const [selectedTime, setSelectedTime] = useState(moment().toDate());
  const [startTime, setStartTime] = useState(new Date());
  const [spinning, setSpinning] = useState(false);

  const [checkRemoveModalShow, setCheckRemoveModalShow] = useState(false);
  const [checkEditModalShow, setCheckEditModalShow] = useState(false);

  const trlRef = useRef({ current: { disabled: false } });

  /**
   * api
   */
  const removeSchedule = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiDeleteAcademyMngSchedule(
        scheduleData?.scheduleIdx,
      );
      dispatch(academyScheduleListAction.refresh());
      Utils.openModal({
        title: '완료',
        body: '일정 삭제 완료되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const editSchedule = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const params = {
        scheduleIdx: scheduleData?.scheduleIdx,
        contents,
        dateTime: `${moment(selectedDate).format('YYYY-MM-DD')} ${moment(
          selectedTime,
        ).format('HH:mm')}:00`,
      };
      const { data } = await apiPutAcademyMngSchedule(params);
      dispatch(academyScheduleListAction.refresh());
      Utils.openModal({
        title: '완료',
        body: '일정이 수정 완료되었습니다.',
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

  const handleSelectDate = date => {
    setSelectedDate(date);
    setShowFullCalendar(false);
  };

  const handleConfirmTime = date => {
    setStartTime(date);
    setSelectedTime(date);
    setShowTimePicker(false);
  };

  const handleArrowPress = direction => {
    const currentSelectedDate = new Date(selectedDate);
    const newDate =
      direction === 'left'
        ? format(addMonths(currentSelectedDate, -1), 'yyyy-MM-dd')
        : format(addMonths(currentSelectedDate, 1), 'yyyy-MM-dd');
    setSelectedDate(newDate);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      if (scheduleData && Object.keys(scheduleData).length > 0) {
        const scheduleDate = moment(
          `${scheduleData.date} ${scheduleData.time}`,
        ).toDate();
        setContents(scheduleData.contents);
        setStartTime(scheduleDate);
        setSelectedDate(scheduleDate);
        setSelectedTime(scheduleDate);
      }
    }, [scheduleData]),
  );

  /**
   * render
   */

  const renderCustomHeader = () => {
    const header = format(new Date(selectedDate), 'yyyy.MM', { locale: ko });

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
          padding: 0,
          margin: 0,
        }}>
        <SafeAreaView style={styles.container}>
          <Header title="일정 수정" />

          <View style={styles.contentContainer}>
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
              <TouchableOpacity
                style={styles.contentBtnBox}
                onPress={() => setShowTimePicker(true)}>
                <Text style={styles.contentBtnText}>
                  {moment(selectedTime).format('A hh:mm')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.textInputBox}>
              <TextInput
                value={contents}
                onChangeText={text => {
                  if (text?.length > 45) return;
                  setContents(text);
                }}
                multiline
                textAlignVertical="top"
                numberOfLines={3}
                placeholder="일정을 입력해 주세요."
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.box}
                placeholderTextColor="rgba(46, 49, 53, 0.60)"
              />
              <View
                style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Text style={[styles.lengthCount, { paddingTop: 0 }]}>
                  {contents.length} / 45
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.applyBtn}>
            <TouchableOpacity
              style={[
                styles.applyBtnBox,
                {
                  backgroundColor: COLORS.background,
                  borderWidth: 1,
                  borderColor: COLORS.border1,
                },
              ]}
              disabled={!contents}
              onPress={() => {
                setCheckRemoveModalShow(true);
              }}>
              <Text style={[styles.applyBtnText, { color: COLORS.black }]}>
                삭제
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.applyBtnBox,
                {
                  backgroundColor: !contents ? '#E3E2E1' : '#FF7C10',
                  borderColor: !contents ? '#E3E2E1' : '#FF7C10',
                },
              ]}
              disabled={!contents}
              onPress={() => {
                setCheckEditModalShow(true);
              }}>
              <Text
                style={[
                  styles.applyBtnText,
                  {
                    color: !contents ? 'rgba(46, 49, 53, 0.28)' : '#FFF',
                  },
                ]}>
                수정
              </Text>
            </TouchableOpacity>
          </View>

          {/* 달력 모달창 */}
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
                    current={selectedDate || new Date()}
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
                  date={startTime}
                  mode="time"
                  minuteInterval={10}
                  onDateChange={time => {
                    setStartTime(time);
                  }}
                  onCancel={() => setShowTimePicker(false)}
                  locale="ko"
                  is24hourSource="locale"
                  onStateChange={state => {
                    setSpinning(state === 'spinning');
                  }}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowTimePicker(false)}>
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
                      handleConfirmTime(startTime);
                    }}>
                    <Text style={styles.confirmButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
          <SPModal
            title="확인"
            contents="일정을 삭제하시겠습니까?"
            visible={checkRemoveModalShow}
            onConfirm={() => {
              removeSchedule();
            }}
            onCancel={() => {
              setCheckRemoveModalShow(false);
            }}
            onClose={() => {
              setCheckRemoveModalShow(false);
            }}
          />
          <SPModal
            title="확인"
            contents="일정을 수정하시겠습니까?"
            visible={checkEditModalShow}
            onConfirm={() => {
              editSchedule();
            }}
            onCancel={() => {
              setCheckEditModalShow(false);
            }}
            onClose={() => {
              setCheckEditModalShow(false);
            }}
          />
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

export default memo(AcademyScheduleEdit);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
  },
  contentBtn: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  contentBtnBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  contentBtnText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  applyBtn: {
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  applyBtnBox: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  textInputBox: {
    flexDirection: 'column',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  box: {
    minHeight: 40,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  lengthCount: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
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
  timePickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 4,
    flex: 1,
  },
  picker: {
    width: '100%',
    backgroundColor: '#FFF',
  },
  pickerItem: {
    backgroundColor: '#FFF',
  },
  colon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 8,
    color: '#000',
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
};
