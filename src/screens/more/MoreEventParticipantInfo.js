import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native';
import { useAppState } from '../../utils/AppStateContext';
import Utils from '../../utils/Utils';
import { MAIN_FOOT_TYPE } from '../../common/constants/mainFootType';
import { CAREER_TYPE } from '../../common/constants/careerType';
import { handleError } from '../../utils/HandleError';
import { apiGetEventApply, apiGetEventLast } from '../../api/RestAPI';

// 이벤트 > 내 정보
function MoreEventParticipantInfo() {
  /**
   * state
   */
  const { participantInfo, setParticipantInfo } = useAppState();
  const [refreshing, setRefreshing] = useState(false);

  /**
   * api
   */
  const getParticipantInfo = async () => {
    try {
      const { data: eventData } = await apiGetEventLast();
      if (eventData?.data) {
        const { data } = await apiGetEventApply(eventData?.data);
        setParticipantInfo(data.data);
      }
    } catch (error) {
      handleError(error);
    }
    setRefreshing(false);
  };

  /**
   * function
   */
  const handleRefresh = () => {
    setRefreshing(true);
  };

  /**
   * useEffect
   */
  useEffect(() => {
    setParticipantInfo({});
  }, []);

  useEffect(() => {
    getParticipantInfo();
  }, [refreshing]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1 }}
        data={[participantInfo]}
        contentContainerStyle={{ gap: 12, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.basicInfoWrapper}>
            {/* 주 발, 발사이즈, 등번호 */}
            <View style={styles.basicInfo}>
              <View style={styles.basicInfoContainer}>
                <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                  주 발
                </Text>
                <Text style={styles.basicNormalText}>
                  {item?.mainFoot ? MAIN_FOOT_TYPE[item?.mainFoot].desc : '-'}
                </Text>
              </View>

              <View style={styles.basicInfoContainer}>
                <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                  발사이즈
                </Text>
                <Text style={styles.basicNormalText}>
                  {Utils.changeNumberComma(item?.shoeSize)}mm
                </Text>
              </View>
            </View>

            {/* 키 , 몸무게 */}
            <View style={styles.basicInfo}>
              <View style={styles.basicInfoContainer}>
                <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                  키
                </Text>
                <Text style={styles.basicNormalText}>
                  {Utils.changeNumberComma(item?.height)}cm
                </Text>
              </View>

              <View style={styles.basicInfoContainer}>
                <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                  몸무게
                </Text>
                <Text style={styles.basicNormalText}>
                  {Utils.changeNumberComma(item?.weight)}kg
                </Text>
              </View>

              <View style={styles.basicInfoContainer}>
                <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                  등번호
                </Text>
                <Text style={styles.basicNormalText}>
                  {item?.backNo || '-'}
                </Text>
              </View>
            </View>

            {/* 선수경력 */}
            <View style={styles.basicInfo}>
              <View style={styles.basicInfoContainer}>
                <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                  선수경력
                </Text>
                <View style={styles.infoBox}>
                  {item?.careerList && item?.careerList.length > 0 ? (
                    item?.careerList.map((level, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <React.Fragment key={index}>
                        <Text style={styles.basicNormalText}>
                          {CAREER_TYPE[level]?.desc}
                        </Text>
                        {/* eslint-disable-next-line no-unsafe-optional-chaining */}
                        {index < item?.careerList.length - 1 && (
                          <View style={styles.circle} />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <Text style={styles.basicNormalText}>-</Text>
                  )}
                </View>
              </View>
            </View>

            {/* 수상 경력(선택) */}
            <View style={styles.basicInfo}>
              <View style={styles.basicInfoContainer}>
                <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                  수상 경력
                </Text>
                <Text style={styles.basicNormalText}>
                  {item?.awards || '-'}
                </Text>
              </View>
            </View>

            {/* 선호 플레이(선택) */}
            <View style={styles.basicInfo}>
              <View style={styles.basicInfoContainer}>
                <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
                  선호 플레이
                </Text>
                <Text style={styles.basicNormalText}>
                  {item?.preferredPlay || '-'}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  basicInfoWrapper: {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  basicInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    backgroundColor: '#F1F5FF',
    padding: 16,
  },
  basicInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  basicMainText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#002672',
    lineHeight: 32,
    letterSpacing: -0.552,
  },
  basicNormalText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  basicInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  contentsSubTitle: {
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  circle: {
    width: 6,
    height: 6,
    backgroundColor: '#8387AF',
    borderRadius: 10,
  },
});

export default MoreEventParticipantInfo;
