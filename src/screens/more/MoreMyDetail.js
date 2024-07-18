import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment/moment';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGetMyInfo, apiModifyMyInfo } from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { GENDER } from '../../common/constants/gender';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import { navName } from '../../common/constants/navName';
import Avatar from '../../components/Avatar';
import SPModal from '../../components/SPModal';
import SPSelectPhotoModal from '../../components/SPSelectPhotoModal';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';

function Memu({ title, value }) {
  return (
    <View style={styles.menuWrapper}>
      <Text
        style={[
          fontStyles.fontSize14_Regular,
          {
            letterSpacing: 0.2,
            color: COLORS.labelNeutral,
          },
        ]}>
        {title ?? ''}
      </Text>
      <Text
        style={[
          fontStyles.fontSize14_Semibold,
          {
            letterSpacing: 0.2,
            color: COLORS.labelNormal,
          },
        ]}>
        {value ?? ''}
      </Text>
    </View>
  );
}

function MoreMyDetail() {
  const [member, setMember] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [logoImage, setLogoImage] = useState();
  const [showProfilePhotoSelectModal, setShowProfilePhotoSelectModal] =
    useState(false);
  const trlRef = useRef({ current: { disabled: false } });
  const maxFilename = 60;
  const [nickname, setNickname] = useState(null);
  const [registModalShow, setRegistModalShow] = useState(false);
  // const handleEdit = () => {
  //   setIsEditing(!isEditing);
  // };

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

  // 닉네임 수정
  const modifyNickName = async newNickname => {
    closeModal();
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const formData = new FormData();

      // JSON 파라미터
      const params = {
        userNickName: Utils.removeSymbolAndBlank(newNickname),
      };
      formData.append('dto', {
        string: JSON.stringify(params),
        type: 'application/json',
      });

      await apiModifyMyInfo(formData);
      Utils.openModal({
        title: '성공',
        body: '수정이 완료되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
      setIsEditing(false);
    }
  };

  // 프로필 이미지 수정
  const updateProfile = async ({ fileUrl, imageName, imageType }) => {
    // 로고 이미지 상태 업데이트
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

  useEffect(() => {
    if (logoImage) {
      fileUpload();
    }
  }, [logoImage]);

  const fileUpload = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      // FormData 생성
      const formData = new FormData();
      const data = {
        userIdx: member.userIdx,
      };
      formData.append('dto', {
        string: JSON.stringify(data),
        type: 'application/json',
      });
      if (logoImage) formData.append('profile', logoImage);

      await apiModifyMyInfo(formData);
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
      NavigationService.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      getMyInfo();
    }, []),
  );
  const renderRightHeaderButton = useMemo(() => {
    return (
      <Pressable
        style={{ padding: 10 }}
        onPress={() => {
          if (member) {
            NavigationService.navigate(navName.moreMyDetailModify, {
              myName: member.userName ? member.userName : '-',
              myBirth: member.userBirthday ? member.userBirthday : '-',
              myPhone: member.userPhoneNo
                ? Utils.addHypenToPhoneNumber(member.userPhoneNo)
                : '-',
              myGender: member.userGender ? member.userGender : '-',
              local: member.userRegion ? member.userRegion : '-',
              subLocal: member.userSubRegion ? member.userSubRegion : '-',
            });
          }
        }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#313779',
            lineHeight: 24,
            letterSpacing: -0.091,
          }}>
          수정
        </Text>
      </Pressable>
    );
  }, [member]);

  const openModal = () => {
    setRegistModalShow(true);
  };
  const closeModal = () => {
    setRegistModalShow(false);
    setNickname(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="내 정보" rightContent={renderRightHeaderButton} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrapper}>
          <Avatar
            imageSize={56}
            imageURL={member?.userProfilePath ?? ''}
            onPress={() => {
              setShowProfilePhotoSelectModal(true);
            }}
          />
          <View style={styles.nameWrapper}>
            <Text style={fontStyles.fontSize14_Semibold}>
              {member?.userNickName ?? ''}
            </Text>
            <Pressable
              hitSlop={5}
              onPress={() => {
                openModal();
              }}>
              <SPSvgs.Pencil width={18} height={18} />
            </Pressable>
          </View>
          {/* <View style={styles.nameWrapper}> */}
          {/*  {isEditing ? ( */}
          {/*    <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}
          {/*      <TextInput */}
          {/*        style={fontStyles.fontSize14_Semibold} */}
          {/*        value={nickname === null ? member?.userNickName : nickname} */}
          {/*        onChangeText={text => setNickname(text)} */}
          {/*        autoFocus */}
          {/*      /> */}
          {/*      <Pressable onPress={modifyNickName}> */}
          {/*        <Text style={{ marginBottom: 3 }}>완료</Text> */}
          {/*      </Pressable> */}
          {/*    </View> */}
          {/*  ) : ( */}
          {/*    <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}
          {/*      <Text style={fontStyles.fontSize14_Semibold}> */}
          {/*        {member?.userNickName ?? ''} */}
          {/*      </Text> */}
          {/*      <Pressable onPress={handleEdit}> */}
          {/*        <SPSvgs.Pencil width={18} height={18} /> */}
          {/*      </Pressable> */}
          {/*    </View> */}
          {/*  )} */}
          {/* </View> */}
        </View>

        <View
          style={{
            rowGap: 16,
          }}>
          <Memu title="이름" value={member.userName ? member.userName : '-'} />
          <Memu
            title="생년월일"
            value={
              member.userBirthday
                ? moment(member.userBirthday).format('YYYY.MM.DD')
                : '-'
            }
          />
          <Memu
            title="휴대폰 번호"
            value={
              member.userPhoneNo
                ? Utils.addHypenToPhoneNumber(member.userPhoneNo)
                : '-'
            }
          />
          <Memu
            title="이메일 주소"
            value={member.userLoginId ? member.userLoginId : '-'}
          />
        </View>

        <View style={{ rowGap: 16, marginTop: 24 }}>
          <Text style={fontStyles.fontSize20_Semibold}>추가 정보</Text>

          <Memu
            title="지역"
            value={
              member.userRegion === '세종특별자치시'
                ? member.userRegion
                : `${member.userRegion ? member.userRegion : ''} ${
                    member.userSubRegion ? member.userSubRegion : ''
                  }`
            }
          />

          <Memu
            title="성별"
            value={member.userGender ? GENDER[member.userGender].desc : '-'}
          />
        </View>

        <View style={{ rowGap: 16, marginTop: 24 }}>
          <Text style={fontStyles.fontSize20_Semibold}>추천인 코드</Text>

          <View style={styles.userReferralCode}>
            <Text>
              {member.userReferralCode ? member.userReferralCode : '-'}
            </Text>

            <Pressable
              onPress={() => {
                Utils.copyToClipboard(member.userReferralCode ?? '');
              }}>
              <SPSvgs.Copy width={18} height={18} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

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
      <SPModal
        title="닉네임"
        visible={registModalShow}
        textInputVisible={true}
        textCancelButton
        textAlign="center"
        placeholder="16자 이내 한글 혹은 영문"
        maxLength={16}
        textInputStyle={{
          borderWidth: 1,
          borderRadius: 10,
          borderColor: COLORS.orange,
          paddingHorizontal: 30,
        }}
        value={nickname === null ? member?.userNickName : nickname}
        onChangeText={value => {
          const text = Utils.removeSymbolAndBlank(value);
          setNickname(text);
        }}
        onConfirm={value => {
          modifyNickName(value);
        }}
        onCancel={() => {
          closeModal();
        }}
        onClose={() => {
          closeModal();
        }}
        // 추가: Clear 버튼을 누르면 nickname을 null로 설정
        // textCancelButton={{
        //   onPress: () => setNickname(null), // 또는 원하는 클리어 로직을 넣으세요
        // }}
      />
    </SafeAreaView>
  );
}

export default memo(MoreMyDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 24,
  },
  avatarWrapper: {
    alignItems: 'center',
    rowGap: 8,
  },
  nameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  menuWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userReferralCode: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: COLORS.peach,
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
});
