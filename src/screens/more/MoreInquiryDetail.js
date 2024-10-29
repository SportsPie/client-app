import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  StatusBar,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import moment from 'moment';
import { PROGRESS_STATUS } from '../../common/constants/progressStatus';
import Header from '../../components/header';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { SPSvgs } from '../../assets/svg';
import Divider from '../../components/Divider';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { handleError } from '../../utils/HandleError';
import { apiGetQnaDetail } from '../../api/RestAPI';
import { useDispatch } from 'react-redux';
import { moreInquiryListAction } from '../../redux/reducers/list/moreInquiryListSlice';
import SPIcons from '../../assets/icon';
import Carousel from 'react-native-snap-carousel';
import { ACTIVE_OPACITY } from '../../common/constants/constants';
import Swiper from 'react-native-swiper';

function CarouselSection({ data, onClick }) {
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = 64;
  const itemHeight = 64;
  const itemGap = 8;
  const list = [...data];

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={ACTIVE_OPACITY}
      onPress={e => {
        e.stopPropagation();
        if (onClick) onClick(index);
      }}>
      <Image
        source={{ uri: item.fileUrl }}
        style={{
          width: itemWidth,
          height: itemHeight,
          borderRadius: 12,
          marginRight: itemGap,
        }}
      />
    </TouchableOpacity>
  );
  return (
    <Carousel
      sliderWidth={screenWidth}
      itemWidth={itemWidth + itemGap}
      data={list}
      renderItem={renderItem}
      activeSlideAlignment="start"
      inactiveSlideScale={1}
      inactiveSlideOpacity={1}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      slideStyle={{ paddingRight: 8 }}
      vertical={false} // 수직 슬라이드 비활성화
    />
  );
}

function MoreInquiryDetail() {
  const dispatch = useDispatch();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [inquiryDetail, setInquiryDetail] = useState(null);
  const [imageModalShow, setImageModalShow] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const { qnaIdx } = route.params;
  const getQnaDetail = async () => {
    try {
      const response = await apiGetQnaDetail(qnaIdx);
      setInquiryDetail(response.data.data);
      dispatch(
        moreInquiryListAction.modifyItem({
          idxName: 'qnaIdx',
          idx: response.data.data.qnaIdx,
          item: response.data.data,
        }),
      );
    } catch (error) {
      handleError(error);
    }
  };

  const openImageModal = index => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(COLORS.black);
    }
    setSelectedImageIndex(index);
    setImageModalShow(true);
  };

  const closeImageModal = () => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(COLORS.white);
    }
    setImageModalShow(false);
  };

  useFocusEffect(
    useCallback(() => {
      getQnaDetail();
    }, []),
  );

  const renderHeader = useMemo(() => {
    return (
      <Header
        title="내 문의 상세"
        rightContent={
          PROGRESS_STATUS?.[inquiryDetail?.qnaState]?.value !== 'COMPLETE' ? (
            <Pressable
              style={{ padding: 10 }}
              onPress={() => {
                NavigationService.navigate(navName.moreInquiryRegist, {
                  inquiryData: inquiryDetail,
                });
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#313779',
                  lineHeight: 24,
                  letterSpacing: -0.091,
                }}>
                수정
              </Text>
            </Pressable>
          ) : null
        }
      />
    );
  }, [inquiryDetail]);

  const statusTextValue = useMemo(() => {
    switch (inquiryDetail?.qnaState) {
      case PROGRESS_STATUS?.COMPLETE?.value:
        return '답변완료';

      case PROGRESS_STATUS?.WAIT.value:
        return '답변대기';

      default:
        return PROGRESS_STATUS?.[inquiryDetail?.qnaState]?.value ?? '';
    }
  }, [inquiryDetail?.qnaState]);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={{ rowGap: 8, paddingHorizontal: 16 }}>
          <View style={styles.dateWrapper}>
            <Text style={styles.timeText}>
              {moment(inquiryDetail?.regDate)?.format('YYYY.MM.DD')}
            </Text>
            <View style={styles.statusWrapperBox}>
              <Text
                style={[
                  styles.statusWrapper,
                  {
                    backgroundColor:
                      PROGRESS_STATUS?.[inquiryDetail?.qnaState]?.value ===
                      'WAIT'
                        ? COLORS.peach
                        : `${COLORS.darkBlue}10`,
                    color:
                      PROGRESS_STATUS?.[inquiryDetail?.qnaState]?.value ===
                      'WAIT'
                        ? COLORS.orange
                        : COLORS.darkBlue,
                  },
                ]}>
                {statusTextValue}
              </Text>
            </View>
          </View>

          <Text style={styles.titleText}>{inquiryDetail?.title}</Text>
        </View>

        <View
          style={{
            borderWidth: 0.5,
            borderColor: 'rgba(135, 141, 150, 0.22)',
          }}
        />

        <View style={styles.itemWrapper}>
          <Text style={styles.contentText}>{inquiryDetail?.question}</Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <CarouselSection
            data={inquiryDetail?.files || []}
            onClick={openImageModal}
          />
        </View>

        {inquiryDetail?.answer && (
          <View>
            <View
              style={{
                borderWidth: 0.5,
                borderColor: 'rgba(135, 141, 150, 0.22)',
              }}
            />
            <View style={styles.asnwerWrapper}>
              <SPSvgs.LetterA />
              <Text style={styles.contentText}>{inquiryDetail?.answer}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <Modal
        animationType="fade"
        transparent
        visible={imageModalShow}
        onRequestClose={closeImageModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.black }}>
          <View style={{ paddingTop: insets.top }}>
            <TouchableOpacity
              onPress={closeImageModal}
              style={{
                width: '100%',
                height: 60,
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}>
              <Image
                source={SPIcons.icNavCancleWhite}
                style={[{ height: 28, width: 28 }]}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.searchContainer} />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Swiper
              loop={false}
              index={selectedImageIndex}
              showsPagination={false}>
              {inquiryDetail?.files.map((imageItem, index) => (
                <View key={imageItem.fileUrl} style={{ flex: 1 }}>
                  <Image
                    source={{ uri: imageItem.fileUrl }}
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
    </SafeAreaView>
  );
}

export default memo(MoreInquiryDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    rowGap: 16,
    paddingTop: 16,
  },
  dateWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusWrapperBox: {
    minWidth: 59,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusWrapper: {
    ...fontStyles.fontSize12_Semibold,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  contentText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNeutral,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  itemWrapper: {
    paddingHorizontal: 16,
    rowGap: 8,
  },
  asnwerWrapper: {
    flexGrow: 1,
    height: '100%',
    paddingTop: 16,
    paddingHorizontal: 16,
    rowGap: 8,
    backgroundColor: '#FFF4EE',
  },
  timeText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.3,
  },
  titleText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.labelNormal,
    lineHeight: 24,
  },
});
