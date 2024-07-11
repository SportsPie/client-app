import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { COLORS } from '../styles/colors';
import Utils from '../utils/Utils';
import fontStyles from '../styles/fontStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleError } from '../utils/HandleError';
import GeoLocationUtils from '../utils/GeoLocationUtils';
import { apiGetHomeInit, apiGetHomeOpen } from '../api/RestAPI';
import { useFocusEffect } from '@react-navigation/native';
import NavigationService from '../navigation/NavigationService';
import { navName } from '../common/constants/navName';

const MainPopup = forwardRef(({ data }, ref) => {
  const [isVisivle, setIsVisivle] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const checkPopupStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('popupDismissed');

        if (value === 'true') {
          const dismissedDate = await AsyncStorage.getItem('dismissedDate');
          const dismissedDateString = new Date(dismissedDate).toDateString();
          const todayDateString = new Date().toDateString();

          if (dismissedDateString === todayDateString) {
            setIsVisivle(false);
          } else {
            setIsVisivle(true);
          }
        } else {
          setIsVisivle(true);
        }
      } catch (error) {
        handleError(error);
      }
    };

    checkPopupStatus();
  }, []);

  const show = useCallback(() => {
    setIsVisivle(true);
  }, []);

  const hide = useCallback(async () => {
    setIsVisivle(false); // 팝업 숨기기

    const today = new Date().toDateString();
    try {
      // 'popupDismissed' 키의 값을 'true'로 설정하여 팝업이 오늘 하루 동안 다시 나타나지 않도록 합니다.
      await AsyncStorage.setItem('popupDismissed', 'true');
      // 'dismissedDate' 키에 오늘 날짜를 저장합니다.
      await AsyncStorage.setItem('dismissedDate', today);
    } catch (error) {
      handleError(error);
    }
  }, []);
  useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

  const close = useCallback(async () => {
    try {
      setIsVisivle(false); // Hide the popup
    } catch (error) {
      handleError(error);
    }
  }, []);

  const handleImagePress = (boardType, linkUrl) => {
    // 각 boardType에 따른 페이지 이동 로직 구현
    switch (boardType) {
      case 'POPUP_WEBVIEW':
        if (linkUrl) {
          // If linkUrl exists, open WebView
          Utils.openOrMoveUrl(linkUrl);
        }
        break;
      case 'POPUP_MATCH':
        // 매치 페이지로 이동
        ref?.current?.hide();
        NavigationService.navigate(navName.matchingSchedule);
        break;
      case 'POPUP_TRAINING':
        // 트레이닝 페이지로 이동
        ref?.current?.hide();
        NavigationService.navigate(navName.training);
        break;
      default:
        break;
    }
  };
  return (
    <Modal transparent visible={isVisivle}>
      <View style={styles.container}>
        <View style={styles.content}>
          <ScrollView
            onScroll={e => {
              const activeIndex = Math.floor(
                (e?.nativeEvent?.contentOffset?.x ?? 0) / (SCREEN_WIDTH - 32),
              );
              setCurrentIndex(activeIndex);
            }}
            scrollEventThrottle={16}
            bounces={false}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            horizontal>
            {data?.map(item => {
              return (
                <Pressable
                  key={item?.boardIdx}
                  onPress={() =>
                    handleImagePress(item?.boardType, item?.linkUrl)
                  }>
                  <Image
                    source={{
                      uri: item?.filePath,
                    }}
                    style={styles.image}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
          <View>
            <View style={styles.indicatorWrapper}>
              {data?.map((item, index) => {
                return (
                  <View
                    key={item?.boardIdx}
                    style={[
                      styles.indocator,
                      index === currentIndex && {
                        backgroundColor: COLORS.orange,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.buttonsSection}>
              <Pressable onPress={hide} style={styles.button}>
                <Text style={styles.buttonText}>오늘 그만 보기</Text>
              </Pressable>
              <Pressable onPress={close} style={styles.button}>
                <Text style={styles.buttonText}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default memo(MainPopup);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000061',
  },
  content: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_HEIGHT * 410) / 800,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: SCREEN_WIDTH - 32,
    height: '100%',
  },
  buttonsSection: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
  },
  buttonText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.labelNormal,
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  indocator: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: `${COLORS.orange}38`,
  },
  indicatorWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    columnGap: 8,
  },
});
