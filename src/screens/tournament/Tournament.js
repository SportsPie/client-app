import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StyleSheet, View } from 'react-native';
import TournamentOngoing from './TournamentOngoing';
import TournamentInProgress from './TournamentInProgress';
import TournamentEnded from './TournamentEnded';
import { navName } from '../../common/constants/navName';

const Tab = createMaterialTopTabNavigator();

function Tournament() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarActiveTintColor: '#FF7C10',
          tabBarInactiveTintColor: '#2E313599',
        }}>
        <Tab.Screen
          name={navName.tournamentOngoing}
          component={TournamentOngoing}
          options={{ tabBarLabel: '접수중' }}
        />
        <Tab.Screen
          name={navName.tournamentInProgress}
          component={TournamentInProgress}
          options={{ tabBarLabel: '진행중' }}
        />
        <Tab.Screen
          name={navName.tournamentEnded}
          component={TournamentEnded}
          options={{ tabBarLabel: '종료' }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: 'white',
    paddingTop: 16,
    marginHorizontal: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    elevation: 0,
    borderBottomWidth: 1, // 안드로이드에서 그림자 제거
    borderBottomColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabIndicator: {
    backgroundColor: '#FB8225',
  },
});

export default Tournament;
