import React, { memo, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../home/Home';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navName } from '../../common/constants/navName';
import AcademyMember from '../academy/AcademyMember';
import MatchingSchedule from '../matching/MatchingSchedule';
import Community from '../community/Community';
import Training from '../training/Training';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SPSvgs } from '../../assets/svg';
import Divider from '../../components/Divider';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import NavigationUtils from '../../utils/NavigationUtils';

const Tab = createBottomTabNavigator();

function BottomTab() {
  const renderIcon = (routeName, isFocused) => {
    switch (routeName) {
      case navName.home:
        if (isFocused) {
          return <SPSvgs.BottomTabHome width={24} height={24} />;
        }
        return <SPSvgs.BottomTabHomeOutline width={24} height={24} />;

      case navName.academyMember:
        if (isFocused) {
          return <SPSvgs.BottomTabAcademy width={24} height={24} />;
        }
        return <SPSvgs.BottomTabAcademyOutline width={24} height={24} />;

      case navName.matchingSchedule:
        if (isFocused) {
          return <SPSvgs.BottomTabMatching width={24} height={24} />;
        }
        return <SPSvgs.BottomTabMatchingOutline width={24} height={24} />;

      case navName.community:
        if (isFocused) {
          return <SPSvgs.BottomTabCommunity width={24} height={24} />;
        }
        return <SPSvgs.BottomTabCommunityOutline width={24} height={24} />;

      case navName.training:
        if (isFocused) {
          return <SPSvgs.BottomTabTraining width={24} height={24} />;
        }
        return <SPSvgs.BottomTabTrainingOutline width={24} height={24} />;

      default:
        break;
    }
  };

  const getRouteName = (routeName, isFocused) => {
    switch (routeName) {
      case navName.home:
        return '홈';

      case navName.academyMember:
        return '아카데미';

      case navName.matchingSchedule:
        return '경기매칭';

      case navName.community:
        return '커뮤니티';

      case navName.training:
        return 'PIE트레이닝';

      default:
        return '';
    }
  };

  const renderTabBar = useCallback(props => {
    const { state, navigation } = props;

    return (
      <View>
        <Divider lineColor="rgba(135, 141, 150, 0.08)" />
        <View style={styles.tabContainer}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            return (
              <Pressable
                onPress={() => {
                  navigation.navigate(route?.name);
                }}
                style={styles.tabWrapper}
                key={route?.key}>
                {renderIcon(route.name, isFocused)}
                <Text
                  style={[
                    styles.tabButtonText,
                    isFocused && {
                      color: COLORS.orange,
                    },
                  ]}>
                  {getRouteName(route?.name, isFocused)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        screenListeners={{
          focus: item => {
            const target = item?.target;
            let type = '';
            let pageName = '';
            if (target) {
              const targetSplit = target.split('-');
              // eslint-disable-next-line prefer-destructuring
              type = targetSplit[0];
              pageName = `${type}-${targetSplit[1]}`;
            }
            NavigationUtils.bottomPageFocusHandler(pageName);
          },
          blur: item => {
            const target = item?.target;
            let type = '';
            let pageName = '';
            if (target) {
              const targetSplit = target.split('-');
              // eslint-disable-next-line prefer-destructuring
              type = targetSplit[0];
              pageName = `${type}-${targetSplit[1]}`;
            }
            NavigationUtils.bottomPageBlurHandler(pageName);
          },
        }}
        tabBar={renderTabBar}>
        <Tab.Screen name={navName.home} component={Home} />
        <Tab.Screen name={navName.academyMember} component={AcademyMember} />
        <Tab.Screen
          name={navName.matchingSchedule}
          component={MatchingSchedule}
        />
        <Tab.Screen name={navName.community} component={Community} />
        <Tab.Screen name={navName.training} component={Training} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default memo(BottomTab);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tabWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 4,
    paddingVertical: 8,
  },
  tabButtonText: {
    ...fontStyles.fontSize11_Medium,
    letterSpacing: 0.342,
    color: COLORS.interactionInactive,
  },
});
