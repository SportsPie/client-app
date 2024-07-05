import 'moment/locale/ko';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGetPlayerListByMatchIdx, apiSaveReview } from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import { SPToast } from '../../components/SPToast';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { handleError } from '../../utils/HandleError';

export default function MatchingRegistReview({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const matchIdx = route?.params?.matchIdx;
  const [rating, setRating] = useState(5);
  const [mvpMemberIdx, setMvpMemberIdx] = useState(null);
  const [review, setReview] = useState('');
  const [players, setPlayers] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);

  // --------------------------------------------------
  // [ Apis ]
  // --------------------------------------------------
  const getPlayerListByMatchIdx = async () => {
    try {
      const { data } = await apiGetPlayerListByMatchIdx(matchIdx);

      if (data) {
        if (data.data.isHome) {
          setPlayers(data.data.awayPlayers);
        } else {
          setPlayers(data.data.homePlayers);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const saveReview = async () => {
    if (mvpMemberIdx === null || rating === 0 || review === '') {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }

    const param = {
      matchIdx,
      rating,
      mvpMemberIdx,
      review,
    };

    try {
      const { data } = await apiSaveReview(param);
      if (data) {
        handleSubmit();
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const handleStarPress = index => {
    setRating(index + 1);
  };

  const handleRadioPress = playerIdx => {
    setMvpMemberIdx(playerIdx);
  };

  const handleSubmit = () => {
    SPToast.show({ text: '매칭 리뷰 등록완료' });
    NavigationService.goBack();
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return '매우 별로에요';
      case 2:
        return '별로에요';
      case 3:
        return '보통이에요';
      case 4:
        return '만족해요';
      case 5:
        return '최고에요';
      default:
        return '';
    }
  };

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------
  useEffect(() => {
    getPlayerListByMatchIdx();
  }, []);

  useEffect(() => {
    setIsDisabled(true);
    if (rating && mvpMemberIdx && review) {
      setIsDisabled(false);
    }
  }, [rating, mvpMemberIdx, review]);

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
        }}>
        <SafeAreaView style={styles.container}>
          <Header title="리뷰작성" />

          <ScrollView style={{ flex: 1 }}>
            <View style={styles.topBox}>
              <View style={styles.topTextBox}>
                <Text style={styles.topText}>좋은 경기를 펼쳤나요?</Text>
                <Text style={styles.topText}>
                  상대팀에 대한 매너점수를 체크해보세요.
                </Text>
              </View>
              <View style={styles.starContainer}>
                {[...Array(5)].map((item, index) => (
                  <TouchableOpacity onPress={() => handleStarPress(index)}>
                    <Image
                      source={
                        index < rating
                          ? SPIcons.icFillStar
                          : SPIcons.icOutlineStar
                      }
                      style={styles.star}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <View style={styles.ratingTextContainer}>
                  <Text style={styles.ratingText}>{rating}점</Text>
                  <View style={styles.dot} />
                  <Text style={styles.ratingText}>{getRatingText()}</Text>
                </View>
              )}
            </View>
            <View
              style={[
                styles.contentBox,
                { paddingVertical: 0, paddingTop: 24, paddingBottom: 8 },
              ]}>
              <Text style={styles.title}>MVP</Text>
            </View>
          </ScrollView>
          <FlatList
            data={players}
            renderItem={({ item: player }) => (
              <View style={styles.playerInfoBox}>
                <TouchableOpacity
                  style={styles.ridoBoxWrapper}
                  onPress={() => handleRadioPress(player.memberIdx)}>
                  <Image
                    source={
                      mvpMemberIdx === player.memberIdx
                        ? SPIcons.icFillRadio
                        : SPIcons.icBasicRadio
                    }
                    style={{ width: 32, height: 32 }}
                  />
                </TouchableOpacity>
                <View style={styles.imageBox}>
                  {player.profilePath ? (
                    <Image
                      source={{ uri: player.profilePath }}
                      style={{ height: 32, width: 32 }}
                    />
                  ) : (
                    <Image
                      source={SPIcons.icPerson}
                      style={{ height: 32, width: 32 }}
                    />
                  )}
                </View>
                <View style={styles.textBox}>
                  <View style={styles.textTop}>
                    {player.backNo && (
                      <View style={styles.numberBox}>
                        <Text style={styles.numberText}>{player.backNo}</Text>
                      </View>
                    )}
                    {/* TODO ::: 나중에 삭제 */}
                    <Text style={styles.nameText}>
                      {player.playerName ? player.playerName : '김파이'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
          <View style={[styles.contentBox, { gap: 4, marginTop: 24 }]}>
            <Text style={styles.title}>리뷰</Text>
            <View style={{ gap: 4 }}>
              <TextInput
                value={review}
                onChange={e => {
                  if (e.nativeEvent.text?.length > 50) return;
                  setReview(e.nativeEvent.text);
                }}
                multiline
                textAlignVertical="top"
                numberOfLines={3}
                placeholder="상대팀에 대한 평가를 적어주세요"
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.box}
              />
              <View
                style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Text style={[styles.lengthCount, { paddingTop: 0 }]}>
                  {review.length} / 50
                </Text>
              </View>
            </View>
          </View>
          {/* 완료 버튼 */}
          <TouchableOpacity
            style={[
              styles.clearBtn,
              isDisabled ? styles.disabledClearBtn : styles.enabledClearBtn,
            ]}
            disabled={isDisabled}
            onPress={() => saveReview()}>
            <Text
              style={[
                styles.clearBtnText,
                isDisabled
                  ? styles.disabledClearBtnText
                  : styles.enabledClearBtnText,
              ]}>
              작성완료
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  topBox: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  topTextBox: {
    marginBottom: 16,
  },
  topText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  star: {
    width: 24,
    height: 24,
  },
  ratingTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF671F',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: '#FF671F',
    borderRadius: 2,
  },
  contentBox: {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  playerInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  ridoBoxWrapper: {
    marginRight: 12,
  },
  imageBox: {
    height: 32,
    width: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 8,
  },
  textBox: {
    justifyContent: 'center',
  },
  textTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBox: {
    minWidth: 16,
    backgroundColor: '#5A5F94',
    borderRadius: 5,
    paddingHorizontal: 2,
    paddingVertical: 1,
    marginRight: 2,
  },
  numberText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFF',
    lineHeight: 14,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  box: {
    minHeight: 98,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  lengthCount: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
    paddingTop: 4,
  },
  clearBtn: {
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  enabledClearBtn: {
    backgroundColor: '#FF671F',
  },
  disabledClearBtn: {
    backgroundColor: '#E3E2E1',
  },
  enabledClearBtnText: {
    color: '#FFF',
  },
  disabledClearBtnText: {
    color: 'rgba(46, 49, 53, 0.28)',
  },
});
