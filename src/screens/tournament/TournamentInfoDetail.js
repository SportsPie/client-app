import React, { memo, useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import 'moment/locale/ko';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import { apiGetTournamentDetail } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { TOURNAMENT_STATE } from '../../common/constants/tournamentState';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SPLoading from '../../components/SPLoading';
import { WebView } from 'react-native-webview';
import ImageSizeGetter from '../../components/ImageSizeGetter';

function TournamentInfoDetail({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const tournamentIdx = route?.params?.tournamentIdx;
  const [tournamentInfo, setTournamentInfo] = useState({});
  const [tournamentStatus, setTournamentStatus] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState({});

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getTournamentDetail = async () => {
    try {
      const { data } = await apiGetTournamentDetail(tournamentIdx);

      if (data) {
        setTournamentInfo(data.data);
        setTournamentStatus(getTournamentState(data.data));
      }
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const getTournamentState = item => {
    if (!item.isOpened && !item.isClosed && item.closeYn !== 'Y') {
      return TOURNAMENT_STATE.UPCOMING;
    }
    if ((item.isOpened && item.isClosed) || item.closeYn === 'Y') {
      return TOURNAMENT_STATE.CLOSED;
    }
    return TOURNAMENT_STATE.REGISTERING;
  };

  const handleLayout = ({ width, height }, key) => {
    setImageHeight(prev => {
      return { ...prev, [key]: height };
    });
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      getTournamentDetail();
    }, [refresh]),
  );

  const renderHeader = useMemo(() => {
    return <Header title={tournamentInfo.trnNm} />;
  }, [tournamentInfo]);

  const renderCompetitionInfo = useMemo(() => {
    return (
      <View>
        {tournamentInfo.posterUrl ? (
          <WebView
            style={{ height: imageHeight[tournamentInfo.posterUrl] }}
            source={{
              html: Utils.getImageHtml(tournamentInfo.posterUrl),
            }}
            // onLoadStart={() => setLoading(true)}
            // onLoadEnd={() => setLoading(false)}
          />
        ) : (
          ''
        )}

        <View style={styles.statusWrapper}>
          <Text
            style={[
              styles.statusText,
              tournamentStatus.code !== TOURNAMENT_STATE.CLOSED.code && {
                color:
                  tournamentStatus.code === TOURNAMENT_STATE.REGISTERING.code
                    ? COLORS.orange
                    : COLORS.darkBlue,
              },
            ]}>
            {tournamentStatus.desc}
          </Text>
          {tournamentStatus.code !== TOURNAMENT_STATE.CLOSED.code && (
            <Text style={styles.timeText}>
              {Utils.convertMillisecondsToFormattedDate(
                tournamentInfo.closeDate,
              )}
            </Text>
          )}
        </View>

        <Text
          style={[
            styles.headlineText,
            {
              paddingHorizontal: 16,
              paddingVertical: 24,
            },
          ]}>
          {tournamentInfo.trnNm ? tournamentInfo.trnNm : '-'}
        </Text>
        {tournamentInfo.imageUrl ? (
          <WebView
            style={{ height: imageHeight[tournamentInfo.imageUrl] }}
            source={{
              html: Utils.getImageHtml(tournamentInfo.imageUrl),
            }}
            // onLoadStart={() => setLoading(true)}
            // onLoadEnd={() => setLoading(false)}
          />
        ) : (
          ''
        )}

        <View style={styles.competitionWrapper}>
          <Text style={styles.headlineText}>대회정보</Text>
          <View style={styles.infoWrapper}>
            <View style={styles.labeledValue}>
              <Text style={styles.labelText}>대회일</Text>
              <Text style={styles.valueText}>
                {tournamentInfo.startDate && tournamentInfo.endDate
                  ? `${Utils.convertMillisecondsToFormattedDate(
                      tournamentInfo.startDate,
                    )} ~ \n${Utils.convertMillisecondsToFormattedDate(
                      tournamentInfo.endDate,
                    )}`
                  : '-'}
              </Text>
            </View>

            <View style={styles.labeledValue}>
              <Text style={styles.labelText}>장소</Text>
              <Text style={styles.valueText}>
                {tournamentInfo.trnAddr ? tournamentInfo.trnAddr : '-'}
              </Text>
            </View>

            <View style={styles.labeledValue}>
              <Text style={styles.labelText}>시상</Text>
              <Text style={styles.valueText}>
                {tournamentInfo.award ? tournamentInfo.award : '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, [tournamentInfo, tournamentStatus, imageHeight]);

  const renderApplicationInfo = useMemo(() => {
    return (
      <View style={styles.competitionWrapper}>
        <Text style={styles.headlineText}>접수안내</Text>

        <View style={styles.infoWrapper}>
          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>접수기간</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.openDate && tournamentInfo.closeDate
                ? `${Utils.convertMillisecondsToFormattedDate(
                    tournamentInfo.openDate,
                  )} ~\n${Utils.convertMillisecondsToFormattedDate(
                    tournamentInfo.closeDate,
                  )}`
                : '-'}
            </Text>
          </View>

          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>모집팀 수</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.recruitCnt ? `${tournamentInfo.recruitCnt}` : '-'}
            </Text>
          </View>

          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>참가연령</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.entryAge ? `${tournamentInfo.entryAge}` : '-'}
            </Text>
          </View>

          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>참가비</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.entryFee
                ? `${Utils.changeNumberComma(
                    tournamentInfo.entryFee,
                    false,
                    false,
                    true,
                  )}`
                : '-'}
            </Text>
          </View>

          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>입금정보</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.depositInfo ? tournamentInfo.depositInfo : '-'}
            </Text>
          </View>

          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>문의</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.inquiry ? tournamentInfo.inquiry : '-'}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [tournamentInfo]);

  const renderOtherInfo = useMemo(() => {
    return (
      <View style={styles.competitionWrapper}>
        <Text style={styles.headlineText}>기타안내</Text>
        <Text style={styles.valueText}>
          {tournamentInfo.description ? tournamentInfo.description : '-'}
        </Text>
      </View>
    );
  }, [tournamentInfo]);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader}
      {!loading ? (
        <View style={{ flex: 1 }}>
          {tournamentInfo.posterUrl && (
            <ImageSizeGetter
              source={tournamentInfo.posterUrl}
              getter={value => {
                handleLayout(value, tournamentInfo.posterUrl);
              }}
            />
          )}
          {tournamentInfo.imageUrl && (
            <ImageSizeGetter
              source={tournamentInfo.imageUrl}
              getter={value => {
                handleLayout(value, tournamentInfo.imageUrl);
              }}
            />
          )}
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderCompetitionInfo}
            <Divider lineHeight={8} lineColor={COLORS.indigo90} />
            {renderApplicationInfo}
            <Divider lineHeight={8} lineColor={COLORS.indigo90} />
            {renderOtherInfo}
          </ScrollView>
        </View>
      ) : (
        <SPLoading />
      )}
    </SafeAreaView>
  );
}

export default memo(TournamentInfoDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    columnGap: 8,
  },
  statusText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.203,
  },
  timeText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.203,
  },
  headlineText: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  competitionWrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 16,
  },
  infoWrapper: {
    rowGap: 24,
  },
  labeledValue: {
    flexDirection: 'row',
    columnGap: 8,
  },
  labelText: {
    ...fontStyles.fontSize14_Regular,
    width: 70,
    letterSpacing: 0.203,
    color: COLORS.labelNeutral,
  },
  valueText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.203,
    flex: 1,
  },
  buttonWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  submitButton: {
    flex: 1,
  },
});
