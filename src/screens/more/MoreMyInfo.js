import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { apiGetAcademyDetail, apiGetMain } from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { LOGIN_TYPES } from '../../common/constants/loginTypes';
import { navName } from '../../common/constants/navName';
import MenuSection from '../../components/MenuSection';
import { PrimaryButton } from '../../components/PrimaryButton';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Utils from '../../utils/Utils';
import MoreFlipCard from './MoreFlipCard';

function MoreMyInfo() {
  const { width: screenWidth } = useWindowDimensions();
  const aspectRatio = 320 / 320; // 이미지의 원본 비율
  const calculatedHeight = (screenWidth - 32) / aspectRatio; // 디바이스 크기에 비례하는 높이
  const [academy, setAcademy] = useState({});
  const [member, setMember] = useState({});
  const [point, setPoint] = useState({});
  const [stats, setStats] = useState({});
  const [openEvent, setOpenEvent] = useState(false);
  const [eventApplied, setEventApplied] = useState(false);

  const getMain = async () => {
    try {
      const { data } = await apiGetMain();
      if (data) {
        const info = data.data;
        setOpenEvent(info.openEvent?.codeValue === 'Y');
        setEventApplied(info.eventApplied);
        let memberInfo = { ...info.member };
        if (info.member?.academyIdx && info.member?.academyMember) {
          const academyResponse = await apiGetAcademyDetail(
            info.member.academyIdx,
          );
          memberInfo = {
            ...memberInfo,
            acdmyNm: academyResponse?.data?.data?.academy?.academyName,
          };
        }
        setMember(memberInfo || {});
        setPoint(info.point || {});
        setStats(info.stats || {});
        setAcademy(info.academy || {});
      }
    } catch (error) {
      handleError(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getMain();
    }, []),
  );

  const renderHeader = useMemo(() => {
    return (
      <Header
        closeIcon
        onLeftIconPress={() => {
          NavigationService.navigate(navName.home);
        }}
        rightContent={
          <Pressable
            style={{ padding: 10 }}
            onPress={() => {
              NavigationService.navigate(navName.moreSetting);
            }}>
            <SPSvgs.Settings />
          </Pressable>
        }
      />
    );
  }, []);

  const renderUserSection = useMemo(() => {
    return (
      <View style={styles.userSectionWrapper}>
        <PrimaryButton
          onPress={e => {
            e.stopPropagation();
            NavigationService.navigate(navName.moreProfile);
          }}
          text="프로필 보기"
          outlineButton
          buttonStyle={{
            width: '100%',
          }}
        />

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            NavigationService.navigate(navName.socialToken);
          }}
          style={styles.socialTokenWrapper}>
          <Text style={[fontStyles.fontSize14_Medium, { color: COLORS.white }]}>
            포인트
          </Text>

          <View style={styles.tokenWrapper}>
            <Text
              style={[fontStyles.fontSize18_Semibold, { color: COLORS.white }]}>
              {point?.pointBalance
                ? Utils.changeNumberComma(point.pointBalance)
                : '0'}{' '}
              P
            </Text>

            <Pressable
              hitSlop={20}
              onPress={() => {
                NavigationService.navigate(navName.pointShop);
              }}
              style={styles.userInfoButton}>
              <Text style={styles.userInfoButtonText}>포인트 쓰러가기</Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [member, stats, point]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {renderHeader}

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ height: calculatedHeight }}>
          {member?.holderYn && (
            <MoreFlipCard
              isSol={member?.holderYn === 'Y'}
              height={calculatedHeight}
              member={member}
              stats={stats}
              point={point}
              academy={academy}
            />
          )}
        </View>
        {renderUserSection}
        <MenuSection
          title="내 정보"
          onPress={() => {
            NavigationService.navigate(navName.moreMyDetail);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <MenuSection
          title="내 퍼포먼스"
          onPress={() => {
            NavigationService.navigate(navName.moreStat);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <MenuSection
          title="쿠폰등록"
          onPress={() => {
            NavigationService.navigate(navName.moreCouponRegister);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <MenuSection
          title="스포츠파이 인사이트"
          onPress={() => {
            NavigationService.navigate(navName.moreArticle);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <View style={styles.rowLine} />
        <Text style={styles.menuTitle}>내 활동</Text>

        <MenuSection
          title="경기 내역"
          onPress={() => {
            NavigationService.navigate(navName.moreGameSchedule);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <MenuSection
          title="대회 내역"
          onPress={() => {
            NavigationService.navigate(navName.moreTournamentHistory);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <MenuSection
          title="활동 내역"
          onPress={() => {
            NavigationService.navigate(navName.moreActiveHistory);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />

        {/* {eventApplied && ( */}
        {openEvent && eventApplied && (
          <MenuSection
            title="이벤트 참여 내역"
            onPress={() => {
              NavigationService.navigate(navName.moreEvent);
            }}
            containerStyle={styles.noBorder}
            titleTextStyle={styles.customTitleText}
          />
        )}
        {openEvent && !eventApplied && (
          <MenuSection
            title="이벤트 참여 내역"
            onPress={() => {
              NavigationService.navigate(navName.moreNoneEvent);
            }}
            containerStyle={styles.noBorder}
            titleTextStyle={styles.customTitleText}
          />
        )}

        <View style={styles.rowLine} />
        <Text style={styles.menuTitle}>고객센터</Text>

        <MenuSection
          title="공지사항"
          onPress={() => {
            NavigationService.navigate(navName.moreNotice);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <MenuSection
          title="자주 묻는 질문"
          onPress={() => {
            NavigationService.navigate(navName.moreQuestion);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <MenuSection
          title="1:1 문의"
          onPress={() => {
            NavigationService.navigate(navName.moreInquiry);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
        <View style={styles.rowLine} />
        <MenuSection
          title="계정 관리"
          label={LOGIN_TYPES[member.loginType]?.desc}
          onPress={() => {
            NavigationService.navigate(navName.moreAccountManage);
          }}
          containerStyle={styles.noBorder}
          titleTextStyle={styles.customTitleText}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MoreMyInfo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userSectionWrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 16,
  },
  avatar: {
    alignSelf: 'center',
  },
  userInfoWrapper: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    rowGap: 8,
    borderColor: COLORS.lineBorder,
    alignItems: 'center',
  },
  usernameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  ageWrapper: {
    backgroundColor: COLORS.darkBlue,
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 5,
  },
  bodyStatisticWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  statisticWrapper: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    rowGap: 4,
    borderRadius: 8,
    backgroundColor: COLORS.fillNormal,
  },
  statisticValueText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  statisticValueTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  socialTokenWrapper: {
    backgroundColor: COLORS.orange,
    padding: 16,
    borderRadius: 16,
    rowGap: 8,
  },
  tokenWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfoButton: {
    backgroundColor: '#FFE1D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 999,
  },
  userInfoButtonText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#000',
    lineHeight: 20,
  },
  menuTitle: {
    ...fontStyles.fontSize12_Semibold,
    padding: 16,
    color: COLORS.labelNeutral,
    letterSpacing: 0.3,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  customTitleText: {
    fontWeight: 500,
    letterSpacing: 0.091,
  },
  rowLine: {
    height: 12,
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
  },
});
