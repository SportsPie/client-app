import { useFocusEffect, useRoute } from '@react-navigation/native';
import moment from 'moment/moment';
import React, { memo, useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { apiGetNoticesDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { moreNoticeListAction } from '../../redux/reducers/list/moreNoticeListSlice';
import { useDispatch } from 'react-redux';

function MoreNoticeDetail() {
  const dispatch = useDispatch();
  const route = useRoute();
  const { boardIdx } = route.params;
  const [noticeDetail, setNoticeDetail] = useState({});
  // const fileUrl =
  //   noticeDetail.data.files && noticeDetail.data.files.length > 0
  //     ? noticeDetail.data.files[0].fileUrl
  //     : null;
  const fileUrl = null;

  const { width } = useWindowDimensions();
  let imageHeight;
  if (width <= 480) {
    imageHeight = 219;
  } else {
    const aspectRatio = 328 / 219;
    imageHeight = width / aspectRatio;
  }
  const getNoticeDetail = async () => {
    try {
      const { data } = await apiGetNoticesDetail(boardIdx);
      setNoticeDetail(data.data);
    } catch (error) {
      if (error.code === 4906 || error.code === 9999) {
        dispatch(moreNoticeListAction.refresh());
      }
      handleError(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getNoticeDetail();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <Text
          style={[
            fontStyles.fontSize24_Bold,
            {
              color: COLORS.black,
            },
          ]}>
          {noticeDetail?.title ?? ''}
        </Text>

        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelNeutral,
              letterSpacing: 0.3,
            },
          ]}>
          {moment(noticeDetail?.regDate).format('YYYY.MM.DD')}
        </Text>
        {noticeDetail?.files?.length > 0 && (
          <Image
            source={{ uri: noticeDetail.files[0].fileUrl }}
            style={[styles.image, { height: imageHeight }]}
          />
        )}
        {noticeDetail?.filePath && (
          <Image
            source={{
              uri: noticeDetail?.filePath,
            }}
            style={{
              width: '100%',
              height: imageHeight,
            }}
          />
        )}

        <Text
          style={[
            fontStyles.fontSize14_Medium,
            {
              paddingTop: 8,
              letterSpacing: 0.2,
              lineHeight: 22,
              color: COLORS.labelNormal,
            },
          ]}>
          {noticeDetail?.contents ?? ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MoreNoticeDetail);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    rowGap: 8,
  },
  image: {
    width: '100%',
    // height: 218.67,
    borderRadius: 10,
    marginBottom: 10,
  },
});
