import { useRoute } from '@react-navigation/native';
import moment from 'moment/moment';
import React, { memo } from 'react';
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

function MoreNoticeDetail() {
  const route = useRoute();
  const { noticeDetail } = route.params;
  const fileUrl =
    noticeDetail.data.files && noticeDetail.data.files.length > 0
      ? noticeDetail.data.files[0].fileUrl
      : null;
  console.log('detail', noticeDetail);
  const { width } = useWindowDimensions();
  let imageHeight;
  if (width <= 480) {
    imageHeight = 219;
  } else {
    const aspectRatio = 328 / 219;
    imageHeight = width / aspectRatio;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text
          style={[
            fontStyles.fontSize24_Bold,
            {
              color: COLORS.black,
            },
          ]}>
          {noticeDetail?.data?.title ?? ''}
        </Text>

        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelNeutral,
              letterSpacing: 0.3,
            },
          ]}>
          {moment(noticeDetail?.data?.regDate).format('YYYY.MM.DD')}
        </Text>
        {fileUrl && <Image source={{ uri: fileUrl }} style={styles.image} />}
        {noticeDetail?.data?.filePath && (
          <Image
            source={{
              uri: noticeDetail?.data?.filePath,
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
          {noticeDetail?.data?.contents ?? ''}
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
    width: 328,
    height: 218.67,
    borderRadius: 10,
    marginBottom: 10,
  },
});
