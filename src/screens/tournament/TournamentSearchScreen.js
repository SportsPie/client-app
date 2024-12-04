import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Close from '../../assets/svg/Close';
import LeftChevron from '../../assets/svg/LeftChevron';
import RightChevron from '../../assets/svg/RightChevron';
import moment from 'moment';

const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function TournamentSearchScreen({
  cityList,
  filterList,
  onClose,
  onResult,
  selectedCity,
  selectedDate,
  selectedCategoryList,
}) {
  const [selectedRegion, setSelectedRegion] = useState(selectedCity || '');
  const [selectedMonth, setSelectedMonth] = useState(
    selectedDate ? moment(selectedDate).month() + 1 : null,
  );
  const [selectedCategories, setSelectedCategories] = useState(
    selectedCategoryList || [],
  );
  const [selectedYear, setSelectedYear] = useState(
    selectedDate ? moment(selectedDate).year() : moment().year(),
  );

  const toggleCategory = category => {
    if (category === '') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev =>
        prev.includes(category)
          ? prev.filter(c => c !== category && c !== '')
          : [...prev.filter(c => c !== ''), category],
      );
    }
  };

  const changeYear = increment => {
    setSelectedYear(prevYear => prevYear + increment);
  };

  const resetAll = () => {
    setSelectedRegion('');
    setSelectedYear(moment().year());
    setSelectedMonth();
    setSelectedCategories([]);
  };

  const result = () => {
    if (onResult) {
      onResult({
        selectedCity: selectedRegion,
        selectedDate: selectedMonth
          ? moment(
              `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`,
            ).format('YYYY-MM')
          : null,
        selectedCategoryList: selectedCategories,
      });
    }
  };

  const cityNameMapping = {
    부산광역시: '부산',
    서울특별시: '서울',
    충청남도: '충남',
    충청북도: '충북',
    경상남도: '경남',
    경상북도: '경북',
    제주특별자치도: '제주',
    세종특별자치시: '세종',
    인천광역시: '인천',
    경기도: '경기',
    대전광역시: '대전',
    전북특별자치도: '전북',
    전라남도: '전남',
    광주광역시: '광주',
    강원특별자치도: '강원',
    대구광역시: '대구',
    울산광역시: '울산',
  };

  const formatCityName = city => {
    // 매핑된 값이 있으면 그 값을 반환하고, 없으면 원본 도시명 반환
    return cityNameMapping[city] || city;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => onClose()}>
          <Close />
        </TouchableOpacity>
        <Text style={styles.title}>대회 검색</Text>
      </View>
      <View style={styles.content}>
        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>지역 설정</Text>
            <View style={styles.buttonGroup}>
              {cityList?.map(region => (
                <TouchableOpacity
                  key={region.label}
                  style={[
                    styles.button,
                    selectedRegion === region.code && styles.selectedButton,
                  ]}
                  onPress={() => {
                    setSelectedRegion(region.code);
                  }}>
                  <Text
                    style={[
                      styles.buttonText,
                      selectedRegion === region.code &&
                        styles.selectedButtonText,
                    ]}>
                    {formatCityName(region.label)} {/* 변환된 값 */}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기간 설정</Text>
            <View style={styles.periodSelector}>
              <View style={styles.yearSelector}>
                <TouchableOpacity
                  onPress={() => changeYear(-1)}
                  style={styles.chevronButton}>
                  <LeftChevron />
                </TouchableOpacity>
                <Text style={styles.year}>{selectedYear}년</Text>
                <TouchableOpacity
                  onPress={() => changeYear(1)}
                  style={styles.chevronButton}>
                  <RightChevron />
                </TouchableOpacity>
              </View>
              <View style={styles.monthSelector}>
                {months.map(month => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthButton,
                      `${selectedMonth}` === month && styles.selectedButton,
                    ]}
                    onPress={() => {
                      if (`${selectedMonth}` === `${month}`) {
                        setSelectedMonth();
                      } else {
                        setSelectedMonth(month);
                      }
                    }}>
                    <View style={styles.monthButtonText}>
                      <Text
                        style={[
                          styles.buttonText,
                          `${selectedMonth}` === month &&
                            styles.selectedButtonText,
                        ]}>
                        {month}월
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>참가 유형</Text>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                styles.allCategoryButton,
                selectedCategories?.length === 0 &&
                  styles.selectedCategoryButton,
              ]}
              onPress={() => toggleCategory('')}>
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategories?.length === 0 &&
                    styles.selectedCategoryButtonText,
                ]}>
                전체
              </Text>
            </TouchableOpacity>
            <View style={styles.categoryDivider} />
            <View style={styles.categoryButtonGroup}>
              {filterList
                ?.filter(category => category.code !== '')
                ?.map(category => (
                  <TouchableOpacity
                    key={category.label}
                    style={[
                      styles.categoryButton,
                      selectedCategories.includes(category.code) &&
                        styles.selectedCategoryButton,
                    ]}
                    onPress={() => toggleCategory(category.code)}>
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategories.includes(category.code) &&
                          styles.selectedCategoryButtonText,
                      ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
          <Text style={styles.resetButtonText}>재설정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} onPress={result}>
          <Text style={styles.searchButtonText}>결과보기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
  section: {
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  closeButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 32,
    color: '#000',
  },
  scrollView: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 24,
    color: '#1A1C1E',
    paddingVertical: 8,
    marginBottom: 4,
    height: 40,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -10,
    marginVertical: -8,
    columnGap: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: '#878D9638',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 0,
    // marginHorizontal: 4,
    marginVertical: 8,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#FF7C10',
    borderColor: '#FF7C10',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 24,
    textAlign: 'center',
    color: 'rgba(46, 49, 53, 0.6)',
    letterSpacing: 0.091,
  },
  selectedButtonText: {
    color: '#fff',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 16,
    width: '100%',
  },

  chevronButton: {
    margin: 12,
    width: 24,
    height: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  year: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  monthButtonText: {
    minWidth: 32,
    minHeight: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 0,
    flexBasis: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  periodSelector: {
    gap: 12,
  },

  monthSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  footer: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  resetButton: {
    // width: 66,
    // height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002672',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    // height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  categoryButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  allCategoryButton: {
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#FF7C10',
    borderColor: '#FF7C10',
  },
  categoryButtonText: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
    color: 'rgba(46, 49, 53, 0.8)',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
  categoryDivider: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 4,
  },
});

export default TournamentSearchScreen;
