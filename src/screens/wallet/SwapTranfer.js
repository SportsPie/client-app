import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPGifs } from '../../assets/gif';
import { navName } from '../../common/constants/navName';
import { PrimaryButton } from '../../components/PrimaryButton';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';

function SwapTranfer() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header closeIcon />

      <View style={styles.container}>
        <Image source={SPGifs.success} style={styles.image} />

        <Text style={styles.header}>스왑 전송</Text>

        <Text style={styles.subheader}>
          {
            '스왑 완료 대기중이에요.\n최대 2분 정도 걸릴 수 있으니 잠시만 기다려 주세요.\n완료되면 거래내역에서 확인하실 수 있어요!'
          }
        </Text>

        <PrimaryButton
          onPress={() => {
            NavigationService.replace(navName.walletDetail);
          }}
          text="지갑으로 이동"
          buttonStyle={{
            marginTop: 'auto',
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(SwapTranfer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 16,
  },
  image: {
    width: SCREEN_WIDTH / 2,
    height: SCREEN_WIDTH / 2,
    alignSelf: 'center',
  },
  header: {
    ...fontStyles.fontSize20_Semibold,
    textAlign: 'center',
  },
  subheader: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelNeutral,
    textAlign: 'center',
  },
});
