import { useFocusEffect, useRoute } from '@react-navigation/native';
import moment from 'moment/moment';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { apiGetTournamentNoticeDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import ImageSizeGetter from '../../components/ImageSizeGetter';
import Utils from '../../utils/Utils';
import { WebView } from 'react-native-webview';

function TournamentNoticeDetail() {
  const route = useRoute();
  const { noticeIdx, tournamentName } = route.params;
  const [noticeDetail, setNoticeDetail] = useState({});
  const [imageHeight, setImageHeight] = useState();

  const getNoticeDetail = async () => {
    try {
      const { data } = await apiGetTournamentNoticeDetail(noticeIdx);
      setNoticeDetail(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleLayout = ({ width, height }) => {
    setImageHeight(height);
  };

  useFocusEffect(
    useCallback(() => {
      getNoticeDetail();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="대회 공지사항" />
      <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
        <Text style={{ ...fontStyles.fontSize20_Semibold }}>
          {tournamentName}
        </Text>
      </View>
      {noticeDetail?.files?.length > 0 && (
        <ImageSizeGetter
          source={noticeDetail.files[0].fileUrl}
          getter={handleLayout}
        />
      )}
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
          {noticeDetail?.notice?.title ?? ''}
        </Text>

        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelNeutral,
              letterSpacing: 0.3,
            },
          ]}>
          {noticeDetail?.notice?.regDate &&
            moment(noticeDetail?.notice?.regDate).format('YYYY.MM.DD')}
        </Text>
        {noticeDetail?.files?.length > 0 && (
          <WebView
            style={{ height: imageHeight }}
            source={{
              html: Utils.getImageHtml(noticeDetail.files[0].fileUrl),
            }}
            // onLoadStart={() => setLoading(true)}
            // onLoadEnd={() => setLoading(false)}
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
          {noticeDetail?.notice?.contents ?? ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(TournamentNoticeDetail);

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
  eventImage: {
    width: SCREEN_WIDTH - 32, // 이미지가 화면의 전체 너비에 맞게 설정됨
  },
});
