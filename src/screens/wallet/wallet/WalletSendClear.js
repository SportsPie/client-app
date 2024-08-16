import React, { memo, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { SPGifs } from '../../../assets/gif';
import SPHeader from '../../../components/SPHeader';
import { navName } from '../../../common/constants/navName';
import { PrimaryButton } from '../../../components/PrimaryButton';
import NavigationService from '../../../navigation/NavigationService';
import { SafeAreaView } from 'react-native-safe-area-context';

// 지갑 보내기 완료
function WalletSendClear({ route }) {
  const { width } = useWindowDimensions();

  let imageHeight;
  if (width <= 480) {
    imageHeight = 203;
  } else {
    const aspectRatio = 360 / 203;
    imageHeight = width / aspectRatio;
  }

  return (
    <SafeAreaView style={styles.container}>
      <SPHeader leftCancleButton={true} />
      <View style={styles.contentBox}>
        <Image
          source={SPGifs.success}
          style={{ width: 100, height: 100, marginBottom: 24 }}
        />
        <View style={styles.mainTextBox}>
          <Text style={styles.mainText}>보내기 완료</Text>
        </View>
        <View>
          <Text style={styles.subText}>보내기 완료되었어요.</Text>
          <Text style={styles.subText}>거래내역에서 확인하실 수 있어요!</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.moveBtn}
        onPress={() => NavigationService.goBack()}>
        <Text style={styles.moveBtnText}>지갑으로 이동</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default memo(WalletSendClear);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 64,
  },
  mainTextBox: {
    marginBottom: 16,
  },
  mainText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
    textAlign: 'center',
  },
  moveBtn: {
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  moveBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
});
