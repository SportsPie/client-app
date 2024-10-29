import React, { memo, useCallback, useMemo, useState, useRef } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { academyMatchingRegistrationListAction } from '../../redux/reducers/list/academyMatchingRegistrationListSlice';
import 'moment/locale/ko';
import { useFocusEffect } from '@react-navigation/native';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import NaverMapView, { Marker } from 'react-native-nmap/index';
import LinearGradient from 'react-native-linear-gradient';
import {
  apiApplyTournament,
  apiGetMyInfo,
  apiGetTournamentDetail,
  apiGetTournamentDetailForMember,
  apiPatchCancelTournament,
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

function TournamentDetail({ route }) {
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const trlRef = useRef({ current: { disabled: false } });
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const dispatch = useDispatch();
  const tournamentIdx = route?.params?.tournamentIdx;
  const fromHistory = route?.params?.fromHistory;
  const [member, setMember] = useState({});
  const [tournamentInfo, setTournamentInfo] = useState({
    trnNm: '리틀 k리그 전국대회',
    ableApply: true,
    admIdx: 3,
    aprvState: 'WAIT',
    award: '6개 부문U-8 / U-9 / U-10 / U-11 / U-12 / U-15',
    trnIdx: 6,
    state: TOURNAMENT_STATE.REGISTERING,
    openDate: '2024-07-30 11:00:00',
    closeDate: '2024-08-30 18:00:00',
    closeYn: 'Y',
    delDate: null,
    depositInfo: '**은행 1234565677',
    description: '조별 리그진행4팀 1개조, 팀당 1일 2경기, 각 조 1, 2위 4강진출',
    startDate: '2024-09-15 13:00:00',
    endDate: '2024-10-10 19:00:00',
    entryAge: '0',
    entryFee: '100000',
    imageNm: null,
    imageUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
    inquiry: '군산축구협회',
    isApply: null,
    isClosed: true,
    isOpened: true,
    memo: '테스트',
    posterNm: null,
    posterUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
    recruitCnt: '96',
    regDate: '2024-07-03 15:16:09',
    thumbNm: 'NISI20220412_0000972545_web_(1).jpg',
    thumbUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
    trnAddr: '전라북도 군산',
    updDate: '2024-09-07 00:19:59',
  });
  const [tournamentStatus, setTournamentStatus] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

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
        dispatch(
          academyMatchingRegistrationListAction.modifyItem({
            idxName: 'tournamentIdx',
            idx: data.data.data.trnIdx,
            item: data.data.data,
          }),
        );
        setTournamentInfo(data.data.data);
        setTournamentStatus(getTournamentState(data.data.data));
      }
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
      const detailData = await apiGetTournamentDetailForMember(tournamentIdx);
      dispatch(
        academyMatchingRegistrationListAction.modifyItem({
          idxName: 'tournamentIdx',
          idx: detailData.data.data.trnIdx,
          item: detailData.data.data,
        }),
      );

      if (data) {
        NavigationService.navigate(navName.tournamentApplyComplete, {
          tournamentIdx,
        });
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const cancelApplyTournament = async () => {
    try {
      if (tournamentInfo.isApply) {
        if (trlRef.current.disabled) return;
        trlRef.current.disabled = true;
        const params = {
          trnIdx: tournamentIdx,
        };
        const { data } = await apiPatchCancelTournament(params);
        Utils.openModal({ title: '성공', body: '대회 신청이 취소되었습니다.' });
        setRefresh(prev => !prev);
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
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
  const getTournamentState = item => {
    if (!item.isOpened && !item.isClosed && item.closeYn !== 'Y') {
      return TOURNAMENT_STATE.UPCOMING;
    }
    if ((item.isOpened && item.isClosed) || item.closeYn === 'Y') {
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
      // getTournamentDetail();
      setLoading(false);
    }, [refresh]),
  );

  const renderHeader = useMemo(() => {
    return (
      <Header
        title={tournamentInfo.trnNm}
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

  const tempTrnStatus = 'ENDED'; // 'UPCOMING' | 'REGISTERING' | 'CLOSED' | 'ONGOING' | 'ENDED'
  //  접수 예정  |    접수 중    | 접수 종료 |   대회중   | 마감(대회 종료)
  const isTrnStatusUpcoming = tempTrnStatus === 'UPCOMING';
  const isTrnStatusRegistering = tempTrnStatus === 'REGISTERING';
  const isTrnStatusClosed = tempTrnStatus === 'CLOSED';
  const isTrnStatusOngoing = tempTrnStatus === 'ONGOING';
  const isTrnStatusEnded = tempTrnStatus === 'ENDED';

  const needRegisterInfo =
    isTrnStatusUpcoming || isTrnStatusRegistering || isTrnStatusClosed;
  const renderTournamentStatusText = () => {
    switch (tempTrnStatus) {
      case 'UPCOMING':
        return (
          <Text style={[styles.statusText, { color: COLORS.darkBlue }]}>
            접수 예정
          </Text>
        );
      case 'REGISTERING':
        return (
          <Text style={[styles.statusText, { color: COLORS.orange }]}>
            접수 중
          </Text>
        );
      case 'CLOSED':
        return (
          <Text style={[styles.statusText, { color: COLORS.textDefault }]}>
            접수 종료
          </Text>
        );
      case 'ONGOING':
        return (
          <Text style={[styles.statusText, { color: COLORS.primaryStrong }]}>
            대회중
          </Text>
        );
      case 'ENDED':
        return (
          <Text style={[styles.statusText, { color: COLORS.labelAlternative }]}>
            접수 종료
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
  const tempRecruitType = '1종, 엘리트';
  const tempDocuName = '상세요강.pdf';
  const tempPressFn = () => Alert.alert('', 'tempFn');
  const renderCompetitionInfo = useMemo(() => {
    return (
      <View>
        {!!tournamentInfo.posterUrl && (
          <Image
            source={{
              uri: `${tournamentInfo.posterUrl}`,
            }}
            resizeMode="cover"
            style={styles.coverImage}
          />
        )}
        {!!tournamentInfo.imageUrl && (
          <Image
            source={{
              uri: `${tournamentInfo.imageUrl}`,
            }}
            resizeMode="cover"
            style={styles.coverImage}
          />
        )}
        <Text
          style={[
            styles.trnNmText,
            {
              paddingHorizontal: 16,
              paddingVertical: 24,
            },
          ]}>
          {tournamentInfo.trnNm ?? '-'}
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
                {tournamentInfo.trnAddr ?? '-'}
              </Text>
            </View>
            <View style={styles.addrWrapper}>
              <NaverMapView style={{ aspectRatio: 2 / 1 }} />
              <Text style={[styles.valueText, { padding: 16 }]}>
                {tournamentInfo.trnAddr}
              </Text>
            </View>
          </View>
          <View style={styles.labeledValue}>
            <Text style={styles.labelText}>참가유형</Text>
            <Text style={styles.valueText}>{tempRecruitType}</Text>
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
            <Pressable
              onPress={tempPressFn}
              style={styles.rowSpaceBetweenWrapper}>
              <View style={{ flexDirection: 'row', columnGap: 8 }}>
                <SPSvgs.Document />
                <Text style={[styles.labelText, { width: undefined }]}>
                  {tempDocuName}
                </Text>
              </View>
              <SPSvgs.DownloadFile />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }, [tournamentInfo, tournamentStatus]);

  const tempRegisterTeamData = [
    { id: 1, name: '초등부', maxCnt: 10, registeredCnt: 7, awaitCnt: 0 },
    { id: 2, name: '중등부', maxCnt: 12, registeredCnt: 6, awaitCnt: 0 },
    { id: 3, name: '성인', maxCnt: 12, registeredCnt: 12, awaitCnt: 5 },
  ];
  const tempRegisterFeeData = [
    { id: 1, name: '초등부', fee: 100000, perUnit: 'person' },
    { id: 2, name: '중등부', fee: 120000, perUnit: 'team' },
    { id: 3, name: '초등부', fee: 200000, perUnit: 'person' },
  ];
  const tempMinMemberCnt = 5;
  const renderRegistrationInfo = () => (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>접수안내</Text>
      <View style={styles.labeledValue}>
        <Text style={styles.labelText}>접수기간</Text>
        {renderTournamentRegisterDate()}
      </View>
      <View style={styles.labeledValue}>
        <Text style={styles.labelText}>모집 단위</Text>
        <View style={{ rowGap: 8 }}>
          {tempRegisterTeamData.map(data => (
            <Text
              key={`tournament_detail_register_team_${data.id}`}
              style={styles.valueText}>
              {`${data.name} - ${data.maxCnt}팀`}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.labeledValue}>
        <Text style={styles.labelText}>참가비</Text>
        <View style={{ rowGap: 8 }}>
          {tempRegisterFeeData.map(data => (
            <Text
              key={`tournament_detail_register_fee_${data.id}`}
              style={styles.valueText}>
              {`${data.name}(${
                data.perUnit === 'person' ? '1인당' : '팀당'
              }) - ${Utils.changeNumberComma(data.fee, false, false, true)}원`}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.labeledValue}>
        <Text style={styles.labelText}>최소 인원수</Text>
        <Text style={styles.valueText}>{`${tempMinMemberCnt}인`}</Text>
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
          {tempRegisterTeamData.map(data => (
            <View
              key={`tournament_detail_registered_team_${data.id}`}
              style={{ flexDirection: 'row' }}>
              <Text style={styles.valueText}>{data.name}</Text>
              <View style={{ flex: 1, flexDirection: 'row', columnGap: 8 }}>
                <Text style={[styles.valueText, { textAlign: 'right' }]}>
                  {`${data.registeredCnt}팀 / ${data.maxCnt}팀`}
                </Text>
                <Text
                  style={styles.labelText13}>{`대기 ${data.awaitCnt}팀`}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const tempTrnTableData = [
    { id: 1, name: '초등부 1학년', imgSrc: tournamentInfo.imageUrl },
    {
      id: 2,
      name: '초등부 2학년',
      imgSrc:
        'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
    },
    {
      id: 3,
      name: '초등부 3학년',
      imgSrc:
        'https://img1.yna.co.kr/etc/graphic/YH/2018/08/23/GYH2018082300340004400_P4.jpg',
    },
    {
      id: 4,
      name: '초등부 4학년',
      imgSrc:
        'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
    },
    {
      id: 5,
      name: 'U-16',
      imgSrc: tournamentInfo.imageUrl,
    },
    { id: 6, name: '성인', imgSrc: tournamentInfo.imageUrl },
  ];
  const isTrnTbLengthOver5 = tempTrnTableData.length > 5;
  const [showTableImgModal, setShowTableImgModal] = useState(false);
  const [tableImgSrc, setTableImgSrc] = useState('');
  const openTableImgModal = () => setShowTableImgModal(true);
  const openTargetTableImgModal = imgSrc => {
    setTableImgSrc(imgSrc);
    openTableImgModal();
  };
  const closeTableImgModal = () => setShowTableImgModal(false);
  const renderTournamentTable = () => (
    <>
      <View style={styles.sectionWrapper}>
        {isTrnTbLengthOver5 ? (
          <Pressable
            onPress={tempPressFn}
            style={styles.rowSpaceBetweenWrapper}>
            <Text style={styles.sectionTitle}>대진표</Text>
            <Image
              source={SPIcons.icArrowRightNoraml}
              style={styles.square28}
            />
          </Pressable>
        ) : (
          <Text style={styles.sectionTitle}>대진표</Text>
        )}
        <View style={styles.rowGap4}>
          {tempTrnTableData.slice(0, 5).map(tbData => (
            <Pressable
              key={`tournament_detail_trn_tb_${tbData.id}`}
              onPress={() => openTargetTableImgModal(tbData.imgSrc)}
              style={{ paddingVertical: 12 }}>
              <Text style={styles.valueText}>{tbData.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Modal
        animationType="fade"
        visible={showTableImgModal}
        onRequestClose={closeTableImgModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.black }}>
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
              대진표
            </Text>
            <Pressable onPress={tempPressFn} style={{ padding: 10 }}>
              <SPSvgs.Download width={28} height={28} fill={COLORS.white} />
            </Pressable>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={{ uri: tableImgSrc }}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );

  const tempTrnSketchData = [
    { id: 1, name: 'image1', imgSrc: tournamentInfo.imageUrl },
    {
      id: 2,
      name: 'image2',
      imgSrc:
        'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
    },
    {
      id: 3,
      name: 'image3',
      imgSrc:
        'https://img1.yna.co.kr/etc/graphic/YH/2018/08/23/GYH2018082300340004400_P4.jpg',
    },
    {
      id: 4,
      name: 'image4',
      imgSrc:
        'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
    },
    {
      id: 5,
      name: 'image5',
      imgSrc: tournamentInfo.imageUrl,
    },
    { id: 6, name: 'image6', imgSrc: tournamentInfo.imageUrl },
  ];
  const renderTournamentSketchPreview = () => {
    const imgHeight = (Dimensions.get('window').width - 32 - 8) / 3;
    return (
      <View style={styles.sectionWrapper}>
        <Pressable
          onPress={() =>
            NavigationService.navigate(navName.tournamentSketch, {
              tournamentIdx,
              tournamentName: tournamentInfo.trnNm,
            })
          }
          style={styles.rowSpaceBetweenWrapper}>
          <Text style={styles.sectionTitle}>대회 스케치</Text>
          <Image source={SPIcons.icArrowRightNoraml} style={styles.square28} />
        </Pressable>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {tempTrnSketchData.map(data => (
            <Image
              key={`tournament_detail_sketch_img_${data.id}`}
              source={{ uri: data.imgSrc }}
              style={{ aspectRatio: 1, height: imgHeight }}
            />
          ))}
        </View>
      </View>
    );
  };

  const tempTrnNoticeData = [
    {
      id: 1,
      title: '[필독] 축구 대회 참가 안내 및 일정 공지',
      date: '2024.08.12',
    },
    {
      id: 2,
      title: '[필독] 축구 대회 참가 안내 및 일정 공지',
      date: '2024.08.12',
    },
    {
      id: 3,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
    {
      id: 4,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
    {
      id: 5,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
    {
      id: 6,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
  ];
  const isNoticeDataExist = !!tempTrnNoticeData.length;
  const renderTournamentNotice = () => (
    <View style={styles.sectionWrapper}>
      <Pressable
        onPress={() => {
          NavigationService.navigate(navName.tournamentNoticeList, {
            tournamentIdx,
            tournamentName: tournamentInfo.trnNm,
          });
        }}
        style={styles.rowSpaceBetweenWrapper}>
        <Text style={styles.sectionTitle}>공지 사항</Text>
        <Image source={SPIcons.icArrowRightNoraml} style={styles.square28} />
      </Pressable>
      {isNoticeDataExist ? (
        <View style={styles.rowGap4}>
          {tempTrnNoticeData.slice(0, 5).map(noticeData => (
            <Pressable
              key={`tournament_detail_trn_notice_${noticeData.id}`}
              onPress={tempPressFn}
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
              <Text style={[styles.labelText, { width: 80 }]}>
                {noticeData.date}
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

  const tempTrnInquiryData = [
    {
      id: 1,
      answered: false,
      title: '[필독] 축구 대회 참가 안내 및 일정 공지',
      date: '2024.08.12',
    },
    {
      id: 2,
      answered: false,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
    {
      id: 3,
      answered: true,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
    {
      id: 4,
      answered: true,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
    {
      id: 5,
      answered: true,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
    {
      id: 6,
      answered: true,
      title:
        '축구 대회 참가 팀 확정 및 조 추첨 결과 축구 대회 참가 팀 확정 및 조 추첨 결과',
      date: '2024.08.12',
    },
  ];
  const isInquiryDataExist = !!tempTrnInquiryData.length;
  const renderTournamentInquiry = () => (
    <View style={styles.sectionWrapper}>
      <Pressable
        onPress={() => {
          NavigationService.navigate(navName.tournamentInquiryList, {
            tournamentIdx,
            tournamentName: tournamentInfo.trnNm,
          });
        }}
        style={styles.rowSpaceBetweenWrapper}>
        <Text style={styles.sectionTitle}>1:1 문의</Text>
        <Image source={SPIcons.icArrowRightNoraml} style={styles.square28} />
      </Pressable>
      {isLogin && isInquiryDataExist ? (
        <View style={styles.rowGap4}>
          {tempTrnInquiryData.slice(0, 5).map(inquiryData => (
            <Pressable
              key={`tournament_detail_trn_inquiry_${inquiryData.title}`}
              onPress={tempPressFn}
              style={{
                flexDirection: 'row',
                columnGap: 8,
                paddingVertical: 12,
              }}>
              <Text
                style={[
                  styles.inquiryAnswerBadge,
                  styles[
                    inquiryData.answered
                      ? 'inquiryAnswerComplete'
                      : 'inquiryAnswerPending'
                  ],
                ]}>
                {inquiryData.answered ? '답변완료' : '답변대기'}
              </Text>
              <Text
                style={styles.valueText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {inquiryData.title}
              </Text>
              <Text style={[styles.labelText, { width: 80 }]}>
                {inquiryData.date}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: 'center', rowGap: 8, paddingVertical: 16 }}>
          <Text style={styles.notAvailableText}>
            {isLogin
              ? `등록된 문의가 없습니다.\n대회에 관해 궁금한 점이 있으면 언제든지 문의를 남겨주세요.`
              : '로그인 후 이용하실 수 있습니다.'}
          </Text>
          <TouchableOpacity
            style={styles.inquiryBtn}
            onPress={() =>
              isLogin
                ? NavigationService.navigate(navName.tournamentInquiryEdit, {
                    tournamentIdx,
                    tournamentName: tournamentInfo.trnNm,
                  })
                : NavigationService.navigate(navName.login, {
                    from: navName.tournamentDetail,
                    tournamentIdx,
                    tournamentName: tournamentInfo.trnNm,
                  })
            }>
            <Text style={styles.inquiryBtnText}>
              {isLogin ? '문의하기' : '로그인하기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const tempTrnReviewData = [
    {
      id: 1,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 1,
      reviewDate: '2024.4.25',
      reviewPoint: 5,
      reviewContent: '아이들에게 좋은 경험이었습니다.',
    },
    {
      id: 2,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 5,
      reviewDate: '2024.4.25',
      reviewPoint: 4,
      reviewContent:
        '아이들에게 좋은 경험이었습니다. 아이들에게 좋은 경험이었습니다. 아이들에게 좋은 경험이었습니다. 아이들에게 좋은 경험이었습니다. 아이들에게 좋은 경험이었습니다. 아이들에게 좋은 경험이었습니다.',
    },
    {
      id: 3,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 21,
      reviewDate: '2024.4.25',
      reviewPoint: 3,
      reviewContent: '아이들에게 좋은 경험이었습니다.',
    },
    {
      id: 4,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 1,
      reviewDate: '2024.4.25',
      reviewPoint: 5,
      reviewContent: '아이들에게 좋은 경험이었습니다.',
    },
    {
      id: 5,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 1,
      reviewDate: '2024.4.25',
      reviewPoint: 5,
      reviewContent: '아이들에게 좋은 경험이었습니다.',
    },
    {
      id: 6,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 1,
      reviewDate: '2024.4.25',
      reviewPoint: 5,
      reviewContent: '아이들에게 좋은 경험이었습니다.',
    },
    {
      id: 7,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 1,
      reviewDate: '2024.4.25',
      reviewPoint: 5,
      reviewContent: '아이들에게 좋은 경험이었습니다.',
    },
    {
      id: 8,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 1,
      reviewDate: '2024.4.25',
      reviewPoint: 5,
      reviewContent: '아이들에게 좋은 경험이었습니다.',
    },
    {
      id: 9,
      academyProfileImg:
        'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
      academyName: '부산 스포츠 아카데미',
      ordinal: 1,
      reviewDate: '2024.4.25',
      reviewPoint: 5,
      reviewContent: '아이들에게 좋은 경험이었습니다.',
    },
  ];
  const reviewDataLength = tempTrnReviewData.length;
  const isReviewDataExist = !!reviewDataLength;
  const renderTournamentReview = () => {
    const reviewAveragePoint = (
      tempTrnReviewData.reduce((acc, cur) => acc + cur.reviewPoint, 0) /
      reviewDataLength
    ).toFixed(1);
    return (
      <View style={styles.sectionWrapper}>
        <Pressable
          onPress={() => {
            NavigationService.navigate(navName.tournamentReviewList, {
              tournamentIdx,
              tournamentName: tournamentInfo.trnNm,
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
              {isReviewDataExist ? reviewAveragePoint : '0.0'}
            </Text>
            <View style={styles.miniDot} />
            <Text
              style={styles.reviewCntText}>{`리뷰 ${reviewDataLength}개`}</Text>
          </View>
          {isReviewDataExist && (
            <Image
              source={SPIcons.icArrowRightNoraml}
              style={styles.square28}
            />
          )}
        </Pressable>
        {isReviewDataExist ? (
          <View>
            {tempTrnReviewData.slice(0, 5).map(reviewData => {
              const reviewStarArr = Array(5)
                .fill()
                .map((_, i) => (i < reviewData.reviewPoint ? 1 : 0));
              return (
                <Pressable
                  key={`tournament_detail_trn_review_${reviewData.id}`}
                  onPress={tempPressFn}
                  style={styles.reviewItemWrapper}>
                  <View style={styles.reviewItemInfoWrapper}>
                    <Image
                      source={{ uri: reviewData.academyProfileImg }}
                      style={styles.reviewItemProfileImg}
                    />
                    <View style={{ rowGap: 2 }}>
                      <Text style={styles.reviewItemName}>
                        {reviewData.academyName}
                      </Text>
                      <Text
                        style={
                          styles.reviewItemName
                        }>{`제 ${reviewData.ordinal}회 참가`}</Text>
                      <View style={{ flexDirection: 'row', columnGap: 8 }}>
                        <Text style={styles.reviewItemDate}>
                          {reviewData.reviewDate}
                        </Text>
                        <View style={{ flexDirection: 'row', columnGap: 4 }}>
                          {reviewStarArr.map((star, starIdx) => (
                            <Image
                              // eslint-disable-next-line react/no-array-index-key
                              key={`trn_review_star_${reviewData.id}_${starIdx}`}
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
                    {reviewData.reviewContent}
                  </Text>
                </Pressable>
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
    isTrnStatusEnded || (member?.academyAdmin && isTrnStatusRegistering);

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
      NavigationService.navigate(navName.academyMatchingRegistration);
      return '';
    }

    if (tournamentStatus.code === TOURNAMENT_STATE.REGISTERING.code) {
      applyTournamentDetail();
      return '';
    }

    return '';
  }, [tournamentStatus, tournamentInfo]);

  const renderSectionDivider = () => (
    <Divider lineHeight={8} lineColor={COLORS.indigo90} />
  );

  if (loading) return <SPLoading />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {renderHeader}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {renderCompetitionInfo}
        {renderSectionDivider()}
        {needRegisterInfo ? renderRegistrationInfo() : renderTournamentTable()}
        {renderSectionDivider()}
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
            {member?.academyAdmin &&
              isTrnStatusRegistering &&
              (tournamentInfo.isApply ? (
                <>
                  <PrimaryButton
                    text="접수 취소"
                    onPress={tempPressFn} // ? cancelApplyTournament
                    outlineButton
                    buttonStyle={[
                      styles.bottomButton,
                      { borderColor: 'rgba(135, 141, 150, 0.32)' },
                    ]}
                    buttonTextStyle={styles.bottomButtonText}
                  />
                  <PrimaryButton
                    text="추가 접수 신청"
                    onPress={tempPressFn} // ? applyTournamentDetail
                    buttonStyle={styles.bottomButton}
                  />
                </>
              ) : (
                <PrimaryButton
                  text="접수 신청"
                  onPress={tempPressFn} // ? applyTournamentDetail
                  buttonStyle={styles.bottomButton}
                />
              ))}
            {isTrnStatusEnded && (
              <>
                {member?.academyAdmin && tournamentInfo.isApply && (
                  <PrimaryButton
                    text="리뷰 작성"
                    onPress={() => {
                      NavigationService.navigate(navName.tournamentReviewEdit);
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
                      tournamentName: tournamentInfo.trnNm,
                    })
                  }
                  buttonStyle={styles.bottomButton}
                />
              </>
            )}
          </View>
        </LinearGradient>
      )}
      {/* {member?.academyAdmin &&
        tournamentStatus.code === TOURNAMENT_STATE.REGISTERING.code &&
        tournamentInfo.aprvState === 'WAIT' &&
        tournamentInfo.ableApply && (
          <PrimaryButton
            outlineButton
            buttonStyle={styles.submitButton}
            text="접수신청 취소"
            onPress={cancelApplyTournament}
          />
        )}

      {member?.academyAdmin &&
        (!tournamentInfo.isApply || !fromHistory) &&
        (tournamentStatus.code === TOURNAMENT_STATE.REGISTERING.code ||
          tournamentInfo.isApply) &&
        tournamentInfo.ableApply && (
          <PrimaryButton
            buttonStyle={styles.submitButton}
            text={renderSubmitButtonText}
            onPress={handleRegister}
          />
        )} */}
      {/* <View style={{ rowGap: 8 }}>
        <PrimaryButton
          text="대회_출전선수등록  페이지로 이동"
          buttonStyle={styles.buttonStyle}
          onPress={() => {
            NavigationService.navigate(navName.tournamentApplyPlayerSelect);
          }}
        />
        <PrimaryButton
          text="리뷰 작성 페이지로 이동"
          buttonStyle={styles.buttonStyle}
          onPress={() => {
            NavigationService.navigate(navName.tournamentReviewEdit);
          }}
        />
        <PrimaryButton
          text="접수 취소 페이지로 이동 : 여러 팀인 경우"
          buttonStyle={styles.buttonStyle}
          onPress={() => {
            NavigationService.navigate(navName.tournamentCancelApplyTeamSelect);
          }}
        />
        <PrimaryButton
          text="접수취소_팀확인 페이지로 이동 : 한팀인 경우"
          buttonStyle={styles.buttonStyle}
          onPress={() => {
            NavigationService.navigate(navName.tournamentCancelApplyTeamCheck);
          }}
        />
        
        <PrimaryButton
          text="리뷰 리스트 페이지로 이동"
          buttonStyle={styles.buttonStyle}
          onPress={() => {
            NavigationService.navigate(navName.tournamentReviewList);
          }}
        />
      </View> */}
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
  coverImage: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  trnNmText: {
    ...fontStyles.fontSize24_Bold,
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
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
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
