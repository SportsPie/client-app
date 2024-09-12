import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { COLORS } from '../../../styles/colors';
import { SPSvgs } from '../../../assets/svg';
import { IS_IOS } from '../../../common/constants/constants';
import SPIcons from '../../../assets/icon';
import Avatar from '../../../components/Avatar';
import {
  apiGetEventApplicantList,
  apiGetEventOpenApplicant,
  apiGetFaq,
} from '../../../api/RestAPI';
import { handleError } from '../../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../../../components/SPLoading';

// 포지션 카드
function ParticipantCard({ participant, eventIdx }) {
  return (
    <TouchableOpacity
      onPress={() => {
        NavigationService.navigate(navName.eventParticipantDetail, {
          participantIdx: participant.participationIdx,
        });
      }}
      key={participant.participationIdx}
      style={styles.participantContainer}>
      <View style={styles.participantMemo}>
        <Avatar imageSize={56} disableEditMode imageURL="" />
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{participant.participationName}</Text>
          <Text style={styles.positionText}>{participant.position}</Text>
        </View>
        <View style={styles.reactionsContain}>
          <View style={styles.reactSize}>
            <SPSvgs.HeartOutline width={20} height={20} />
            <Text
              style={[
                fontStyles.fontSize12_Semibold,
                { color: COLORS.labelNeutral },
              ]}>
              {participant.cntLike}
            </Text>
          </View>
          <View style={styles.reactWrapper}>
            <SPSvgs.BubbleChatOutline width={20} height={20} />
            <Text
              style={[
                fontStyles.fontSize12_Semibold,
                { color: COLORS.labelNeutral },
              ]}>
              {participant.cntComment}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EventParticipantList({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const eventIdx = route.params?.eventIdx;
  const [keyword, setKeyword] = useState('');
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [searched, setSearched] = useState(false);
  const [fwList, setFwList] = useState([]);
  const [gkList, setGkList] = useState([]);
  const [dfList, setDfList] = useState([]);
  const [mfList, setMfList] = useState([]);
  const [peopleCount, setPeopleCount] = useState(0);
  const [positionCount, setPositionCount] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLast, setIsLast] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false); // 추가된 상태

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------

  const searching = () => {
    setSearchedKeyword(keyword);
    setSearched(prev => !prev);
  };

  const clearKeyword = () => {
    setKeyword('');
    setSearchedKeyword('');
  };

  // 검색창
  const renderSearchInput = useMemo(() => {
    return (
      <View style={styles.searchContainer}>
        <SPSvgs.Search width={20} height={20} fill="#2E313599" />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.searchInput}
            value={keyword}
            onChangeText={e => {
              if (e?.length > 50) return;
              setKeyword(e);
            }}
            placeholder="이름을 입력해보세요"
            placeholderTextColor="rgba(46, 49, 53, 0.60)"
            autoCorrect={false}
            autoCapitalize="none"
            onSubmitEditing={searching}
            returnKeyType="search"
            onFocus={() => {
              setIsInputFocused(true); // 포커스 시 상태 변경
              resetSearch();
              setLoading(false); // 로딩 상태를 false로 설정하여 무한 로딩 방지
            }}
            onBlur={() => {
              setIsInputFocused(false); // 포커스 아웃 시 상태 변경
              // 검색 상태 초기화
            }}
          />
          {keyword && (
            <Pressable
              hitSlop={14}
              onPress={clearKeyword}
              style={styles.clearButton}>
              <SPSvgs.CloseCircleFill width={20} height={20} />
            </Pressable>
          )}
        </View>
      </View>
    );
  }, [keyword]);

  // 포지션
  const renderParticipantSection = (list, count, type) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={
        list.length === 0
          ? styles.scrollViewContentEmpty
          : styles.scrollViewContent
      }>
      {list.length === 0 ? (
        <View style={styles.noParticipants}>
          <Text style={styles.emptyText}>해당 포지션에 지원자가 없습니다.</Text>
        </View>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              padding: 16,
            }}>
            {list.slice(0, 4).map(participant => (
              <ParticipantCard
                key={participant.participationIdx}
                participant={participant}
              />
            ))}
          </View>
          {list.length > 3 && (
            <TouchableOpacity
              onPress={() => {
                NavigationService.navigate(navName.eventParticipantPartList, {
                  type,
                  eventIdx,
                  count,
                });
              }}
              style={[styles.moreArrowBtn, { paddingRight: 16 }]}>
              <Image
                source={SPIcons.icArrowEvent}
                style={{ width: 48, height: 48 }}
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );

  const getEventSummary = async () => {
    try {
      const { data } = await apiGetEventOpenApplicant(eventIdx);
      setDfList(data.data.dfList);
      setFwList(data.data.fwList);
      setMfList(data.data.mfList);
      setGkList(data.data.gkList);
      setPositionCount(data.data.applyCount);
    } catch (error) {
      handleError(error);
    }
  };

  const handleEndReached = () => {
    if (!isLast) {
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setEventData([]);
    setCurrentPage(1);
    setIsLast(false);
    setRefreshing(true);
  }, []);

  const resetSearch = () => {
    setKeyword('');
    setSearchedKeyword('');
    setEventData([]);
    setCurrentPage(1);
    setLoading(false);
    setIsLast(false);
    setPeopleCount(0);
  };

  const renderEmptyList = useCallback(() => {
    return (
      <View style={styles.emptyViewWrapper}>
        <Text style={styles.emptyTitle}>검색 결과가 없습니다.</Text>
        <Text style={styles.emptyText}>다른 이름으로 검색해 보세요.</Text>
      </View>
    );
  }, []);

  const renderParticipant = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        NavigationService.navigate(navName.eventParticipantDetail, {
          participantIdx: item.participationIdx,
        });
      }}
      key={item.participationIdx}
      style={styles.participantContain}>
      <Avatar imageSize={56} disableEditMode imageURL="" />
      <View style={styles.infoContain}>
        <Text style={styles.nameText}>{item.participationName}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.positionText}>{item.position}</Text>
          <View style={styles.reactionsContainer}>
            <View style={styles.reactWrapper}>
              <SPSvgs.HeartOutline width={20} height={20} />
              <Text
                style={[
                  fontStyles.fontSize12_Semibold,
                  { color: COLORS.labelNeutral },
                ]}>
                {item.cntLike}
              </Text>
            </View>
            <View style={styles.reactWrapper}>
              <SPSvgs.BubbleChatOutline width={20} height={20} />
              <Text
                style={[
                  fontStyles.fontSize12_Semibold,
                  { color: COLORS.labelNeutral },
                ]}>
                {item.cntComment}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  const getSearchParticipant = async () => {
    const params = {
      size: pageSize,
      page: currentPage,
      keyword: searchedKeyword,
      eventIdx,
    };
    try {
      const { data } = await apiGetEventApplicantList(params);
      if (Array.isArray(data.data.list)) {
        const newList = data.data.list;
        setPeopleCount(newList.length);
        setIsLast(data.data.isLast);
        setEventData(prevEventData =>
          currentPage === 1 ? newList : [...prevEventData, ...newList],
        );
      }
    } catch (error) {
      setIsLast(true);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getEventSummary();
    }, []),
  );

  useEffect(() => {
    if (searchedKeyword) {
      setLoading(true);
      getSearchParticipant();
    }
  }, [searchedKeyword, currentPage]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="참가자 목록" />

      {renderSearchInput}

      {isInputFocused || searchedKeyword ? (
        <View style={{ flex: 1 }}>
          <SafeAreaView style={[styles.container, { paddingHorizontal: 16 }]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
              <Text style={styles.contentsTitle}>참가자</Text>
              <Text style={styles.contentsText}>{peopleCount}</Text>
            </View>

            {eventData && eventData.length > 0 ? (
              <FlatList
                data={eventData}
                numColumns={1}
                renderItem={renderParticipant}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmptyList}
                contentContainerStyle={styles.content}
              />
            ) : loading ? (
              <Loading />
            ) : (
              renderEmptyList()
            )}
          </SafeAreaView>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ paddingVertical: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <Text style={styles.contentsTitle}>공격수</Text>
                <Text style={styles.contentsText}>{positionCount.fwCount}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate(navName.eventParticipantPartList, {
                    type: 'FW',
                    count: positionCount.fwCount,
                    eventIdx,
                  });
                }}
                style={styles.moreArrowBtn}>
                <Image source={SPIcons.icArrowRightNoraml} />
              </TouchableOpacity>
            </View>
            {renderParticipantSection(fwList, positionCount.fwCount, 'FW')}
          </View>
          <View style={{ paddingVertical: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <Text style={styles.contentsTitle}>미드필더</Text>
                <Text style={styles.contentsText}>{positionCount.mfCount}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate(navName.eventParticipantPartList, {
                    type: 'MF',
                    count: positionCount.mfCount,
                    eventIdx,
                  });
                }}
                style={styles.moreArrowBtn}>
                <Image source={SPIcons.icArrowRightNoraml} />
              </TouchableOpacity>
            </View>
            {renderParticipantSection(mfList, positionCount.mfCount, 'MF')}
          </View>
          <View style={{ paddingVertical: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <Text style={styles.contentsTitle}>수비수</Text>
                <Text style={styles.contentsText}>{positionCount.dfCount}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate(navName.eventParticipantPartList, {
                    type: 'DF',
                    count: positionCount.dfCount,
                    eventIdx,
                  });
                }}
                style={styles.moreArrowBtn}>
                <Image source={SPIcons.icArrowRightNoraml} />
              </TouchableOpacity>
            </View>
            {renderParticipantSection(dfList, positionCount.dfCount, 'DF')}
          </View>
          <View style={{ paddingVertical: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <Text style={styles.contentsTitle}>골키퍼</Text>
                <Text style={styles.contentsText}>{positionCount.gkCount}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate(navName.eventParticipantPartList, {
                    type: 'GK',
                    count: positionCount.gkCount,
                    eventIdx,
                  });
                }}
                style={styles.moreArrowBtn}>
                <Image source={SPIcons.icArrowRightNoraml} />
              </TouchableOpacity>
            </View>
            {renderParticipantSection(gkList, positionCount.gkCount, 'GK')}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default EventParticipantList;

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 16,
    // marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.peach,
    columnGap: 4,
    padding: 8,
    borderRadius: 10,
    height: 48,
  },
  searchInput: {
    ...fontStyles.fontSize14_Medium,
    letterSpacing: 0.2,
    color: COLORS.labelNormal,
    height: 36,
    width: '100%',
    top: IS_IOS ? -2 : 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  participantContainer: {
    width: 108,
    height: 156,
    // paddingHorizontal: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderWidth: 1,
    alignItems: 'center',
  },
  participantMemo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#000',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  positionText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  scrollViewContentEmpty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  noParticipants: {
    height: 156,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    paddingRight: 30,
  },
  clearButton: {
    position: 'absolute',
    right: 8,
  },
  participantContain: {
    flexDirection: 'row',
    alignItems: 'center', // Adjust width to match screen width
    height: 92,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8, // Add margin to separate items
  },
  infoContain: {
    flex: 1,
    marginLeft: 16,
    width: '100%', // Adjust width to match container
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reactionsContain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  reactSize: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentsTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  contentsText: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  emptyViewWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 24,
    letterSpacing: 0.091,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
});
