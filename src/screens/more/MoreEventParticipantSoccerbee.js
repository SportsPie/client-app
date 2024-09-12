import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useAppState } from '../../utils/AppStateContext';

function MoreEventParticipantInfo() {
  const { applyData, setApplyData } = useAppState();
  const [refreshing, setRefreshing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 사커비 탭의 단계

  const SoccerBee = [{ id: '1', title: 'info' }];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000); // simulate refresh
  };

  const handleConnectButton = () => {
    setCurrentStep(1); // '사커비를 연결중입니다.' 상태로 변경

    // 5초 후에 다음 단계로 자동 이동
    setTimeout(() => {
      setCurrentStep(2); // 5초 후에 '사커비 포지션, 평점' 정보 표시
    }, 5000);
  };

  // '사커비를 연결해보세요' 컴포넌트
  const SoccerBeeConnect = ({ onPress }) => (
    <View style={styles.basicInfoWrapper}>
      <Text style={styles.emptyTitle}>사커비를 연결해 보세요!</Text>
      <TouchableOpacity style={styles.outLineBtn} onPress={onPress}>
        <Text style={styles.outLineBtnText}>사커비 연결하기</Text>
      </TouchableOpacity>
    </View>
  );

  // '사커비를 연결중입니다' 컴포넌트
  const SoccerBeeConnecting = () => (
    <View style={styles.basicInfoWrapper}>
      <Text style={styles.emptyTitle}>사커비를 연결 중입니다!</Text>
      <Text style={[styles.emptyText, { textAlign: 'left' }]}>
        {'아래 정보로 사커비 연결 신청 중입니다\n잠시만 기다려주세요.'}
      </Text>
    </View>
  );

  // '사커비 포지션, 평점' 컴포넌트
  const SoccerBeeInfo = () => (
    <View style={styles.basicInfoWrapper}>
      {/* 사커비 포지션 , 평점 */}
      <View style={styles.basicInfo}>
        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={styles.contentsSubTitle}>사커비 포지션</Text>
          <Text style={styles.basicNormalText}>CM</Text>
        </View>

        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={styles.contentsSubTitle}>평점</Text>
          <Text style={styles.basicNormalText}>8.34</Text>
        </View>
      </View>

      {/* 이동거리, 분석시간 */}
      <View style={styles.basicInfo}>
        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={styles.contentsSubTitle}>이동 거리(km)</Text>
          <Text style={styles.basicNormalText}>9.21</Text>
        </View>

        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={styles.contentsSubTitle}>분석시간(분)</Text>
          <Text style={styles.basicNormalText}>42.54</Text>
        </View>
      </View>

      {/* 최고속도, 활동범위 */}
      <View style={styles.basicInfo}>
        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={styles.contentsSubTitle}>최고속도(km/h)</Text>
          <Text style={styles.basicNormalText}>31.02</Text>
        </View>

        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={styles.contentsSubTitle}>활동범위(%)</Text>
          <Text style={styles.basicNormalText}>29.23</Text>
        </View>
      </View>

      {/* 평균 속도, 어질리티 */}
      <View style={styles.basicInfo}>
        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
            평균 속도(km/h)
          </Text>
          <Text style={styles.basicNormalText}>5.33</Text>
        </View>

        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
            어질리티(%)
          </Text>
          <Text style={styles.basicNormalText}>34.23</Text>
        </View>
      </View>

      {/* 스프린트거리, 스프린트(회) */}
      <View style={styles.basicInfo}>
        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
            스프린트거리(m)
          </Text>
          <Text style={styles.basicNormalText}>242.4</Text>
        </View>

        <View style={[styles.basicInfoContainer, styles.basicSoccerBee]}>
          <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
            스프린트(회)
          </Text>
          <Text style={styles.basicNormalText}>32</Text>
        </View>
      </View>
    </View>
  );

  // 사커비 탭의 단계별 컴포넌트 렌더링
  const renderSoccerBeeContent = () => {
    switch (currentStep) {
      case 0:
        return <SoccerBeeConnect onPress={handleConnectButton} />;
      case 1:
        return <SoccerBeeConnecting />;
      case 2:
        return <SoccerBeeInfo />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1 }}
        data={SoccerBee}
        contentContainerStyle={{ gap: 12, paddingBottom: 80, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        renderItem={() => <View>{renderSoccerBeeContent()}</View>} // 단계별 콘텐츠 렌더링
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {
                '신청이 확정되면 이 페이지를 자유롭게 이용하실 수 있어요.\n조금만 기다려 주세요!'
              }
            </Text>
          </View>
        }
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
  basicInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  basicSoccerBee: {
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
    textAlign: 'center',
  },
  outLineBtn: {
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    borderRadius: 10,
    padding: 12,
  },
  outLineBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#002672',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  contentsSubTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  basicNormalText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
});

export default MoreEventParticipantInfo;
