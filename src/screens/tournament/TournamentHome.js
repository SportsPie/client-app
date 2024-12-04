import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import TournamentSearch from './TournamentSearch';
import TournamentCard from '../../components/TournamentCard';
import { COLORS } from '../../styles/colors';
import SPIcons from '../../assets/icon';
import Swiper from 'react-native-swiper';
import TournamentSearchScreen from './TournamentSearchScreen';
import { handleError } from '../../utils/HandleError';
import { apiCityList, apiGetTournamentOpenTags } from '../../api/RestAPI';
import SPLoading from '../../components/SPLoading';
import ListEmptyView from '../../components/ListEmptyView';

function TournamentHome({
  dataList,
  selectedDate,
  selectedCity,
  selectedCategoryList,
  searching,
  loading,
  refreshing,
  onRefresh,
  loadMoreProjects,
}) {
  /**
   * state
   */
  const [cityList, setCityList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [filterModalShow, setFilterModalShow] = useState(false);

  /**
   * api
   */
  const getCityList = async () => {
    try {
      const { data } = await apiCityList();
      const transformedData = [
        { id: 0, code: '', label: '전체' },
        ...data.data.map(city => ({
          code: city,
          label: city,
        })),
      ];
      setCityList(transformedData || []);
    } catch (error) {
      handleError(error);
    }
  };

  const getFileterList = async () => {
    try {
      const { data } = await apiGetTournamentOpenTags();
      const list = data.data?.map(item => {
        return { code: item.codeSub, label: item.codeName };
      });
      setFilterList(list || []);
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * function
   */

  const openModal = () => {
    const statusBarColor = COLORS.white;
    const statusBarStyle = 'dark-content';
    StatusBar.setBarStyle(statusBarStyle);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(statusBarColor);
    }
    setFilterModalShow(true);
  };
  const closeModal = () => {
    const statusBarColor = COLORS.darkBlue;
    const statusBarStyle = 'light-content';
    StatusBar.setBarStyle(statusBarStyle);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(statusBarColor);
    }
    setFilterModalShow(false);
  };

  const getFilterDescList = () => {
    if (selectedCategoryList?.length > 0) {
      return filterList
        .filter(item => selectedCategoryList.includes(item.code))
        .map(item => item.label);
    }
    return [];
  };
  /**
   * useEffect
   */

  useEffect(() => {
    getCityList();
    getFileterList();
  }, []);

  /**
   * render
   */
  const renderItem = ({ item }) => (
    <TournamentCard
      tournamentIdx={item.tournamentIdx}
      title={item.trnName}
      tournamentCount={item.trnCount}
      startDate={item.startDate}
      endDate={item.endDate}
      location={item.trnPlace}
      image={item.thumbPath}
      status={item.trnState}
      openDate={item.openDate}
      closeDate={item.closeDate}
    />
  );

  return (
    <View style={styles.container}>
      <TournamentSearch
        openModal={openModal}
        selectedDate={selectedDate}
        selectedCity={selectedCity}
        selectedCategoryDescList={getFilterDescList()}
      />
      <View style={{ flex: 1 }}>
        {dataList?.length > 0 ? (
          <FlatList
            data={dataList}
            renderItem={renderItem}
            keyExtractor={item => item.tournamentIdx}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  onRefresh();
                }}
              />
            }
            onEndReached={() => {
              loadMoreProjects();
            }}
            onEndReachedThreshold={0.5}
          />
        ) : loading ? (
          <SPLoading />
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ListEmptyView text="대회가 존재하지 않습니다." />
          </View>
        )}
      </View>
      <Modal
        animationType="fade"
        transparent
        visible={filterModalShow}
        onRequestClose={closeModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <TournamentSearchScreen
            cityList={cityList}
            filterList={filterList}
            selectedDate={selectedDate}
            selectedCity={selectedCity}
            selectedCategoryList={selectedCategoryList}
            onClose={closeModal}
            onResult={value => {
              if (searching) searching(value);
              closeModal();
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
});

export default TournamentHome;
