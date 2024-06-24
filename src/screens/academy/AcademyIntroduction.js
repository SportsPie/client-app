import React, { memo, useCallback, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment/moment';
import SPIcons from '../../assets/icon';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { apiGetAcademyDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { IS_YN } from '../../common/constants/isYN';
import Utils from '../../utils/Utils';
import { MATCH_GENDER } from '../../common/constants/matchGender';
import { MATCH_STATE } from '../../common/constants/matchState';
import SPHeader from '../../components/SPHeader';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import AcademyJoinModal from './AcademyJoinModal';
import { JOIN_TYPE } from '../../common/constants/joinType';
import { SafeAreaView } from 'react-native-safe-area-context';

// 경기일정 컴포넌트
function MatchingBox({ data }) {
  const title = data?.title;
  const gender = MATCH_GENDER[data?.genderCode]?.desc;
  const matchState = MATCH_STATE[data?.matchState]?.desc;
  const date = `${data?.matchDate} ${data?.matchTime}`;
  const momentDate = moment(date);
  const newFormatString = momentDate.format('MMMM Do dddd A h:mm');
  const matchPlace = data?.matchPlace;
  const matchMethod = data?.matchMethod;
  const matchIdx = data?.matchIdx;

  const isReady = MATCH_STATE.READY.code === data?.matchState;

  // 경기 완료일때 matchingBoxStyle, genderStyle, numberStyle, statusStyle, statusTextStyle 색상이 변경됨
  const matchingBoxStyle = isReady
    ? styles.matchingBox
    : { ...styles.matchingBox, backgroundColor: 'rgba(49, 55, 121, 0.08)' }; // 상태에 따라 변경된 스타일 적용
  const genderStyle = isReady
    ? styles.matchingGender
    : {
        ...styles.matchingGender,
        backgroundColor: 'rgba(49, 55, 121, 0.08)',
        borderWidth: 0,
      };
  const numberStyle = isReady
    ? styles.matchingNumber
    : {
        ...styles.matchingNumber,
        backgroundColor: 'rgba(49, 55, 121, 0.08)',
        borderWidth: 0,
      };
  const statusStyle = isReady
    ? styles.matchingStatus
    : {
        ...styles.matchingStatus,
        backgroundColor: 'rgba(49, 55, 121, 0.08)',
      };
  const statusTextStyle = isReady
    ? styles.matchingStatusText
    : { ...styles.matchingStatusText, color: 'rgba(46, 49, 53, 0.80)' };

  return (
    <TouchableOpacity
      style={matchingBoxStyle}
      onPress={() => {
        NavigationService.navigate(navName.matchingDetail, {
          matchIdx,
        });
      }}>
      <View style={styles.matchingPersonnel}>
        <View style={styles.matchingPersonnelBox}>
          <View style={genderStyle}>
            <Text style={styles.matchingGenderText}>{gender}</Text>
          </View>
          <View style={numberStyle}>
            <Text style={styles.matchingNumberText}>
              {matchMethod == null
                ? '-'
                : matchMethod === 0
                ? '협의 후 결정'
                : `${matchMethod} : ${matchMethod}`}
            </Text>
          </View>
        </View>
        <View style={statusStyle}>
          <Text style={statusTextStyle}>{matchState}</Text>
        </View>
      </View>
      <Text style={styles.matchingTitle} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      <View style={[styles.matchingDay, { marginBottom: 5 }]}>
        <Image source={SPIcons.icDate} style={styles.matchingDayIcon} />
        <Text style={styles.matchingDayText}>{newFormatString}</Text>
      </View>
      <View style={styles.matchingDay}>
        <Image source={SPIcons.icMarker} style={styles.matchingDayIcon} />
        <Text style={styles.matchingDayText}>{matchPlace}</Text>
      </View>
    </TouchableOpacity>
  );
}

function AcademyIntroduction({ route }) {
  /**
   * state
   */
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const academyIdx = route?.params?.academyIdx;
  const [isAdmin, setIsAdmin] = useState(false);
  const [academyDetail, setAcademyDetail] = useState({});
  const [shouldShowMoreButton, setShouldShowMoreButton] = useState(false);
  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [classTypeStr, setClassTypeStr] = useState('');
  const [teachingTypeStr, setTeachingTypeStr] = useState('');
  const [serviceTypeStr, setServiceTypeStr] = useState('');
  const [academyJoinType, setAcademyJoinType] = useState(JOIN_TYPE.NO_LOGIN);

  const [fistCall, setFistCall] = useState(false);
  const [matchingList, setMatchingList] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [isJoined, setIsJoined] = useState(undefined);

  /**
   * api
   */
  const getUserInfo = async () => {
    if (!isLogin) return;
    try {
      const joinType = await Utils.getUserJoinType(academyIdx);
      setAcademyJoinType(joinType);
      setIsAdmin(joinType === JOIN_TYPE.ACADEMY_ADMIN);
    } catch (error) {
      handleError(error);
    }
  };

  const getAcademyDetailInfo = async () => {
    try {
      const { data } = await apiGetAcademyDetail(academyIdx);
      setAcademyDetail(data.data.academy);
      setMatchingList(data.data.matchList);
      const planTypeList = data.data.academy?.planTypeList?.reverse();

      const classTypeList = [];
      const teachingTypeList = [];
      const serviceTypeList = [];
      planTypeList?.forEach(item => {
        if (item.planTypeCode.includes('CLS_')) {
          if (item.planTypeCode.includes('ETC')) {
            classTypeList.push(item.etc);
          } else {
            classTypeList.push(item.planTypeName);
          }
        }
      });
      planTypeList?.forEach(item => {
        if (item.planTypeCode.includes('MTD_')) {
          if (item.planTypeCode.includes('ETC')) {
            teachingTypeList.push(item.etc);
          } else {
            teachingTypeList.push(item.planTypeName);
          }
        }
      });
      planTypeList?.forEach(item => {
        if (item.planTypeCode.includes('SVC_')) {
          if (item.planTypeCode.includes('ETC')) {
            serviceTypeList.push(item.etc);
          } else {
            serviceTypeList.push(item.planTypeName);
          }
        }
      });
      setClassTypeStr(classTypeList.join(', '));
      setTeachingTypeStr(teachingTypeList.join(', '));
      setServiceTypeStr(serviceTypeList.join(', '));
    } catch (error) {
      handleError(error);
    }
    setFistCall(true);
  };

  /**
   * function
   */
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      if (isJoined !== undefined) {
        getUserInfo();
        getAcademyDetailInfo();
      }
      // return () => {
      //   setFistCall(false);
      // };
    }, [isJoined]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <SPHeader
        title="아카데미 소개"
        noLeftLogo
        {...(isAdmin
          ? {
              rightBasicButton: SPIcons.icSetting,
              onPressRightIcon: () =>
                NavigationService.navigate(navName.academyManagement, {
                  academyIdx,
                }),
            }
          : {})}
        rightBasicAddButton={SPIcons.icOptionsVertical}
        onPressAddRightIcon={openModal}
      />
      <SPMoreModal
        visible={modalVisible}
        onClose={closeModal}
        isAdmin={isAdmin}
        type={MODAL_MORE_TYPE.ACADEMY}
        idx={academyIdx}
        adminButtons={[MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.SHARE]}
        memberButtons={[
          MODAL_MORE_BUTTONS.REPORT,
          MODAL_MORE_BUTTONS.SHARE,
          academyJoinType === JOIN_TYPE.ACADEMY_MEMBER
            ? MODAL_MORE_BUTTONS.LEAVE
            : null,
        ]}
        shareLink={`academyIntro?id=${academyIdx}`}
        shareTitle={academyDetail?.academyName ?? ''}
        shareDescription={academyDetail?.description ?? ''}
      />
      <ScrollView>
        {/* 아카데미 소개 */}
        <View style={styles.introduction}>
          <View style={styles.topBox}>
            <Text style={styles.topAddress}>
              {academyDetail.addrCity} · {academyDetail.addrGu}
            </Text>
            <View style={styles.topRow}>
              <Text style={styles.topTitle}>{academyDetail.academyName}</Text>
              {academyDetail.certYn === IS_YN.Y && (
                <View>
                  <Image source={SPIcons.icCheckBadge} />
                </View>
              )}
            </View>
            <View style={styles.topRow}>
              <View>
                <Image source={SPIcons.icStar} />
              </View>
              <Text style={styles.score}>
                {' '}
                {academyDetail.rating === null
                  ? parseFloat(3).toFixed(1)
                  : academyDetail.rating}
              </Text>
            </View>
            <View style={[styles.topRow, { gap: 8 }]}>
              {academyDetail.instagramUrl && (
                <TouchableOpacity
                  onPress={() => {
                    if (academyDetail.instagramUrl) {
                      Utils.openInstagram(academyDetail.instagramUrl);
                    }
                  }}>
                  <Image source={SPIcons.icInstagram} />
                </TouchableOpacity>
              )}
              {academyDetail.homepageUrl && (
                <TouchableOpacity
                  onPress={() => {
                    if (academyDetail.homepageUrl) {
                      Linking.openURL(academyDetail.homepageUrl);
                    }
                  }}>
                  <Image source={SPIcons.icExplore} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={[styles.middleBox, { paddingTop: 8 }]}>
            <Text
              style={styles.middleText}
              numberOfLines={showMoreDesc ? 0 : 3}
              onTextLayout={({ nativeEvent: { lines } }) => {
                setShouldShowMoreButton(lines.length > 3);
              }}
              ellipsizeMode="tail">
              {academyDetail.description}
            </Text>
            {shouldShowMoreButton && (
              <TouchableOpacity
                style={{ alignSelf: 'flex-start' }}
                onPress={() => {
                  setShowMoreDesc(prev => !prev);
                }}>
                <Text style={styles.moreText}>
                  {showMoreDesc ? '숨기기' : '더보기'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.middleBox}>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>대표번호</Text>
              </View>
              <Text style={styles.middleInfoText}>
                {Utils.addHypenToPhoneNumber(academyDetail.phoneNo)}
              </Text>
            </View>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>영업시간</Text>
              </View>
              <Text style={styles.middleInfoText}>
                {academyDetail.workTime}
              </Text>
            </View>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>주소</Text>
              </View>
              <Text style={styles.middleInfoText}>
                {academyDetail.addressFull}
              </Text>
            </View>
          </View>
          <View style={styles.middleBox}>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>클래스</Text>
              </View>
              <Text style={styles.middleInfoText}>{classTypeStr}</Text>
            </View>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>수업방식</Text>
              </View>
              <Text style={styles.middleInfoText}>{teachingTypeStr}</Text>
            </View>
            <View style={styles.middleInfo}>
              <View style={{ minWidth: 46 }}>
                <Text style={styles.middleInfoTitle}>서비스</Text>
              </View>
              <Text style={styles.middleInfoText}>{serviceTypeStr}</Text>
            </View>
            <Text style={[styles.middleInfoText, { textAlign: 'left' }]}>
              {academyDetail.memo}
            </Text>
          </View>
        </View>
        {/* 경기일정 */}
        <View style={styles.matching}>
          <View style={styles.matchingTopBox}>
            <Text style={styles.topTitle}>경기일정</Text>
          </View>
          {matchingList &&
            matchingList.length > 0 &&
            matchingList.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <MatchingBox key={index} data={item} />
            ))}
          {matchingList && matchingList.length > 0 && (
            <TouchableOpacity
              style={styles.matchingMoreBtn}
              onPress={() => {
                NavigationService.navigate(navName.matchingSchedule);
              }}>
              <Text style={styles.buttonText}>경기일정 더보기</Text>
            </TouchableOpacity>
          )}
          {(!matchingList || matchingList.length === 0) && (
            <View style={styles.noneMatchingContainer}>
              <View style={styles.noneMatchingBox}>
                <Text style={styles.noneText}>예정된 경기 일정이 없어요.</Text>
                <Text style={styles.noneText}>
                  다른 아카데미의 경기 매칭 일정을 확인해보세요.
                </Text>
              </View>
              <View style={styles.moreBtn}>
                <TouchableOpacity
                  onPress={() =>
                    NavigationService.navigate(navName.matchingSchedule)
                  }
                  style={styles.moreBtnBox}>
                  <Text style={styles.moreBtnText}>경기매칭 둘러보기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <AcademyJoinModal academyIdx={academyIdx} setIsJoined={setIsJoined} />
    </SafeAreaView>
  );
}

export default memo(AcademyIntroduction);

const styles = {
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  introduction: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#FFF',
  },
  topBox: {
    flexDirection: 'column',
    gap: 8,
  },
  topAddress: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF671F',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  score: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  middleBox: {
    flexDirection: 'column',
    gap: 8,
    // paddingVertical: 8,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.16)',
  },
  middleText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  moreText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  middleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  middleInfoTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  middleInfoText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'right',
    flexShrink: 1,
  },
  matching: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  matchingTopBox: {
    marginBottom: 4,
  },
  matchingBox: {
    position: 'relative',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  matchingPersonnel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchingPersonnelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchingGender: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(49, 55, 121, 0.43)',
  },
  matchingGenderText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingNumber: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(49, 55, 121, 0.43)',
  },
  matchingNumberText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingStatus: {
    backgroundColor: 'rgba(255, 103, 31, 0.16)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchingStatusText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FF671F',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 8,
  },
  matchingDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchingDayIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center', // 내부 Image 중앙 정렬
    alignItems: 'center',
  },
  matchingDayText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchingMoreBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  noneMatchingContainer: {
    paddingHorizontal: 38,
    paddingVertical: 118,
  },
  noneMatchingBox: {
    marginBottom: 16,
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
  moreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  moreBtnBox: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  moreBtnText: {
    fontSize: 15,
    fontWeight: 500,
    color: '#313779',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
};
