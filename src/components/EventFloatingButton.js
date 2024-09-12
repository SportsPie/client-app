import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
  Text,
} from 'react-native';
import NavigationService from '../navigation/NavigationService';
import { navName } from '../common/constants/navName';
import { SPSvgs } from '../assets/svg'; // 아이콘 가져오기
import { useDispatch, useSelector } from 'react-redux';
import { apiGetEventDetail } from '../api/RestAPI';

function EventFloatingButton({ eventIdx, eventApplied }) {
  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const [isOpen, setIsOpen] = useState(false); // 작은 버튼들이 열려 있는지 상태
  const [animation] = useState(new Animated.Value(0)); // 애니메이션 상태값
  const [eventInfo, setEventInfo] = useState({});

  const getEventDetail = async () => {
    try {
      console.log('getEventDetail');
      const { data } = await apiGetEventDetail(eventIdx);
      setEventInfo(data.data.eventInfo);
    } catch (error) {
      handleError(error);
    }
  };

  // 버튼 클릭 시 애니메이션을 통해 버튼 보이기/숨기기
  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen); // 상태 변경
  };

  // 작은 버튼 위치 조정
  const eventDetailStyle = {
    transform: [
      {
        scale: animation,
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60], // 버튼이 위로 올라가는 위치
        }),
      },
    ],
  };

  const eventWriteStyle = {
    transform: [
      {
        scale: animation,
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -116], // 두 번째 버튼은 더 위로 올라가야 함
        }),
      },
    ],
  };

  useEffect(() => {
    getEventDetail();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 서브 버튼 */}

        {/* 이벤트 상세 */}
        <Animated.View style={[styles.subButton, eventDetailStyle]}>
          <TouchableOpacity
            style={styles.subButtonContent}
            onPress={() => {
              NavigationService.navigate(navName.eventDetail, {
                eventIdx,
              });
            }}>
            <View style={styles.subButtonBox}>
              <Text style={styles.subText}>이벤트 상세</Text>
              <SPSvgs.EventDetail width={20} height={20} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* 신청 정보, 접수하기 */}
        {eventApplied ? (
          <Animated.View style={[styles.subButton, eventWriteStyle]}>
            <TouchableOpacity
              style={styles.subButtonContent}
              onPress={() => {
                NavigationService.navigate(navName.moreEvent);
              }}>
              <View style={styles.subButtonBox}>
                <Text style={styles.subText}>신청 정보</Text>
                <SPSvgs.EventInfo />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.subButton, eventWriteStyle]}>
            <TouchableOpacity
              style={styles.subButtonContent}
              onPress={() => {
                NavigationService.navigate(navName.eventApplyType, {
                  eventIdx,
                  eventInfo,
                });
              }}>
              <View style={styles.subButtonBox}>
                <Text style={styles.subText}>접수하기</Text>
                <SPSvgs.EventWrite width={20} height={20} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* 메인 이벤트 버튼 */}
        <TouchableOpacity onPress={toggleMenu}>
          {isOpen ? (
            <View style={[styles.mainButton, { backgroundColor: '#fff' }]}>
              <SPSvgs.EventClose width={24} height={24} />
            </View>
          ) : (
            <View style={styles.mainButton}>
              <SPSvgs.EventMain width={24} height={24} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16, // 화면 오른쪽에 위치
    bottom: 16, // 화면 하단에 위치
    alignItems: 'center',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF7C10',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  subButton: {
    position: 'absolute',
  },
  subButtonBox: {
    width: 115,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 40,
    borderRadius: 20,
    padding: 10,
    marginRight: 60,
    backgroundColor: '#E6E9F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  subText: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
    flexGrow: 1,
  },
  subButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 아이콘을 오른쪽에 고정
    gap: 8,
  },
  icon: {
    width: 56,
    height: 56,
  },
});

export default EventFloatingButton;
