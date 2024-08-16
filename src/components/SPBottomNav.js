import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { NAV_PREFIX, navName } from '../common/constants/navName';
import SPImages from '../assets/images';
import SPIcons from '../assets/icon';
import NavigationService from '../navigation/NavigationService';
import { ACTIVE_OPACITY } from '../common/constants/constants';

export default function SPBottomNav({
  component: Component,
  children,
  ...props
}) {
  const route = useRoute();
  const navigationName = route?.name;

  const checkActive = footerNavName => {
    const navType = footerNavName.split('-')[0];
    if (NAV_PREFIX.bottom === navType) {
      const currentNavName = navigationName.split('-').slice(1).join('-');
      const footerName = footerNavName.split('-').slice(1).join('-');
      if (currentNavName === footerName) {
        return true;
      }
    }
    return false;
  };

  const bottomNavList = [
    {
      title: '홈',
      navName: navName.home,
      image: SPIcons.icNavHome,
      activeImage: SPIcons.icNavHomeActive,
    },
    {
      title: '아카데미',
      navName: navName.academyMember,
      image: SPIcons.icNavAcademy,
      activeImage: SPIcons.icNavAcademyActive,
    },
    {
      title: '경기매칭',
      navName: navName.matchingSchedule,
      image: SPIcons.icNavMatching,
      activeImage: SPIcons.icNavMatchingActive,
    },
    {
      title: '커뮤니티',
      navName: navName.community,
      image: SPIcons.icNavCommunity,
      activeImage: SPIcons.icNavCommunityActive,
    },
    {
      title: 'PIE트레이닝',
      navName: navName.training,
      image: SPIcons.icNavTraining,
      activeImage: SPIcons.icNavTrainingActive,
    },
  ];
  return (
    <View
      style={{
        height: 58,
        paddingVertical: 8,
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(135, 141, 150, 0.08)',
      }}>
      {bottomNavList.map((item, index) => {
        return (
          <TouchableOpacity
            key={index}
            style={{ flex: 1 }}
            activeOpacity={ACTIVE_OPACITY}
            onPress={() => {
              NavigationService.reset(item.navName);
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
              }}>
              <Image
                source={
                  checkActive(item.navName) ? item.activeImage : item.image
                }
                style={{ width: 24, height: 24 }}
              />
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: checkActive(item.navName) ? '#FF7C10' : '#ADABA7',
                    lineHeight: 14,
                    letterSpacing: 0.342,
                  }}>
                  {item.title}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
