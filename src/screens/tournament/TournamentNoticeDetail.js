import { useFocusEffect, useRoute } from '@react-navigation/native';
import moment from 'moment/moment';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import {
  apiGetTournamentNoticeDetail,
  apiGetTournamentTitle,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import ImageSizeGetter from '../../components/ImageSizeGetter';
import Utils from '../../utils/Utils';
import { WebView } from 'react-native-webview';

function TournamentNoticeDetail() {
  const route = useRoute();
  const { noticeIdx, tournamentIdx } = route.params;
  const [noticeDetail, setNoticeDetail] = useState({});
  const [imageHeight, setImageHeight] = useState({});
  const [tournamentCount, setTournamentCount] = useState();
  const [tournamentName, setTournamentName] = useState();

  const getTournamentName = async () => {
    try {
      const { data } = await apiGetTournamentTitle(tournamentIdx);
      setTournamentCount(data.data.trnCnt);
      setTournamentName(data.data.title);
    } catch (error) {
      handleError(error);
    }
  };

  const getNoticeDetail = async () => {
    try {
      const { data } = await apiGetTournamentNoticeDetail(noticeIdx);
      setNoticeDetail(data.data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleLayout = ({ width, height }, fileIdx) => {
    setImageHeight(prev => {
      return { ...prev, [fileIdx]: height };
    });
  };

  useFocusEffect(
    useCallback(() => {
      getTournamentName();
      getNoticeDetail();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="대회 공지사항" />
      <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
        <Text style={{ ...fontStyles.fontSize20_Semibold }}>
          {tournamentCount &&
            `제${Utils.changeNumberComma(tournamentCount)}회 `}{' '}
          {tournamentName}
        </Text>
      </View>
      {noticeDetail?.files?.length > 0 &&
        noticeDetail?.files?.map((item, index) => {
          return (
            <ImageSizeGetter
              key={item.fileIdx}
              source={item.fileUrl}
              getter={value => {
                handleLayout(value, item.fileIdx);
              }}
            />
          );
        })}
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
        <View>
          {noticeDetail?.files?.length > 0 &&
            noticeDetail?.files?.map((item, index) => {
              return (
                <TouchableOpacity
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  activeOpacity={1}
                  onPress={() => {}}>
                  <WebView
                    key={item.fileIdx}
                    style={{ height: imageHeight[item.fileIdx] }}
                    source={{
                      html: Utils.getImageHtml(item.fileUrl),
                    }}
                    // onLoadStart={() => setLoading(true)}
                    // onLoadEnd={() => setLoading(false)}
                  />
                </TouchableOpacity>
              );
            })}
        </View>
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
