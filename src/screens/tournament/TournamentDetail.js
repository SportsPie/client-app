import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import 'moment/locale/ko';
import Header from '../../components/header';
import { SPSvgs } from '../../assets/svg';
import Divider from '../../components/Divider';
import { COLORS } from '../../styles/colors';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import fontStyles from '../../styles/fontStyles';
import { PrimaryButton } from '../../components/PrimaryButton';
import Utils from '../../utils/Utils';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import {
  apiApplyTournament,
  apiGetMyInfo,
  apiGetTournamentDetail,
  apiGetTournamentDetailForMember,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { TOURNAMENT_STATE } from '../../common/constants/tournamentState';
import { isAfter, isBefore } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import { SafeAreaView } from 'react-native-safe-area-context';

function TournamentDetail({ route }) {
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const tournamentIdx = route?.params?.tournamentIdx;
  const [member, setMember] = useState({});
  const [tournamentInfo, setTournamentInfo] = useState({});
  const [tournamentStatus, setTournamentStatus] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getTournamentDetail = async () => {
    try {
      let data;
      if (isLogin) {
        data = await apiGetTournamentDetailForMember(tournamentIdx);
      } else {
        data = await apiGetTournamentDetail(tournamentIdx);
      }

      if (data) {
        setTournamentInfo(data.data.data);
        setTournamentStatus(
          getTournamentState(data.data.data.openDate, data.data.data.closeDate),
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  const applyTournamentDetail = async () => {
    try {
      const param = {
        trnIdx: tournamentIdx,
      };

      const { data } = await apiApplyTournament(param);

      if (data) {
        NavigationService.navigate(navName.tournamentApplyComplete, {
          tournamentIdx,
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getMyInfo = async () => {
    if (!isLogin) {
      return;
    }
    try {
      const { data } = await apiGetMyInfo();
      if (data) {
        setMember(data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const getTournamentState = (openDate, closeDate) => {
    const now = new Date();
    if (isBefore(now, new Date(openDate))) {
      return TOURNAMENT_STATE.UPCOMING;
    }
    if (isAfter(now, new Date(closeDate))) {
      return TOURNAMENT_STATE.CLOSED;
    }
    return TOURNAMENT_STATE.REGISTERING;
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      getMyInfo();
      getTournamentDetail();
    }, []),
  );

  const renderHeader = useMemo(() => {
    return (
      <Header
        title={tournamentInfo.trnNm}
        rightContent={
          <Pressable
            onPress={() => {
              setShowShareModal(true);
            }}>
            <SPSvgs.EllipsesVertical />
          </Pressable>
        }
      />
    );
  }, [tournamentInfo]);

  const renderCompetitionInfo = useMemo(() => {
    return (
      <View>
        {tournamentInfo.thumbUrl ? (
          <Image
            source={{
              uri: `${tournamentInfo.thumbUrl}`,
            }}
            style={styles.coverImage}
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

        {tournamentInfo.posterUrl ? (
          <Image
            source={{
              uri: `${tournamentInfo.posterUrl}`,
            }}
            style={[
              styles.coverImage,
              {
                height: (SCREEN_HEIGHT * 491) / 800,
              },
            ]}
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
  }, [tournamentInfo, tournamentStatus]);

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
              {tournamentInfo.recruitCnt
                ? `${tournamentInfo.recruitCnt}팀`
                : '-'}
            </Text>
          </View>

          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>참가연령</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.entryAge ? `${tournamentInfo.entryAge}대` : '-'}
            </Text>
          </View>

          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>참가비</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.entryFee
                ? `${Utils.changeNumberComma(tournamentInfo.entryFee)}원`
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

  const renderSubmitButtonText = useMemo(() => {
    if (tournamentInfo.isApply) {
      return '접수내역 보기';
    }

    if (tournamentStatus.code === TOURNAMENT_STATE.REGISTERING.code) {
      return '접수신청';
    }

    return '';
  }, [tournamentStatus, tournamentInfo]);

  const handleRegister = useCallback(() => {
    if (tournamentInfo.isApply) {
      NavigationService.navigate(navName.academyMachingRegistration, {
        tournamentIdx,
      });
      return '';
    }

    if (tournamentStatus.code === TOURNAMENT_STATE.REGISTERING.code) {
      applyTournamentDetail();
      return '';
    }

    return '';
  }, [tournamentStatus, tournamentInfo]);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderCompetitionInfo}
        <Divider lineHeight={8} lineColor={COLORS.indigo90} />
        {renderApplicationInfo}
        <Divider lineHeight={8} lineColor={COLORS.indigo90} />
        {renderOtherInfo}
      </ScrollView>

      {member?.academyAdmin &&
        (tournamentStatus.code === TOURNAMENT_STATE.REGISTERING.code ||
          tournamentInfo.isApply) && (
          <PrimaryButton
            buttonStyle={styles.submitButton}
            text={renderSubmitButtonText}
            onPress={handleRegister}
          />
        )}

      <SPMoreModal
        visible={showShareModal}
        onClose={() => {
          setShowShareModal(false);
        }}
        type={MODAL_MORE_TYPE.RECRUIT}
        adminButtons={[MODAL_MORE_BUTTONS.SHARE]}
        memberButtons={[MODAL_MORE_BUTTONS.SHARE]}
        shareLink={`tournament?id=${tournamentIdx}`}
        shareTitle={tournamentInfo?.trnNm ?? ''}
        shareDescription={tournamentInfo?.description ?? ''}
      />
    </SafeAreaView>
  );
}

export default memo(TournamentDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: (SCREEN_HEIGHT * 480) / 800,
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
  submitButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 16,
  },
});
