import { useRoute } from '@react-navigation/native';
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

function CompleteSign() {
  const route = useRoute();
  const { userNickName } = route.params;

  const handleGoToSportsPage = () => {
    NavigationService.navigate(navName.home);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header closeIcon onLeftIconPress={handleGoToSportsPage} />

      <View style={styles.content}>
        <Image source={SPGifs.gift} style={{ width: 130, height: 130 }} />

        <Text
          style={
            fontStyles.fontSize20_Semibold
          }>{`${userNickName}님, 반가워요 😊`}</Text>

        <Text
          style={[
            fontStyles.fontSize14_Medium,
            {
              color: COLORS.labelNeutral,
              textAlign: 'center',
            },
          ]}>
          {'가입 감사 의미로\n적립금을 지급해드렸어요!'}
        </Text>
      </View>

      <PrimaryButton
        onPress={handleGoToSportsPage}
        buttonStyle={styles.button}
        text="스포츠파이 보러가기"
      />
    </SafeAreaView>
  );
}

export default memo(CompleteSign);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 24,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
});
