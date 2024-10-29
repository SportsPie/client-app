import 'moment/locale/ko';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  apiGetTournamentOpen,
  apiPostTournamentReview,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import Header from '../../components/header';
import { handleError } from '../../utils/HandleError';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';

export default function TournamentReviewEdit({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const tournamentIdx = route?.params?.tournamentIdx;
  const tournamentName = route?.params?.tournamentName;
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const [tournamentDetail, setTournamentDetail] = useState({});

  // --------------------------------------------------
  // [ Apis ]
  // --------------------------------------------------

  const getTournamentDetail = async () => {
    try {
      const { data } = await apiGetTournamentOpen({ tournamentIdx });
      setTournamentDetail(data.data?.tournament);
    } catch (error) {
      handleError(error);
    }
  };

  const saveReview = async () => {
    if (rating === 0 || review === '') {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }

    const param = {
      tournamentIdx,
      rating,
      review,
    };

    try {
      const { data } = await apiPostTournamentReview(param);
      Utils.openModal({
        title: '리뷰 작성 완료',
        body: '리뷰 작성이 성공적으로 완료됐습니다. \n의견을 들려주셔서 감사합니다!',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
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
    getTournamentDetail();
  }, []);

  useEffect(() => {
    setIsDisabled(true);
    if (rating && review) {
      setIsDisabled(false);
    }
  }, [rating, review]);

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
                <Text style={styles.topText}>
                  제 {tournamentDetail?.trnCount}회
                </Text>
                <Text style={styles.topText}>{tournamentName}</Text>
                <Text style={styles.secondText}>함께해 주셔서 감사합니다!</Text>
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.thirdText}>
                    대회에 대한 의견을 들려주세요.
                  </Text>
                </View>
              </View>
              <View style={styles.starContainer}>
                {[...Array(5)].map((item, index) => (
                  <TouchableOpacity
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={index}
                    onPress={() => handleStarPress(index)}>
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
          </ScrollView>
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
                placeholder={`대회에서의 경험을 공유해주세요. \n다른 사람들에 도움이 됩니다!`}
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
    alignItems: 'center',
  },
  topText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  secondText: { ...fontStyles.fontSize16_Medium },
  thirdText: { ...fontStyles.fontSize14_Medium },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
    paddingVertical: 12,
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
    color: '#FF7C10',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: '#FF7C10',
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
    backgroundColor: '#546EA1',
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
    backgroundColor: '#FF7C10',
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
