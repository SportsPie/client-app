import React, { memo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import Utils from '../../utils/Utils';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { navName } from '../../common/constants/navName';
import TournamentSketchPhoto from './TournamentSketchPicture';
import TournamentSketchVideo from './TournamentSketchVideo';
import { apiGetTournamentTitle } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';

const Tab = createMaterialTopTabNavigator();

function TournamentSketch({ route }) {
  const tournamentIdx = route?.params?.tournamentIdx;
  const picture = route?.params?.picture;
  const [tournamentCount, setTournamentCount] = useState();
  const [tournamentName, setTournamentName] = useState();

  const getTournamentName = async () => {
    try {
      const { data } = await apiGetTournamentTitle(tournamentIdx);
      setTournamentCount(data.data.trnCnt);
      setTournamentName(data.data.title);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    getTournamentName();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="대회 스케치" />
      <Text style={styles.trnName}>
        {tournamentCount && `제${Utils.changeNumberComma(tournamentCount)}회 `}{' '}
        {tournamentName}
      </Text>
      <Tab.Navigator
        initialRouteName={
          picture
            ? navName.tournamentSketchPicture
            : navName.tournamentSketchVideo
        }
        screenOptions={{ lazy: true, swipeEnabled: false }}
        sceneContainerStyle={{
          backgroundColor: COLORS.white,
        }}
        tabBar={TournamentSketchTab}>
        <Tab.Screen
          name={navName.tournamentSketchVideo}
          component={TournamentSketchVideo}
          options={{ tabBarLabel: '동영상' }}
          initialParams={{ tournamentIdx }}
        />
        <Tab.Screen
          name={navName.tournamentSketchPicture}
          component={TournamentSketchPhoto}
          options={{ tabBarLabel: '사진' }}
          initialParams={{ tournamentIdx }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default memo(TournamentSketch);

function TournamentSketchTab(props) {
  const { state, navigation } = props;
  return (
    <View style={styles.switch}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <TouchableOpacity
            key={route?.key}
            style={[styles.toggle, isFocused && styles.activeToggle]}
            onPress={onPress}>
            <Text
              style={[styles.toggleText, isFocused && styles.activeToggleText]}>
              {route.name === navName.tournamentSketchVideo ? '동영상' : '사진'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  trnName: {
    padding: 16,
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  switch: {
    flexDirection: 'row',
    columnGap: 4,
    padding: 4,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFE1D2',
  },
  toggle: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
  },
  activeToggle: {
    backgroundColor: COLORS.white,
  },
  toggleText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.disableText,
    letterSpacing: 0.203,
  },
  activeToggleText: {
    color: COLORS.orange,
  },
});
