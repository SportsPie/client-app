import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { useCallback, useState, useRef, memo } from 'react';
import {
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import {
  apiGetAcademyDetail,
  apiPostAcademyConfigMngCert,
  apiPostAcademyConfigMngRecert,
} from '../../api/RestAPI';
import { IS_YN } from '../../common/constants/isYN';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { navName } from '../../common/constants/navName';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import SPModal from '../../components/SPModal';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function AcademyCompany({ route }) {
  /**
   * state
   */
  const academyIdx = route?.params?.academyIdx;
  const recert = route?.params?.recert;
  const [certRequestModalVisible, setCertRequestModalVisible] = useState(false);
  const [reCertRequestModalVisible, setReCertRequestModalVisible] =
    useState(false);
  const [academyDetail, setAcademyDetail] = useState({});
  const trlRef = useRef({ current: { disabled: false } });

  const [inputs, setInputs] = useState({
    businessNo: '',
    ceoName: '',
    openDate: '',
  });

  const areInputsFilled = Object.values(inputs).every(
    value => value && value.trim() !== '',
  );
  /**
   * api
   */
  const getAcademyDetailInfo = async () => {
    try {
      const { data } = await apiGetAcademyDetail(academyIdx);
      setAcademyDetail(data.data.academy);
      setInputs({
        businessNo: data.data.academy?.businessNo,
        ceoName: data.data.academy?.ceoName,
        openDate: data.data.academy?.openDate
          ? moment(data.data.academy.openDate).format('YYYYMMDD')
          : '',
      });
    } catch (error) {
      handleError(error);
    }
  };

  const certCompany = async () => {
    setCertRequestModalVisible(false);
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      // data check
      if (!dateCheck()) {
        return;
      }
      if (!businessNoCheck()) {
        return;
      }

      const params = {
        academyIdx,
        b_no: inputs.businessNo,
        p_nm: inputs.ceoName,
        start_dt: inputs.openDate,
      };
      const { data } = await apiPostAcademyConfigMngCert(params);
      Utils.openModal({
        title: '성공',
        body: '인증되셨습니다.',
        closeEvent: MODAL_CLOSE_EVENT.replacePage,
        pageName: navName.academyCompanyManagement,
        data: {
          academyIdx,
        },
      });
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  const reCertCompany = async () => {
    setReCertRequestModalVisible(false);
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      // data check
      if (!dateCheck()) {
        return;
      }
      if (!businessNoCheck()) {
        return;
      }

      const params = {
        academyIdx,
        b_no: inputs.businessNo,
        p_nm: inputs.ceoName,
        start_dt: inputs.openDate,
      };
      const { data } = await apiPostAcademyConfigMngRecert(params);
      Utils.openModal({
        title: '성공',
        body: '인증되셨습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  /**
   * function
   */
  const handleInputChange = (name, value, onlyNumber) => {
    setInputs(prev => ({
      ...prev,
      [name]: onlyNumber ? Utils.onlyNumber(value) : value,
    }));
  };

  const openModal = () => {
    Keyboard.dismiss();
    if (academyDetail.certYn === IS_YN.Y) {
      setReCertRequestModalVisible(true);
    } else {
      setCertRequestModalVisible(true);
    }
  };

  const businessNoCheck = () => {
    const businessNumber = inputs.businessNo;
    const regex = /^\d{10}$/;
    const isValidFormat = regex.test(businessNumber);
    if (!isValidFormat) {
      Utils.openModal({
        title: '확인 요청',
        body: '유효하지 않는 사업자등록번호입니다.',
      });
      return false;
    }
    return true;
  };

  const dateCheck = () => {
    const dateString = inputs.openDate; // Format: 'YYYYMMDD'
    const isValidFormat =
      /^(19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])$/.test(dateString);

    if (isValidFormat) {
      const isValidDate = moment(dateString, 'YYYYMMDD').isValid();
      if (!isValidDate) {
        Utils.openModal({
          title: '확인 요청',
          body: '유효하지 않은 날짜입니다. 개업일을 확인해주십시오.',
        });
        return false;
      }
    } else {
      Utils.openModal({
        title: '확인 요청',
        body: '개업일 형태(YYYYMMDD)를 확인해주십시오.',
      });
      return false;
    }
    return true;
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getAcademyDetailInfo();
    }, []),
  );

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          padding: 0,
          margin: 0,
        }}>
        <SafeAreaView
          style={{
            flex: 1,
            gap: 16,
          }}>
          <Header title="사업자 인증" />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              flex: 1,
              gap: 16,
              paddingHorizontal: 16,
              paddingVertical: 24,
            }}>
            <View style={{ gap: 4 }}>
              <Text style={styles.subTitle}>사업자등록번호</Text>
              <View style={styles.subInputBox}>
                <TextInput
                  editable={!recert}
                  style={[
                    styles.subTextInput,
                    {
                      color: recert
                        ? 'rgba(46, 49, 53, 0.60)'
                        : COLORS.labelNormal,
                    },
                  ]}
                  placeholder="사업자등록번호 10자리를 숫자로 입력해주세요."
                  value={inputs.businessNo}
                  onChangeText={value => {
                    if (value?.length > 15) return;
                    handleInputChange('businessNo', value, true);
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{ gap: 4, marginTop: 16 }}>
              <Text style={styles.subTitle}>대표자명</Text>
              <View style={styles.subInputBox}>
                <TextInput
                  style={styles.subTextInput}
                  placeholder="대표자명을 입력해주세요."
                  value={inputs.ceoName}
                  onChangeText={value => {
                    if (value?.length > 15) return;
                    handleInputChange('ceoName', value);
                  }}
                />
              </View>
            </View>
            <View style={{ gap: 4, marginTop: 16 }}>
              <Text style={styles.subTitle}>개업일</Text>
              <View style={styles.subInputBox}>
                <TextInput
                  editable={!recert}
                  style={[
                    styles.subTextInput,
                    {
                      color: recert
                        ? 'rgba(46, 49, 53, 0.60)'
                        : COLORS.labelNormal,
                    },
                  ]}
                  placeholder="개업연월일 8자리를(YYYYMMDD) 입력해 주세요."
                  value={inputs.openDate}
                  onChangeText={value => {
                    if (value?.length > 8) return;
                    handleInputChange('openDate', value, true);
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 24,
            }}>
            <TouchableOpacity
              disabled={!areInputsFilled}
              onPress={() => {
                openModal();
              }}
              style={{
                height: 48,
                backgroundColor: areInputsFilled
                  ? COLORS.orange
                  : COLORS.disable,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  ...fontStyles.fontSize16_Semibold,
                  color: areInputsFilled ? COLORS.white : COLORS.disableText,
                }}>
                인증하기
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SPKeyboardAvoidingView>

      <SPModal
        title="인증 확인"
        contents="인증 요청하시겠습니까?"
        visible={certRequestModalVisible}
        onConfirm={() => {
          certCompany();
        }}
        onCancel={() => {
          setCertRequestModalVisible(false);
        }}
        onClose={() => {
          setCertRequestModalVisible(false);
        }}
      />
      <SPModal
        title="재인증 확인"
        contents="재인증 요청하시겠습니까?"
        visible={reCertRequestModalVisible}
        onConfirm={() => {
          reCertCompany();
        }}
        onCancel={() => {
          setReCertRequestModalVisible(false);
        }}
        onClose={() => {
          setReCertRequestModalVisible(false);
        }}
      />
    </DismissKeyboard>
  );
}

export default memo(AcademyCompany);

const styles = {
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 0,
  },
  subInputBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  subTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 10,
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 15,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.labelNormal,
    lineHeight: 20,
    letterSpacing: 0.203,
  },
};
