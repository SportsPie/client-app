import { Linking, Modal, StyleSheet, Text, View } from 'react-native';
import React, { memo, useCallback, useState } from 'react';
import { PrimaryButton } from './PrimaryButton';
import { COLORS } from '../styles/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPSvgs } from '../assets/svg';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import fontStyles from '../styles/fontStyles';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import VersionCheck from 'react-native-version-check';
import { IS_ANDROID } from '../common/constants/constants';
import Utils from '../utils/Utils';

function ForceUpdateModal() {
  const insets = useSafeAreaInsets();
  const [isNeededUpdate, setIsNeededUpdate] = useState(false);
  const [storeURL, setStoreURL] = useState('');

  const handleCheckVersion = async () => {
    const appStoreURL =
      'https://itunes.apple.com/kr/lookup?bundleId=com.faentasium.footballcash';

    const response = await axios.get(appStoreURL);
    const version = response?.data?.results?.[0] || undefined;

    if (IS_ANDROID) {
      VersionCheck.needUpdate().then(res => {
        console.log('🚀 ~ VersionCheck.needUpdate ~ res:', res);
        setIsNeededUpdate(res?.isNeeded ?? false);
        setStoreURL(res?.storeUrl ?? '');
      });
    } else if (version) {
      VersionCheck.needUpdate({
        currentVersion: VersionCheck.getCurrentVersion(),
        latestVersion: version.version,
      }).then(res => {
        console.log('🚀 ~ handleCheckVersion ~ res:', res);
        setIsNeededUpdate(res?.isNeeded ?? false);
        setStoreURL(res?.storeURL ?? version?.trackViewUrl ?? '');
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleCheckVersion();
    }, []),
  );

  const handleUpdate = useCallback(() => {
    if (storeURL) {
      Utils.openOrMoveUrl(storeURL);
    }
  }, [storeURL]);

  return (
    <Modal visible={isNeededUpdate} animationType="slide">
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}>
        <SPSvgs.Upgrade width={SCREEN_WIDTH} height={SCREEN_WIDTH / 2} />

        <Text style={styles.headerText}>업데이트 시간이에요!</Text>

        <Text style={styles.subheaderText}>
          {
            '사용자 경험을 최대한 원활하게 만들기 위해\n신규 기능을 추가했고 버그도 수정했습니다.'
          }
        </Text>

        <PrimaryButton
          onPress={handleUpdate}
          text="앱 업데이트"
          buttonStyle={styles.submitButton}
        />
      </View>
    </Modal>
  );
}

export default memo(ForceUpdateModal);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 24,
  },
  headerText: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.labelNormal,
  },
  subheaderText: {
    ...fontStyles.fontSize14_Medium,
    textAlign: 'center',
    color: COLORS.labelNeutral,
  },
  submitButton: {
    paddingHorizontal: 24,
  },
});
