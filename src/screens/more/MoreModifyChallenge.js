import { useRoute } from '@react-navigation/native';
import React, { memo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPutModifyChallengeVideo } from '../../api/RestAPI';
import { navName } from '../../common/constants/navName';
import Checkbox from '../../components/Checkbox';
import CustomSwitch from '../../components/CustomSwitch';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';

function MoreModifyChallenge() {
  let imageHeight;
  const { width } = useWindowDimensions();
  const route = useRoute();
  const { videoIdx, videoTitle, videoContents, thumbPath } = route.params;
  const [isVideoPublic, setIsVideoPublic] = useState(false);
  const [title, setTitle] = useState(videoTitle);
  const [contents, setContents] = useState(videoContents);
  const [isChecked, setIsChecked] = useState(false);
  const trlRef = useRef({ current: { disabled: false } });

  if (width <= 480) {
    imageHeight = 202;
  } else {
    const aspectRatio = 16 / 9;
    imageHeight = width / aspectRatio;
  }

  const modifyChallenge = async () => {
    try {
      if (trlRef.current.disabled) return; // 이미 스로틀링 중이면 함수 종료
      trlRef.current.disabled = true; // 스로틀링 시작

      const data = {
        videoIdx,
        title,
        contents,
        showYn: isVideoPublic ? 'Y' : 'N', // Y값 혹은 N값 전달
      };

      const response = await apiPutModifyChallengeVideo(data);

      NavigationService.navigate(navName.moreActiveHistory);
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false; // 스로틀링 종료
    }
  };

  return (
    <DismissKeyboard>
      <SafeAreaView style={{ flex: 1 }}>
        <Header />

        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <Image
              source={{
                uri: thumbPath,
              }}
              style={{
                width: '100%',
                height: imageHeight,
              }}
            />

            <View style={styles.contentWrapper}>
              <SPInput
                title="제목"
                placeholder="훈련 제목을 입력하세요"
                value={title}
                onChangeText={setTitle}
              />

              <SPInput
                title="내용"
                placeholder="훈련에 대한 내용을 입력하세요"
                value={contents}
                onChangeText={setContents}
                numberOfLines={5}
              />

              <View style={styles.buttonSwitch}>
                <Text
                  style={[
                    fontStyles.fontSize18_Semibold,
                    {
                      color: COLORS.black,
                    },
                  ]}>
                  훈련영상 공개
                </Text>
                <CustomSwitch
                  value={isVideoPublic}
                  onValueChange={setIsVideoPublic}
                />
              </View>

              <View>
                <Checkbox
                  label="주의사항 동의"
                  labelStyle={styles.lableStyle}
                  selected={isChecked}
                  onPress={() => {
                    setIsChecked(!isChecked);
                  }}
                />
                <View style={styles.termWrapper}>
                  <Text style={styles.termText}>
                    1. 주제와 관련 없는 영상이라고 확인되면, 삭제될 수 있으며
                    영상의 종류에 따라 페널티를 부과할 수 있어요.
                  </Text>
                  <Text style={styles.termText}>
                    2. 저작권, 초상권 등에 위배되는 행위가 발견된 경우, 사전
                    통보 없이 삭제될 수 있으며 향후 법적 책임 또한 물을 수
                    있어요.
                  </Text>
                  <Text style={styles.termText}>
                    3. 다른 사용자가 올린 영상을 허가 없이 무단으로 활용(상업적
                    활용 및 AI 학습 등) 하면 안 돼요.
                  </Text>
                  <Text style={styles.termText}>
                    4. 등록된 영상의 검토 기간은 최대 7일까지 소요될 수가
                    있어요. (최대한 빨리 검토가 이루어지도록 노력할게요.)
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <PrimaryButton
            text="저장"
            onPress={modifyChallenge}
            disabled={!isChecked}
            buttonStyle={styles.submitButton}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(MoreModifyChallenge);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    rowGap: 16,
  },
  submitButton: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  content: {
    rowGap: 24,
  },
  contentWrapper: {
    rowGap: 16,
    paddingHorizontal: 16,
  },
  buttonSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  lableStyle: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.labelNormal,
  },
  termWrapper: {
    backgroundColor: COLORS.peach,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    rowGap: 16,
  },
  termText: {
    ...fontStyles.fontSize14_Regular,
    lineHeight: 22,
    color: COLORS.labelNeutral,
    letterSpacing: 0.2,
  },
});
