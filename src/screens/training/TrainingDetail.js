import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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
import { trainingListAction } from '../../redux/reducers/list/trainingListSlice';
import { trainingDetailAction } from '../../redux/reducers/list/trainingDetailSlice';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

// 상수값
const MAX_DESC_TEXT = 70;

// 탭 컴포넌트 (클래스 영상, 마스터 영상)
function TabButton({ title, activeTab, setActiveTab }) {
  return (
    <Pressable
      hitSlop={{
        top: 20,
        bottom: 14,
      }}
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
    </Pressable>
  );
}

// 트레이닝 상세 메인
function TrainingDetail({ route }) {
  const dispatch = useDispatch();
  const listName = 'trainingDetail';
  const { masterVideoList, trainingDetail, refreshing, loading } = useSelector(
    selector => selector[listName],
  );
  const noParamReset = route?.params?.noParamReset;
  const action = trainingDetailAction;
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
  const [activeTab, setActiveTab] = useState('클래스 영상'); // 기초튼튼 훈련, 챌린지
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

      if (!trainingDetail.isLike) {
        likeTraining();
      } else {
        unlikeTraining();
      }
    }
  };

  // [ api ] 트레이닝 상세 조회
  const getTrainingDetail = async () => {
    try {
      const { data } = await apiGetTrainingDetail(trainingIdx);

      if (data) {
        dispatch(action.setTrainingDetail(data.data));
        setDisplayAllProgramDesc(data.data.programDesc.length < MAX_DESC_TEXT);
        setDisplayAllCoachDesc(data.data.coachDesc.length < MAX_DESC_TEXT);
        if (pageRef.current) pageRef.current.scrollTo(0, 0);
        dispatch(
          trainingListAction.modifyItem({
            idxName: 'trainingIdx',
            idx: trainingIdx,
            item: data.data,
          }),
        );
      }
    } catch (error) {
      handleError(error);
    }
    dispatch(action.setLoading(false));
  };

  // [ api ] 좋아요 등록
  const likeTraining = async () => {
    try {
      const { data } = await apiLikeTraining(trainingIdx);

      if (data) {
        dispatch(
          action.setTrainingDetail({
            ...trainingDetail,
            cntLike: trainingDetail.cntLike + 1,
            isLike: true,
          }),
        );
        trlRef.current.disabled = false;
        trainingDetail.cntLike += 1;
        dispatch(
          trainingListAction.modifyItem({
            idxName: 'trainingIdx',
            idx: trainingIdx,
            item: trainingDetail,
          }),
        );
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
        dispatch(
          action.setTrainingDetail({
            ...trainingDetail,
            cntLike: trainingDetail.cntLike - 1,
            isLike: false,
          }),
        );
        trlRef.current.disabled = false;
        trainingDetail.cntLike -= 1;
        dispatch(
          trainingListAction.modifyItem({
            idxName: 'trainingIdx',
            idx: trainingIdx,
            item: trainingDetail,
          }),
        );
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
        dispatch(action.setMasterVideoList(data.data.list));
      }
    } catch (error) {
      handleError(error);
    }
  };

  // [ useEffect ] 상세
  const onFocus = async () => {
    try {
      if (!noParamReset) {
        setActiveTab('클래스 영상');
        dispatch(action.reset());
        NavigationService.replace(navName.trainingDetail, {
          ...(route?.params || {}),
          noParamReset: true,
        });
        return;
      }
      await getTrainingDetail();
      await getMasterVideoList();
    } catch (error) {
      handleError(error);
    }
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
  };

  useEffect(() => {
    if (trainingIdx) {
      onFocus();
    } else handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }, [trainingIdx, noParamReset]);

  useEffect(() => {
    const pageRefresh = async () => {
      await getTrainingDetail();
      await getMasterVideoList();
      dispatch(action.setRefreshing(false));
      dispatch(action.setLoading(false));
    };
    if (refreshing) {
      pageRefresh();
    }
  }, [refreshing]);

  // [ return ]
  return (
    <SafeAreaView style={styles.container}>
      <Header title="기초튼튼 훈련" />

      {loading ? (
        <SPLoading />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                dispatch(action.refresh());
              }}
            />
          }>
          <ImageBackground
            source={
              trainingDetail.bannerPath
                ? { uri: trainingDetail.bannerPath }
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
              {trainingDetail.trainingName}
            </Text>
            <Text style={styles.DetailViews}>
              조회수 {Utils.changeNumberComma(trainingDetail.cntView)}
            </Text>
            <Pressable
              hitSlop={{
                top: 10,
                bottom: 10,
              }}
              activeOpacity={ACTIVE_OPACITY}
              style={styles.DetailLike}
              onPress={touchLikeHandler}>
              <View>
                <Image
                  source={
                    trainingDetail.isLike
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
                  {Utils.changeNumberComma(trainingDetail.cntLike)}
                </Text>
              </View>
            </Pressable>
            <View style={styles.introductionBox}>
              <Text style={styles.introductionName}>
                {trainingDetail.coachName}
              </Text>
              <Text style={styles.introductionText}>
                {trainingDetail.coachDesc.length < MAX_DESC_TEXT ||
                displayAllCoachDesc
                  ? trainingDetail.coachDesc
                  : `${trainingDetail.coachDesc.substring(
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
                {trainingDetail.programDesc.length < MAX_DESC_TEXT ||
                displayAllProgramDesc
                  ? trainingDetail.programDesc
                  : `${trainingDetail.programDesc.substring(
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
              numberOfPie={trainingDetail.cntVideo}
              numberPieComplete={trainingDetail.lastViewOrder}
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
                <ClassVideoTab
                  trainingIdx={trainingIdx}
                  setLoading={value => {
                    dispatch(action.setLoading(value));
                  }}
                />
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
    marginTop: 32,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    // paddingVertical: 8,
    padddingTop: 20,
    paddingBottom: 14,
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
    color: '#FF7C10',
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
    backgroundColor: '#FF7C10',
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
