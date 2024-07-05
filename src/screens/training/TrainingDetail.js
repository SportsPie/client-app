import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import SPIcons from '../../assets/icon';
import SPImages from '../../assets/images';
import ClassVideoTab from '../../components/training/ClassVideoTab';
import MasterVideoTab from '../../components/training/MasterVideoTab';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import TrainingStatus from '../../components/training/TrainingStatus';
import {
  apiGetMasterVideoList,
  apiGetTrainingDetail,
  apiLikeTraining,
  apiUnlikeTraining,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import {
  AccessDeniedException,
  CustomException,
} from '../../common/exceptions';
import Utils from '../../utils/Utils';
import SPLoading from '../../components/SPLoading';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { ACTIVE_OPACITY } from '../../common/constants/constants';

// 상수값
const MAX_DESC_TEXT = 70;

// 탭 컴포넌트 (클래스 영상, 마스터 영상)
function TabButton({ title, activeTab, setActiveTab }) {
  return (
    <TouchableOpacity
      activeOpacity={ACTIVE_OPACITY}
      style={[
        styles.tabButton,
        activeTab === title ? styles.activeTab : styles.inactiveTab,
      ]}
      onPress={() => setActiveTab(title)}>
      <Text
        style={[
          styles.tabText,
          activeTab === title ? styles.activeTabText : null,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// 트레이닝 상세 메인
function TrainingDetail({ route }) {
  const isLogin = useSelector(selector => selector.auth)?.isLogin;

  const { width } = useWindowDimensions();
  const aspectRatio = 16 / 9;

  // 화면 너비에 따른 이미지 높이 동적 계산
  let imageHeight;
  // 화면 너비가 480 이하일 때는 고정 높이 270
  if (width <= 480) {
    imageHeight = 270;
  }
  // 화면 너비가 480 초과일 때는 비율에 따른 동적 높이 계산
  else {
    imageHeight = width / aspectRatio;
  }

  // 다중 클릭 방지
  const trlRef = useRef({ current: { disabled: false } });

  // 훈련 IDX
  const trainingIdx = route?.params?.trainingIdx;

  // [ ref ]
  const pageRef = useRef();

  // [ state ]
  const [loading, setLoading] = useState(true); // 로딩
  const [activeTab, setActiveTab] = useState('클래스 영상'); // 기초튼튼 훈련, 챌린지
  const [trainingSummary, setTrainingSummary] = useState({
    trainingName: '',
    bannerPath: '',
    cntLike: 0,
    cntView: 0,
    coachDesc: '',
    coachName: '',
    cntVideo: 0,
    lastViewOrder: '',
    programDesc: '',
    isLike: false,
  }); // 트레이닝 상세
  const [masterVideoList, setMasterVideoList] = useState([]); // 마스터 영상 리스트
  const [displayAllProgramDesc, setDisplayAllProgramDesc] = useState(false); // 프로그램 소개글 더보기
  const [displayAllCoachDesc, setDisplayAllCoachDesc] = useState(false); // 코치 소개글 더보기

  // [ util ] 좋아요 등록/취소
  const touchLikeHandler = e => {
    e.preventDefault();

    if (!isLogin) {
      handleError(new CustomException('로그인이 필요합니다.'));
      return;
    }

    if (!trlRef.current.disabled) {
      trlRef.current.disabled = true;

      if (!trainingSummary.isLike) {
        likeTraining();
      } else {
        unlikeTraining();
      }
    }
  };

  // [ api ] 트레이닝 상세 조회
  const getTrainingDetail = async () => {
    try {
      setLoading(true);
      const { data } = await apiGetTrainingDetail(trainingIdx);

      if (data) {
        setTrainingSummary({ ...data.data });
        setDisplayAllProgramDesc(data.data.programDesc.length < MAX_DESC_TEXT);
        setDisplayAllCoachDesc(data.data.coachDesc.length < MAX_DESC_TEXT);
        if (pageRef.current) pageRef.current.scrollTo(0, 0);
      }

      setLoading(false);
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  // [ api ] 좋아요 등록
  const likeTraining = async () => {
    try {
      const { data } = await apiLikeTraining(trainingIdx);

      if (data) {
        setTrainingSummary({
          ...trainingSummary,
          cntLike: trainingSummary.cntLike + 1,
          isLike: true,
        });
        trlRef.current.disabled = false;
      }
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  // [ api ] 좋아요 취소
  const unlikeTraining = async () => {
    try {
      const { data } = await apiUnlikeTraining(trainingIdx);

      if (data) {
        setTrainingSummary({
          ...trainingSummary,
          cntLike: trainingSummary.cntLike - 1,
          isLike: false,
        });
        trlRef.current.disabled = false;
      }
    } catch (error) {
      handleError(error);
      trlRef.current.disabled = false;
    }
  };

  // [ api ] 마스터 영상 리스트 조회
  const getMasterVideoList = async () => {
    try {
      const { data } = await apiGetMasterVideoList({
        page: 1,
        size: 6,
        trainingIdx,
        // trainingIdx: 19,
      });

      if (data) {
        setMasterVideoList([...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ useEffect ] 상세
  useFocusEffect(
    useCallback(() => {
      if (trainingIdx) getTrainingDetail();
      else handleError(new AccessDeniedException('잘못된 접근입니다.'));
    }, [trainingIdx]),
  );

  // [ useFocusEffect ] 마스터 영상 리스트
  useFocusEffect(
    useCallback(() => {
      if (trainingIdx) getMasterVideoList();
    }, [trainingIdx]),
  );

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      <Header title="기초튼튼 훈련" />

      {loading ? (
        <SPLoading />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={
              trainingSummary.bannerPath
                ? { uri: trainingSummary.bannerPath }
                : SPImages.academyMainImage
            }
            style={[
              styles.image,
              styles.subBackgroundImage,
              { height: imageHeight },
            ]}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)']}
              style={styles.gradient}
            />
          </ImageBackground>
          {/* 소개글 */}
          <View style={styles.DetailSection}>
            <Text style={styles.DetailTitle}>
              {trainingSummary.trainingName}
            </Text>
            <Text style={styles.DetailViews}>
              조회수 {Utils.changeNumberComma(trainingSummary.cntView)}
            </Text>
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              style={styles.DetailLike}
              onPress={touchLikeHandler}>
              <View>
                <Image
                  source={
                    trainingSummary.isLike
                      ? SPIcons.icOrangeHeart
                      : SPIcons.icGrayHeart
                  }
                />
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={styles.DetailLikeNumber}>
                  {Utils.changeNumberComma(trainingSummary.cntLike)}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.introductionBox}>
              <Text style={styles.introductionName}>
                {trainingSummary.coachName}
              </Text>
              <Text style={styles.introductionText}>
                {trainingSummary.coachDesc.length < MAX_DESC_TEXT ||
                displayAllCoachDesc
                  ? trainingSummary.coachDesc
                  : `${trainingSummary.coachDesc.substring(
                      0,
                      MAX_DESC_TEXT,
                    )}...`}{' '}
              </Text>
              {!displayAllCoachDesc && (
                <TouchableOpacity
                  onPress={() => setDisplayAllCoachDesc(true)}
                  activeOpacity={ACTIVE_OPACITY}>
                  <Text style={styles.introductionMore}>더보기</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.introductionSubBox}>
              <Text style={styles.introductionText}>
                {trainingSummary.programDesc.length < MAX_DESC_TEXT ||
                displayAllProgramDesc
                  ? trainingSummary.programDesc
                  : `${trainingSummary.programDesc.substring(
                      0,
                      MAX_DESC_TEXT,
                    )}...`}
              </Text>
              {!displayAllProgramDesc && (
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  onPress={() => setDisplayAllProgramDesc(true)}>
                  <Text style={styles.introductionMore}>더보기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 트레이닝 현황 (스탬프) */}
          <View style={styles.stampSection}>
            <View style={styles.stampInfoText}>
              <Text style={styles.infoText}>클래스 마스터 달성하면</Text>
              <Text style={styles.infoText}>스탬프 1장 콕!</Text>
            </View>

            <TrainingStatus
              numberOfPie={trainingSummary.cntVideo}
              numberPieComplete={trainingSummary.lastViewOrder}
            />
          </View>

          {/* 탭 메뉴 */}
          <View style={styles.classBox}>
            <View style={styles.tabButtonContainer}>
              <View style={styles.tabButtonBox}>
                <TabButton
                  title="클래스 영상"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <TabButton
                  title="마스터 영상"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </View>
            </View>
            <View>
              {activeTab === '마스터 영상' ? (
                <MasterVideoTab
                  title="마스터 영상"
                  videoList={masterVideoList}
                />
              ) : (
                <ClassVideoTab trainingIdx={trainingIdx} />
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default memo(TrainingDetail);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  DetailSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  DetailTitle: {
    ...fontStyles.fontSize18_Semibold,
    marginBottom: 8,
  },
  DetailViews: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    marginBottom: 16,
  },
  DetailLike: {
    flexDirection: 'row',
    alignItem: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  DetailLikeNumber: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  introductionBox: {
    gap: 8,
    backgroundColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  introductionName: {
    ...fontStyles.fontSize18_Semibold,
  },
  introductionText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
  },
  introductionMore: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelAlternative,
  },
  introductionSubBox: {
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.16)',
  },
  stampSection: {
    paddingVertical: 24,
  },
  stampInfoText: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    ...fontStyles.fontSize20_Medium,
    lineHeight: 28,
  },
  stampContainer: {
    backgroundColor: '#313779',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 24,
  },
  stampTitleBox: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  stampTitle: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.white,
  },
  stampSubTitle: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.white,
  },
  betweenText: {
    color: COLORS.orange,
  },
  stampBox: {
    flexDirection: 'column',
    gap: 16,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
  },
  stampRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  stampImage: {
    width: 40,
    height: 40,
  },
  stamp: {
    width: 40,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 50,
  },
  stampNumber: {
    color: 'rgba(46, 49, 53, 0.60)',
  },
  tabButtonContainer: {
    borderBottomWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabButtonBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItem: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#FB8225',
  },
  activeTabText: {
    color: '#FF671F',
  },
  classDetailTop: {
    flexDirection: 'row',
    alignItem: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  classDetailTopText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  classDetailTopNumber: {
    fontSize: 12,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  classDetailBox: {
    flexDirection: 'column',
    gap: 16,
  },
  classBackgroundBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  usersBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    borderRadius: 4,
    padding: 2,
    margin: 16,
  },
  subText: {
    fontSize: 11,
    fontWeight: 400,
    color: '#FFF',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  subDetailContainer: {
    padding: 16,
  },
  subDetailTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    marginBottom: 8,
  },
  subDetailText: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  subDetailButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItem: 'center',
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 8,
  },
  subDetailButtonText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  clearStamp: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
    paddingBottom: 8,
  },
};
