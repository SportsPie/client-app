import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiGetAcademyConfigMngPlayersByUserIdx,
  apiPutAcademyConfigMngPlayers,
} from '../../api/RestAPI';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import { MAIN_FOOT_TYPE } from '../../common/constants/mainFootType';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { POSITION_TYPE } from '../../common/constants/positionType';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import { COLORS } from '../../styles/colors';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import Header from '../../components/header';

function AcademyPlayerProfileEdit({ route }) {
  /**
   * state
   */
  const statIdx = route?.params?.statIdx;
  const userIdx = route?.params?.userIdx;

  const [player, setPlayer] = useState({});

  const [selectedPositionType, setSelectedPositionType] = useState({});
  const [selectedFootType, setSelectedFootType] = useState({});
  const [inputs, setInputs] = useState({
    height: '',
    shoeSize: '',
    weight: '',
    backNo: '',
  });
  const trlRef = useRef({ current: { disabled: false } });

  const areInputsFilled = Object.values(inputs).every(
    value => value && value.trim() !== '',
  );

  const isFormValid =
    selectedPositionType && selectedFootType && areInputsFilled;

  const positionTypeList = Object.values(POSITION_TYPE).map(item => {
    return { label: item.desc, value: item.code };
  });

  const footTypeList = Object.values(MAIN_FOOT_TYPE).map(item => {
    return { label: item.desc, value: item.name };
  });

  /**
   * api
   */
  const getProfile = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngPlayersByUserIdx(userIdx);
      setPlayer(data.data.player || {});
      setSelectedPositionType(data.data.player?.position);
      setSelectedFootType(data.data.player?.mainFoot);
      setInputs({
        height: `${data.data.player?.height || ''}`,
        shoeSize: `${data.data.player?.shoeSize || ''}`,
        weight: `${data.data.player?.weight || ''}`,
        backNo: `${data.data.player?.backNo || ''}`,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const editProfile = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const params = {
        userIdx,
        ...inputs,
        position: selectedPositionType,
        mainFoot: selectedFootType,
      };
      const { data } = await apiPutAcademyConfigMngPlayers(params);
      Utils.openModal({
        title: '성공',
        body: '프로필이 수정되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const handleInputChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: Utils.onlyNumber(value) }));
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getProfile();
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
        <SafeAreaView style={styles.container}>
          <Header title="선수 프로필 수정" />
          <ScrollView style={styles.subContainer}>
            <View style={{ flexDirection: 'column', gap: 16, paddingTop: 24 }}>
              <View style={{ gap: 4 }}>
                <Text style={[styles.subTitle, { marginBottom: 4 }]}>
                  포지션
                </Text>
                <View
                  style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {positionTypeList.map((item, index) => (
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      /* eslint-disable-next-line react/no-array-index-key */
                      key={index}
                      onPress={() => {
                        setSelectedPositionType(item.value);
                      }}
                      style={[
                        styles.classTypeBtn,
                        {
                          backgroundColor:
                            selectedPositionType === item.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                          borderColor:
                            selectedPositionType === item.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.classTypeText,
                          {
                            color:
                              selectedPositionType === item.value
                                ? '#FFF'
                                : 'rgba(46, 49, 53, 0.60)',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>키</Text>
                <View style={styles.subInputBox}>
                  <TextInput
                    style={styles.subTextInput}
                    placeholder="키를 입력해주세요."
                    value={inputs.height}
                    onChangeText={value => handleInputChange('height', value)}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.subTextInputText}>cm</Text>
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>발 사이즈</Text>
                <View style={styles.subInputBox}>
                  <TextInput
                    style={styles.subTextInput}
                    placeholder="발 사이즈를 입력해주세요."
                    value={inputs.shoeSize}
                    onChangeText={value => handleInputChange('shoeSize', value)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.subTextInputText}>mm</Text>
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>몸무게</Text>
                <View style={styles.subInputBox}>
                  <TextInput
                    style={styles.subTextInput}
                    placeholder="몸무게를 입력해주세요."
                    value={inputs.weight}
                    onChangeText={value => handleInputChange('weight', value)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.subTextInputText}>kg</Text>
                </View>
              </View>
              <View style={{ gap: 4 }}>
                <Text style={styles.subTitle}>등 번호</Text>
                <View style={styles.subInputBox}>
                  <TextInput
                    style={styles.subTextInput}
                    placeholder="등 번호를 입력해주세요."
                    value={inputs.backNo}
                    onChangeText={value => handleInputChange('backNo', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={{ gap: 4 }}>
                <Text style={[styles.subTitle, { marginBottom: 4 }]}>
                  주 사용발
                </Text>
                <View
                  style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {footTypeList.map((item, index) => (
                    <TouchableOpacity
                      /* eslint-disable-next-line react/no-array-index-key */
                      key={index}
                      onPress={() => {
                        setSelectedFootType(item.value);
                      }}
                      style={[
                        styles.classTypeBtn,
                        {
                          backgroundColor:
                            selectedFootType === item.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                          borderColor:
                            selectedFootType === item.value
                              ? '#FF671F'
                              : 'rgba(135, 141, 150, 0.16)',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.classTypeText,
                          {
                            color:
                              selectedFootType === item.value
                                ? '#FFF'
                                : 'rgba(46, 49, 53, 0.60)',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={[styles.subBtn, { opacity: isFormValid ? 1 : 0.5 }]}>
            <TouchableOpacity
              style={styles.subBtnBox}
              disabled={!isFormValid}
              onPress={() => {
                editProfile();
              }}>
              <Text style={styles.subBtnText}>저장</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

export default memo(AcademyPlayerProfileEdit);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  subContainer: {
    flex: 1,
    paddingHorizontal: 16,
    // paddingTop: 24,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 0,
  },
  classTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  classTypeText: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  subBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  subBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
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
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  subTextInputText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
};
