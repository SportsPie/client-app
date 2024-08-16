import React, { useCallback, useState, useRef, memo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DismissKeyboard from '../../components/DismissKeyboard';
import { COLORS } from '../../styles/colors';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import SPIcons from '../../assets/icon';
import SPSwitch from '../../components/SPSwitch';
import SPSearchAddress from '../../components/SPSearchAddress';
import Utils from '../../utils/Utils';
import SPSelectPhotoModal from '../../components/SPSelectPhotoModal';
import { apiGetAcdmyFilters, apiPostAcademy } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { IS_YN } from '../../common/constants/isYN';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function AcademyRegist() {
  /**
   * state
   */

  const [classTypeList, setClassTypeList] = useState([]);
  const [teachingTypeList, setTeachingTypeList] = useState([]);
  const [serviceTypeList, setServiceTypeList] = useState([]);

  /* 아카데미 정보 */
  // 로고 이미지
  const [logoImage, setLogoImage] = useState();
  // 아카데미 이름
  const [academyName, setAcademyName] = useState('');
  // 주소
  const [addr, setAddr] = useState('');
  // 상세주소
  const [detailAddr, setDetailAddr] = useState('');
  // 위경도
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [city, setCity] = useState();
  const [gu, setGu] = useState();
  const [dong, setDong] = useState();
  // 대표번호
  const [ceoPhone, setCeoPhone] = useState('');
  // 운영시간
  const [workTime, setWorkTime] = useState('');
  // 아카데미 이미지
  const [academyPhotoList, setAcademyPhotoList] = useState([]);
  // 인스타그램 계정
  const [instagram, setInstagram] = useState('');
  // 홈페이지 주소
  const [homePageUrl, setHomePageUrl] = useState('');
  // 소개글
  const [description, setDescription] = useState('');
  // 클래스
  const [selectedClassType, setSelectedClassType] = useState({});
  const [classDesc, setClassDesc] = useState('');
  // 수업방식
  const [selectedTeachingType, setSelectedTeachingType] = useState({});
  const [teachingDesc, setTeachingDesc] = useState('');
  // 서비스
  const [selectedServiceType, setSelectedServiceType] = useState({});
  // 기타사항
  const [memo, setMemo] = useState('');
  // 자동 가입
  const [autoJoin, setAutoJoin] = useState(IS_YN.N);
  // 경기내역 공개
  const [matchHistoryOpen, setMatchHistoryOpen] = useState(IS_YN.N);

  /* modal */
  const [showSearchAddressModal, setShowSearchAddressModal] = useState(false);
  const [showProfilePhotoSelectModal, setShowProfilePhotoSelectModal] =
    useState(false);
  const [showAcademyPhotoSelectModal, setShowAcademyPhotoSelectModal] =
    useState(false);

  /**
   * api
   */
  const getAcademyFilterList = async () => {
    try {
      const { data } = await apiGetAcdmyFilters();
      if (data.data) {
        const { CLASS, METHOD, SERVICE } = data.data;
        if (CLASS && CLASS.length > 0) {
          const list = CLASS.map(v => {
            return { label: v.codeName, value: v.codeSub };
          });
          setClassTypeList(list.reverse());
        }
        if (METHOD && METHOD.length > 0) {
          const list = METHOD.map(v => {
            return { label: v.codeName, value: v.codeSub };
          });
          setTeachingTypeList(list.reverse());
        }
        if (SERVICE && SERVICE.length > 0) {
          const list = SERVICE.map(v => {
            return { label: v.codeName, value: v.codeSub };
          });
          setServiceTypeList(list.reverse());
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const trlRef = useRef({ current: { disabled: false } });
  const registAcademy = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      if (!checkValues()) return;
      const formData = new FormData();

      // academy info
      const params = {
        academyName: Utils.removeSymbolAndBlank(academyName?.trim()),
        description: description?.trim(),
        addrCity: city,
        addrGu: gu,
        addrDong: dong,
        addressFull: `${addr} ${detailAddr?.trim()}`,
        latitude,
        longitude,
        phoneNo: ceoPhone?.trim(),
        workTime: workTime?.trim(),
        openMatchPublicYn: matchHistoryOpen,
        autoApprovalYn: autoJoin,
        memo: memo?.trim(),
        homepageUrl: homePageUrl?.trim(),
        instagramUrl: instagram?.trim(),
        planTypeList: getFilterList(),
      };
      formData.append('dto', {
        string: JSON.stringify(params),
        type: 'application/json',
      });

      // logo
      if (logoImage) formData.append('logo', logoImage);

      // academy photos
      if (academyPhotoList && academyPhotoList.length > 0) {
        academyPhotoList.forEach(item => {
          formData.append('files', item);
        });
      }

      // regist
      const { data } = await apiPostAcademy(formData);
      NavigationService.replace(navName.academyDetail, {
        academyIdx: data.data.academyIdx,
      });
      setTimeout(() => {
        Utils.openModal({
          title: '성공',
          body: '아카데미 등록이 완료되었습니다.',
        });
      }, 0);
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  /**
   * function
   */
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

  const onSelectAddress = data => {
    setAddr(data.address);
    setCity(data.city);
    setGu(data.gu);
    setDong(data.dong);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
  };

  const updateAcademyPhoto = ({ fileUrl, imageName, imageType }) => {
    const photo = {
      uri: fileUrl,
      name:
        imageName.length <= maxFilename
          ? imageName
          : imageName.substring(
              imageName.length - maxFilename,
              imageName.length,
            ),
      type: imageType,
    };
    if (academyPhotoList.length > 2) return; // 이미지는 3개까지 업로드 가능
    setAcademyPhotoList(prev => [...prev, photo]);
  };
  const removeAcademyPhoto = index => {
    const list = [...academyPhotoList];
    list.splice(index, 1);
    setAcademyPhotoList(list);
  };

  const getFilterList = () => {
    const selectedClass = [];
    const selectedTeaching = [];
    const selectedService = [];
    Object.keys(selectedClassType).forEach(key => {
      if (selectedClassType[key]) {
        selectedClass.push({
          planTypeCode: key,
          etc: key?.includes('ETC') ? classDesc : null,
        });
      }
    });
    Object.keys(selectedTeachingType).forEach(key => {
      if (selectedTeachingType[key]) {
        selectedTeaching.push({
          planTypeCode: key,
          etc: key?.includes('ETC') ? teachingDesc : null,
        });
      }
    });
    Object.keys(selectedServiceType).forEach(key => {
      if (selectedServiceType[key]) {
        selectedService.push({
          planTypeCode: key,
          etc: null,
        });
      }
    });
    return [...selectedClass, ...selectedTeaching, ...selectedService];
  };

  const filterExistsCheck = () => {
    let classTypeExists = false;
    let teachingTypeExists = false;
    let serviceTypeExists = false;
    let classEtcExists = false;
    let teachingEtcExists = false;
    const classKeys = Object.keys(selectedClassType);
    const teachingKeys = Object.keys(selectedTeachingType);
    const serviceKeys = Object.keys(selectedServiceType);

    for (let i = 0; i < classKeys.length; i += 1) {
      const key = classKeys[i];
      if (selectedClassType[key]) {
        classTypeExists = true;
        break;
      }
    }
    for (let i = 0; i < classKeys.length; i += 1) {
      const key = classKeys[i];
      if (selectedClassType[key] && key?.includes('ETC')) {
        classEtcExists = true;
        break;
      }
    }

    for (let i = 0; i < teachingKeys.length; i += 1) {
      const key = teachingKeys[i];
      if (selectedTeachingType[key]) {
        teachingTypeExists = true;
        break;
      }
    }
    for (let i = 0; i < teachingKeys.length; i += 1) {
      const key = teachingKeys[i];
      if (selectedTeachingType[key] && key?.includes('ETC')) {
        teachingEtcExists = true;
        break;
      }
    }

    for (let i = 0; i < serviceKeys.length; i += 1) {
      const key = serviceKeys[i];
      if (selectedServiceType[key]) {
        serviceTypeExists = true;
        break;
      }
    }
    if (!classTypeExists) {
      Utils.openModal({
        title: '알림',
        body: '클래스를 하나 이상을 선택해주세요.',
      });
      return false;
    }
    if (classEtcExists && !classDesc) {
      Utils.openModal({
        title: '알림',
        body: '기타 클래스에 대한 값을 입력해주세요.',
      });
      return false;
    }
    if (!teachingTypeExists) {
      Utils.openModal({
        title: '알림',
        body: '수업방식을 하나 이상을 선택해주세요.',
      });
      return false;
    }
    if (teachingEtcExists && !teachingDesc) {
      Utils.openModal({
        title: '알림',
        body: '기타 수업방식에 대한 값을 입력해주세요.',
      });
      return false;
    }
    if (!serviceTypeExists) {
      Utils.openModal({
        title: '알림',
        body: '서비스를 하나 이상을 선택해주세요.',
      });
      return false;
    }
    return classTypeExists && teachingTypeExists && serviceTypeExists;
  };

  const checkShowEtcInput = obj => {
    if (!obj) return false;
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (obj[key]) {
        if (key?.includes('ETC')) return true;
      }
    }
    return false;
  };

  const checkValues = () => {
    if (!academyName?.trim()) {
      Utils.openModal({ title: '알림', body: '아카데미 이름을 입력해주세요' });
      return false;
    }
    if (!addr) {
      Utils.openModal({ title: '알림', body: '주소를 입력해주세요' });
      return false;
    }
    if (!ceoPhone?.trim()) {
      Utils.openModal({ title: '알림', body: '대표번호를 입력해주세요.' });
      return false;
    }
    if (!workTime?.trim()) {
      Utils.openModal({ title: '알림', body: '운영시간을 입력해주세요.' });
      return false;
    }
    if (!(academyPhotoList && academyPhotoList.length > 0)) {
      Utils.openModal({ title: '알림', body: '대표이미지를 등록해주세요.' });
      return false;
    }
    if (instagram?.trim() && !Utils.isInstagram(instagram?.trim())) {
      Utils.openModal({
        title: '알림',
        body: '인스타그램 주소를 확인해주세요.(http://www.instagram.com)',
      });
      return false;
    }
    if (homePageUrl?.trim() && !Utils.isValidUrl(homePageUrl?.trim())) {
      Utils.openModal({
        title: '알림',
        body: '홈페이지 주소를 확인해주세요.(http://www.example.com)',
      });
      return false;
    }
    if (!description?.trim()) {
      Utils.openModal({
        title: '알림',
        body: '아카데미 소개글을 입력해주세요.',
      });
      return false;
    }
    if (!filterExistsCheck()) {
      return false;
    }
    return true;
  };

  /**
   * useEffect
   */

  useFocusEffect(
    useCallback(() => {
      getAcademyFilterList();
    }, []),
  );
  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="아카데미 만들기" />
        <SPKeyboardAvoidingView
          behavior="padding"
          isResize={true}
          keyboardVerticalOffset={0}
          style={{
            flex: 1,
            backgroundColor: COLORS.white,
            padding: 0,
            margin: 0,
          }}>
          <View style={styles.container}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{
                flex: 1,
                backgroundColor: COLORS.background,
              }}>
              <View style={styles.contentsTop}>
                <TouchableOpacity
                  onPress={() => {
                    setShowProfilePhotoSelectModal(true);
                  }}>
                  <View
                    style={{
                      height: 56,
                      width: 56,
                      borderRadius: 12,
                      backgroundColor: COLORS.gray,
                    }}>
                    {logoImage && logoImage.uri ? (
                      <Image
                        source={{
                          uri: logoImage.uri,
                        }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                        }}
                      />
                    ) : (
                      <Image
                        source={SPIcons.icDefaultAcademy}
                        style={{
                          width: 56,
                          height: 56,
                        }}
                      />
                    )}
                    <View
                      style={{
                        position: 'absolute',
                        width: 18,
                        height: 18,
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#FF7C10',
                        borderRadius: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Image
                        source={SPIcons.icCamera}
                        style={{
                          width: 12,
                          height: 12,
                        }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.contentsList}>
                <Text style={styles.title}>기본 정보</Text>
                <View>
                  <Text style={styles.subTitle}>아카데미 이름</Text>
                  <TextInput
                    value={academyName}
                    onChange={e => {
                      if (e.nativeEvent.text?.length > 45) return;
                      const text = Utils.removeSymbolAndBlank(
                        e.nativeEvent.text,
                      );
                      setAcademyName(text);
                    }}
                    placeholder="아카데미 이름을 입력하세요"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.box}
                  />
                </View>
                <View>
                  <Text style={styles.subTitle}>주소</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowSearchAddressModal(true);
                    }}>
                    <View
                      style={[
                        styles.box,
                        { flexDirection: 'row', alignItems: 'center', gap: 8 },
                      ]}>
                      <Image
                        source={SPIcons.icBlueSearch}
                        style={{ width: 20, height: 20 }}
                      />
                      <Text style={styles.boxText}>
                        {addr || '도로명, 건물명 또는 지번으로 검색하세요'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={{ paddingTop: 8 }}>
                    <TextInput
                      placeholder="상세주소를 입력하세요"
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={styles.box}
                      value={detailAddr}
                      onChange={e => {
                        if (e.nativeEvent.text.length > 50) return;
                        setDetailAddr(e.nativeEvent.text);
                      }}
                    />
                  </View>
                </View>
                <View>
                  <Text style={styles.subTitle}>대표번호</Text>
                  <View>
                    <TextInput
                      placeholder="아카데미 대표번호를 입력하세요"
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={styles.box}
                      value={Utils.onlyNumber(ceoPhone)}
                      keyboardType="phone-pad"
                      onChange={e => {
                        if (e.nativeEvent.text.length > 15) return;
                        setCeoPhone(Utils.onlyNumber(e.nativeEvent.text));
                      }}
                    />
                  </View>
                </View>
                <View>
                  <Text style={styles.subTitle}>운영시간</Text>
                  <View>
                    <TextInput
                      placeholder="운영시간을 입력하세요"
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={styles.box}
                      value={workTime}
                      onChange={e => {
                        if (e.nativeEvent.text.length > 45) return;
                        setWorkTime(e.nativeEvent.text);
                      }}
                    />
                  </View>
                </View>
                <View>
                  <Text style={styles.subTitle}>대표이미지</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 8,
                      paddingTop: 4,
                    }}>
                    {academyPhotoList &&
                      academyPhotoList.length > 0 &&
                      academyPhotoList.map((item, index) => {
                        return (
                          <View
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            style={{
                              height: 80,
                              width: 80,
                              backgroundColor: COLORS.white,
                              borderRadius: 12,
                              overflow: 'hidden',
                            }}>
                            <Image
                              resizeMode="cover"
                              source={{ uri: item.uri }}
                              style={{
                                width: 80,
                                height: 80,
                              }}
                            />
                            {index === 0 && (
                              <View style={styles.imageTitle}>
                                <Image
                                  source={SPIcons.icWhiteCheck}
                                  style={{
                                    width: 10,
                                    height: 10,
                                  }}
                                />
                                <Text style={styles.imageTitleText}>대표</Text>
                              </View>
                            )}
                            <TouchableOpacity
                              onPress={e => {
                                e.stopPropagation();
                                removeAcademyPhoto(index);
                              }}
                              style={{
                                position: 'absolute',
                                right: 4,
                                top: 4,
                              }}>
                              <Image
                                resizeMode="contain"
                                source={SPIcons.icGrayCancel}
                                style={{
                                  width: 16,
                                  height: 16,
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    {!academyPhotoList ||
                      (academyPhotoList.length < 3 && (
                        <TouchableOpacity
                          onPress={() => {
                            setShowAcademyPhotoSelectModal(true);
                          }}
                          style={styles.imageItem}>
                          <Image
                            source={SPIcons.icAdd}
                            style={{
                              width: 24,
                              height: 24,
                            }}
                          />
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              </View>
              <View style={[styles.contentsList, { paddingTop: 24 }]}>
                <Text style={styles.title}>추가 정보</Text>
                <View>
                  <Text style={styles.subTitle}>인스타그램 링크</Text>
                  <TextInput
                    value={instagram}
                    onChange={e => {
                      if (e.nativeEvent.text.length > 100) return;
                      setInstagram(e.nativeEvent.text);
                    }}
                    placeholder="인스타그램 URL을 입력하세요"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.box}
                  />
                </View>
                <View>
                  <Text style={styles.subTitle}>홈페이지</Text>
                  <TextInput
                    value={homePageUrl}
                    onChange={e => {
                      if (e.nativeEvent.text.length > 100) return;
                      setHomePageUrl(e.nativeEvent.text);
                    }}
                    placeholder="홈페이지 URL을 입력하세요"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.box}
                  />
                </View>
                <View>
                  <Text style={styles.subTitle}>소개글</Text>
                  <TextInput
                    value={description}
                    multiline
                    scrollEnabled={false}
                    textAlignVertical="top"
                    numberOfLines={6}
                    onChange={e => {
                      if (e.nativeEvent.text.length > 1000) return;
                      setDescription(e.nativeEvent.text);
                    }}
                    placeholder="아카데미 소개글을 입력하세요"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.box}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}>
                    <Text style={styles.lengthCount}>
                      {description.length} / 1,000
                    </Text>
                  </View>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.subTitle}>클래스</Text>
                  <View
                    style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {classTypeList &&
                      classTypeList.length > 0 &&
                      classTypeList.map((item, index) => {
                        return (
                          <Pressable
                            // eslint-disable-next-line react/no-array-index-key
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            key={index}
                            onPress={() => {
                              setSelectedClassType(prev => {
                                return {
                                  ...prev,
                                  [item.value]: !prev[item.value],
                                };
                              });
                            }}
                            style={[
                              styles.classTypeBtn,
                              {
                                backgroundColor: selectedClassType?.[item.value]
                                  ? '#FF7C10'
                                  : 'rgba(135, 141, 150, 0.16)',
                                borderColor: selectedClassType?.[item.value]
                                  ? '#FF7C10'
                                  : 'rgba(135, 141, 150, 0.16)',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.classTypeText,
                                {
                                  color: selectedClassType?.[item.value]
                                    ? COLORS.white
                                    : 'rgba(46, 49, 53, 0.60)',
                                },
                              ]}>
                              {item.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>
                  {checkShowEtcInput(selectedClassType) && (
                    <TextInput
                      value={classDesc}
                      onChange={e => {
                        if (e.nativeEvent.text.length > 45) return;
                        setClassDesc(e.nativeEvent.text);
                      }}
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={[styles.box, { marginTop: 4 }]}
                    />
                  )}
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.subTitle}>수업방식</Text>
                  <View
                    style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {teachingTypeList &&
                      teachingTypeList.length > 0 &&
                      teachingTypeList.map((item, index) => {
                        return (
                          <Pressable
                            // eslint-disable-next-line react/no-array-index-key
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            key={index}
                            onPress={() => {
                              setSelectedTeachingType(prev => {
                                return {
                                  ...prev,
                                  [item.value]: !prev[item.value],
                                };
                              });
                            }}
                            style={[
                              styles.classTypeBtn,
                              {
                                backgroundColor: selectedTeachingType?.[
                                  item.value
                                ]
                                  ? '#FF7C10'
                                  : 'rgba(135, 141, 150, 0.16)',
                                borderColor: selectedTeachingType?.[item.value]
                                  ? '#FF7C10'
                                  : 'rgba(135, 141, 150, 0.16)',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.classTypeText,
                                {
                                  color: selectedTeachingType?.[item.value]
                                    ? COLORS.white
                                    : 'rgba(46, 49, 53, 0.60)',
                                },
                              ]}>
                              {item.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>
                  {checkShowEtcInput(selectedTeachingType) && (
                    <TextInput
                      value={teachingDesc}
                      onChange={e => {
                        if (e.nativeEvent.text.length > 45) return;
                        setTeachingDesc(e.nativeEvent.text);
                      }}
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={[styles.box, { marginTop: 4 }]}
                    />
                  )}
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.subTitle}>서비스</Text>
                  <View
                    style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {serviceTypeList &&
                      serviceTypeList.length > 0 &&
                      serviceTypeList.map((item, index) => {
                        return (
                          <Pressable
                            // eslint-disable-next-line react/no-array-index-key
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            key={index}
                            onPress={() => {
                              setSelectedServiceType(prev => {
                                return {
                                  ...prev,
                                  [item.value]: !prev[item.value],
                                };
                              });
                            }}
                            style={[
                              styles.classTypeBtn,
                              {
                                backgroundColor: selectedServiceType?.[
                                  item.value
                                ]
                                  ? '#FF7C10'
                                  : 'rgba(135, 141, 150, 0.16)',
                                borderColor: selectedServiceType?.[item.value]
                                  ? '#FF7C10'
                                  : 'rgba(135, 141, 150, 0.16)',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.classTypeText,
                                {
                                  color: selectedServiceType?.[item.value]
                                    ? COLORS.white
                                    : 'rgba(46, 49, 53, 0.60)',
                                },
                              ]}>
                              {item.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.subTitle}>기타사항</Text>
                  <TextInput
                    value={memo}
                    onChange={e => {
                      if (e.nativeEvent.text.length > 50) return;
                      setMemo(e.nativeEvent.text);
                    }}
                    multiline
                    scrollEnabled={false}
                    textAlignVertical="top"
                    numberOfLines={3}
                    placeholder="추가 정보를 입력하세요"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.box}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}>
                    <Text style={[styles.lengthCount, { paddingTop: 0 }]}>
                      {memo.length} / 50
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ marginTop: 24 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 7,
                  }}>
                  <Text style={styles.toggleTitle}>자동가입</Text>
                  <SPSwitch
                    switchOn={autoJoin === 'Y'}
                    onChange={e => {
                      setAutoJoin(e ? 'Y' : 'N');
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 7,
                    marginTop: 16,
                    marginBottom: 24,
                  }}>
                  <Text style={styles.toggleTitle}>경기내역 공개</Text>
                  <SPSwitch
                    switchOn={matchHistoryOpen === 'Y'}
                    onChange={e => {
                      setMatchHistoryOpen(e ? 'Y' : 'N');
                    }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
          <View
            style={{
              width: '100%',
              paddingVertical: 24,
              paddingHorizontal: 16,
            }}>
            <TouchableOpacity
              onPress={() => {
                registAcademy();
              }}
              style={{
                width: '100%',
                height: 48,
                paddingVertical: 12,
                paddingHorizontal: 28,
                backgroundColor: '#FF7C10',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}>
              <Text style={styles.clearBtn}>완료</Text>
            </TouchableOpacity>
          </View>
          <SPSearchAddress
            show={showSearchAddressModal}
            setShow={setShowSearchAddressModal}
            onSelect={onSelectAddress}
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
          <SPSelectPhotoModal
            visible={showAcademyPhotoSelectModal}
            crop
            cropWithRate={4}
            cropHeightRate={3}
            onClose={async () => {
              setShowAcademyPhotoSelectModal(false);
            }}
            onComplete={data => {
              updateAcademyPhoto(data);
            }}
          />
        </SPKeyboardAvoidingView>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(AcademyRegist);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
  },
  contentsTop: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    marginBottom: 16,
  },
  contentsList: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  box: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  boxText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 4,
  },
  imageItem: {
    height: 80,
    width: 80,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(112, 115, 124, 0.16)',
    borderRadius: 12,
  },
  imageTitle: {
    position: 'absolute',
    left: 4,
    top: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FF7C10',
  },
  imageTitleText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  lengthCount: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
    paddingTop: 4,
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
  toggleTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  clearBtn: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
});
