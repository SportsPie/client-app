import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import 'moment/locale/ko';
import {setMonth, setYear} from "date-fns";

const CalendarTest = () => {

    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const isMonth = moment().month();
    const [selectDay, setSelectDay] = useState(moment().month() === isMonth ? moment().date() : '');
    const [showFullCalendar, setShowFullCalendar] = useState(false);
    const [month, setMonth] = useState(moment().format('MMMM'));
    const [year, setYear] = useState(moment().format('YYYY'));


    const toggleCalendarView = () => {
        setShowFullCalendar(!showFullCalendar);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
            </View>
            <TouchableOpacity onPress={toggleCalendarView} style={styles.toggleButton}>
                <Text>{showFullCalendar ? '주간 보기' : '전체 보기'}</Text>
            </TouchableOpacity>
            {!showFullCalendar ? (
                <View style={styles.calendarContainer}>
                    <WeeklyCalendar onSelectDate={setSelectedDate} selectedDate={selectedDate} setMonth={setMonth} setYear={setYear} />
                </View>
            ) : (
                <View style={styles.calendarContainer}>
                    <MonthlyCalendar onSelectDay={setSelectDay} selectDay={selectDay} setMonth={setMonth} setYear={setYear} />
                </View>
            )}

        </View>
    );
};
//주달력
const WeeklyCalendar = ({ onSelectDate, selectedDate, setMonth, setYear }) => {
    const [selectedWeek, setSelectedWeek] = useState(moment().week());
    const [selectedYear, setSelectedYear] = useState(moment().year());

    // 이번 주 시작 날짜 설정
    const startOfWeek = moment().locale('ko').year(selectedYear).week(selectedWeek).startOf('day');

    const goToPreviousWeek = () => {
        const newSelectedWeek = selectedWeek - 1;
        if (newSelectedWeek < 1) {
            // 현재 연도의 이전 해로 이동
            const previousYear = selectedYear - 1;
            setSelectedWeek(moment().year(previousYear).weeksInYear());
            setSelectedYear(previousYear);
        } else {
            setSelectedWeek(newSelectedWeek);
        }
    };

    const goToNextWeek = () => {
        const newSelectedWeek = selectedWeek + 1;
        if (newSelectedWeek > moment().year(selectedYear).weeksInYear()) {
            // 현재 연도의 다음 해로 이동
            const nextYear = selectedYear + 1;
            setSelectedWeek(1);
            setSelectedYear(nextYear);
        } else {
            setSelectedWeek(newSelectedWeek);
        }
    };

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = moment(startOfWeek).add(i, 'days');
        weekDays.push({
            date: day,
            isToday: day.isSame(moment(), 'day') // 오늘 날짜인지 확인하는 부붐
        });
    }
    const containerWidth = 100 / 7;
    return (
        <View style={styles.weeklyBorder}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, marginTop: 20, }}>
                <TouchableOpacity onPress={goToPreviousWeek}>
                    <Text style={styles.buttonText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.weekHeader}>{selectedYear}년 {moment(startOfWeek).format('MMMM')}</Text>
                <TouchableOpacity onPress={goToNextWeek}>
                    <Text style={styles.buttonText}>{'>'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.weekContainer}>
                {weekDays.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onSelectDate(item.date.format('YYYY-MM-DD'))}
                        style={[
                            styles.weekDayContainer,
                            item.isToday ? styles.today : null,
                            item.date.format('YYYY-MM-DD') === selectedDate ? styles.selectedDay : null,
                        ]}
                    >
                        <Text style={[
                            styles.weekDay,
                            item.date.format('dddd') === '일요일' ? styles.sunday : null,
                            item.date.format('dddd') === '토요일' ? styles.saturday : null,
                        ]}>
                            {item.date.format('dddd')}
                        </Text>
                        <Text style={styles.weekDate}>{item.date.format('DD')}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
const MonthlyCalendar = ({ onSelectDay, setMonth, setYear, selectDay }) => {
    const [selectedMonth, setSelectedMonth] = useState(moment().month());
    const [selectedYear, setSelectedYear] = useState(moment().year());

    const goToPreviousMonth = () => {
        const newSelectedMonth = selectedMonth - 1;
        let newSelectedYear = selectedYear;
        if (newSelectedMonth < 0) {
            newSelectedYear = selectedYear - 1;
            setSelectedMonth(11); // 11 = 12 월
            setMonth(moment().month(11).format('MMMM'));
        } else {
            setSelectedMonth(newSelectedMonth);
            setMonth(moment().month(newSelectedMonth).format('MMMM'));
        }
        setSelectedYear(newSelectedYear);
        setYear(newSelectedYear); // 연도 변경
    };

    const goToNextMonth = () => {
        const newSelectedMonth = selectedMonth + 1;
        let newSelectedYear = selectedYear;
        if (newSelectedMonth > 11) {
            newSelectedYear = selectedYear + 1;
            setSelectedMonth(0);
            setMonth(moment().month(0).format('MMMM'));
        } else {
            setSelectedMonth(newSelectedMonth);
            setMonth(moment().month(newSelectedMonth).format('MMMM'));
        }
        setSelectedYear(newSelectedYear);
        setYear(newSelectedYear);
    };

    const year = selectedYear;
    const month = moment().month(selectedMonth).format('MMMM');
    const daysInMonth = moment().month(selectedMonth).daysInMonth();
    const firstDayOfMonth = moment(selectedYear + "-" + (selectedMonth + 1)).startOf('month').format('d');


    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push('');
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    //const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.calendarBorder}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 20,}}>
                <TouchableOpacity onPress={goToPreviousMonth} style={styles.button}>
                    <Text style={styles.buttonText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.monthHeader}> {year}년 {month}</Text>
                <TouchableOpacity onPress={goToNextMonth} style={styles.button}>
                    <Text style={styles.buttonText}>{'>'}</Text>
                </TouchableOpacity>
            </View>
                <View style={styles.divider} />
            <View style={styles.weekContainer}>
                {weekdays.map((day, index) => (
                    <Text key={index} style={[styles.weekDayHeader, {width: `${100/7.17}%`, textAlign: 'center', fontWeight: 'bold', }, day === '일' ? styles.sunday : null, day === '토' ? styles.saturday : null,]}>{day}</Text>
                ))}
            </View>
            <View style={styles.monthContainer}>
                {days.map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onSelectDay(day)}
                        style={[
                            styles.dayContainer,
                            day === '' ? styles.emptyDay : null,
                            day === selectDay ? styles.selectedDay : null, // 수정된 부분
                        ]}
                        disabled={day === ''}
                    >
                        {day !== '' && (
                            <Text style={styles.day}>{day}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    year: {
        fontSize: 24,
        marginRight: 5,
    },
    month: {
        fontSize: 24,
    },
    calendarContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    weekHeader: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    weeklyBorder: {
        backgroundColor: 'white',
        borderWidth: 1,

    },
    weekContainer: {
        flexDirection: 'row',
        marginTop: 30,
        marginBottom: 10,

    },
    //주달력 요일 수정
    weekDay: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    //주달력 날짜 수정
    weekDate: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    //달력 위에 메인 년도 월
    monthHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    monthContainer: {

        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayContainer: {
        width: '14%',
        marginTop: 10,
        aspectRatio: 1,
        alignItems: 'center',
        borderColor: '#CCCCCC',
        borderWidth: 0,

    },
    emptyDay: {
        borderColor: 'transparent',
    },
    //달력 날짜 조절
    day: {
        fontSize: 19,
    },
    toggleButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#DDDDDD',
    },

    weekDayContainer: {
        alignItems: 'center',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 13,
    },
    // 선택 날짜 색상 조절
    selectedDay: {
        backgroundColor:'orange',
        borderRadius: 10,
    },
    sunday: {
        color: 'red',
    },

    saturday: {
        color: 'blue'
    },
    // 달력 테두리 전체 조절
    calendarBorder: {
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 10,
        width: '100%',
        height: '77%',
    },
    //전체보기 년도 월 달력 사이 줄
    divider: {
        height: 1,
        backgroundColor: 'black',
    },
    // 버튼
    buttonText: {
        fontSize: 25, // 버튼 텍스트의 크기 조정
        marginLeft: 30,
        marginRight: 30,
    },
});

export default CalendarTest;
