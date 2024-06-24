/* eslint-disable react/no-unstable-nested-components */
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import TopTabLabel from '../../components/TopTabLabel';
import ChallengeTab from '../../components/activity-details/ChallengeTab';
import ClassMasterTab from '../../components/activity-details/ClassMasterTab';
import CommunityTab from '../../components/activity-details/CommunityTab';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

const Tab = createMaterialTopTabNavigator();

function MoreActiveHistory() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="활동내역" />

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
    </SafeAreaView>
  );
}

export default memo(MoreActiveHistory);

const styles = StyleSheet.create({});
