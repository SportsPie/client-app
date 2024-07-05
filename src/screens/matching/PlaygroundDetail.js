import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { memo, useMemo, useState, useCallback } from 'react';
import Header from '../../components/header';
import NaverMapView, { Marker } from 'react-native-nmap/index';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { SPSvgs } from '../../assets/svg';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { apiGetPlaygroundDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import Utils from '../../utils/Utils';
import { SafeAreaView } from 'react-native-safe-area-context';

const weekDays = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
  SAT: '토요일',
  SUN: '일요일',
};

function PlaygroundDetail({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const groundIdx = route?.params?.groundIdx;
  const [playgroundInfo, setPlaygroundInfo] = useState({});
  const [camera, setCamera] = useState({
    latitude: 35.182360938,
    longitude: 129.079075027,
  });

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getPlaygroundDetail = async () => {
    try {
      const { data } = await apiGetPlaygroundDetail(groundIdx);
      console.log(data);
      // instagramUrl;
      // homepageUrl;

      if (data) {
        setPlaygroundInfo(data.data);
        setCamera({
          latitude: data.data.latitude,
          longitude: data.data.longitude,
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------

  const formatTime = time => {
    return time.substring(0, 5); // 시간과 분까지만 반환
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      getPlaygroundDetail();
    }, []),
  );

  const renderBasicInfo = useMemo(() => {
    return (
      <View style={styles.contentWrapper}>
        <View style={styles.cityWrapper}>
          {(playgroundInfo.groundCity || playgroundInfo.groundGu) && (
            <Text style={styles.cityText}>
              {playgroundInfo.groundCity} {playgroundInfo.groundGu}
            </Text>
          )}
        </View>

        <View>
          <Text style={styles.headlineText}>
            {playgroundInfo.groundNm ? playgroundInfo.groundNm : '-'}
          </Text>
          <Text style={styles.addressText}>
            {playgroundInfo.groundAddr ? playgroundInfo.groundAddr : '-'}
          </Text>
          {playgroundInfo.phoneNo && (
            <View style={styles.phoneWrapper}>
              <SPSvgs.Phone />
              <Text style={styles.phoneText}>{playgroundInfo.phoneNo}</Text>
            </View>
          )}
        </View>

        <NaverMapView
          center={{ ...camera, zoom: 15 }}
          zoomControl={false}
          style={styles.mapView}>
          <Marker coordinate={camera} />
        </NaverMapView>
      </View>
    );
  }, [playgroundInfo, camera]);

  const renderOperatingTime = useMemo(() => {
    return (
      <View style={styles.contentWrapper}>
        <Text style={styles.headlineText}>운영시간</Text>
        <Text style={styles.contentText}>
          {playgroundInfo.groundSchedule ? playgroundInfo.groundSchedule : '-'}
        </Text>
      </View>
    );
  }, [playgroundInfo]);

  const renderStadiumInfo = useMemo(() => {
    return (
      <View style={styles.contentWrapper}>
        <Text style={styles.headlineText}>구장안내</Text>
        <Text style={styles.contentText}>
          {playgroundInfo.groundService ? playgroundInfo.groundService : '-'}
        </Text>
      </View>
    );
  }, [playgroundInfo]);

  const renderLinks = useMemo(() => {
    return (
      (playgroundInfo.instagramUrl || playgroundInfo.homepageUrl) && (
        <View style={styles.contentWrapper}>
          <Text style={styles.headlineText}>홈페이지</Text>
          <View style={styles.linkWrapper}>
            {playgroundInfo.instagramUrl && (
              <Pressable
                onPress={() =>
                  Utils.openInstagram(playgroundInfo.instagramUrl)
                }>
                <SPSvgs.Instagram />
              </Pressable>
            )}
            {playgroundInfo.homepageUrl && (
              <Pressable
                onPress={() => Linking.openURL(playgroundInfo.homepageUrl)}>
                <SPSvgs.Website />
              </Pressable>
            )}
          </View>
        </View>
      )
    );
  }, [playgroundInfo]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="실내 풋살장" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {renderBasicInfo}
        {renderOperatingTime}
        {renderStadiumInfo}
        {renderLinks}
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(PlaygroundDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  contentWrapper: {
    paddingVertical: 24,
    rowGap: 16,
  },
  mapView: {
    height: (SCREEN_HEIGHT * 164) / 800,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headlineText: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  contentText: {
    ...fontStyles.fontSize16_Medium,
    lineHeight: 26,
    color: COLORS.labelNeutral,
    letterSpacing: 0.091,
  },
  addressText: {
    ...fontStyles.fontSize14_Medium,
    lineHeight: 18,
    color: COLORS.black,
    marginVertical: 8,
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  phoneText: {
    ...fontStyles.fontSize12_Medium,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: COLORS.labelNeutral,
  },
  cityWrapper: {
    backgroundColor: COLORS.orange,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cityText: {
    ...fontStyles.fontSize12_Semibold,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  linkWrapper: {
    flexDirection: 'row',
    columnGap: 8,
  },
});
