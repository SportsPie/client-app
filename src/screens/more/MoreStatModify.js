import React, { memo, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGetMyStat, apiModifyMyStat } from '../../api/RestAPI';
import { CAREER_TYPE } from '../../common/constants/careerType';
import { MAIN_FOOT } from '../../common/constants/mainFoot';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { SOCCER_POSITION } from '../../common/constants/soccerPosition';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import Selector from '../../components/Selector';
import Header from '../../components/header';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';

function MoreStatModify() {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [backNo, setBackNo] = useState('');
  const [shoeSize, setShoeSize] = useState('');
  const [position, setPosition] = useState('');
  const [mainFoot, setMainFoot] = useState('');
  const [careerType, setCareerType] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [throttle, setThrottle] = useState(false);
  // const [showCompleteModal, setShowCompleteModal] = useState(false);

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  // Input 검증
  const validateAllInput = () => {
    const result = {
      isValid: true,
      message: '',
    };

    if (!height || Number.isNaN(parseFloat(height))) {
      result.isValid = false;
      result.message = '키를 입력해 주세요.';
      return result;
    }

    if (!shoeSize || Number.isNaN(parseInt(shoeSize, 10))) {
      result.isValid = false;
      result.message = '발 사이즈를 입력해 주세요.';
      return result;
    }

    if (!weight || Number.isNaN(parseFloat(height))) {
      result.isValid = false;
      result.message = '몸무게를 입력해 주세요.';
      return result;
    }

    if (!backNo) {
      result.isValid = false;
      result.message = '등번호를 입력해 주세요.';
      return result;
    }

    if (!position) {
      result.isValid = false;
      result.message = '포지션을 선택해 주세요.';
      return result;
    }

    if (!mainFoot) {
      result.isValid = false;
      result.message = '주 사용발을 선택해 주세요.';
      return result;
    }

    if (careerType.length < 1) {
      result.isValid = false;
      result.message = '선수경력을 선택해 주세요.';
      return result;
    }

    return result;
  };

  // --------------------------------------------------
  // [ Apis ]
  // --------------------------------------------------
  const getStat = async () => {
    try {
      const { data } = await apiGetMyStat();
      if (data && data.data && data.data.stats) {
        const info = data.data.stats;

        setWeight(info.weight);
        setBackNo(info.backNo);
        setHeight(info.height);
        setPosition(info.position);
        setShoeSize(info.shoeSize);
        setMainFoot(info.mainFoot);
        setCareerType(info.careerType);
      } else {
        const info = {};
      }
    } catch (error) {
      handleError(error);
    }
  };
  const modifyStat = async () => {
    try {
      if (throttle) return;
      setThrottle(true);
      const validRes = validateAllInput();
      if (!validRes.isValid) {
        Utils.openModal({
          body: validRes.message,
          closeEvent: MODAL_CLOSE_EVENT.nothing,
        });
        return;
      }

      const param = {
        weight,
        height,
        backNo,
        position,
        shoeSize,
        mainFoot,
        careerType,
      };

      const { data } = await apiModifyMyStat(param);
      if (data) {
        Utils.openModal({
          body: '수정에 성공했습니다.',
          closeEvent: MODAL_CLOSE_EVENT.goBack,
        });
      }
    } catch (error) {
      handleError(error);
    }
    setThrottle(false);
  };

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------
  useEffect(() => {
    getStat();
  }, []);

  useEffect(() => {
    const res = validateAllInput();
    setIsValid(res.isValid);
  }, [height, weight, backNo, shoeSize, position, mainFoot, careerType]);

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <Header title="내 퍼포먼스 수정" />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            <Selector
              title="포지션"
              options={Object.values(SOCCER_POSITION).map(item => {
                return {
                  id: Utils.UUIDV4(),
                  label: item?.desc,
                  value: item?.value,
                };
              })}
              onItemPress={value => {
                setPosition(value);
              }}
              selectedOnItem={position}
            />

            <SPInput
              placeholder=""
              title="키"
              subPlaceholder="cm"
              maxLength={5}
              keyboardType="number-pad"
              textAlign="right"
              value={`${height}`}
              onChangeText={setHeight}
              onlyDecimal
            />

            <SPInput
              placeholder=""
              title="발 사이즈"
              subPlaceholder="mm"
              maxLength={3}
              keyboardType="number-pad"
              textAlign="right"
              value={`${shoeSize}`}
              onChangeText={setShoeSize}
              onlyNumber
            />

            <SPInput
              placeholder=""
              title="몸무게"
              subPlaceholder="kg"
              maxLength={5}
              keyboardType="number-pad"
              textAlign="right"
              value={`${weight}`}
              onChangeText={setWeight}
            />

            <SPInput
              placeholder="등 번호를 입력해주세요"
              title="등 번호"
              keyboardType="number-pad"
              value={`${backNo}`}
              onChangeText={setBackNo}
              textAlign="right"
              onlyNumber
            />

            <Selector
              title="선수경력"
              options={Object.values(CAREER_TYPE).map(item => {
                return {
                  id: Utils.UUIDV4(),
                  label: item?.desc,
                  value: item?.value,
                };
              })}
              multiple
              selectedOnItem={careerType}
              onItemPress={setCareerType}
            />

            <Selector
              title="주 사용발"
              options={Object.values(MAIN_FOOT).map(item => {
                return {
                  id: Utils.UUIDV4(),
                  label: item?.desc,
                  value: item?.value,
                };
              })}
              selectedOnItem={mainFoot}
              onItemPress={setMainFoot}
            />
          </ScrollView>

          <PrimaryButton
            text="수정완료"
            buttonStyle={styles.submitButton}
            onPress={modifyStat}
            disabled={!isValid}
          />
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

export default memo(MoreStatModify);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    rowGap: 16,
  },
  content: {
    paddingTop: 24,
    rowGap: 16,
  },
  submitButton: {
    marginVertical: 24,
  },
});
