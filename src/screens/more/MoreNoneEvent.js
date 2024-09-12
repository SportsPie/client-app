import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { PrimaryButton } from '../../components/PrimaryButton';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { SPSvgs } from '../../assets/svg';
import MoreEventParticipantInfo from './MoreEventParticipantInfo';
import MoreEventParticipantVideoList from './MoreEventParticipantVideoList';
import MoreEventParticipantSoccerbee from './MoreEventParticipantSoccerbee';
import { handleError } from '../../utils/HandleError';
import { apiGetEventLast } from '../../api/RestAPI';
import { useAppState } from '../../utils/AppStateContext';
import { useFocusEffect } from '@react-navigation/native';

function MoreNoneEvent() {
  const { fromMore, setFromMore } = useAppState();
  const [eventIdx, setEventIdx] = useState(false); // 진행 중인 이벤트 여부
  const [reRender, setReRender] = useState(false);
  const getLastEvent = async () => {
    try {
      const { data } = await apiGetEventLast();
      setEventIdx(data?.data);
    } catch (error) {
      handleError(error);
    }
  };
  useEffect(() => {
    getLastEvent();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setReRender(prev => !prev);
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="이벤트 참여 내역"
        onLeftIconPress={() => {
          NavigationService.navigate(navName.moreMyInfo);
        }}
      />
      <View style={styles.contentsBox}>
        <Text style={styles.contentsTitle}>참여한 이벤트가 아직 없네요!</Text>

        {eventIdx ? (
          // 진행 중인 이벤트 있을 때
          <>
            <Text style={styles.contentsText}>
              진행 중인 이벤트를 한 번 확인해보시겠어요?
            </Text>

            <TouchableOpacity
              style={styles.moveBtn}
              onPress={() => {
                setFromMore(true);
                NavigationService.navigate(navName.eventDetail, {
                  eventIdx,
                });
              }}>
              <Text style={styles.moveBtnText}>진행 중인 이벤트</Text>
              <SPSvgs.RightArrow />
            </TouchableOpacity>
          </>
        ) : (
          // 진행 중인 이벤트 없을 때
          <Text style={styles.contentsText}>
            {
              '현재 진행 중인 이벤트가 없습니다 🥲\n새로운 이벤트가 열리면 알려드릴게요!'
            }
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentsBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentsTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 16,
  },
  contentsText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  moveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    padding: 12,
    marginVertical: 24,
  },
  moveBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
});

export default MoreNoneEvent;
