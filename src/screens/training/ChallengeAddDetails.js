import React, { memo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Checkbox from '../../components/Checkbox';
import CustomSwitch from '../../components/CustomSwitch';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { handleError } from '../../utils/HandleError';
import { AccessDeniedException } from '../../common/exceptions';
import SPVideo from '../../components/SPVideo';
import Utils from '../../utils/Utils';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function ChallengeAddDetails({ route }) {
  const { width } = useWindowDimensions();
  let imageHeight;

  if (width <= 480) {
    imageHeight = 203;
  } else {
    const aspectRatio = 16 / 9;
    imageHeight = width / aspectRatio;
  }

  // 전달 파라미터 > 접근 유효성 검증
  const { videoURL, parentIdx, videoIdx, videoName, videoType } =
    route?.params || {
      videoURL: '',
      videoIdx: '',
      parentIdx: '',
      videoName: '',
      videoType: '',
    };
  if (!videoURL || !parentIdx || !videoIdx) {
    handleError(new AccessDeniedException('잘못된 접근입니다.'));
  }

  // [ ref ]
  const descRef = useRef();

  // [ state ] 입력
  const [title, setTitle] = useState(undefined); // 제목
  const [description, setDescription] = useState(undefined); // 내용
  const [isOpenVideo, setIsOpenVideo] = useState(false); // 공개 유무
  const [isAgreed, setIsAgreed] = useState(false); // 동의 유무

  // [ util ] 동영상 공개 유무
  const toggleSwitch = () => setIsOpenVideo(prev => !prev);

  // [ util ] 동영상 업로드 진행 이동
  const moveToTrainingUpload = () => {
    // 제목 확인
    if (!title || !title.trim()) {
      Utils.openModal({ body: '제목을 확인해주세요.' });
      return;
    }

    if (title.length > 15) {
      Utils.openModal({ body: '제목은 최대 15자까지 입력할 수 있습니다.' });
      return;
    }

    // 내용 확인
    if (!description || !description.trim()) {
      Utils.openModal({ body: '내용을 확인해주세요.' });
      return;
    }

    // 동의유무 확인
    if (!isAgreed) {
      Utils.openModal({ body: '주의사항을 확인해주세요.' });
      return;
    }

    NavigationService.replace(navName.challengeRegistering, {
      videoURL,
      parentIdx,
      videoIdx,
      videoName,
      videoType,
      title,
      description,
      isOpenVideo,
      isAgreed,
    });
  };

  // [ return ]
  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          padding: 0,
          margin: 0,
        }}>
        <SafeAreaView style={styles.container}>
          <Header title="세부정보 추가" />

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* 동영상 */}
            <SPVideo
              width="100%"
              height={imageHeight}
              source={videoURL}
              repeat={true}
              disablePlayPause={true}
              disableBack={true}
            />

            <View
              style={{
                rowGap: 24,
                paddingHorizontal: 16,
                marginBottom: 24,
              }}>
              <SPInput
                placeholder="훈련 제목을 입력하세요"
                title="제목"
                value={title}
                onChange={e => setTitle(e.nativeEvent.text)}
                onBlur={e => descRef.current.focus()}
                maxLength={15}
                bottomTextStyle={{ textAlign: 'right' }}
                bottomText={`${title !== undefined ? title.length : 0} / 15`}
                returnKeyType="done"
                error={title !== undefined && title.trim() === ''}
              />

              <SPInput
                inputRef={descRef}
                placeholder="훈련에 대한 내용을 입력하세요"
                title="내용"
                numberOfLines={5}
                value={description}
                onChange={e => setDescription(e.nativeEvent.text)}
                maxLength={300}
                bottomTextStyle={{ textAlign: 'right' }}
                bottomText={`${
                  description !== undefined ? description.length : 0
                } / 300`}
                error={description !== undefined && description.trim() === ''}
              />

              {/* 영상 공개 */}
              <View style={styles.videoReleaseSwitchWrapper}>
                <Text style={styles.videoReleaseSwitchText}>영상 공개</Text>

                <CustomSwitch
                  value={isOpenVideo}
                  onValueChange={toggleSwitch}
                  style={styles.customSwitch}
                />
              </View>

              {/* Agree to precautions */}
              <View style={styles.precautionsWrapper}>
                <Checkbox
                  label="주의사항 동의"
                  selected={isAgreed}
                  onPress={() => setIsAgreed(prev => !prev)}
                  labelStyle={styles.customLabelStyle}
                />
                <View style={styles.precautionsTextWrapper}>
                  <View style={styles.precautionsTextBox}>
                    <Text style={styles.precautionsText}>1.</Text>
                    <Text style={[styles.precautionsText, { flex: 1 }]}>
                      주제와 관련 없는 영상이라고 확인되면, 삭제될 수 있으며
                      영상의 종류에 따라 페널티를 부과할 수 있어요.
                    </Text>
                  </View>
                  <View style={styles.precautionsTextBox}>
                    <Text style={styles.precautionsText}>2.</Text>
                    <Text style={[styles.precautionsText, { flex: 1 }]}>
                      저작권, 초상권 등에 위배되는 행위가 발견된 경우, 사전 통보
                      없이 삭제될 수 있으며 향후 법적 책임 또한 물을 수 있어요.
                    </Text>
                  </View>
                  <View style={styles.precautionsTextBox}>
                    <Text style={styles.precautionsText}>3.</Text>
                    <Text style={[styles.precautionsText, { flex: 1 }]}>
                      다른 사용자가 올린 영상을 허가 없이 무단으로 활용(상업적
                      활용 및 AI 학습 등) 하면 안 돼요.
                    </Text>
                  </View>
                  <View style={styles.precautionsTextBox}>
                    <Text style={styles.precautionsText}>4.</Text>
                    <Text style={[styles.precautionsText, { flex: 1 }]}>
                      등록된 영상의 검토 기간은 최대 7일까지 소요될 수가 있어요.
                      (최대한 빨리 검토가 이루어지도록 노력할게요.)
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* 영상 등록중 페이지로 이동 */}
          <PrimaryButton
            onPress={moveToTrainingUpload}
            text="등록"
            buttonStyle={styles.submitButton}
            disabled={
              !title ||
              !title.trim() ||
              title.length > 15 ||
              !description ||
              !description.trim() ||
              !isAgreed
            }
          />
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

export default memo(ChallengeAddDetails);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // flex: 1,
    rowGap: 24,
  },
  image: {
    width: '100%',
  },
  videoReleaseSwitchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoReleaseSwitchText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#000',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  customSwitch: {
    transform: [{ scaleX: 0.65 }, { scaleY: 0.65 }],
  },
  precautionsWrapper: {
    rowGap: 8,
  },
  precautionsTextWrapper: {
    flexDirection: 'column',
    gap: 14,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFE1D2',
  },
  customLabelStyle: {
    fontSize: 16,
    fontWeight: 400,
    color: '#1A1C1E',

    letterSpacing: 0.091,
  },
  precautionsTextBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
    flexWrap: 'wrap',
  },
  precautionsText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  submitButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
});
