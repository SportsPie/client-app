import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Modal,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useAppState } from '../../../utils/AppStateContext';
import SPModal from '../../../components/SPModal';
import SPIcons from '../../../assets/icon';
import { SPSvgs } from '../../../assets/svg';
import Avatar from '../../../components/Avatar';
import Divider from '../../../components/Divider';
import Checkbox from '../../../components/Checkbox';
import MenuTile from '../../../components/more-profile/MenuTile';
import { ACTIVE_OPACITY } from '../../../common/constants/constants';
import moment from 'moment';

function EventApplyInputCheck() {
  const { applyData, setApplyData } = useAppState();
  const [cancelModalVisible, setCancelModalVisible] = useState(false); // 헤더 취소 모달
  const [member, setMember] = useState({});
  const [check1, setCheck1] = useState(false); // 체크박스 상태 관리
  const [isCollapsed, setIsCollapsed] = useState({
    personalInfo: true,
    performanceInfo: true,
    paymentInfo: true,
  });

  // 모달 열기
  const openCancelModal = () => setCancelModalVisible(true);

  // 모달 닫기
  const closeCancelModal = () => setCancelModalVisible(false);

  // 확인 버튼을 누르면 home 페이지로 이동
  const handleConfirm = () => {
    closeCancelModal();
    NavigationService.navigate(navName.eventDetail, {
      eventIdx: applyData.eventIdx,
    }); // home 페이지로 이동
  };

  // 토글을 개별적으로 관리하는 함수
  const toggleSection = section => {
    setIsCollapsed(prevState => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  // ** api **
  const birthday = moment(member?.userBirthday);
  const today = moment();
  const age = today.diff(birthday, 'years');

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="이벤트 접수 정보 확인"
        rightContent={
          <Pressable style={{ padding: 10 }} onPress={openCancelModal}>
            <Text style={styles.headerText}>취소</Text>
          </Pressable>
        }
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.eventTopBox}>
          <Text style={styles.eventTopTitle}>마지막 확인</Text>
          <Text style={styles.eventTopText}>7/8</Text>
        </View>

        <View style={styles.contentItem}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                marginRight: 48,
              }}>
              <Text style={styles.contentTitle}>내 정보</Text>
            </View>
            <Pressable
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => toggleSection('personalInfo')}>
              <Image
                source={
                  isCollapsed.personalInfo
                    ? SPIcons.icArrowUpBlack // 펼쳐졌을 때 아이콘
                    : SPIcons.icArrowDownBlack // 닫혔을 때 아이콘
                }
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          </View>
          <Collapsible collapsed={isCollapsed.personalInfo} duration={500}>
            <View style={styles.contentContainer}>
              <View style={styles.contentBtn}>
                <TouchableOpacity style={styles.contentOutlineBtn}>
                  <Text style={styles.contentOutlineBtnText}>수정</Text>
                </TouchableOpacity>
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
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventInfoText}>U-15</Text>
                  </View>
                  <Text style={styles.nameText}>윤도윤</Text>
                  <Text style={styles.eventTypeText}>ST/CF/SS</Text>
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
                    style={[
                      fontStyles.fontSize12_Semibold,
                      { color: '#FF7C10' },
                    ]}>
                    서울FC 소속
                  </Text>
                </View>
              </View>

              <View style={styles.contentsSubContainer}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>보호자 이름</Text>
                  <Text style={styles.contentsSubText}>윤계상</Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>관계(선택)</Text>
                  <Text style={styles.contentsSubText}>-</Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>
                    보호자 휴대폰 번호
                  </Text>
                  <Text style={styles.contentsSubText}>010-9999-9999</Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>본인 연락처(선택)</Text>
                  <Text style={styles.contentsSubText}>010-8888-8888</Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>주소</Text>
                  <Text style={styles.contentsSubText}>
                    경상북도 포항시 북구 새천년대로 70 101동 1113호
                  </Text>
                </View>
              </View>
            </View>
          </Collapsible>
        </View>

        <Divider lineHeight={8} lineColor={COLORS.indigo90} />

        {/* 퍼포먼스 */}
        <View style={styles.contentItem}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                marginRight: 48,
              }}>
              <Text style={styles.contentTitle}>퍼포먼스</Text>
            </View>
            <Pressable
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => toggleSection('performanceInfo')}>
              <Image
                source={
                  isCollapsed.performanceInfo
                    ? SPIcons.icArrowUpBlack // 펼쳐졌을 때 아이콘
                    : SPIcons.icArrowDownBlack // 닫혔을 때 아이콘
                }
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          </View>
          <Collapsible collapsed={isCollapsed.performanceInfo} duration={500}>
            <View style={styles.contentContainer}>
              <View style={styles.contentBtn}>
                <TouchableOpacity style={styles.contentOutlineBtn}>
                  <Text style={styles.contentOutlineBtnText}>수정</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.basicInfoWrapper}>
                {/* 포지션 */}
                <View style={styles.basicInfoContainer}>
                  <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                    포지션
                  </Text>
                  <View style={styles.basicInfoBox}>
                    <Text style={styles.basicMainText}>🏅</Text>
                    <Text style={styles.basicMainText}>ST/CF/SS</Text>
                  </View>

                  <View style={styles.basicInfoBox}>
                    <Text style={styles.basicNormalText}>🥈</Text>
                    <Text style={styles.basicNormalText}>CB</Text>
                  </View>

                  <View style={styles.basicInfoBox}>
                    <Text style={styles.basicNormalText}>🥉</Text>
                    <Text style={styles.basicNormalText}>CAM</Text>
                  </View>
                </View>

                {/* 주 발, 발사이즈, 등번호 */}
                <View style={styles.basicInfo}>
                  <View style={styles.basicInfoContainer}>
                    <Text
                      style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                      주 발
                    </Text>
                    <Text style={styles.basicNormalText}>왼발</Text>
                  </View>

                  <View style={styles.basicInfoContainer}>
                    <Text
                      style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                      발사이즈
                    </Text>
                    <Text style={styles.basicNormalText}>265mm</Text>
                  </View>

                  <View style={styles.basicInfoContainer}>
                    <Text
                      style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                      등번호(선택)
                    </Text>
                    <Text style={styles.basicNormalText}>-</Text>
                  </View>
                </View>

                {/* 키 , 몸무게 */}
                <View style={styles.basicInfo}>
                  <View style={styles.basicInfoContainer}>
                    <Text
                      style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                      키
                    </Text>
                    <Text style={styles.basicNormalText}>189cm</Text>
                  </View>

                  <View style={styles.basicInfoContainer}>
                    <Text
                      style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                      몸무게
                    </Text>
                    <Text style={styles.basicNormalText}>30kg</Text>
                  </View>
                </View>

                {/* 선수경력 */}
                <View style={styles.basicInfo}>
                  <View style={styles.basicInfoContainer}>
                    <Text
                      style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                      선수경력
                    </Text>
                    <Text style={styles.basicNormalText}>초등학교</Text>
                  </View>
                </View>

                {/* 수상 경력(선택) */}
                <View style={styles.basicInfo}>
                  <View style={styles.basicInfoContainer}>
                    <Text
                      style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                      수상 경력(선택)
                    </Text>
                    <Text style={styles.basicNormalText}>-</Text>
                  </View>
                </View>

                {/* 선호 플레이(선택) */}
                <View style={styles.basicInfo}>
                  <View style={styles.basicInfoContainer}>
                    <Text
                      style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                      선호 플레이(선택)
                    </Text>
                    <Text style={styles.basicNormalText}>-</Text>
                  </View>
                </View>
              </View>
            </View>
          </Collapsible>
        </View>

        <Divider lineHeight={8} lineColor={COLORS.indigo90} />

        <View style={styles.contentItem}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                marginRight: 48,
              }}>
              <Text style={styles.contentTitle}>결제 정보</Text>
            </View>
            <Pressable
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => toggleSection('paymentInfo')}>
              <Image
                source={
                  isCollapsed.paymentInfo
                    ? SPIcons.icArrowUpBlack // 펼쳐졌을 때 아이콘
                    : SPIcons.icArrowDownBlack // 닫혔을 때 아이콘
                }
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          </View>
          <Collapsible collapsed={isCollapsed.paymentInfo} duration={500}>
            <View style={styles.contentContainer}>
              <View style={styles.contentBtn}>
                <TouchableOpacity style={styles.contentOutlineBtn}>
                  <Text style={styles.contentOutlineBtnText}>수정</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contentsSubContainer}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>입금자 이름</Text>
                  <Text style={styles.contentsSubText}>
                    홍지수 345
                    <Text style={styles.contentsDatailText}>
                      {''}(받는 분 통장 표시)
                    </Text>
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>환불 계좌</Text>
                  <Text style={styles.contentsSubText}>
                    국민은행 222222-22-222222 홍지수
                  </Text>
                </View>
              </View>
            </View>
          </Collapsible>
        </View>

        <Divider lineHeight={8} lineColor={COLORS.indigo90} />

        <View style={styles.contentsCheckBox}>
          <Checkbox
            selected={check1}
            onPress={() => setCheck1(!check1)} // 체크박스 상태 토글
            label={
              '위 모든 정보를 확인하였으며,\n 기입한 정보에 오류가 없는 것을 확인했습니다. '
            }
            labelStyle={styles.checkboxText}
            checkBoxStyle={[
              styles.checkbox,
              !check1 && {
                backgroundColor: 'transparent',
              },
            ]}
          />
        </View>
      </ScrollView>
      <View style={styles.bottomButtonWrap}>
        <PrimaryButton
          onPress={() => {
            if (check1) {
              NavigationService.navigate(navName.eventApplyComplete);
            }
          }}
          text="다음"
          disabled={!check1} // 체크 안 하면 버튼 비활성화
        />
      </View>

      {/* Modal */}
      {/* 헤더 취소 모달 */}
      <SPModal
        visible={cancelModalVisible}
        title="취소 안내"
        contents={`입력한 정보가 모두 사라집니다.\n다시 신청하려면 처음부터 입력해야 해요.`}
        cancelButtonText="취소"
        confirmButtonText="확인"
        onCancel={closeCancelModal} // 취소 버튼: 모달 닫기
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
  contentItem: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  contentContainer: {
    paddingTop: 16,
    marginBottom: 24,
  },
  contentBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  contentOutlineBtn: {
    borderRadius: 6,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
  },
  contentOutlineBtnText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
  userInfoWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    rowGap: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.22)',
  },
  avatar: {
    alignSelf: 'center',
  },
  titleTextBox: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eventInfo: {
    borderWidth: 1,
    borderColor: 'rgba(0, 38, 114, 0.43)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventInfoText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlgin: 'center',
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#121212',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentsSubContainer: {
    flexDirection: 'column',
    gap: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  contentsSubBox: {
    flexDirection: 'column',
    gap: 8,
  },
  contentsSubTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentsSubText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  basicInfoWrapper: {
    flexDirection: 'column',
    gap: 8,
    paddingTop: 16,
  },
  basicInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    backgroundColor: '#F1F5FF',
    padding: 16,
  },
  basicInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  basicMainText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#002672',
    lineHeight: 32,
    letterSpacing: -0.552,
  },
  basicNormalText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  contentsDatailText: {
    fontSize: 13,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  basicInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  contentsCheckBox: {
    padding: 16,
  },
  checkboxText: {
    ...fontStyles.fontSize16_Regular,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  checkbox: {
    width: 18,
    height: 18,
    marginHorizontal: 3,
    marginVertical: 4,
  },
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});

export default EventApplyInputCheck;
