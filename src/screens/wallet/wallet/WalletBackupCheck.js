import React, { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { navName } from '../../../common/constants/navName';
import Checkbox from '../../../components/Checkbox';
import { PrimaryButton } from '../../../components/PrimaryButton';
import NavigationService from '../../../navigation/NavigationService';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';

function WalletBackupCheck() {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  const isCheckAll = useMemo(() => {
    return check1 && check2 && check3;
  }, [check1, check2, check3]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header closeIcon />

      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <Text style={styles.headerText}>복구 시드 이해하기</Text>
          <Text style={styles.subHeaderText}>
            {
              '아래 체크박스 내용을 읽고 복구 시드의 중요성을\n이해했는지 확인하세요.'
            }
          </Text>
        </View>

        <View style={styles.content}>
          <Checkbox
            selected={check1}
            onPress={() => setCheck1(!check1)}
            label="복구 시드는 직접 적어 안전한 오프라인 장소에 보관하세요!"
            labelStyle={styles.checkboxText}
            checkBoxStyle={[
              styles.checkbox,
              !check1 && {
                backgroundColor: 'transparent',
              },
            ]}
          />
          <Checkbox
            selected={check2}
            onPress={() => setCheck2(!check2)}
            label="분실하는 경우 해당 지갑을 사용할 수 없으니 반드시 안전하게 보관해주세요."
            labelStyle={styles.checkboxText}
            checkBoxStyle={[
              styles.checkbox,
              !check2 && {
                backgroundColor: 'transparent',
              },
            ]}
          />
          <Checkbox
            selected={check3}
            onPress={() => setCheck3(!check3)}
            label="해당 정보를 다른 사람과 절대 공유하지 마세요."
            labelStyle={styles.checkboxText}
            checkBoxStyle={[
              styles.checkbox,
              !check3 && {
                backgroundColor: 'transparent',
              },
            ]}
          />
        </View>

        <PrimaryButton
          text="다음"
          onPress={() => {
            NavigationService.navigate(navName.walletBackup);
          }}
          buttonStyle={{ marginTop: 'auto' }}
          disabled={!isCheckAll}
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(WalletBackupCheck);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 24,
  },
  headerWrapper: {
    rowGap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: COLORS.peach,
    padding: 16,
    rowGap: 16,
    borderRadius: 16,
  },
  headerText: {
    ...fontStyles.fontSize20_Semibold,
    letterSpacing: -0.24,
    color: COLORS.black,
  },
  subHeaderText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelNeutral,
    letterSpacing: 0.302,
    textAlign: 'center',
  },
  checkboxText: {
    ...fontStyles.fontSize16_Regular,
    color: COLORS.labelNormal,
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  checkbox: {
    width: 18,
    height: 18,
    marginHorizontal: 3,
    marginVertical: 4,
  },
});
