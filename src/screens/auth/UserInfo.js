import { useRoute } from '@react-navigation/native';
import React, { memo, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiCityList, apiGuList, apiVerifyReferral } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import Avatar from '../../components/Avatar';
import BoxSelect from '../../components/BoxSelect';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import SPSelectPhotoModal from '../../components/SPSelectPhotoModal';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';

function UserInfo() {
  const [nickName, setNickName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSubRegion, setSelectedSubRegion] = useState('');
  const [recommend, setRecommend] = useState(null);
  const [regions, setRegions] = useState([]);
  const [subRegions, setSubRegions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoImage, setLogoImage] = useState();
  const [showProfilePhotoSelectModal, setShowProfilePhotoSelectModal] =
    useState(false);
  const route = useRoute();
  const maxFilename = 60;

  const updateProfile = ({ fileUrl, imageName, imageType }) => {
    setLogoImage({
      uri: fileUrl,
      name:
        imageName.length <= maxFilename
          ? imageName
          : imageName.substring(
              imageName.length - maxFilename,
              imageName.length,
            ),
      type: imageType,
    });
  };
  const {
    userName,
    userBirth,
    userPhoneNo,
    userGender,
    userLoginId,
    userLoginPassword,
    loginType,
    snsKey,
    codeType,
  } = route.params;

  const nextPage = async () => {
    let params;
    if (loginType === 'EMAIL') {
      params = {
        userName,
        userBirth,
        userPhoneNo,
        userGender,
        userLoginId,
        userLoginPassword,
        logoImage,
        loginType,
        userNickName: nickName,
        referralCode: recommend,
        userRegion: selectedRegion,
        userSubRegion: selectedSubRegion,
      };
    } else {
      params = {
        userName,
        userBirth,
        userPhoneNo,
        userGender,
        userLoginId,
        logoImage,
        loginType,
        snsKey,
        codeType,
        userNickName: nickName,
        referralCode: recommend,
        userRegion: selectedRegion,
        userSubRegion: selectedSubRegion,
      };
    }

    if (recommend) {
      try {
        const response = await apiVerifyReferral(recommend);
        NavigationService.navigate(navName.performanceInfo, params);
      } catch (error) {
        handleError(error);
        setRecommend(null);
      }
    } else {
      NavigationService.navigate(navName.performanceInfo, params);
    }
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
        ); // 데이터에서 지역 목록을 가져옵니다.
      } catch (error) {
        handleError(error);
      }
    };
    fetchRegionData();
  }, []);

  useEffect(() => {
    const fetchSubRegionData = async () => {
      try {
        const response = await apiGuList(selectedRegion); // selectedRegion 값 사용
        console.log('Gu list data:', response.data);
        setSubRegions(
          response.data.data?.map(item => {
            return {
              id: Utils.UUIDV4(),
              label: item,
              value: item,
            };
          }),
        ); // 데이터에서 지역 목록을 가져옵니다.
      } catch (error) {
        handleError(error);
      }
    };

    if (selectedRegion) {
      fetchSubRegionData();
      setSelectedSubRegion('');
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedRegion === '세종특별자치시') {
      setSelectedSubRegion('-');
    }
  }, [selectedRegion]);
  console.log(selectedSubRegion);
  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="회원 가입" />

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={fontStyles.fontSize18_Semibold}>
            {'회원님의 정보를\n입력해주세요.'}
          </Text>
          <View style={styles.contentsTop}>
            <Avatar
              imageSize={56}
              imageURL={logoImage?.uri}
              onPress={() => {
                setShowProfilePhotoSelectModal(true);
              }}
            />
          </View>
          {/* Nickname */}
          <SPInput
            title="닉네임"
            placeholder="8자 이내 한글 혹은 영문 닉네임을 입력하세요"
            maxLength={8}
            value={nickName}
            onChangeText={setNickName}
          />

          {/* Country */}
          <View style={{ gap: 4 }}>
            <Text style={styles.countryTitle}>지역</Text>
            <View style={styles.country}>
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
                />
              )}
            </View>
          </View>

          {/* Referrol code */}
          <SPInput
            title="추천인 코드"
            placeholder="추천인 코드를 입력하세요"
            bottomText={errorMessage?.length > 0 ? errorMessage : ''}
            error={errorMessage?.length > 0}
            value={recommend}
            onChangeText={setRecommend}
          />
        </ScrollView>

        <PrimaryButton
          text="다음"
          buttonStyle={styles.submitButton}
          disabled={!nickName || !selectedRegion || !selectedSubRegion}
          onPress={nextPage}
        />
        <SPSelectPhotoModal
          visible={showProfilePhotoSelectModal}
          crop
          cropWithRate={1}
          cropHeightRate={1}
          onClose={async () => {
            setShowProfilePhotoSelectModal(false);
          }}
          onComplete={data => {
            updateProfile(data);
          }}
        />
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(UserInfo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    rowGap: 16,
  },
  submitButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  contentsTop: {
    alignSelf: 'flex-start',
  },
  country: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
  },
  countryTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
});
