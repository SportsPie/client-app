import React, { useState, useEffect } from 'react';
import { Modal, View, Button } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

LocaleConfig.locales.ko = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
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
};

LocaleConfig.defaultLocale = 'ko';

function SPCalendarModal({
  modalVisible,
  setModalVisible,
  confirmDate, // 현재날짜 체크
  setConfirmDate, // 수정 날짜 체크
  setConfirmDateDayOfWeek, // 요일 값 // 월 화 수 목 금 토 일
  onlyTimeCheck, // 시간만 사용
  timeCheck, // 시간 사용 여부 체크
  confirmTime, // 선택 시간
  setConfirmTime, // 시간
  setViewTime, // 보여주는 시간
}) {
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectDate, setSelectDate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const markedSelectedDates = {
    [confirmDate]: {
      selected: true,
    },
  };

  useEffect(() => {
    if (modalVisible) {
      if (onlyTimeCheck) {
        setTimePickerVisibility(modalVisible);
      } else {
        setShowModal(modalVisible);
      }
    }
  }, [modalVisible]);

  const handleDayPress = day => {
    setModalVisible(false);
    if (timeCheck) {
      onCloseModal();
      setTimePickerVisibility(true);
      setSelectDate(day.dateString);
    } else {
      onCloseModal();
      setConfirmDate(day.dateString);
      if (setConfirmDateDayOfWeek) {
        setConfirmDateDayOfWeek(getDayOfWeek(day.dateString));
      }
    }
  };

  const handleTimeConfirm = time => {
    if (onlyTimeCheck) {
      setConfirmTime(time.toLocaleTimeString('en-US', { hour12: false }));
      if (setViewTime) {
        setViewTime(
          formatTimeToAmPm(time.toLocaleTimeString('en-US', { hour12: false })),
        );
      }
      onCloseModal();
      return;
    }
    if (setConfirmDateDayOfWeek) {
      setConfirmDateDayOfWeek(getDayOfWeek(selectDate));
    }
    setConfirmDate(selectDate);
    onCloseModal();
  };

  // 선택한 날짜의 요일을 계산하는 함수
  const getDayOfWeek = dateString => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const date = new Date(dateString);
    const dayOfWeek = days[date.getDay()];
    return dayOfWeek;
  };

  // 시간을 오전/오후 형식으로 변환하는 함수
  const formatTimeToAmPm = timeString => {
    // 주어진 시간 문자열을 ':'를 기준으로 분리하여 시, 분, 초를 추출합니다.
    const [hourString, minuteString, secondString] = timeString.split(':');

    // 시간 문자열을 숫자로 변환합니다.
    const hour = parseInt(hourString, 10);

    // 오전/오후를 결정합니다.
    const period = hour >= 12 ? '오후' : '오전';

    // 12시간 형식으로 변환합니다.
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

    // 분을 두 자리로 표시합니다.
    const minute = parseInt(minuteString, 10);
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    return `${period} ${formattedHour}:${formattedMinute}`;
  };
  const onCloseModal = () => {
    setModalVisible(false);
    setShowModal(false);
    setTimePickerVisibility(false);
  };

  return (
    <View>
      <Modal
        animationType="slide"
        transparent
        visible={showModal}
        onRequestClose={() => {
          onCloseModal();
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
            }}>
            <Calendar
              key={confirmDate}
              current={confirmDate}
              firstDay={1}
              onDayPress={handleDayPress}
              markedDates={markedSelectedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                selectedDayTextColor: '#ffffff',
                selectedDayBackgroundColor: '#FF671F',
                todayTextColor: '#FF671F',
                arrowColor: 'black',
                dayTextColor: 'black',
                textDisabledColor: '#d9e1e8',
                textDayFontWeight: 'bold',
              }}
            />
            <Button title="닫기" onPress={() => onCloseModal()} />
          </View>
        </View>
      </Modal>
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        date={confirmTime ? new Date(`2023-01-15 ${confirmTime}`) : new Date()}
        mode="time"
        minuteInterval={10}
        onConfirm={handleTimeConfirm}
        onCancel={() => onCloseModal()}
      />
    </View>
  );
}

export default SPCalendarModal;
