import React, { memo, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { useAppState } from '../../utils/AppStateContext';
import { apiGetBankList } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import Header from '../../components/header';
import BoxSelect from '../../components/BoxSelect';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';

function TournamentRefundRequestForm({ route }) {
  const prtIdx = route?.params?.prtIdx;

  const { applyData, setApplyData } = useAppState();

  const [bankOptions, setBankOptions] = useState([]);

  const resetData = () => {
    setApplyData({
      refundBank: '',
      refundAccount: '',
      refundName: '',
    });
  };
  const getBankList = async () => {
    try {
      const { data } = await apiGetBankList();
      if (data.data && data.data.length > 0) {
        const bankList = data.data.map(item => {
          return {
            id: item.codeSub,
            label: item.codeName,
            value: item.codeName,
          };
        });
        setBankOptions(bankList);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    resetData();
    getBankList();
  }, []);

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
        }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Header title="환불 신청" />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContainer}>
            <Text style={styles.formTitle}>환불 계좌 등록</Text>
            <View style={styles.formInputWrapper}>
              <Text style={styles.formInputLabel}>예금주</Text>
              <TextInput
                placeholder="예금주 입력"
                autoCorrect={false}
                autoCapitalize="none"
                value={applyData.refundName ?? ''}
                onChangeText={text => {
                  if (text?.length > 15) return;
                  setApplyData({
                    ...applyData,
                    refundName: text,
                  });
                }}
                style={styles.formTextInput}
              />
            </View>
            <View style={styles.formInputWrapper}>
              <Text style={styles.formInputLabel}>은행 선택</Text>
              <BoxSelect
                placeholder="은행을 선택하세요"
                arrayOptions={bankOptions}
                onItemPress={bank => {
                  setApplyData({ ...applyData, refundBank: bank });
                }}
                value={applyData?.refundBank}
                boxStyle={[styles.formTextInput, { height: 44 }]}
                isArrowDropDown
              />
            </View>
            <View style={styles.formInputWrapper}>
              <Text style={styles.formInputLabel}>계좌번호</Text>
              <TextInput
                placeholder="계좌번호를 입력해주세요."
                autoCorrect={false}
                autoCapitalize="none"
                value={applyData.refundAccount ?? ''}
                onChangeText={text => {
                  if (text?.length > 45) return;
                  setApplyData({
                    ...applyData,
                    refundAccount: text,
                  });
                }}
                style={styles.formTextInput}
              />
            </View>
          </ScrollView>
          <View style={{ padding: 16 }}>
            <PrimaryButton
              text="다음"
              disabled={
                !(
                  applyData?.refundBank &&
                  applyData?.refundAccount &&
                  applyData?.refundName
                )
              }
              onPress={() => {
                NavigationService.navigate(navName.tournamentRefundRequest, {
                  prtIdx,
                });
              }}
            />
          </View>
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}
export default memo(TournamentRefundRequestForm);

const styles = StyleSheet.create({
  formContainer: {
    rowGap: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  formTitle: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  formInputWrapper: { rowGap: 4 },
  formInputLabel: { ...fontStyles.fontSize12_Regular, letterSpacing: 0.302 },
  formTextInput: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border0,
    ...fontStyles.fontSize14_Regular,
    letterSpacing: 0.203,
  },
  contentsWrapper: { rowGap: 16, paddingVertical: 24, paddingHorizontal: 16 },
  contentsTitle: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  cancelAgreeText: {
    ...fontStyles.fontSize16_Regular,
    letterSpacing: 0.091,
  },
});
