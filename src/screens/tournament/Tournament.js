import React, { useCallback, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StyleSheet, Text, View } from 'react-native';
import TournamentOngoing from './TournamentOngoing';
import TournamentInProgress from './TournamentInProgress';
import TournamentEnded from './TournamentEnded';
import { navName } from '../../common/constants/navName';
import { useFocusEffect } from '@react-navigation/native';
import { handleError } from '../../utils/HandleError';
import { apiGetTournamentOpenShowCheck } from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import fontStyles from '../../styles/fontStyles';

const Tab = createMaterialTopTabNavigator();

function Tournament() {
  const [init, setInit] = useState(false);
  const [showTab, setShowTab] = useState(false);
  const getTournamentListShow = async () => {
    try {
      const { data } = await apiGetTournamentOpenShowCheck();
      setShowTab(data.intended);
    } catch (error) {
      handleError(error);
    }
    setInit(true);
  };
  useFocusEffect(
    useCallback(() => {
      getTournamentListShow();
    }, []),
  );
  return (
    init && (
      <View style={styles.container}>
        {showTab ? (
          <Tab.Navigator
            screenOptions={{
              lazy: true,
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
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 24,
            }}>
            <SPSvgs.ShootBall />
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.waitText}>대회 준비중입니다!</Text>
              <Text style={styles.waitText}>
                곧 만나보실 수 있어요. 조금만 기다려 주세요!
              </Text>
            </View>
          </View>
        )}
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.203,
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
  waitText: {
    ...fontStyles.fontSize14_Medium,
    color: 'rgba(46, 49, 53, 0.80)',
  },
});

export default Tournament;
