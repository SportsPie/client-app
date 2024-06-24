import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import shadowStyles from '../styles/shadowStyles';
import { COLORS } from '../styles/colors';
import SPIcons from '../assets/icon';
import { TranslationContext } from '../utils/TranslationContext';
import { ACTIVE_OPACITY } from '../common/constants/constants';

const images = {
  home: {
    active: SPIcons.icHomeActive,
    inactive: SPIcons.icHome,
  },
  project: {
    active: SPIcons.icProjectActive,
    inactive: SPIcons.icProject,
  },
  carbon: {
    active: SPIcons.icCoprintActive,
    inactive: SPIcons.icCoprint,
  },
  wallet: {
    active: SPIcons.icWalletActive,
    inactive: SPIcons.icWallet,
  },
  my: {
    active: SPIcons.icMyActive,
    inactive: SPIcons.icMy,
  },
};

const styles = {
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingTop: 10,
    ...shadowStyles.shadowBottom,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    color: COLORS.cbGreen,
  },
  tabLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 5,
  },
};

function SPNavigationBar({ activeTab, onPress }) {
  const { translation, setLanguage } = useContext(TranslationContext);
  const tabs = [
    { label: translation.navTabHome, icon: 'home', key: 0 },
    { label: translation.navTabPrj, icon: 'project', key: 1 },
    { label: translation.navTabCarbon, icon: 'carbon', key: 2 },
    { label: translation.navTabMy, icon: 'my', key: 3 },
    { label: translation.navTabWallet, icon: 'wallet', key: 4 },
  ];

  const handlePressTab = key => {
    onPress(key);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          activeOpacity={ACTIVE_OPACITY}
          onPress={() => handlePressTab(tab.key)}>
          <Image
            style={{ width: 26, height: 26, resizeMode: 'contain' }}
            source={
              activeTab === index
                ? images[tab.icon].active
                : images[tab.icon].inactive
            }
          />
          <Text
            style={[styles.tabLabel, activeTab === index && styles.activeTab]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default SPNavigationBar;
