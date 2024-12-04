import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import 'moment/locale/ko';
import { useFocusEffect } from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import NaverMapView, { Marker } from 'react-native-nmap/index';
import LinearGradient from 'react-native-linear-gradient';
import {
  apiApplyTournament,
  apiGetMyInfo,
  apiGetTournamentOpen,
  apiGetTournamentOptionList,
} from '../../api/RestAPI';
import NavigationService from '../../navigation/NavigationService';
import { SPSvgs } from '../../assets/svg';
import SPIcons from '../../assets/icon';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { navName } from '../../common/constants/navName';
import { TOURNAMENT_STATE } from '../../common/constants/tournamentState';
import Header from '../../components/header';
import Divider from '../../components/Divider';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import SPLoading from '../../components/SPLoading';
import Utils from '../../utils/Utils';
import { handleError } from '../../utils/HandleError';
import { TOURNAMENT_STATE_TYPE } from '../../common/constants/TournamentStateType';
import { tournamentOngoingListAction } from '../../redux/reducers/list/tournamentOngoingListSlice';
import { tournamentInProgressListAction } from '../../redux/reducers/list/tournamentInProgressListSlice';
import { tournamentFinishedListAction } from '../../redux/reducers/list/tournamentFinishedListSlice';
import ImageSizeGetter from '../../components/ImageSizeGetter';
import { WebView } from 'react-native-webview';
import { ENTRY_FEE_TYPE } from '../../common/constants/entryFeeType';
import { DefaultToast } from '../../components/SPToast';
import moment from 'moment';
import { PARTICIPATION_STATE } from '../../common/constants/ParticipationState';
import Swiper from 'react-native-swiper';
import { academyMatchingRegistrationListAction } from '../../redux/reducers/list/academyMatchingRegistrationListSlice';
import PaymentModal from '../../components/PaymentModal';
import { useAppState } from '../../utils/AppStateContext';

function TournamentDetail({ route }) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const trlRef = useRef({ current: { disabled: false } });
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const {
    tournamentApplyModalShow,
    setTournamentApplyModalShow,
    tournamentApplyModalReset,
  } = useAppState();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const tournamentIdx = route?.params?.tournamentIdx;
  const fromHistory = route?.params?.fromHistory;
  const [tournamentInfo, setTournamentInfo] = useState({});
  const [tournamentStatus, setTournamentStatus] = useState();
  const [contentList, setContentList] = useState([]);
  const [fileAttach, setFileAttach] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [noticeList, setNoticeList] = useState([]);
  const [qnaList, setQnaList] = useState([]);
  const [reviewCnt, setReviewCnt] = useState(0);
  const [reviewList, setReviewList] = useState([]);
  const [targetList, setTargetList] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  const [imageHeight, setImageHeight] = useState({});
  const modalRef = useRef(null);

  const isTrnStatusUpcoming =
    tournamentStatus === TOURNAMENT_STATE_TYPE.APPLY_WAIT.code;
  const isTrnStatusRegistering =
    tournamentStatus === TOURNAMENT_STATE_TYPE.APPLY_OPEN.code;
  const isTrnStatusClosed =
    tournamentStatus === TOURNAMENT_STATE_TYPE.APPLY_CLOSED.code;
  const isTrnStatusOngoing =
    tournamentStatus === TOURNAMENT_STATE_TYPE.ONGOING.code;
  const isTrnStatusEnded =
    tournamentStatus === TOURNAMENT_STATE_TYPE.FINISHED.code;
  const isTrnStatusCancel =
    tournamentStatus === TOURNAMENT_STATE_TYPE.CANCELED.code;

  const needRegisterInfo =
    isTrnStatusUpcoming || isTrnStatusRegistering || isTrnStatusClosed;

  const [showTableImgModal, setShowTableImgModal] = useState(false);
  const [openImageIndex, setOpenImageIndex] = useState();
  const [currentImageIndex, setCurrentImageIndex] = useState();
  const [isShowSketch, setIsShowSketch] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const [applyTargetList, setApplyTargetList] = useState([]);
  const [applyOptionList, setApplyOptionList] = useState([]);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getTournamentDetail = async () => {
    try {
      const params = {
        userIdx,
        tournamentIdx,
      };
      const { data } = await apiGetTournamentOpen(params);
      setTournamentInfo(data.data?.tournament);
      setContentList(data.data?.contentList || []);
      setFileAttach(data.data?.fileAttach || []);
      setImageList(data.data?.imageList || []);
      setNoticeList(data.data?.noticeList || []);
      setQnaList(data.data?.qnaList || []);
      setReviewCnt(data.data?.reviewCnt);
      setReviewList(data.data?.reviewList || []);
      setTargetList(data.data?.targetList || []);
      setTournamentStatus(data.data?.tournament?.trnState);

      dispatch(
        tournamentOngoingListAction.modifyItem({
          idxName: 'tournamentIdx',
          idx: tournamentIdx,
          item: data.data.tournament,
        }),
      );
      dispatch(
        tournamentInProgressListAction.modifyItem({
          idxName: 'tournamentIdx',
          idx: tournamentIdx,
          item: data.data.tournament,
        }),
      );
      dispatch(
        tournamentFinishedListAction.modifyItem({
          idxName: 'tournamentIdx',
          idx: tournamentIdx,
          item: data.data.tournament,
        }),
      );
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const applyTournamentDetail = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const param = {
        trnIdx: tournamentIdx,
      };

      const { data } = await apiApplyTournament(param);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const getTargetAndOptionList = async () => {
    try {
      const { data } = await apiGetTournamentOptionList(tournamentIdx);
      setApplyTargetList(data.data.targetList);
      setApplyOptionList(data.data.optionList);
    } catch (error) {
      handleError(error);
    }
  };

  const getMyInfo = async () => {
    if (!isLogin) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data } = await apiGetMyInfo();
      if (data.data.academyAdmin || data.data.academyCreator) {
        setIsAdmin(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------

  const imageFileDownLoad = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      let fileUrl;
      let fileName;
      if (isShowSketch) {
        const content = contentList[currentImageIndex];
        if (content) {
          fileUrl = content.filePath;
          fileName = content.fileName;
        }
      } else {
        const chart = targetList?.filter(item => !!item.chartPath)?.[
          currentImageIndex
        ];
        if (chart) {
          fileUrl = chart.chartPath;
          fileName = chart.chartName;
        }
      }
      if (fileUrl && fileName) {
        await Utils.imageFileDownLoad(fileUrl, fileName);
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const fileDownload = async (fileUrl, fileName) => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      if (fileUrl && fileName) {
        await Utils.fileDownLoad(fileUrl, fileName);
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const handleLayout = ({ width, height }, fileIdx) => {
    setImageHeight(prev => {
      return { ...prev, [fileIdx]: height };
    });
  };

  const openTableImgModal = () => {
    const statusBarColor = COLORS.black;
    const statusBarStyle = 'light-content';
    StatusBar.setBarStyle(statusBarStyle);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(statusBarColor);
    }
    setShowTableImgModal(true);
  };

  const openTargetTableImgModal = (index, sketch) => {
    setOpenImageIndex(index);
    setCurrentImageIndex(index);
    setIsShowSketch(sketch);
    openTableImgModal();
  };
  const closeTableImgModal = () => {
    const statusBarColor = COLORS.white;
    const statusBarStyle = 'dark-content';
    StatusBar.setBarStyle(statusBarStyle);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(statusBarColor);
    }
    setShowTableImgModal(false);
  };

  const onFocus = async () => {
    try {
      await getMyInfo();
      await getTournamentDetail();
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, [refresh]),
  );

  useEffect(() => {
    if (isAdmin && isTrnStatusRegistering) {
      getTargetAndOptionList();
    }
  }, [isAdmin, isTrnStatusRegistering]);

  useEffect(() => {
    if (tournamentApplyModalShow) {
      setTimeout(() => {
        modalRef.current?.show();
        setTournamentApplyModalShow(false);
      }, 0);
    }
  }, [tournamentApplyModalShow]);

  // --------------------------------------------------
  // [ render ]
  // --------------------------------------------------

  const renderHeader = useMemo(() => {
    return (
      <Header
        title={
          tournamentInfo?.trnCount &&
          tournamentInfo?.trnName &&
          `제${Utils.changeNumberComma(tournamentInfo.trnCount)}회 ${
            tournamentInfo.trnName
          }`
        }
        rightContent={
          <Pressable
            style={{ padding: 10 }}
            onPress={() => {
              setShowShareModal(true);
            }}>
            <SPSvgs.EllipsesVertical />
          </Pressable>
        }
      />
    );
  }, [tournamentInfo]);

  const renderTournamentStatusText = () => {
    switch (tournamentStatus) {
      case TOURNAMENT_STATE_TYPE.APPLY_WAIT.code:
        return (
          <Text style={[styles.statusText, { color: COLORS.darkBlue }]}>
            {TOURNAMENT_STATE_TYPE.APPLY_WAIT.desc}
          </Text>
        );
      case TOURNAMENT_STATE_TYPE.APPLY_OPEN.code:
        return (
          <Text style={[styles.statusText, { color: COLORS.orange }]}>
            {TOURNAMENT_STATE_TYPE.APPLY_OPEN.desc}
          </Text>
        );
      case TOURNAMENT_STATE_TYPE.APPLY_CLOSED.code:
        return (
          <Text style={[styles.statusText, { color: COLORS.textDefault }]}>
            {TOURNAMENT_STATE_TYPE.APPLY_CLOSED.desc}
          </Text>
        );
      case TOURNAMENT_STATE_TYPE.ONGOING.code:
        return (
          <Text style={[styles.statusText, { color: COLORS.primaryStrong }]}>
            {TOURNAMENT_STATE_TYPE.ONGOING.desc}
          </Text>
        );
      case TOURNAMENT_STATE_TYPE.FINISHED.code:
        return (
          <Text style={[styles.statusText, { color: COLORS.labelAlternative }]}>
            {TOURNAMENT_STATE_TYPE.FINISHED.desc}
          </Text>
        );
      case TOURNAMENT_STATE_TYPE.CANCELED.code:
        return (
          <Text style={[styles.statusText, { color: COLORS.darkRed }]}>
            {TOURNAMENT_STATE_TYPE.CANCELED.desc}
          </Text>
        );
      default:
        break;
    }
  };
  const renderTournamentRegisterDate = () => (
    <Text
      style={
        styles.registerDateText
      }>{`${Utils.convertMillisecondsToFormattedDateNoTime(
      tournamentInfo.openDate,
    )} - ${Utils.convertMillisecondsToFormattedDateNoTime(
      tournamentInfo.closeDate,
    )}`}</Text>
  );
  const tempPressFn = () => Alert.alert('', 'tempFn');

  const renderCompetitionInfo = useMemo(() => {
    return (
      <View>
        {imageList?.map((image, index) => {
          return (
            <WebView
              key={image.fileIdx}
              style={{ height: imageHeight[image.fileIdx] }}
              source={{
                html: Utils.getImageHtml(image.fileUrl),
              }}
              // onLoadStart={() => setLoading(true)}
              // onLoadEnd={() => setLoading(false)}
            />
          );
        })}
        <Text
          style={[
            styles.trnNmText,
            {
              paddingHorizontal: 16,
              paddingVertical: 24,
            },
          ]}>
          {tournamentInfo?.trnCount && tournamentInfo?.trnName
            ? `제${Utils.changeNumberComma(tournamentInfo.trnCount)}회 ${
                tournamentInfo.trnName
              }`
            : '-'}
        </Text>
        <View style={styles.statusWrapper}>
          {renderTournamentStatusText()}
          {needRegisterInfo && renderTournamentRegisterDate()}
        </View>

        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>대회정보</Text>
          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>대회일</Text>
            <Text style={styles.valueText}>
              {`${Utils.convertMillisecondsToFormattedDateNoTime(
                tournamentInfo.startDate,
              )} - ${Utils.convertMillisecondsToFormattedDateNoTime(
                tournamentInfo.endDate,
              )}`}
            </Text>
          </View>
          <View style={{ rowGap: 8 }}>
            <View style={styles.labeledValue}>
              <Text style={styles.labelText}>장소</Text>
              <Text style={styles.valueText}>
                {tournamentInfo.trnPlace ?? '-'}
              </Text>
            </View>
            <View style={[styles.addrWrapper]}>
              <View
                style={{
                  height: windowWidth > 360 ? windowWidth * 0.45 : 164,
                }}>
                {tournamentInfo?.latitude && tournamentInfo?.longitude && (
                  <NaverMapView
                    // style={{ aspectRatio: 2 / 1 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      overflow: 'hidden',
                    }}
                    center={{
                      latitude: tournamentInfo?.latitude,
                      longitude: tournamentInfo?.longitude,
                      zoom: 15,
                    }}
                    showsMyLocationButton={false}
                    zoomControl={false}
                    scaleBar={false}
                    useTextureView>
                    <Marker
                      coordinate={{
                        latitude: tournamentInfo?.latitude,
                        longitude: tournamentInfo?.longitude,
                      }}
                    />
                  </NaverMapView>
                )}
              </View>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 16,
                }}
                onPress={() => {
                  if (tournamentInfo.trnAddress) {
                    Utils.copyToClipboard(tournamentInfo.trnAddress);
                  }
                }}>
                <Text style={[styles.valueText, { padding: 16 }]}>
                  {tournamentInfo.trnAddress}
                </Text>
                <SPSvgs.Copy width={18} height={18} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>참가유형</Text>
            <Text style={styles.valueText}>
              {tournamentInfo?.listTagKo?.join(', ') || '-'}
            </Text>
          </View>
          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>시상</Text>
            <Text style={styles.valueText}>{tournamentInfo.award ?? '-'}</Text>
          </View>
          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>내용</Text>
            <Text style={styles.valueText}>
              {tournamentInfo.description ?? '-'}
            </Text>
          </View>
          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>상세 요강</Text>
            <View style={{ flex: 1, gap: 8 }}>
              {fileAttach?.map((item, index) => {
                return (
                  <Pressable
                    key={item.fileIdx}
                    onPress={() => {
                      fileDownload(item.fileUrl, item.fileName);
                    }}
                    style={[styles.rowSpaceBetweenWrapper]}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          columnGap: 8,
                          flex: 1,
                          alignItems: 'center',
                        }}>
                        <SPSvgs.Document />
                        <View style={{ flex: 1 }}>
                          <Text
                            numberOfLines={1}
                            style={[
                              {
                                ...fontStyles.fontSize14_Regular,
                                color: COLORS.labelNeutral,
                                letterSpacing: 0.203,
                              },
                            ]}>
                            {item.fileName}
                          </Text>
                        </View>
                      </View>
                      <SPSvgs.DownloadFile />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  }, [tournamentInfo, tournamentStatus, imageList, imageHeight]);

  const renderRegistrationInfo = () => (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>접수안내</Text>
      <View style={styles.labeledValue}>
        <Text style={styles.labelText}>접수기간</Text>
        {renderTournamentRegisterDate()}
      </View>
      <View style={styles.labeledValue}>
        <Text style={styles.labelText}>모집 단위</Text>
        <View style={{ flex: 1, rowGap: 8 }}>
          {targetList?.map(data => (
            <Text
              key={`tournament_detail_register_team_${data.targetIdx}`}
              style={styles.valueText}>
              {`${data.targetName} - ${Utils.changeNumberComma(
                data.targetCnt,
              )}팀`}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.labeledValue}>
        <Text style={styles.labelText}>참가비</Text>
        <View style={{ flex: 1, rowGap: 8 }}>
          {targetList?.map(data => (
            <Text
              key={`tournament_detail_register_fee_${data.targetIdx}`}
              style={styles.valueText}>
              {`${data.targetName}(${
                ENTRY_FEE_TYPE[data.entryFeeType]?.feeUnit
              }) - ${Utils.changeNumberComma(data.entryFee)}원`}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.labeledValue}>
        <Text style={styles.labelText}>최소 인원수</Text>
        <Text style={styles.valueText}>
          {tournamentInfo?.minCnt
            ? `${Utils.changeNumberComma(tournamentInfo?.minCnt)}인`
            : '-'}
        </Text>
      </View>
    </View>
  );

  const renderRegisteredTeamInfo = () => (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>접수 현황</Text>
      <View
        style={{
          flexDirection: 'row',
          columnGap: 8,
        }}>
        <Text style={styles.labelText}>신청 수</Text>
        <View style={{ flex: 1, rowGap: 8 }}>
          {targetList?.map(data => (
            <View
              key={`tournament_detail_registered_team_${data.targetIdx}`}
              style={{ flexDirection: 'row' }}>
              <Text style={styles.valueText}>{data.targetName}</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  columnGap: 8,
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}>
                <View>
                  <Text style={[styles.valueText, { textAlign: 'right' }]}>
                    {`${Utils.changeNumberComma(
                      data.appliedCnt,
                    )}팀 / ${Utils.changeNumberComma(data.targetCnt)}팀`}
                  </Text>
                </View>
                <Text
                  style={styles.labelText13}>{`대기 ${Utils.changeNumberComma(
                  data.waitCnt,
                )}팀`}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderTournamentTable = () => (
    <>
      <View style={styles.sectionWrapper}>
        <Text style={styles.sectionTitle}>대진표</Text>
        <View style={styles.rowGap4}>
          {targetList?.filter(item => !!item.chartPath)?.length > 0 ? (
            targetList
              ?.filter(item => !!item.chartPath)
              ?.map((tbData, index) => (
                <Pressable
                  key={`tournament_detail_trn_tb_${tbData.targetIdx}`}
                  onPress={() => openTargetTableImgModal(index)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.valueText}>{tbData.targetName}</Text>
                    <Image
                      source={{ uri: tbData?.chartPath }}
                      style={{
                        width: 44,
                        height: 44,
                        resizeMode: 'stretch',
                      }}
                    />
                  </View>
                </Pressable>
              ))
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}>
              <Text style={[styles.notAvailableText, { paddingVertical: 16 }]}>
                현재 등록된 대진표가 없습니다.
              </Text>
            </View>
          )}
        </View>
      </View>
      <Modal
        animationType="fade"
        visible={showTableImgModal}
        onRequestClose={closeTableImgModal}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: COLORS.black,
            paddingTop: insets.top,
          }}>
          <DefaultToast />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 60,
              paddingHorizontal: 4,
            }}>
            <Pressable onPress={closeTableImgModal} style={{ padding: 10 }}>
              <Image
                source={SPIcons.icArrowLeftWhite}
                style={styles.square28}
              />
            </Pressable>
            <Text style={[styles.trnNmText, { flex: 1, color: COLORS.white }]}>
              {isShowSketch ? '대회 스케치' : '대진표'}
            </Text>
            <Pressable
              onPress={() => {
                imageFileDownLoad();
              }}
              style={{ padding: 10 }}>
              <SPSvgs.Download width={28} height={28} fill={COLORS.white} />
            </Pressable>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Swiper
              loop={false}
              index={openImageIndex}
              showsPagination={false}
              onIndexChanged={index => {
                setCurrentImageIndex(index);
              }}>
              {isShowSketch
                ? contentList?.map((imageItem, index) => (
                    <View key={imageItem.contentsIdx} style={{ flex: 1 }}>
                      <Image
                        source={{ uri: imageItem.filePath }}
                        style={{
                          width: '100%',
                          height: '100%',
                          resizeMode: 'contain',
                        }}
                      />
                    </View>
                  ))
                : targetList
                    ?.filter(item => !!item.chartPath)
                    ?.map((tbData, index) => (
                      <View key={tbData.targetIdx} style={{ flex: 1 }}>
                        <Image
                          source={{ uri: tbData.chartPath }}
                          style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'contain',
                          }}
                        />
                      </View>
                    ))}
            </Swiper>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );

  const renderTournamentSketchPreview = () => {
    const imgHeight = (Dimensions.get('window').width - 32 - 8) / 3;
    return (
      <View style={styles.sectionWrapper}>
        <Pressable
          onPress={() =>
            NavigationService.navigate(navName.tournamentSketch, {
              tournamentIdx,
            })
          }
          style={styles.rowSpaceBetweenWrapper}>
          <Text style={styles.sectionTitle}>대회 스케치</Text>
          <Image source={SPIcons.icArrowRightNoraml} style={styles.square28} />
        </Pressable>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {contentList?.length > 0 ? (
            contentList?.map((data, index) => (
              <Pressable
                key={`tournament_detail_sketch_img_${data.contentsIdx}`}
                onPress={() => openTargetTableImgModal(index, true)}>
                <Image
                  source={{ uri: data.filePath }}
                  style={{ aspectRatio: 1, height: imgHeight }}
                />
              </Pressable>
            ))
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}>
              <Text style={[styles.notAvailableText, { paddingVertical: 16 }]}>
                현재 등록된 스케치가 없습니다.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTournamentNotice = () => (
    <View style={styles.sectionWrapper}>
      <Pressable
        onPress={() => {
          NavigationService.navigate(navName.tournamentNoticeList, {
            tournamentIdx,
          });
        }}
        style={styles.rowSpaceBetweenWrapper}>
        <Text style={styles.sectionTitle}>공지 사항</Text>
        <Image source={SPIcons.icArrowRightNoraml} style={styles.square28} />
      </Pressable>
      {noticeList?.length > 0 ? (
        <View style={styles.rowGap4}>
          {noticeList.map(noticeData => (
            <Pressable
              key={`tournament_detail_trn_notice_${noticeData.noticeIdx}`}
              onPress={() => {
                NavigationService.navigate(navName.tournamentNoticeDetail, {
                  noticeIdx: noticeData.noticeIdx,
                  tournamentIdx,
                });
              }}
              style={{
                flexDirection: 'row',
                columnGap: 8,
                paddingVertical: 12,
              }}>
              <Text
                style={styles.valueText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {noticeData.title}
              </Text>
              <Text
                style={[styles.labelText, { width: 80, textAlign: 'right' }]}>
                {noticeData.regDate
                  ? moment(noticeData.regDate).format('YYYY.MM.DD')
                  : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={[styles.notAvailableText, { paddingVertical: 16 }]}>
          현재 등록된 공지 사항이 없습니다.
        </Text>
      )}
    </View>
  );

  const renderTournamentInquiry = () => (
    <View style={styles.sectionWrapper}>
      <Pressable
        onPress={() => {
          NavigationService.navigate(navName.tournamentInquiryList, {
            tournamentIdx,
          });
        }}
        style={styles.rowSpaceBetweenWrapper}>
        <Text style={styles.sectionTitle}>1:1 문의</Text>
        <Image source={SPIcons.icArrowRightNoraml} style={styles.square28} />
      </Pressable>
      {isLogin && qnaList?.length > 0 ? (
        <View style={styles.rowGap4}>
          {qnaList.map(inquiryData => (
            <Pressable
              key={`tournament_detail_trn_inquiry_${inquiryData.qnaIdx}`}
              onPress={() => {
                NavigationService.navigate(navName.tournamentInquiryDetail, {
                  tournamentIdx,
                  qnaIdx: inquiryData.qnaIdx,
                });
              }}
              style={{
                flexDirection: 'row',
                columnGap: 8,
                paddingVertical: 12,
              }}>
              <Text
                style={[
                  styles.inquiryAnswerBadge,
                  styles[
                    inquiryData.qnaState === 'COMPLETE'
                      ? 'inquiryAnswerComplete'
                      : 'inquiryAnswerPending'
                  ],
                ]}>
                {inquiryData.qnaState === 'COMPLETE' ? '답변완료' : '답변대기'}
              </Text>
              <Text
                style={styles.valueText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {inquiryData.title}
              </Text>
              <Text style={[styles.labelText, { width: 80 }]}>
                {inquiryData.regDate &&
                  moment(inquiryData.regDate).format('YYYY.MM.DD')}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: 'center', rowGap: 8, paddingVertical: 16 }}>
          <Text style={styles.notAvailableText}>
            {isLogin
              ? `등록된 문의가 없습니다.\n대회에 관해 궁금한 점이 있으면 \n언제든지 문의를 남겨주세요.`
              : '로그인 후 이용하실 수 있습니다.'}
          </Text>
          <TouchableOpacity
            style={styles.inquiryBtn}
            onPress={() =>
              isLogin
                ? NavigationService.navigate(navName.tournamentInquiryEdit, {
                    tournamentIdx,
                  })
                : NavigationService.navigate(navName.login, { goBack: true })
            }>
            <Text style={styles.inquiryBtnText}>
              {isLogin ? '문의하기' : '로그인하기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTournamentReview = () => {
    return (
      <View style={styles.sectionWrapper}>
        <Pressable
          onPress={() => {
            NavigationService.navigate(navName.tournamentReviewList, {
              tournamentIdx,
            });
          }}
          style={styles.rowSpaceBetweenWrapper}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: 4,
            }}>
            <Image
              source={SPIcons.icFillStar}
              style={{ width: 24, height: 24 }}
            />
            <Text style={styles.reviewAveragePoint}>
              {tournamentInfo?.avgRating
                ? Number(tournamentInfo?.avgRating).toFixed(1)
                : '0.0'}
            </Text>
            <View style={styles.miniDot} />
            <Text style={styles.reviewCntText}>{`리뷰 ${reviewCnt}개`}</Text>
          </View>
          <Image source={SPIcons.icArrowRightNoraml} style={styles.square28} />
        </Pressable>
        {reviewList?.length > 0 ? (
          <View>
            {reviewList?.map(reviewData => {
              const reviewStarArr = Array(5)
                .fill()
                .map((_, i) => (i < Number(reviewData.rating) ? 1 : 0));
              return (
                <View
                  key={`tournament_detail_trn_review_${reviewData.reviewIdx}`}
                  style={styles.reviewItemWrapper}>
                  <View style={styles.reviewItemInfoWrapper}>
                    {reviewData.logoPath ? (
                      <Image
                        source={{ uri: reviewData.logoPath }}
                        style={styles.reviewItemProfileImg}
                      />
                    ) : (
                      <Image
                        source={SPIcons.icDefaultAcademy}
                        style={styles.reviewItemProfileImg}
                      />
                    )}
                    <View style={{ rowGap: 2, flexShrink: 1 }}>
                      <Text style={styles.reviewItemName}>
                        {reviewData.academyName}
                      </Text>
                      <Text
                        style={
                          styles.reviewItemName
                        }>{`제 ${Utils.changeNumberComma(
                        reviewData.trnCnt,
                      )}회 참가`}</Text>
                      <View style={{ flexDirection: 'row', columnGap: 8 }}>
                        <Text style={styles.reviewItemDate}>
                          {reviewData.regDate &&
                            moment(reviewData.regDate).format('YYYY.MM.DD')}
                        </Text>
                        <View style={{ flexDirection: 'row', columnGap: 4 }}>
                          {reviewStarArr.map((star, starIdx) => (
                            <Image
                              // eslint-disable-next-line react/no-array-index-key
                              key={`trn_review_star_${reviewData.reviewIdx}_${starIdx}`}
                              source={
                                SPIcons[star ? 'icFillStar' : 'icOutlineStar']
                              }
                              style={{ width: 14, height: 14 }}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewItemContent}>
                    {reviewData.review}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.notAvailableText, { paddingVertical: 16 }]}>
            등록된 리뷰가 없습니다.
          </Text>
        )}
      </View>
    );
  };

  const needBottomButton =
    isTrnStatusEnded || (isAdmin && isTrnStatusRegistering);

  const renderSectionDivider = () => (
    <Divider lineHeight={8} lineColor={COLORS.indigo90} />
  );

  const handleApplyTournament = target => {
    setSelectedTarget(target);
    setTimeout(() => {
      modalRef.current?.show();
    }, 0);
  };

  const handlePaymentConfirm = param => {
    modalRef.current?.hide();
    setTimeout(() => {
      NavigationService.navigate(navName.tournamentApplyPlayerSelect, {
        ...param,
        tournamentInfo,
        updDate: tournamentInfo?.updDate,
      });
    }, 0);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {renderHeader}
      {!loading ? (
        <View style={{ flex: 1 }}>
          {imageList?.map((image, index) => {
            return (
              <ImageSizeGetter
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                source={image.fileUrl}
                getter={value => {
                  handleLayout(value, image.fileIdx);
                }}
              />
            );
          })}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: needBottomButton ? 100 : 0,
            }}>
            {renderCompetitionInfo}
            {renderSectionDivider()}
            {!isTrnStatusCancel
              ? needRegisterInfo
                ? renderRegistrationInfo()
                : renderTournamentTable()
              : null}
            {isTrnStatusClosed && (
              <>
                {renderSectionDivider()}
                {renderTournamentTable()}
              </>
            )}
            {!isTrnStatusCancel && renderSectionDivider()}
            {isTrnStatusRegistering && (
              <>
                {renderRegisteredTeamInfo()}
                {renderSectionDivider()}
              </>
            )}
            {isTrnStatusEnded && (
              <>
                {renderTournamentSketchPreview()}
                {renderSectionDivider()}
              </>
            )}
            {renderTournamentNotice()}
            {renderSectionDivider()}
            {renderTournamentInquiry()}
            {renderSectionDivider()}
            {renderTournamentReview()}
          </ScrollView>
          {needBottomButton && (
            <LinearGradient
              colors={['rgba(255, 255, 255, 0)', '#FFFFFF']}
              locations={[0.012, 0.1577]}
              style={styles.bottomButtonLG}>
              <View style={styles.bottomButtonWrapper}>
                {isAdmin &&
                  isTrnStatusRegistering &&
                  (tournamentInfo.hasConfirmed ||
                  tournamentInfo.hasRefundRequest ||
                  tournamentInfo.applyWait ? (
                    <>
                      {tournamentInfo.applyWait && (
                        <PrimaryButton
                          text="접수 취소"
                          onPress={() => {
                            if (fromHistory) {
                              dispatch(
                                academyMatchingRegistrationListAction.setType(
                                  PARTICIPATION_STATE.WAITING.value,
                                ),
                              );
                              NavigationService.goBack();
                            } else {
                              NavigationService.navigate(
                                navName.academyMatchingRegistration,
                                {
                                  participationState:
                                    PARTICIPATION_STATE.WAITING.value,
                                },
                              );
                            }
                          }} // ? cancelApplyTournament
                          outlineButton
                          buttonStyle={[
                            styles.bottomButton,
                            { borderColor: 'rgba(135, 141, 150, 0.32)' },
                          ]}
                          buttonTextStyle={styles.bottomButtonText}
                        />
                      )}
                      <PrimaryButton
                        text="추가 접수 신청"
                        onPress={() => handleApplyTournament(targetList[0])}
                        buttonStyle={styles.bottomButton}
                      />
                    </>
                  ) : (
                    <PrimaryButton
                      text="접수 신청"
                      onPress={() => handleApplyTournament(targetList[0])}
                      buttonStyle={styles.bottomButton}
                    />
                  ))}
                {isTrnStatusEnded && (
                  <>
                    {isAdmin &&
                      tournamentInfo.hasConfirmed &&
                      !tournamentInfo.reviewWrited && (
                        <PrimaryButton
                          text="리뷰 작성"
                          onPress={() => {
                            NavigationService.navigate(
                              navName.tournamentReviewEdit,
                              {
                                tournamentIdx,
                              },
                            );
                          }}
                          outlineButton
                          buttonStyle={[
                            styles.bottomButton,
                            { borderColor: COLORS.orange },
                          ]}
                          buttonTextStyle={[
                            styles.bottomButtonText,
                            { color: COLORS.orange },
                          ]}
                        />
                      )}
                    <PrimaryButton
                      text="대회 사진보기"
                      onPress={() =>
                        NavigationService.navigate(navName.tournamentSketch, {
                          tournamentIdx,
                          picture: true,
                        })
                      }
                      buttonStyle={styles.bottomButton}
                    />
                  </>
                )}
              </View>
            </LinearGradient>
          )}
          <PaymentModal
            key={tournamentApplyModalReset ? 'reset' : 'default'}
            ref={modalRef}
            tournamentIdx={tournamentIdx}
            minCnt={tournamentInfo?.minCnt}
            amount={selectedTarget?.entryFee}
            onConfirm={handlePaymentConfirm}
            targetList={applyTargetList}
            optionList={applyOptionList}
            isDuplicate={false}
          />
          <SPMoreModal
            visible={showShareModal}
            onClose={() => {
              setShowShareModal(false);
            }}
            type={MODAL_MORE_TYPE.RECRUIT}
            adminButtons={[MODAL_MORE_BUTTONS.SHARE]}
            memberButtons={[MODAL_MORE_BUTTONS.SHARE]}
            shareLink={`type=tournament&id=${tournamentIdx}`}
            shareTitle={tournamentInfo?.trnName ?? ''}
            shareDescription={tournamentInfo?.description ?? ''}
          />
        </View>
      ) : (
        <SPLoading />
      )}
    </SafeAreaView>
  );
}

export default memo(TournamentDetail);

const styles = StyleSheet.create({
  coverImage: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  trnNmText: {
    ...fontStyles.fontSize24_Bold,
    color: '#000',
    letterSpacing: -0.552,
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statusText: {
    ...fontStyles.fontSize14_Medium,
    letterSpacing: 0.203,
  },
  registerDateText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.203,
  },
  sectionWrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 16,
  },
  sectionTitle: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  square28: {
    width: 28,
    height: 28,
  },
  rowGap4: { rowGap: 4 },
  rowSpaceBetweenWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addrWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.fillStrong,
    overflow: 'hidden',
  },
  labeledValue: {
    flexDirection: 'row',
    columnGap: 8,
  },
  labelText: {
    width: 70,
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  labelText13: {
    ...fontStyles.fontSize13_Regular,
    letterSpacing: 0.252,
    color: COLORS.labelNeutral,
  },
  notAvailableText: {
    ...fontStyles.fontSize16_Medium,
    // color: COLORS.labelAlternative,
    color: 'rgba(46, 49, 53, 0.60)',
    letterSpacing: 0.302,
    textAlign: 'center',
  },
  valueText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.203,
    flex: 1,
  },
  inquiryAnswerBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 100,
    ...fontStyles.fontSize12_Semibold,
    letterSpacing: 0.302,
  },
  inquiryAnswerPending: {
    color: COLORS.orange,
    backgroundColor: 'rgba(255, 103, 31, 0.10)',
  },
  inquiryAnswerComplete: {
    color: COLORS.darkBlue,
    backgroundColor: 'rgba(49, 55, 121, 0.10)',
  },
  inquiryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  inquiryBtnText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.orange,
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  reviewAveragePoint: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.black,
    letterSpacing: -0.004,
  },
  miniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.fillStrong,
  },
  reviewCntText: {
    ...fontStyles.fontSize16_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.091,
  },
  reviewItemWrapper: {
    rowGap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.fillStrong,
  },
  reviewItemInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  reviewItemProfileImg: {
    width: 40,
    height: 40,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  reviewItemName: {
    ...fontStyles.fontSize13_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.252,
  },
  reviewItemOrdinal: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelNeutral,
    letterSpacing: 0.302,
  },
  reviewItemDate: {
    ...fontStyles.fontSize11_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.342,
  },
  reviewItemContent: {
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNeutral,
    letterSpacing: 0.203,
  },
  bottomButtonLG: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomButtonWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    columnGap: 8,
  },
  bottomButton: { flex: 1 },
  bottomButtonText: { letterSpacing: 0.091 },
});
