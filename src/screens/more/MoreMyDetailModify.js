import { useRoute } from '@react-navigation/native';
import React, { memo, useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiCityList,
  apiGetMyInfo,
  apiGuList,
  apiModifyMyInfo,
} from '../../api/RestAPI';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { navName } from '../../common/constants/navName';
import BoxSelect from '../../components/BoxSelect';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import NavigationService from '../../navigation/NavigationService';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import Header from '../../components/header';

function MoreMyDetailModify() {
  const [member, setMember] = useState({});
  const [Phone, setPhone] = useState([]);
  const route = useRoute();
  const { myName, myBirth, myPhone, myGender, local, subLocal } = route.params;
  const [phoneNumber, setPhoneNumber] = useState(myPhone);
  const [selectedRegion, setSelectedRegion] = useState(local);
  const [selectedSubRegion, setSelectedSubRegion] = useState(subLocal);
  const [regions, setRegions] = useState([]);
  const [subRegions, setSubRegions] = useState([]);
  const { userName, userBirth, userPhone, userGender } = route.params || {}; // 기본값으로 빈 객체 설정
  const [isModified, setIsModified] = useState(false);
  const [isCheckInfo, setIsCheckInfo] = useState(false);
  const [isSubRegion, setIsSubRegion] = useState(false);
  const trlRef = useRef({ current: { disabled: false } });
  const getMyInfo = async () => {
    try {
      const { data } = await apiGetMyInfo();
      if (data) {
        setMember(data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    getMyInfo();
  }, []);

  const handlePhoneNumberChange = newPhoneNumber => {
    setPhoneNumber(newPhoneNumber);
  };

  const handlePhoneNumberUpdate = () => {
    NavigationService.navigate(navName.moreMobileAuthenticationMyInfo);
  };

  useEffect(() => {
    const fetchRegionData = async () => {
      try {
        const response = await apiCityList();
        setRegions(
          response.data.data?.map(item => {
            return {
              id: Utils.UUIDV4(),
              label: item,
              value: item,
            };
          }),
        );
      } catch (error) {
        handleError(error);
      }
    };
    fetchRegionData();
  }, []);

  useEffect(() => {
    const fetchGuListData = async () => {
      try {
        const response = await apiGuList(selectedRegion);
        const result = response.data.data?.map(item => {
          return {
            id: Utils.UUIDV4(),
            label: item,
            value: item,
          };
        });

        setSubRegions(result);
      } catch (error) {
        handleError(error);
        throw error;
      }
    };

    fetchGuListData();
  }, [selectedRegion]);

  const handleUpdateComplete = async () => {
    const formData = new FormData();

    const param = {
      userPhoneNo: phoneNumber,
      userRegion: selectedRegion,
      userSubRegion: selectedSubRegion,
      userName: userName != null ? userName : member.userName,
      userBirth:
        userBirth != null
          ? Utils.formatDateString(userBirth)
          : member.userBirthday,
      userGender: userGender != null ? userGender : myGender,
    };
    formData.append('dto', {
      string: JSON.stringify(param),
      type: 'application/json',
    });
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiModifyMyInfo(formData);
      if (data) {
        Utils.openModal({
          body: '수정에 성공했습니다.',
          closeEvent: MODAL_CLOSE_EVENT.goBack,
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  useEffect(() => {
    setIsModified(phoneNumber === myPhone);
  }, [phoneNumber, myPhone]);

  useEffect(() => {
    setIsCheckInfo(
      member.userName === userName &&
        member.userBirthday === Utils.formatDateString(userBirth) &&
        member.userGender === userGender &&
        phoneNumber === Utils.addHypenToPhoneNumber(userPhone),
    );
  }, [member, userName, userBirth, userGender, userPhone, phoneNumber]);

  useEffect(() => {
    if (selectedRegion === '세종특별자치시') {
      setSelectedSubRegion('-');
    } else if (selectedRegion !== local) {
      setSelectedSubRegion(null);
    }
  }, [selectedRegion]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="내 정보 수정" />

      <View style={styles.container}>
        <View style={[styles.rowContent, { columnGap: 8 }]}>
          <SPInput
            containerStyle={{ flex: 1 }}
            title="휴대폰번호"
            placeholder="휴대폰번호를 입력하세요"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
          />
          <PrimaryButton
            onPress={handlePhoneNumberUpdate}
            outlineButton
            text="변경"
            buttonStyle={styles.button}
          />
        </View>

        <View style={{ rowGap: 4 }}>
          <Text style={fontStyles.fontSize12_Regular}>지역</Text>

          <View style={styles.rowContent}>
            <BoxSelect
              placeholder="시/도"
              arrayOptions={regions}
              onItemPress={setSelectedRegion} // setSelectedRegion 호출
              value={selectedRegion}
            />
            {selectedRegion !== '세종특별자치시' && (
              <BoxSelect
                placeholder="시/군/구"
                arrayOptions={subRegions}
                onItemPress={setSelectedSubRegion}
                value={selectedSubRegion}
                disabled={subRegions?.length === 0}
              />
            )}
          </View>
        </View>

        <PrimaryButton
          text="수정완료"
          buttonStyle={{
            marginTop: 'auto',
          }}
          onPress={handleUpdateComplete}
          disabled={(!isModified && !isCheckInfo) || selectedSubRegion === null}
          // true일때 비활성화
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(MoreMyDetailModify);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  rowContent: {
    flexDirection: 'row',
    columnGap: 16,
  },
  button: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    // paddingHorizontal: 28,
    padding: 12,
  },
});
