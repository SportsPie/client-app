/* eslint-disable no-unsafe-optional-chaining */
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiGetMatches, apiGetProfile } from '../../api/RestAPI';
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

// const DATA = [
//   {
//     id: Utils.UUIDV4(),
//     title: '2024 축구대회[초등부 남자]',
//     value: '2024.04.06',
//   },
//   {
//     id: Utils.UUIDV4(),
//     title: '2024 축구대회[초등부 남자]',
//     value: '2024.04.06',
//   },
//   {
//     id: Utils.UUIDV4(),
//     title: '2024 축구대회[초등부 남자]',
//     value: '2024.04.06',
//   },
// ];

function MoreProfile() {
  /**
   * state
   */
  const insets = useSafeAreaInsets();
  const [member, setMember] = useState({});
  const [player, setPlayer] = useState({});
  const [stats, setStats] = useState({});
  const [userIdx, setUserIdx] = useState({});
  const [matchHistory, setMatchHistory] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const flatListRef = useRef();
  const [isLast, setIsLast] = useState(false);

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
        setUserIdx(data.data.member.userIdx);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const birthday = moment(member?.userBirthday);
  const today = moment();
  const age = today.diff(birthday, 'years');

  const getUserMatchHistory = async () => {
    const params = {
      size: pageSize,
      page,
      academyIdx: member.academyIdx,
    };
    try {
      const { data } = await apiGetMatches(params);
      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setIsLast(data.data.isLast); // 현재 페이지가 마지막 페이지임을 설정
        setMatchHistory(prevArticles =>
          page === 1 ? newList : [...prevArticles, ...newList],
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * function
   */
  const handleScroll = event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isScrolledToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isScrolledToBottom) {
      loadMoreProjects();
    }
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      getUserMatchHistory();
    }, [page, userIdx]),
  );

  const renderUserSection = useMemo(() => {
    return (
      <View style={styles.userSectionWrapper}>
        <Avatar
          imageSize={56}
          disableEditMode
          imageURL={member?.userProfilePath ?? ''}
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
                    <Text style={[fontStyles.fontSize20_Semibold]}>
                      {CAREER_TYPE[item]?.desc}
                    </Text>
                  );
                }
                return (
                  <>
                    <Text style={[fontStyles.fontSize20_Semibold]}>
                      {CAREER_TYPE[item]?.desc}
                    </Text>
                    <SPSvgs.Ellipse width={6} height={6} />
                  </>
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
        <Text style={fontStyles.fontSize20_Semibold}>경기 참가이력</Text>

        <View style={styles.gameScoreWrapper}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoretitleText}>출전경기수</Text>
            <Text style={fontStyles.fontSize20_Semibold}>
              {player?.totalMatch ? player.totalMatch : '0'}
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoretitleText}>득점</Text>
            <Text style={fontStyles.fontSize20_Semibold}>
              {player?.totalScore ? player.totalScore : '0'}
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoretitleText}>MVP</Text>
            <Text style={fontStyles.fontSize20_Semibold}>
              {player?.totalMvp ? player.totalMvp : '0'}
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoretitleText}>도움</Text>
            <Text style={fontStyles.fontSize20_Semibold}>
              {player?.totalAssistance ? player.totalAssistance : '0'}
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoretitleText}>경고</Text>
            <Text style={fontStyles.fontSize20_Semibold}>
              {player?.totalYellowCard ? player.totalYellowCard : '0'}
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoretitleText}>퇴장</Text>
            <Text style={fontStyles.fontSize20_Semibold}>
              {player?.totalRedCard ? player.totalRedCard : '0'}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [player]);

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

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        {renderUserSection}

        <View style={styles.content}>
          {/* Body Statistic */}
          {renderBodyStatistic}

          {/* Game participation history */}
          {renderGameParticipantHistory}

          {/* List history */}
          <View
            style={{
              rowGap: 16,
              paddingVertical: 16,
              flexDirection: 'column',
            }}>
            {matchHistory &&
              matchHistory.length > 0 &&
              matchHistory.map((item, index) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <View key={index} style={styles.historyItemWrapper}>
                    <Text style={styles.subTitle}>{item.title}</Text>
                    <Text style={styles.subText}>
                      {moment(item.matchDate).format('YYYY-MM-DD')}
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>
      </ScrollView>
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
    paddingVertical: 24,
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
    paddingHorizontal: 16,
    paddingTop: 24,
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
  },
  scoreItem: {
    // backgroundColor: COLORS.fillNormal,
    backgroundColor: '#F1F5FF',
    width: (SCREEN_WIDTH - 49) / 3,
    padding: 8,
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
});
