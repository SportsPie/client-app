import React, { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
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
import { handleError } from '../../utils/HandleError';
import { apiGetQnaDetail } from '../../api/RestAPI';
import { useDispatch } from 'react-redux';
import { moreInquiryListAction } from '../../redux/reducers/list/moreInquiryListSlice';

function MoreInquiryDetail() {
  const dispatch = useDispatch();
  const route = useRoute();
  const [inquiryDetail, setInquiryDetail] = useState(null);
  const { qnaIdx } = route.params;
  const getQnaDetail = async () => {
    try {
      const response = await apiGetQnaDetail(qnaIdx);
      setInquiryDetail(response.data.data);
      dispatch(
        moreInquiryListAction.modifyItem({
          idxName: 'qnaIdx',
          idx: response.data.data.qnaIdx,
          item: response.data.data,
        }),
      );
    } catch (error) {
      handleError(error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      getQnaDetail();
    }, []),
  );

  const renderHeader = useMemo(() => {
    return (
      <Header
        title="내 문의 상세"
        rightContent={
          PROGRESS_STATUS?.[inquiryDetail?.qnaState]?.value !== 'COMPLETE' ? (
            <Pressable
              style={{ padding: 10 }}
              onPress={() => {
                NavigationService.navigate(navName.moreInquiryRegist, {
                  inquiryData: {
                    title: inquiryDetail?.title,
                    question: inquiryDetail?.question,
                    qnaState: inquiryDetail?.qnaState,
                    qnaIdx: inquiryDetail?.qnaIdx,
                  },
                });
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
          ) : null
        }
      />
    );
  }, [inquiryDetail]);

  const statusTextValue = useMemo(() => {
    switch (inquiryDetail?.qnaState) {
      case PROGRESS_STATUS?.COMPLETE?.value:
        return '답변완료';

      case PROGRESS_STATUS?.WAIT.value:
        return '답변대기';

      default:
        return PROGRESS_STATUS?.[inquiryDetail?.qnaState]?.value ?? '';
    }
  }, [inquiryDetail?.qnaState]);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={{ rowGap: 8, paddingHorizontal: 16 }}>
          <View style={styles.dateWrapper}>
            <Text style={styles.timeText}>
              {moment(inquiryDetail?.regDate)?.format('YYYY.MM.DD')}
            </Text>
            <View style={styles.statusWrapperBox}>
              <Text
                style={[
                  styles.statusWrapper,
                  {
                    backgroundColor:
                      PROGRESS_STATUS?.[inquiryDetail?.qnaState]?.value ===
                      'WAIT'
                        ? COLORS.peach
                        : `${COLORS.darkBlue}10`,
                    color:
                      PROGRESS_STATUS?.[inquiryDetail?.qnaState]?.value ===
                      'WAIT'
                        ? COLORS.orange
                        : COLORS.darkBlue,
                  },
                ]}>
                {statusTextValue}
              </Text>
            </View>
          </View>

          <Text style={styles.titleText}>{inquiryDetail?.title}</Text>
        </View>

        <Divider />

        <View style={styles.itemWrapper}>
          <Text style={styles.contentText}>{inquiryDetail?.question}</Text>
        </View>

        <Divider />

        {inquiryDetail?.answer && (
          <View style={styles.itemWrapper}>
            <SPSvgs.LetterA />
            <Text style={styles.contentText}>{inquiryDetail?.answer}</Text>
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
  statusWrapperBox: {
    minWidth: 59,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusWrapper: {
    ...fontStyles.fontSize12_Semibold,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
