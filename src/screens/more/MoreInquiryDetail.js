import React, { memo, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import moment from 'moment';
import { PROGRESS_STATUS } from '../../common/constants/progressStatus';
import Header from '../../components/header';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import Divider from '../../components/Divider';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { SafeAreaView } from 'react-native-safe-area-context';

function MoreInquiryDetail() {
  const route = useRoute();
  const { inquiryDetail } = route.params;

  const renderHeader = useMemo(() => {
    return (
      <Header
        title="내 문의 상세"
        rightContent={
          PROGRESS_STATUS?.[inquiryDetail?.data?.qnaState]?.value !==
          'COMPLETE' ? (
            <Pressable
              onPress={() => {
                NavigationService.navigate(navName.moreInquiryRegist, {
                  inquiryData: {
                    title: inquiryDetail?.data?.title,
                    question: inquiryDetail?.data?.question,
                    qnaState: inquiryDetail?.data?.qnaState,
                    qnaIdx: inquiryDetail?.data?.qnaIdx,
                  },
                });
              }}>
              <Text
                style={[
                  fontStyles.fontSize14_Semibold,
                  {
                    color: COLORS.darkBlue,
                  },
                ]}>
                수정
              </Text>
            </Pressable>
          ) : null
        }
      />
    );
  }, [inquiryDetail?.data]);

  const statusTextValue = useMemo(() => {
    switch (inquiryDetail?.data?.qnaState) {
      case PROGRESS_STATUS?.COMPLETE?.value:
        return '답변완료';

      case PROGRESS_STATUS?.WAIT.value:
        return '답변대기';

      default:
        return PROGRESS_STATUS?.[inquiryDetail?.data?.qnaState]?.value ?? '';
    }
  }, [inquiryDetail?.data?.qnaState]);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={{ rowGap: 8, paddingHorizontal: 16 }}>
          <View style={styles.dateWrapper}>
            <Text style={styles.timeText}>
              {moment(inquiryDetail?.data?.regDate)?.format('YYYY.MM.DD')}
            </Text>
            <Text
              style={[
                styles.statusWrapper,
                {
                  backgroundColor:
                    PROGRESS_STATUS?.[inquiryDetail?.data?.qnaState]?.value ===
                    'WAIT'
                      ? COLORS.peach
                      : `${COLORS.darkBlue}10`,
                  color:
                    PROGRESS_STATUS?.[inquiryDetail?.data?.qnaState]?.value ===
                    'WAIT'
                      ? COLORS.orange
                      : COLORS.darkBlue,
                },
              ]}>
              {statusTextValue}
            </Text>
          </View>

          <Text style={styles.titleText}>{inquiryDetail?.data?.title}</Text>
        </View>

        <Divider />

        <View style={styles.itemWrapper}>
          <Text style={styles.contentText}>
            {inquiryDetail?.data?.question}
          </Text>
        </View>

        <Divider />

        {inquiryDetail?.data?.answer && (
          <View style={styles.itemWrapper}>
            <SPSvgs.LetterA />
            <Text style={styles.contentText}>
              {inquiryDetail?.data?.answer}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MoreInquiryDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    rowGap: 16,
    paddingTop: 16,
  },
  dateWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusWrapper: {
    ...fontStyles.fontSize12_Semibold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 59,
    borderRadius: 999,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  contentText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  itemWrapper: {
    paddingHorizontal: 16,
    rowGap: 8,
  },
  timeText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.3,
  },
  titleText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.labelNormal,
    lineHeight: 24,
  },
});
