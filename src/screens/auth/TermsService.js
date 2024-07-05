import React, { memo, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { apiTermsType } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import Checkbox from '../../components/Checkbox';
import { PrimaryButton } from '../../components/PrimaryButton';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { useRoute } from '@react-navigation/native';
import Header from '../../components/header';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { handleError } from '../../utils/HandleError';

function TermsService() {
  const insets = useSafeAreaInsets();
  const [isCheckedAll, setIsCheckedAll] = useState(false);
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isChecked3, setIsChecked3] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMarketingAgree, setIsMarketingAgree] = useState(false);
  const [terms, setTerms] = useState('');
  const route = useRoute();
  const { loginType, snsKey, userLoginId, codeType } = route.params;

  const isDisableButton = useMemo(() => {
    if (isCheckedAll || (isChecked1 && isChecked2)) {
      return false;
    }

    return true;
  }, [isCheckedAll, isChecked1, isChecked2]);

  // 상위 체크 박스 클릭 시 모든 체크 박스 선택/해제
  const handleAllCheck = () => {
    const newValue = !isCheckedAll;
    setIsCheckedAll(newValue);
    setIsChecked1(newValue);
    setIsChecked2(newValue);
    setIsChecked3(newValue);
    setIsMarketingAgree(newValue);
  };

  // 개별 체크 박스 클릭 시 해당 체크 상태 변경
  const handleCheck1 = () => {
    setIsChecked1(!isChecked1);
    setIsCheckedAll(false); // isChecked1 변경 시 모두 동의 체크 해제
  };

  const handleCheck2 = () => {
    setIsChecked2(!isChecked2);
    setIsCheckedAll(false); // isChecked2 변경 시 모두 동의 체크 해제
  };

  const handleCheck3 = () => {
    setIsChecked3(!isChecked3);
    setIsMarketingAgree(!isChecked3);
    setIsCheckedAll(false); // isChecked3 변경 시 모두 동의 체크 해제
  };

  const openModal = type => {
    setModalVisible(true);
    fetchTermsFromAPI(type);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const fetchTermsFromAPI = async type => {
    try {
      const response = await apiTermsType(type);
      setTerms(response.data.data.contents);
    } catch (error) {
      handleError(error);
    }
  };

  const goToNextPage = () => {
    if (loginType === 'EMAIL') {
      NavigationService.navigate(navName.identifyVerification, {
        loginType,
        isMarketingAgree,
      });
    } else {
      NavigationService.navigate(navName.identifyVerification, {
        loginType,
        snsKey,
        userLoginId,
        codeType,
        isMarketingAgree,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="약관 동의" />

      <ScrollView
        contentContainerStyle={styles.contentStyle}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headerText}>
          {'SPORTS PIE 서비스 이용약관에\n동의해주세요.'}
        </Text>

        <Checkbox
          label="모두 동의(선택 정보 포함)"
          boldText={true}
          onPress={handleAllCheck}
          selected={isCheckedAll}
        />
        <Checkbox
          label="서비스 이용약관 동의(필수)"
          selected={isChecked1}
          viewMore
          onViewMorePress={() => openModal('TERMS_SERVICE')}
          onPress={handleCheck1}
        />
        <Checkbox
          label="개인정보 보호정책 동의(필수)"
          selected={isChecked2}
          viewMore
          onViewMorePress={() => openModal('TERMS_PRIVATE')}
          onPress={handleCheck2}
        />
        <Checkbox
          selected={isChecked3}
          label="마케팅 안내 수신 동의(선택)"
          onPress={handleCheck3}
        />
      </ScrollView>

      {/* Sunmit button */}
      <PrimaryButton
        text="동의하고 가입하기"
        buttonStyle={styles.submitButton}
        onPress={goToNextPage}
        disabled={isDisableButton}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            {
              paddingTop: insets.top,
            },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <WebView style={styles.modal} source={{ html: terms }} />
          </ScrollView>

          <PrimaryButton
            text="닫기"
            onPress={closeModal}
            buttonStyle={styles.closeButton}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default memo(TermsService);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentStyle: {
    paddingTop: 24,
    rowGap: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.labelNormal,
  },
  submitButton: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  modalContainer: {
    flex: 1,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  closeButton: {
    marginTop: 8,
  },
  closeButtonText: {
    color: 'white',
  },
  modal: { flex: 1, fontSize: 40, width: 400, height: 800 },
});
