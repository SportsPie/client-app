import React, { Fragment, useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationService from '../../../navigation/NavigationService';
import Header from '../../../components/header';
import Avatar from '../../../components/Avatar';
import Divider from '../../../components/Divider';
import MenuTile from '../../../components/more-profile/MenuTile';
import SPModal from '../../../components/SPModal';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { SPSvgs } from '../../../assets/svg';
import { COLORS } from '../../../styles/colors';
import { useAppState } from '../../../utils/AppStateContext';
import { CAREER_TYPE } from '../../../common/constants/careerType';
import { useFocusEffect } from '@react-navigation/native';
import { handleError } from '../../../utils/HandleError';
import { apiGetProfile } from '../../../api/RestAPI';
import moment from 'moment';
import { GENDER } from '../../../common/constants/gender';
import { MAIN_FOOT } from '../../../common/constants/mainFoot';
import SPLoading from '../../../components/SPLoading';

function EventApplyPrevInformation() {
  /**
   * state
   */
  const { applyData, setApplyData } = useAppState();
  const [modalVisible, setModalVisible] = useState(false);
  const [member, setMember] = useState({});
  const [player, setPlayer] = useState({});
  const [stats, setStats] = useState({});
  const [userIdx, setUserIdx] = useState({});
  const [fstCall, setFstCall] = useState(false);

  /**
   * api
   */
  const getProfile = async () => {
    try {
      const { data } = await apiGetProfile();
      if (data) {
        const info = data.data;
        setMember(info.member || {});
        setPlayer(info.player || {});
        setStats(info.stats || {});
        setUserIdx(data.data.member.userIdx);
      }
    } catch (error) {
      handleError(error);
    }
    setFstCall(true);
  };

  const birthday = moment(member?.userBirthday);
  const today = moment();
  const age = today.diff(birthday, 'years');

  /**
   * function
   */
  // 모달 열기
  const openModal = () => setModalVisible(true);

  // 모달 닫기
  const closeModal = () => setModalVisible(false);

  // 확인 버튼을 누르면 home 페이지로 이동
  const handleConfirm = () => {
    closeModal();
    NavigationService.navigate(navName.eventDetail, {
      eventIdx: applyData.eventIdx,
    }); // home 페이지로 이동
  };

  const saveUserInfo = prevUse => {
    setApplyData({
      ...applyData,
      participationName: prevUse ? member?.userName : null,
      participationBirth: prevUse ? member?.userBirthday : null,
      participationGender: prevUse ? member?.userGender : null,
      phoneNumber: prevUse ? member?.userPhoneNo : null,
      profilePath: prevUse ? member?.userProfilePath : null,
      profileName: prevUse ? member?.userName : null,
    });
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, []),
  );

  /**
   * render
   */
  return fstCall ? (
    <SafeAreaView style={styles.container}>
      <Header
        title="이벤트 접수 신청"
        rightContent={
          <Pressable style={{ padding: 10 }} onPress={openModal}>
            <Text style={styles.headerText}>취소</Text>
          </Pressable>
        }
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.eventTopBox}>
          <Text style={styles.eventTopTitle}>내 정보</Text>
          <Text style={styles.eventTopText}>2/8</Text>
        </View>

        <View style={styles.userInfoWrapper}>
          {/* 프로필 사진 */}
          <View style={styles.avatar}>
            <Avatar
              imageSize={48}
              imageURL={member?.userProfilePath ?? ''}
              disableEditMode
            />
          </View>

          <View style={styles.titleTextBox}>
            <Text style={styles.nameText}>{member?.userName}</Text>
            <Text style={styles.dateText}>
              {member?.userBirthday &&
                moment(member?.userBirthday).format('YYYY.MM.DD')}
            </Text>
          </View>

          {/* 소속 */}
          <View
            style={{
              backgroundColor: 'rgba(255, 124, 16, 0.15)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            }}>
            <Text
              style={[fontStyles.fontSize12_Semibold, { color: '#FF7C10' }]}>
              {member?.acdmyNm}
            </Text>
          </View>
        </View>

        <Divider lineHeight={8} lineColor={COLORS.indigo90} />

        {/* 퍼포먼스 */}
        <View style={styles.contentsBox}>
          <Text style={styles.contentsTitle}>퍼포먼스</Text>

          <View style={styles.basicInfoWrapper}>
            <MenuTile title="포지션" value={stats?.position} />
            <MenuTile title="지역" value={member?.userRegion} />
            <MenuTile
              title="성별"
              value={member.userGender ? GENDER[member.userGender].desc : '-'}
            />
            <MenuTile
              title="나이"
              value={age}
              subValue={moment(member.userBirthday).format('YYYY.MM.DD')}
            />
            <MenuTile
              title="주 발"
              value={stats.mainFoot ? MAIN_FOOT[stats.mainFoot].desc : '-'}
            />
            <MenuTile
              title="키"
              value={stats.height ? `${stats.height}cm` : '-'}
            />
            <MenuTile
              title="발사이즈"
              value={stats.shoeSize ? `${stats.shoeSize}mm` : '-'}
            />
            <MenuTile
              title="몸무게"
              value={stats.weight ? `${stats.weight}kg` : '-'}
            />
          </View>

          {/* 선수경력 */}
          <View
            style={[
              styles.menuTileContainer,
              {
                width: '100%',
                marginTop: 8,
              },
            ]}>
            <Text
              style={[
                fontStyles.fontSize14_Medium,
                {
                  color: COLORS.labelNeutral,
                },
              ]}>
              선수경력
            </Text>

            {stats?.careerType ? (
              <View
                style={{
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: 8,
                }}>
                {stats?.careerType?.map((item, index) => {
                  // eslint-disable-next-line no-unsafe-optional-chaining
                  const lastItem = index === member?.careerType?.length - 1;
                  if (lastItem) {
                    return (
                      <Text
                        /* eslint-disable-next-line react/no-array-index-key */
                        key={index}
                        style={[fontStyles.fontSize20_Semibold]}>
                        {CAREER_TYPE[item]?.desc}
                      </Text>
                    );
                  }
                  return (
                    /* eslint-disable-next-line react/no-array-index-key */
                    <Fragment key={index}>
                      <Text style={[fontStyles.fontSize20_Semibold]}>
                        {CAREER_TYPE[item]?.desc}
                      </Text>
                      {/* eslint-disable-next-line no-unsafe-optional-chaining */}
                      {index !== stats?.careerType?.length - 1 && (
                        <SPSvgs.Ellipse width={6} height={6} />
                      )}
                    </Fragment>
                  );
                })}
              </View>
            ) : (
              <Text style={[fontStyles.fontSize20_Semibold]}>-</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 새로 작성하기 , 기존 정보 활용하기 버튼 */}
      <View style={styles.appealBox}>
        <TouchableOpacity
          style={styles.appealOutlineBtn}
          onPress={() => {
            saveUserInfo();
            NavigationService.navigate(navName.eventApplyInputMyInfo);
          }}>
          <Text style={styles.appealOutlineBtnText}>새로 작성하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.appealBtn}
          onPress={() => {
            saveUserInfo(true);
            NavigationService.navigate(navName.eventApplyInputMyInfo);
          }}>
          <Text style={styles.appealBtnText}>기존 정보 활용하기</Text>
        </TouchableOpacity>
      </View>

      {/* 취소 안내 모달 */}
      <SPModal
        visible={modalVisible}
        title="취소 안내"
        contents={`입력한 정보가 모두 사라집니다.\n다시 신청하려면 처음부터 입력해야 해요.`}
        cancelButtonText="취소"
        confirmButtonText="확인"
        onCancel={closeModal} // 취소 버튼: 모달 닫기
        onConfirm={handleConfirm} // 확인 버튼: 홈 페이지로 이동
        cancelButtonStyle={{
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        }} // 취소 버튼 스타일
        confirmButtonStyle={{
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        }} // 확인 버튼 스타일
        cancelButtonTextStyle={{ color: '#002672' }} // 취소 버튼 텍스트 스타일
        confirmButtonTextStyle={{ color: '#002672' }} // 확인 버튼 텍스트 스타일
      />
    </SafeAreaView>
  ) : (
    <SPLoading />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  eventTopBox: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTopTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  eventTopText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  userInfoWrapper: {
    paddingHorizontal: 16,
    marginBottom: 24,
    rowGap: 8,
    alignItems: 'center',
  },
  avatar: {
    alignSelf: 'center',
  },
  titleTextBox: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlgin: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
    textAlgin: 'center',
  },
  contentsBox: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentsTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
    marginBottom: 16,
  },
  basicInfoWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  menuTileContainer: {
    // backgroundColor: COLORS.fillNormal,
    backgroundColor: '#F1F5FF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    padding: 16,
    width: (SCREEN_WIDTH - 40) / 2,
    rowGap: 8,
  },
  bottomButtonWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#FF7C10', // 기본 활성화된 버튼 색상
  },
  disabledButton: {
    backgroundColor: '#ccc', // 비활성화된 버튼 색상
  },

  appealBox: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  appealBtn: {
    flex: 1,
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  appealBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  appealOutlineBtn: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FF7C10',
  },
  appealOutlineBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FF7C10',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
});

export default EventApplyPrevInformation;
