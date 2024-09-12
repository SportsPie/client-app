import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Collapsible from 'react-native-collapsible';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import { SPGifs } from '../../../assets/gif';
import SPIcons from '../../../assets/icon';
import { COLORS } from '../../../styles/colors';
import Divider from '../../../components/Divider';
import { ACTIVE_OPACITY } from '../../../common/constants/constants';
import { useAppState } from '../../../utils/AppStateContext';
import moment from 'moment';
import { POSITION_DETAIL_TYPE } from '../../../common/constants/positionDetailType';
import Utils from '../../../utils/Utils';

function EventApplyInputComplete() {
  const { applyData, setApplyData } = useAppState();

  const [isCollapsed, setIsCollapsed] = useState({
    personalInfo: false,
    eventInfo: false,
    paymentInfo: false,
  });

  // 토글을 개별적으로 관리하는 함수
  const toggleSection = section => {
    setIsCollapsed(prevState => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="접수 완료"
        closeIcon
        onLeftIconPress={() => {
          NavigationService.navigate(navName.eventDetail, {
            eventIdx: applyData.eventIdx,
          }); // home 페이지로 이동
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.content}>
          <Image source={SPGifs.check} style={{ width: 178, height: 178 }} />

          <Text style={styles.mainTitle}>접수가 완료되었습니다!</Text>

          <Text style={styles.mainText}>
            {
              '이체 시, 입금자 이름과 번호를 정확히 입력해 주세요.\n기한 내 미입금 시 접수가 취소됩니다!'
            }
          </Text>
        </View>

        <Divider lineHeight={8} lineColor={COLORS.indigo90} />

        {/* 신청 정보 확인 */}
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
              <Text style={styles.contentTitle}>신청 정보 확인</Text>
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
                    ? SPIcons.icArrowDownBlack
                    : SPIcons.icArrowUpBlack
                }
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          </View>
          <Collapsible collapsed={isCollapsed.personalInfo} duration={500}>
            <View style={styles.contentContainer}>
              <View style={styles.contentsSubContainer}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>이름</Text>
                  <Text style={styles.contentsSubText}>
                    {applyData?.participationName}
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>생년월일</Text>
                  <Text style={styles.contentsSubText}>
                    {moment(applyData?.participationBirth).format('YYYY.MM.DD')}
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>참가 부문</Text>
                  <Text style={styles.contentsSubText}>
                    {applyData?.targetName}
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>포지션</Text>
                  <Text style={styles.contentsSubText}>
                    {POSITION_DETAIL_TYPE[applyData?.firstWish].enDesc}
                    {applyData?.secondWish
                      ? `, ${
                          POSITION_DETAIL_TYPE[applyData?.secondWish].enDesc
                        }`
                      : ''}
                    {applyData?.thirdWish
                      ? `, ${POSITION_DETAIL_TYPE[applyData?.thirdWish].enDesc}`
                      : ''}
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>보호자</Text>
                  <Text style={styles.contentsSubText}>
                    {applyData?.guardianName} {applyData?.guardianContact}
                  </Text>
                </View>
              </View>
            </View>
          </Collapsible>
        </View>

        <Divider lineHeight={8} lineColor={COLORS.indigo90} />

        {/* 이벤트 정보 확인 */}
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
              <Text style={styles.contentTitle}>이벤트 정보 확인</Text>
            </View>
            <Pressable
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => toggleSection('eventInfo')}>
              <Image
                source={
                  isCollapsed.eventInfo
                    ? SPIcons.icArrowDownBlack
                    : SPIcons.icArrowUpBlack
                }
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          </View>
          <Collapsible collapsed={isCollapsed.eventInfo} duration={500}>
            <View style={styles.contentContainer}>
              <View style={styles.contentsSubContainer}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>이벤트명</Text>
                  <Text style={styles.contentsSubText}>
                    {applyData?.eventInfo?.eventName}
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>이벤트 일자</Text>
                  <Text style={styles.contentsSubText}>
                    {moment(applyData?.eventInfo?.startDate).format(
                      'YYYY.MM.DD',
                    )}{' '}
                    -{' '}
                    {moment(applyData?.eventInfo?.endDate).format('YYYY.MM.DD')}
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>이벤트 장소</Text>
                  <Text style={styles.contentsSubText}>
                    {applyData?.eventInfo?.eventPlace}
                  </Text>
                </View>
              </View>
            </View>
          </Collapsible>
        </View>

        <Divider lineHeight={8} lineColor={COLORS.indigo90} />

        {/* 결제 정보 확인 */}
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
              <Text style={styles.contentTitle}>결제 정보 확인</Text>
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
                    ? SPIcons.icArrowDownBlack
                    : SPIcons.icArrowUpBlack
                }
                style={{ width: 24, height: 24 }}
              />
            </Pressable>
          </View>
          <Collapsible collapsed={isCollapsed.paymentInfo} duration={500}>
            <View style={styles.contentContainer}>
              <View style={[styles.contentsSubContainer, { gap: 16 }]}>
                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>결제 금액</Text>
                  <Text style={styles.contentsSubText}>
                    {Utils.changeNumberComma(applyData?.eventInfo?.parFee)}원
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>입금자 이름</Text>
                  <Text style={styles.contentsSubText}>
                    {applyData?.depositName}
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>입금 기한</Text>
                  <Text style={styles.contentsSubText}>
                    {moment().format('YYYY.MM.DD')} 23:59
                  </Text>
                </View>

                <View style={styles.contentsSubBox}>
                  <Text style={styles.contentsSubTitle}>환불 계좌</Text>
                  <Text style={styles.contentsSubText}>
                    {applyData?.refundBank} {applyData?.refundAccount}{' '}
                    {applyData?.refundName}
                  </Text>
                </View>
              </View>
            </View>
          </Collapsible>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 16,
    paddingHorizontal: 16,
    paddingVertical: 64,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  mainText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  contentItem: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
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
    // marginBottom: 24,
  },
  contentsSubContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  contentsSubBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentsSubTitle: {
    minWidth: 80,
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
});

export default EventApplyInputComplete;
