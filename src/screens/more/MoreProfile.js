/* eslint-disable no-unsafe-optional-chaining */
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiGetProfile, apiModifyMyInfo } from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { GENDER } from '../../common/constants/gender';
import { MAIN_FOOT } from '../../common/constants/mainFoot';
import Avatar from '../../components/Avatar';
import Header from '../../components/header';
import MenuTile from '../../components/more-profile/MenuTile';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import { CAREER_TYPE } from '../../common/constants/careerType';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment/moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SPModal from '../../components/SPModal';
import SPSelectPhotoModal from '../../components/SPSelectPhotoModal';
import Utils from '../../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';

function MoreProfile() {
  /**
   * state
   */
  const insets = useSafeAreaInsets();
  const [member, setMember] = useState({});
  const [player, setPlayer] = useState({});
  const [stats, setStats] = useState({});
  const [userIdx, setUserIdx] = useState({});
  const [isLast, setIsLast] = useState(false);
  const [nickname, setNickname] = useState(null);
  const [registModalShow, setRegistModalShow] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState({});
  const trlRef = useRef({ current: { disabled: false } });

  const [selectedTab, setSelectedTab] = useState('matching'); // matching, tournament

  const [logoImage, setLogoImage] = useState();
  const [showProfilePhotoSelectModal, setShowProfilePhotoSelectModal] =
    useState(false);
  const maxFilename = 60;

  /**
   * api
   */
  // MenuTile에 표시될 value 설정
  const value = `${age}세`;
  const getProfile = async () => {
    try {
      const { data } = await apiGetProfile();
      if (data) {
        const info = data.data;
        setMember(info.member || {});
        setPlayer(info.player || {});
        setStats(info.stats || {});
        setTournamentHistory(info.tournamentHistory || {});
        setUserIdx(data.data.member.userIdx);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const birthday = moment(member?.userBirthday);
  const today = moment();
  const age = today.diff(birthday, 'years');

  /**
   * function
   */

  // 닉네임 수정
  const modifyNickName = async newNickname => {
    closeModal();
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const formData = new FormData();

      // JSON 파라미터
      const params = {
        userNickName: Utils.removeSymbolAndBlank(newNickname),
      };
      formData.append('dto', {
        string: JSON.stringify(params),
        type: 'application/json',
      });

      await apiModifyMyInfo(formData);
      Utils.openModal({
        title: '성공',
        body: '수정이 완료되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  // 프로필 이미지 수정
  const updateProfile = async ({ fileUrl, imageName, imageType }) => {
    // 로고 이미지 상태 업데이트
    setLogoImage({
      uri: fileUrl,
      name:
        imageName.length <= maxFilename
          ? imageName
          : imageName.substring(
              imageName.length - maxFilename,
              imageName.length,
            ),
      type: imageType,
    });
  };

  const openModal = () => {
    setRegistModalShow(true);
  };
  const closeModal = () => {
    setRegistModalShow(false);
    setNickname(null);
  };

  const fileUpload = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;

      // FormData 생성
      const formData = new FormData();
      const data = {
        userIdx: member.userIdx,
      };
      formData.append('dto', {
        string: JSON.stringify(data),
        type: 'application/json',
      });
      if (logoImage) formData.append('profile', logoImage);

      await apiModifyMyInfo(formData);
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
      NavigationService.goBack();
    }
  };

  /**
   * useEffect
   */
  useEffect(() => {
    if (logoImage) {
      fileUpload();
    }
  }, [logoImage]);

  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, []),
  );

  const renderUserSection = useMemo(() => {
    return (
      <View style={styles.userSectionWrapper}>
        <Pressable
          style={{
            paddingHorizontal: 16,
            paddingVertical: 4,
            marginBottom: 16,
            alignSelf: 'flex-end',
          }}
          onPress={() => {
            NavigationService.navigate(navName.moreStatModify);
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#FFF',
              lineHeight: 24,
              letterSpacing: -0.091,
            }}>
            퍼포먼스 수정
          </Text>
        </Pressable>
        <Avatar
          imageSize={56}
          imageURL={member?.userProfilePath ?? ''}
          onPress={() => {
            setShowProfilePhotoSelectModal(true);
          }}
        />

        <View style={styles.usernameWrapper}>
          {stats?.backNo && (
            <View
              style={{
                backgroundColor: '#5A5F94',
                borderRadius: 4,
                paddingHorizontal: 4,
              }}>
              <Text
                style={[
                  fontStyles.fontSize14_Semibold,
                  { color: COLORS.white },
                ]}>
                {stats?.backNo ?? ''}
              </Text>
            </View>
          )}
          <Text
            style={[fontStyles.fontSize18_Semibold, { color: COLORS.white }]}>
            {member?.userNickName ?? ''}
          </Text>
          <Pressable
            hitSlop={5}
            onPress={() => {
              openModal();
            }}>
            <SPSvgs.Pencil width={18} height={18} fill="#fff" />
          </Pressable>
        </View>

        {member?.acdmyNm && (
          <View style={styles.fcWrapper}>
            <Text
              style={[
                fontStyles.fontSize12_Semibold,
                { color: COLORS.white, letterSpacing: 0.3 },
              ]}>
              {member.acdmyNm}
            </Text>
          </View>
        )}
      </View>
    );
  }, [member]);

  const renderBodyStatistic = useMemo(() => {
    return (
      <>
        <View style={styles.basicInfoWrapper}>
          <MenuTile
            title="포지션"
            value={stats.position ? stats.position : '-'}
          />
          <MenuTile
            title="지역"
            value={member.userRegion ? member.userRegion : ''}
          />
          <MenuTile
            title="성별"
            value={member.userGender ? GENDER[member.userGender].desc : '-'}
          />
          <MenuTile
            title="나이"
            value={age}
            subValue={moment(member.userBirthday).format('YYYY.MM.DD')}
          />
          <MenuTile
            title="주 발"
            value={stats.mainFoot ? MAIN_FOOT[stats.mainFoot].desc : '-'}
          />
          <MenuTile
            title="키"
            value={stats.height ? `${stats.height}cm` : '-'}
          />
          <MenuTile
            title="발사이즈"
            value={stats.shoeSize ? `${stats.shoeSize}mm` : '-'}
          />
          <MenuTile
            title="몸무게"
            value={stats.weight ? `${stats.weight}kg` : '-'}
          />
        </View>
        <View
          style={[
            styles.menuTileContainer,
            {
              width: '100%',
              marginTop: 8,
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color: COLORS.labelNeutral,
              },
            ]}>
            선수경력
          </Text>

          {stats?.careerType ? (
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: 8,
              }}>
              {stats?.careerType?.map((item, index) => {
                const lastItem = index === member?.careerType?.length - 1;
                if (lastItem) {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Text key={index} style={[fontStyles.fontSize20_Semibold]}>
                      {CAREER_TYPE[item]?.desc}
                    </Text>
                  );
                }
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <Fragment key={index}>
                    <Text style={[fontStyles.fontSize20_Semibold]}>
                      {CAREER_TYPE[item]?.desc}
                    </Text>
                    {index !== stats?.careerType?.length - 1 && (
                      <SPSvgs.Ellipse width={6} height={6} />
                    )}
                  </Fragment>
                );
              })}
            </View>
          ) : (
            <Text style={[fontStyles.fontSize20_Semibold]}>-</Text>
          )}
        </View>
      </>
    );
  }, [stats, member]);

  const renderGameParticipantHistory = useMemo(() => {
    return (
      <View style={styles.gameHistoryWrapper}>
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: COLORS.lineBorder,
            paddingHorizontal: 16,
            gap: 16,
          }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedTab('matching')}
            style={[
              styles.tabWrap,
              selectedTab === 'matching' && styles.tabWrapActive,
            ]}>
            <Text
              style={[
                styles.tabText,
                selectedTab === 'matching' && styles.tabTextActive,
              ]}>
              경기 참가이력
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedTab('tournament')}
            style={[
              styles.tabWrap,
              selectedTab === 'tournament' && styles.tabWrapActive,
            ]}>
            <Text
              style={[
                styles.tabText,
                selectedTab === 'tournament' && styles.tabTextActive,
              ]}>
              대회 참가이력
            </Text>
          </TouchableOpacity>
        </View>
        {selectedTab === 'matching' ? (
          <View style={styles.gameScoreWrapper}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoretitleText}>출전 경기 수</Text>
              <Text style={fontStyles.fontSize20_Semibold}>
                {player?.totalMatch
                  ? Utils.changeNumberComma(player.totalMatch)
                  : '0'}
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoretitleText}>득점</Text>
              <Text style={fontStyles.fontSize20_Semibold}>
                {player?.totalScore
                  ? Utils.changeNumberComma(player.totalScore)
                  : '0'}
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoretitleText}>MVP</Text>
              <Text style={fontStyles.fontSize20_Semibold}>
                {player?.totalMvp
                  ? Utils.changeNumberComma(player.totalMvp)
                  : '0'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                NavigationService.navigate(navName.moreGameSchedule);
              }}
              style={styles.historyMoveButton}>
              <Text style={styles.historyButtonText}>내 경기 이력 보기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 8, paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={styles.tournamentItem}>
                <Text style={styles.scoretitleText}>MVP</Text>
                <Text style={fontStyles.fontSize20_Semibold}>
                  {tournamentHistory?.tournamentMvpCount
                    ? Utils.changeNumberComma(
                        tournamentHistory.tournamentMvpCount,
                      )
                    : '0'}
                </Text>
              </View>
              <View style={styles.tournamentItem}>
                <Text style={styles.scoretitleText}>득점</Text>
                <Text style={fontStyles.fontSize20_Semibold}>
                  {tournamentHistory?.tournamentScoreCount
                    ? Utils.changeNumberComma(
                        tournamentHistory.tournamentScoreCount,
                      )
                    : '0'}
                </Text>
              </View>
              <View style={styles.tournamentItem}>
                <Text style={styles.scoretitleText}>경고</Text>
                <Text style={fontStyles.fontSize20_Semibold}>
                  {tournamentHistory?.tournamentWaringCnt
                    ? Utils.changeNumberComma(
                        tournamentHistory.tournamentWaringCnt,
                      )
                    : '0'}
                </Text>
              </View>
              <View style={styles.tournamentItem}>
                <Text style={styles.scoretitleText}>퇴장</Text>
                <Text style={fontStyles.fontSize20_Semibold}>
                  {tournamentHistory?.tournamentExpulsionCount
                    ? Utils.changeNumberComma(
                        tournamentHistory.tournamentExpulsionCount,
                      )
                    : '0'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                NavigationService.navigate(navName.moreTournamentHistory);
              }}
              style={styles.historyMoveButton}>
              <Text style={styles.historyButtonText}>내 대회 이력 보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [player, tournamentHistory, selectedTab]);

  return (
    <View style={styles.container}>
      <Header
        title="프로필"
        headerContainerStyle={[
          styles.header,
          {
            paddingTop: insets.top,
            paddingBottom: 14,
          },
        ]}
        leftIconColor={COLORS.white}
        headerTextStyle={{ color: COLORS.white }}
        // rightContent={renderHeaderRightButtons}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderUserSection}

        <View style={styles.content}>
          {/* Body Statistic */}
          <View style={{ paddingHorizontal: 16 }}>{renderBodyStatistic}</View>

          {/* Game participation history */}
          {renderGameParticipantHistory}
        </View>
      </ScrollView>

      <SPSelectPhotoModal
        visible={showProfilePhotoSelectModal}
        crop
        cropWithRate={1}
        cropHeightRate={1}
        onClose={async () => {
          setShowProfilePhotoSelectModal(false);
        }}
        onComplete={data => {
          updateProfile(data);
        }}
      />
      <SPModal
        title="닉네임"
        visible={registModalShow}
        textInputVisible={true}
        textCancelButton
        textAlign="center"
        placeholder="16자 이내 한글 혹은 영문"
        maxLength={16}
        textInputStyle={{
          borderWidth: 1,
          borderRadius: 10,
          borderColor: COLORS.orange,
          paddingHorizontal: 30,
        }}
        value={nickname === null ? member?.userNickName : nickname}
        /* eslint-disable-next-line no-shadow */
        onChangeText={value => {
          const text = Utils.removeSymbolAndBlank(value);
          setNickname(text);
        }}
        /* eslint-disable-next-line no-shadow */
        onConfirm={value => {
          modifyNickName(value);
        }}
        onCancel={() => {
          closeModal();
        }}
        onClose={() => {
          closeModal();
        }}
        // 추가: Clear 버튼을 누르면 nickname을 null로 설정
        // textCancelButton={{
        //   onPress: () => setNickname(null), // 또는 원하는 클리어 로직을 넣으세요
        // }}
      />
    </View>
  );
}

export default memo(MoreProfile);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.darkBlue,
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.darkBlue,
  },
  rightHeaderButtonWrapper: {
    flexDirection: 'row',
    columnGap: 16,
  },
  userSectionWrapper: {
    alignItems: 'center',
    rowGap: 8,
    paddingBottom: 24,
  },
  usernameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  fcWrapper: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  basicInfoWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  menuTileContainer: {
    // backgroundColor: COLORS.fillNormal,
    backgroundColor: '#F1F5FF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    padding: 16,
    width: (SCREEN_WIDTH - 40) / 2,
    rowGap: 8,
  },
  gameHistoryWrapper: {
    paddingTop: 48,
    rowGap: 16,
  },
  gameScoreWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  scoreItem: {
    // backgroundColor: COLORS.fillNormal,
    backgroundColor: '#F1F5FF',
    width: Math.floor((SCREEN_WIDTH - 49) / 3),
    padding: 8,
    borderRadius: 8,
    rowGap: 8,
    alignItems: 'center',
  },
  tournamentItem: {
    flex: 1,
    // backgroundColor: COLORS.fillNormal,
    backgroundColor: '#F1F5FF',
    paddingVertical: 8,
    borderRadius: 8,
    rowGap: 8,
    alignItems: 'center',
  },
  scoretitleText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
  },
  historyItemWrapper: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    borderColor: COLORS.lineBorder,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#000',
    lineHeight: 24,
    letterSpacing: 0.091,
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  tabWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    paddingVertical: 8,
  },
  tabWrapActive: {
    borderBottomColor: '#FF7C10',
  },
  tabText: {
    ...fontStyles.fontSize14_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  tabTextActive: {
    color: '#FB8225',
  },
  historyMoveButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FB8225',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 8,
  },
  historyButtonText: {
    ...fontStyles.fontSize16_Semibold,
    color: '#FB8225',
  },
});
