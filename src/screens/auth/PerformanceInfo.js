import { useRoute } from '@react-navigation/native';
import React, { memo, useEffect, useMemo, useState, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { apiJoin, apiPostSnsJoin, apiPutAddInfo } from '../../api/RestAPI';
import { MAIN_FOOT } from '../../common/constants/mainFoot';
import { navName } from '../../common/constants/navName';
import { SCHOOL_LEVEL } from '../../common/constants/schoolLevel';
import { SOCCER_POSITION } from '../../common/constants/soccerPosition';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import Selector from '../../components/Selector';
import Header from '../../components/header/index';
import NavigationService from '../../navigation/NavigationService';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { getFcmToken } from '../../utils/FirebaseMessagingService';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import { SafeAreaView } from 'react-native-safe-area-context';

function PerformanceInfo() {
  const route = useRoute();
  const {
    userName,
    userBirth,
    userPhoneNo,
    userGender,
    userLoginId,
    userLoginPassword,
    userNickName,
    referralCode,
    userRegion,
    userSubRegion,
    logoImage,
    loginType,
    snsKey,
    codeType,
    isMarketingAgree,
  } = route.params;
  const [position, setPosition] = useState('');
  const [tall, setTall] = useState('');
  const [footSize, setFootSize] = useState('');
  const [weight, setWeight] = useState('');
  const [backNumber, setBackNumber] = useState('');
  const [career, setCareer] = useState([]);
  const [mainFoot, setMainFoot] = useState('');
  const [osVersion, setOsVersion] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const trlRef = useRef({ current: { disabled: false } });
  // const mess = codeType.includes('1205') ? '인증완료' : '가입완료';
  const mess =
    codeType == null ? '가입완료' : codeType === 1205 ? '인증완료' : '가입완료';
  const isDisableButton = useMemo(() => {
    if (
      !position ||
      !tall ||
      !footSize ||
      !weight ||
      !backNumber ||
      !career ||
      !mainFoot
    ) {
      return true;
    }

    return false;
  }, [position, tall, footSize, weight, backNumber, career, mainFoot]);
  const handleTallChange = text => {
    const tallValue = Utils.changeDecimalForInput(text, 1);
    setTall(tallValue);
  };

  const handleWeightChange = text => {
    const weightValue = Utils.changeDecimalForInput(text, 1);
    setWeight(weightValue);
  };

  const nextPage = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const formData = new FormData();
      const token = await getFcmToken();
      let data;
      if (loginType === 'EMAIL') {
        data = {
          userName,
          userBirth,
          userPhoneNo,
          userGender,
          userLoginId,
          userLoginPassword,
          userNickName,
          referralCode,
          userRegion,
          userSubRegion,
          position,
          osVersion,
          deviceId,
          deviceType: Platform.OS === 'ios' ? 'IOS' : 'AOS',
          deviceModel,
          height: tall,
          shoeSize: footSize,
          weight,
          backNo: backNumber,
          careerList: career,
          mainFoot,
          optionSelected: true,
          marketingAgree: isMarketingAgree,
          fcmToken: token ?? '',
        };
        formData.append('dto', {
          string: JSON.stringify(data),
          type: 'application/json',
        });
        // logo
        if (logoImage) formData.append('file', logoImage);
        apiJoin(formData)
          .then(async response => {
            await Utils.login(response.data.data);
            NavigationService.navigate(navName.completeSign, {
              userNickName,
            });
          })
          .catch(error => {
            handleError(error);
          });
      } else if (loginType !== 'EMAIL' && codeType === 1101) {
        data = {
          userName,
          userBirth,
          userPhoneNo,
          userGender,
          userLoginId,
          loginType,
          userNickName,
          referralCode,
          userRegion,
          userSubRegion,
          position,
          osVersion,
          deviceId,
          deviceType: Platform.OS === 'ios' ? 'IOS' : 'AOS',
          deviceModel,
          height: tall,
          shoeSize: footSize,
          weight,
          backNo: backNumber,
          careerList: career,
          mainFoot,
          optionSelected: true,
          marketingAgree: isMarketingAgree,
          snsKey,
          fcmToken: token ?? '',
        };
        formData.append('dto', {
          string: JSON.stringify(data),
          type: 'application/json',
        });

        // logo
        if (logoImage) formData.append('file', logoImage);
        apiPostSnsJoin(formData)
          .then(async response => {
            await Utils.login(response.data.data);
            NavigationService.navigate(navName.completeSign, {
              userNickName,
            });
          })
          .catch(error => {
            handleError(error);
          });
      } else {
        data = {
          userName,
          userBirth,
          userPhoneNo,
          userGender,
          userLoginId,
          loginType,
          userNickName,
          referralCode,
          userRegion,
          userSubRegion,
          position,
          osVersion,
          deviceId,
          deviceType: Platform.OS === 'ios' ? 'IOS' : 'AOS',
          deviceModel,
          height: tall,
          shoeSize: footSize,
          weight,
          backNo: backNumber,
          careerList: career,
          mainFoot,
          optionSelected: true,
          marketingAgree: isMarketingAgree,
          snsKey,
        };
        formData.append('dto', {
          string: JSON.stringify(data),
          type: 'application/json',
        });

        // logo
        if (logoImage) formData.append('file', logoImage);
        apiPutAddInfo(formData)
          .then(async response => {
            await Utils.login(response.data.data);
            NavigationService.navigate(navName.completeSign, {
              userNickName,
            });
          })
          .catch(error => {
            handleError(error);
          });
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const jumpPage = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const formData = new FormData();
      let data;
      const token = await getFcmToken();

      if (loginType === 'EMAIL') {
        data = {
          userName,
          userBirth,
          userPhoneNo,
          userGender,
          userLoginId,
          userLoginPassword,
          userNickName,
          referralCode,
          userRegion,
          userSubRegion,
          osVersion,
          deviceId,
          deviceType: Platform.OS === 'ios' ? 'IOS' : 'AOS',
          deviceModel,
          optionSelected: false,
          marketingAgree: isMarketingAgree,
          fcmToken: token ?? '',
        };
        formData.append('dto', {
          string: JSON.stringify(data),
          type: 'application/json',
        });
        // logo
        if (logoImage) formData.append('file', logoImage);
        apiJoin(formData)
          .then(async response => {
            await Utils.login(response.data.data);
            NavigationService.navigate(navName.completeSign, {
              userNickName,
            });
          })
          .catch(error => {
            handleError(error);
          });
      } else if (loginType !== 'EMAIL' && codeType === 1101) {
        data = {
          userName,
          userBirth,
          userPhoneNo,
          userGender,
          userLoginId,
          loginType,
          userNickName,
          referralCode,
          userRegion,
          userSubRegion,
          osVersion,
          deviceId,
          deviceType: Platform.OS === 'ios' ? 'IOS' : 'AOS',
          deviceModel,
          optionSelected: false,
          marketingAgree: isMarketingAgree,
          snsKey,
          fcmToken: token ?? '',
        };
        formData.append('dto', {
          string: JSON.stringify(data),
          type: 'application/json',
        });
        // logo
        if (logoImage) formData.append('file', logoImage);
        apiPostSnsJoin(formData)
          .then(async response => {
            await Utils.login(response.data.data);
            NavigationService.navigate(navName.completeSign, {
              userNickName,
            });
          })
          .catch(error => {
            handleError(error);
          });
      } else {
        data = {
          userName,
          userBirth,
          userPhoneNo,
          userGender,
          userLoginId,
          loginType,
          userNickName,
          referralCode,
          userRegion,
          userSubRegion,
          osVersion,
          deviceId,
          deviceType: Platform.OS === 'ios' ? 'IOS' : 'AOS',
          marketingAgree: isMarketingAgree,
          deviceModel,
          optionSelected: false,
          snsKey,
        };
        formData.append('dto', {
          string: JSON.stringify(data),
          type: 'application/json',
        });
        // logo
        if (logoImage) formData.append('file', logoImage);
        apiPutAddInfo(formData)
          .then(async response => {
            await Utils.login(response.data.data);
            NavigationService.navigate(navName.completeSign, {
              userNickName,
            });
          })
          .catch(error => {
            handleError(error);
          });
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  useEffect(() => {
    const phoneInfo = async () => {
      const fetchedOsVersion = DeviceInfo.getSystemVersion();
      const fetchedDeviceId = await DeviceInfo.getUniqueId();
      const fetchedDeviceModel = DeviceInfo.getModel();
      setOsVersion(fetchedOsVersion);
      setDeviceId(fetchedDeviceId);
      setDeviceModel(fetchedDeviceModel);
    };
    phoneInfo();
  });

  const renderRightButton = useMemo(() => {
    return (
      <Pressable onPress={jumpPage}>
        <Text style={styles.rightHeaderText}>건너뛰기</Text>
      </Pressable>
    );
  }, []);

  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <SPKeyboardAvoidingView
          isResize={true}
          behavior="padding"
          style={styles.container}>
          <Header title="회원가입" rightContent={renderRightButton} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainerStyle}>
            <Text style={fontStyles.fontSize18_Semibold}>
              {'회원님의 퍼포먼스 정보를\n입력해주세요.'}
            </Text>

            {/* Position */}
            <Selector
              title="포지션"
              options={Object.values(SOCCER_POSITION).map(item => {
                return {
                  id: Utils.UUIDV4(),
                  label: item?.desc,
                  value: item?.value,
                };
              })}
              onItemPress={setPosition}
              selectedItem={position}
            />

            {/* Tall */}
            <SPInput
              placeholder=""
              title="키"
              subPlaceholder="cm"
              maxLength={5}
              keyboardType="number-pad"
              value={tall}
              onChangeText={handleTallChange}
              textAlign="right"
              onlyDecimal
            />

            {/* Foot size */}
            <SPInput
              placeholder=""
              title="발 사이즈"
              subPlaceholder="mm"
              maxLength={3}
              keyboardType="number-pad"
              value={Utils.onlyNumber(footSize)}
              onChangeText={setFootSize}
              textAlign="right"
              onlyNumber
            />

            {/* Weight */}
            <SPInput
              placeholder=""
              title="몸무게"
              subPlaceholder="kg"
              maxLength={5}
              keyboardType="number-pad"
              value={weight}
              onChangeText={handleWeightChange}
              textAlign="right"
              onlyDecimal
            />

            {/* Back number */}
            <SPInput
              placeholder=""
              title="등 번호"
              maxLength={2}
              value={Utils.onlyNumber(backNumber)}
              onChangeText={setBackNumber}
              keyboardType="number-pad"
              textAlign="right"
              onlyNumber
            />

            <Selector
              title="선수경력"
              options={Object.values(SCHOOL_LEVEL).map(item => ({
                id: Utils.UUIDV4(),
                label: item?.desc,
                value: item?.value,
              }))}
              onItemPress={setCareer}
              selectedItem={career}
              multiple={true}
            />

            {/* Main foot */}
            <Selector
              title="주 사용발"
              options={Object.values(MAIN_FOOT).map(item => {
                return {
                  id: Utils.UUIDV4(),
                  label: item?.desc,
                  value: item?.value,
                };
              })}
              onItemPress={setMainFoot}
              selectedItem={mainFoot}
            />
          </ScrollView>

          <PrimaryButton
            onPress={nextPage}
            buttonStyle={styles.submitButton}
            text={mess}
            disabled={isDisableButton}
          />
        </SPKeyboardAvoidingView>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(PerformanceInfo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    rowGap: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  submitButton: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
});
