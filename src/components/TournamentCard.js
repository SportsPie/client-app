import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ClockIcon from '../assets/svg/ClockIcon';
import NavigationService from '../navigation/NavigationService';
import { navName } from '../common/constants/navName';
import moment from 'moment';
import { TOURNAMENT_STATE_TYPE } from '../common/constants/TournamentStateType';
import Utils from '../utils/Utils';

function TournamentCard({
  title,
  tournamentCount,
  startDate,
  endDate,
  location,
  image,
  dDay,
  status,
  openDate,
  tournamentIdx,
}) {
  const getStatusStyle = statusParam => {
    switch (statusParam) {
      case TOURNAMENT_STATE_TYPE.APPLY_WAIT.code:
        return styles.pendingStatus;
      case TOURNAMENT_STATE_TYPE.APPLY_OPEN.code:
        return styles.ongoingStatus;
      case TOURNAMENT_STATE_TYPE.APPLY_CLOSED.code:
        return styles.endedStatus;
      case TOURNAMENT_STATE_TYPE.ONGOING.code:
        return styles.tournamentOngoingStatus;
      case TOURNAMENT_STATE_TYPE.FINISHED.code:
        return styles.tournamentEndedStatus;
      case TOURNAMENT_STATE_TYPE.CANCELED.code:
        return styles.tournamentCanceledStatus;
      default:
        return styles.ongoingStatus;
    }
  };

  const isRegistrationPending =
    status === TOURNAMENT_STATE_TYPE.APPLY_WAIT.code;

  const formatStatus = statusText => {
    if (statusText === TOURNAMENT_STATE_TYPE.APPLY_OPEN.code) {
      return TOURNAMENT_STATE_TYPE[statusText]?.desc;
    }
    if (statusText.length > 2) {
      return `${TOURNAMENT_STATE_TYPE[statusText]?.desc?.slice(
        0,
        2,
      )}\n${TOURNAMENT_STATE_TYPE[statusText]?.desc?.slice(2)}`;
    }
    return TOURNAMENT_STATE_TYPE[statusText]?.desc;
  };

  const getStatusTextColor = statusParam => {
    return statusParam === TOURNAMENT_STATE_TYPE.ONGOING.code
      ? '#FF7C10'
      : 'white';
  };

  return (
    <Pressable
      onPress={() =>
        NavigationService.navigate(navName.tournamentDetail, {
          tournamentIdx,
        })
      }>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.cardImage} />
          {isRegistrationPending && (
            <View style={styles.pendingOverlay}>
              <ClockIcon />
              <Text style={styles.pendingText}>
                {moment(openDate).format('MM월 D일')} 접수 시작
              </Text>
            </View>
          )}
          <View style={[styles.cardStatus, getStatusStyle(status)]}>
            {dDay ? (
              <View style={styles.statusContent}>
                <Text
                  style={[
                    styles.dDay,
                    { color: getStatusTextColor(status) },
                    isRegistrationPending
                      ? styles.pendingDDay
                      : styles.ongoingDDay,
                  ]}>
                  {dDay}
                </Text>
                <Text
                  style={[
                    styles.status,
                    { color: getStatusTextColor(status) },
                    isRegistrationPending
                      ? styles.pendingStatusText
                      : styles.ongoingStatusText,
                  ]}>
                  {formatStatus(status)}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.statusOnly,
                  { color: getStatusTextColor(status) },
                ]}>
                {formatStatus(status)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
            제{Utils.changeNumberComma(tournamentCount)}회 {title}
          </Text>
          <Text style={styles.cardInfo}>{`${moment(startDate).format(
            'M월 D일 dddd',
          )} - ${moment(endDate).format('M월 D일 dddd')}`}</Text>
          <Text style={styles.cardInfo}>{location}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    // iOS 그림자
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      // Android 그림자
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    minHeight: 239,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 26.01,
    textAlign: 'left',
  },
  cardInfo: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 22,
    color: '#959393',
  },
  cardStatus: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#60617029',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  statusContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingStatus: {
    backgroundColor: 'rgba(50, 107, 255, 1)',
  },
  ongoingStatus: {
    backgroundColor: 'rgba(255, 112, 9, 1)',
  },
  endedStatus: {
    backgroundColor: '#001B51',
  },
  tournamentOngoingStatus: {
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#FF7C10',
  },
  tournamentEndedStatus: {
    backgroundColor: '#ADABA7',
  },
  tournamentCanceledStatus: {
    backgroundColor: '#970000',
  },
  status: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
    marginTop: -2,
  },
  statusOnly: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
  },
  dDay: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 0,
  },
  pendingDDay: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  ongoingDDay: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
  pendingStatusText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  ongoingStatusText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  pendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingText: {
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.24,
    textAlign: 'center',
    color: 'white',
    marginTop: 8,
  },
});

export default TournamentCard;
