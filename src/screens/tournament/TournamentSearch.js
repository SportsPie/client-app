import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BasicButton } from '../../components/BasicButton';
import moment from 'moment';
import SPIcons from '../../assets/icon';

function TournamentSearch({
  openModal,
  selectedDate,
  selectedCity,
  selectedCategoryDescList,
}) {
  const searched =
    selectedDate || selectedCity || selectedCategoryDescList?.length > 0;
  return (
    <View style={styles.container}>
      {searched ? (
        <View style={styles.searchContainer}>
          <Text style={styles.searchTextDetail}>
            {selectedCity}{' '}
            {selectedDate && moment(selectedDate).format('YYYY.MM')}{' '}
            {selectedCategoryDescList?.join(' ')}
          </Text>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              borderWidth: 1,
              borderRadius: 8,
              borderColor: 'rgba(135, 141, 150, 0.22)',
              padding: 4,
            }}
            hitSlop={20}
            onPress={() => {
              openModal();
            }}>
            <Image
              source={SPIcons.icFilter}
              style={{ height: 24, width: 24 }}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchContainer}>
          <Text style={styles.searchText}>원하는 조건으로 검색해 보세요.</Text>
          <BasicButton
            text="대회 검색"
            buttonStyle={styles.button}
            buttonTextStyle={styles.buttonText}
            onPress={() => {
              openModal();
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Android에서 그림자 효과
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#2E3135CC',
  },
  searchTextDetail: {
    flex: 1,
    flexDirection: 'row',
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  button: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default TournamentSearch;
