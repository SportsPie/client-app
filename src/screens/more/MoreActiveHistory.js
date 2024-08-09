/* eslint-disable react/no-unstable-nested-components */
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { memo, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import TopTabLabel from '../../components/TopTabLabel';
import ChallengeTab from '../../components/activity-details/ChallengeTab';
import ClassMasterTab from '../../components/activity-details/ClassMasterTab';
import CommunityTab from '../../components/activity-details/CommunityTab';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPLoading from '../../components/SPLoading';
import {
  moreChallengeCommentListAction,
  moreChallengeListAction,
} from '../../redux/reducers/list/moreChallengeCommentListSlice';
import { moreClassMaterCommentListAction } from '../../redux/reducers/list/moreClassMasterCommentListSlice';
import { moreCommunityListAction } from '../../redux/reducers/list/moreCommunityListSlice';
import { moreClassMaterVideoListAction } from '../../redux/reducers/list/moreClassMasterVideoListSlice';

const Tab = createMaterialTopTabNavigator();

function MoreActiveHistory({ route }) {
  const dispatch = useDispatch();
  const noParamReset = route?.params?.noParamReset;
  const [loading, setLoading] = useState(true);
  useFocusEffect(
    useCallback(() => {
      if (!noParamReset) {
        setLoading(true);
        dispatch(moreCommunityListAction.reset());
        dispatch(moreClassMaterCommentListAction.reset());
        dispatch(moreClassMaterVideoListAction.reset());
        dispatch(moreChallengeCommentListAction.reset());
        NavigationService.replace(navName.moreActiveHistory, {
          ...(route?.params || {}),
          noParamReset: true,
        });
        return;
      }
      setLoading(false);
    }, [noParamReset]),
  );
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="활동내역" />
      {loading ? (
        <SPLoading />
      ) : (
        <Tab.Navigator
          screenOptions={{
            lazy: true,
          }}
          sceneContainerStyle={{
            backgroundColor: COLORS.white,
          }}
          tabBar={props => <TopTabLabel {...props} />}>
          <Tab.Screen name="커뮤니티" component={CommunityTab} />
          <Tab.Screen name="클래스마스터" component={ClassMasterTab} />
          <Tab.Screen name="챌린지" component={ChallengeTab} />
        </Tab.Navigator>
      )}
    </SafeAreaView>
  );
}

export default memo(MoreActiveHistory);

const styles = StyleSheet.create({});
