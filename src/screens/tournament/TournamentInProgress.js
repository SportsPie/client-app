import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import TournamentHome from './TournamentHome';
import { useDispatch, useSelector } from 'react-redux';
import { apiGetTournamentOpenOngoing } from '../../api/RestAPI';
import { store } from '../../redux/store';
import { handleError } from '../../utils/HandleError';
import { tournamentInProgressListAction } from '../../redux/reducers/list/tournamentInProgressListSlice';

function TournamentInProgress({ route }) {
  /**
   * state
   */
  const [init, setInit] = useState(true);
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const dispatch = useDispatch();
  const listName = 'tournamentInProgressList';
  const { page, list, refreshing, loading, isLast, listParamReset } =
    useSelector(selector => selector[listName]);
  const [size, setSize] = useState(100);
  const action = tournamentInProgressListAction;

  const [selectedDate, setSelectedDate] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [selectedCategoryList, setSelectedCategoryList] = useState([]);
  const [searched, setSearched] = useState(false);

  /**
   * api
   */
  const getTournamentList = async () => {
    try {
      const params = {
        userIdx,
        page,
        size,
        tagList: selectedCategoryList,
        cityName: selectedCity,
        yearMonth: selectedDate,
      };
      const { data } = await apiGetTournamentOpenOngoing(params);
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
    } catch (error) {
      handleError(error);
    }
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  /**
   * function
   */
  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }
    }, 0);
  };

  const searching = value => {
    setSelectedCity(value?.selectedCity);
    setSelectedDate(value?.selectedDate);
    setSelectedCategoryList(value?.selectedCategoryList);
    setSearched(prev => !prev);
  };

  const onRefresh = async () => {
    dispatch(action.refresh());
  };

  /**
   * useEffect
   */
  useEffect(() => {
    action.reset();
    setInit(false);
  }, []);

  useEffect(() => {
    onRefresh();
  }, [searched, listParamReset]);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getTournamentList();
    }
  }, [page, refreshing]);

  /**
   * render
   */
  return (
    <View style={styles.container}>
      <TournamentHome
        dataList={list}
        searching={searching}
        selectedDate={selectedDate}
        selectedCity={selectedCity}
        selectedCategoryList={selectedCategoryList}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        loadMoreProjects={loadMoreProjects}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default TournamentInProgress;
