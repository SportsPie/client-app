import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  Linking,
  Image,
  Dimensions,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import YouTube from 'react-native-youtube-iframe';
import Carousel from 'react-native-snap-carousel';
import Header from '../../components/header';
import Utils from '../../utils/Utils';
import { SPSvgs } from '../../assets/svg';
import SPIcons from '../../assets/icon';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';

const Tab = createMaterialTopTabNavigator();

function TournamentSketch({ route }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="대회 스케치" />
      <Text style={styles.trnName}>{route?.params?.tournamentName ?? '-'}</Text>
      <Tab.Navigator
        screenOptions={{ lazy: true }}
        sceneContainerStyle={{
          backgroundColor: COLORS.white,
        }}
        tabBar={TournamentSketchTab}>
        <Tab.Screen name="동영상" component={TournamentSketchVideo} />
        <Tab.Screen name="사진" component={TournamentSketchPhoto} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default TournamentSketch;

function TournamentSketchTab(props) {
  const { state, navigation } = props;
  return (
    <View style={styles.switch}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <TouchableOpacity
            key={route?.key}
            style={[styles.toggle, isFocused && styles.activeToggle]}
            onPress={onPress}>
            <Text
              style={[styles.toggleText, isFocused && styles.activeToggleText]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TournamentSketchVideo() {
  return (
    <FlatList
      data={tempSketchVideoData}
      ListEmptyComponent={
        <View style={styles.emptyListView}>
          <Text
            style={
              styles.emptyText
            }>{`동영상이 업로드 될 예정입니다.\n잠시만 기다려 주세요.`}</Text>
        </View>
      }
      keyExtractor={(item, idx) => `${item.name}_${idx}`}
      contentContainerStyle={styles.videoContentContainer}
      renderItem={({ item }) => (
        <>
          <View style={styles.videoContent}>
            <YouTube
              videoId={Utils.getYoutubeVideoId(item.youtubeUrl)}
              webViewStyle={{ aspectRatio: 16 / 9 }}
            />
            <Pressable
              style={styles.videoLink}
              onPress={() => Linking.openURL(item.youtubeUrl)}
            />
          </View>
          <Text style={styles.videoName}>{item.name}</Text>
        </>
      )}
      ListFooterComponent={<View style={{ height: 16 }} />}
    />
  );
}

function TournamentSketchPhoto() {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [pressedPhotoIndex, setPressedPhotoIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const openPhotoModal = () => setShowPhotoModal(true);
  const openPressedPhotoModal = index => {
    setPressedPhotoIndex(index);
    setCurrentPhotoIndex(index);
    openPhotoModal();
  };
  const closePhotoModal = () => setShowPhotoModal(false);

  const windowWidth = Dimensions.get('window').width;
  const imgHeight = (windowWidth - 8) / 3;

  const tempPressFn = () => Alert.alert('', 'tempFn');
  return (
    <>
      <FlatList
        data={tempSketchPhotoData}
        ListEmptyComponent={
          <View style={styles.emptyListView}>
            <Text
              style={
                styles.emptyText
              }>{`사진이 업로드 될 예정입니다.\n잠시만 기다려 주세요.`}</Text>
          </View>
        }
        keyExtractor={(item, idx) => `${item.imgUrl}_${idx}`}
        contentContainerStyle={{
          flexGrow: 1,
          rowGap: 4,
        }}
        columnWrapperStyle={{ columnGap: 4 }}
        numColumns={3}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => openPressedPhotoModal(index)}>
            <Image
              source={{ uri: item.imgUrl }}
              style={{ aspectRatio: 1, height: imgHeight }}
            />
          </Pressable>
        )}
      />

      <Modal
        animationType="fade"
        visible={showPhotoModal}
        onRequestClose={closePhotoModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.black }}>
          <View style={styles.photoModalHeader}>
            <Pressable onPress={closePhotoModal} style={styles.padding10}>
              <Image
                source={SPIcons.icArrowLeftWhite}
                style={{ width: 28, height: 28 }}
              />
            </Pressable>
            <Text style={styles.photoModalHeaderTitle}>대회 스케치</Text>
            <Pressable onPress={tempPressFn} style={styles.padding10}>
              <SPSvgs.Download width={28} height={28} fill={COLORS.white} />
            </Pressable>
          </View>
          <View style={styles.photoCarouselWrapper}>
            <Carousel
              data={tempSketchPhotoData}
              renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                  <Image
                    source={{ uri: item.imgUrl }}
                    style={styles.photoCarouselImg}
                  />
                </View>
              )}
              sliderWidth={windowWidth}
              itemWidth={windowWidth}
              firstItem={pressedPhotoIndex}
              loop
              inactiveSlideScale={1}
              onSnapToItem={index => setCurrentPhotoIndex(index)}
            />
          </View>
          <View style={styles.photoLikeCntBox}>
            <Image source={SPIcons.icHeart} style={{ width: 18, height: 18 }} />
            <Text style={styles.photoLikeCnt}>
              {tempSketchPhotoData[currentPhotoIndex].likeCnt}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trnName: {
    padding: 16,
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  switch: {
    flexDirection: 'row',
    columnGap: 4,
    padding: 4,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFE1D2',
  },
  toggle: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
  },
  activeToggle: {
    backgroundColor: COLORS.white,
  },
  toggleText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.disableText,
    letterSpacing: 0.203,
  },
  activeToggleText: {
    color: COLORS.orange,
  },
  emptyListView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...fontStyles.fontSize14_Regular,
    color: 'rgba(46,49,53,0.60)',
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  videoContentContainer: {
    flexGrow: 1,
    rowGap: 16,
    paddingHorizontal: 16,
  },
  videoContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoLink: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoName: {
    padding: 8,
    ...fontStyles.fontSize16_Medium,
    color: COLORS.labelNormal,
    letterSpacing: 0.091,
  },
  photoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 4,
  },
  padding10: { padding: 10 },
  photoModalHeaderTitle: {
    flex: 1,
    ...fontStyles.fontSize24_Bold,
    color: COLORS.white,
    letterSpacing: -0.552,
  },
  photoCarouselWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCarouselImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  photoLikeCntBox: {
    position: 'absolute',
    bottom: 19,
    right: 8,
    flexDirection: 'row',
    columnGap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(20, 22, 48, 0.48)',
    backgroundColor: 'rgba(10, 11, 24, 0.48)',
  },
  photoLikeCnt: {
    ...fontStyles.fontSize11_Semibold,
    color: 'rgba(225, 227, 230, 0.80)',
    letterSpacing: 0.342,
  },
});

const tempSketchVideoData = [
  {
    name: '나랑 축구파이 할래?',
    youtubeUrl: 'https://youtu.be/crjZchlfC8M?si=5v_uDu_z_qmReZ77',
  },
  {
    name: '나랑 축구파이 할래? 30초ver',
    youtubeUrl: 'https://youtu.be/xy4ZlOHbl0M?si=_u_Lwx5ovFFvp-qY',
  },
  {
    name: '나랑 축구파이 할래?',
    youtubeUrl: 'https://youtu.be/crjZchlfC8M?si=5v_uDu_z_qmReZ77',
  },
  {
    name: '나랑 축구파이 할래? 30초ver',
    youtubeUrl: 'https://youtu.be/xy4ZlOHbl0M?si=_u_Lwx5ovFFvp-qY',
  },
];
const tempSketchPhotoData = [
  {
    likeCnt: 0,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
  {
    likeCnt: 10,
    imgUrl: 'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
  },
  {
    likeCnt: 9,
    imgUrl:
      'https://img1.yna.co.kr/etc/graphic/YH/2018/08/23/GYH2018082300340004400_P4.jpg',
  },
  {
    likeCnt: 5,
    imgUrl: 'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
  },
  {
    likeCnt: 7,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
  {
    likeCnt: 226,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
  {
    likeCnt: 0,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
  {
    likeCnt: 0,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
  {
    likeCnt: 10,
    imgUrl: 'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
  },
  {
    likeCnt: 9,
    imgUrl:
      'https://img1.yna.co.kr/etc/graphic/YH/2018/08/23/GYH2018082300340004400_P4.jpg',
  },
  {
    likeCnt: 5,
    imgUrl: 'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
  },
  {
    likeCnt: 7,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
  {
    likeCnt: 226,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
  {
    likeCnt: 0,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
  {
    likeCnt: 9,
    imgUrl:
      'https://img1.yna.co.kr/etc/graphic/YH/2018/08/23/GYH2018082300340004400_P4.jpg',
  },
  {
    likeCnt: 5,
    imgUrl: 'https://www.newsroad.co.kr/news/photo/202309/25466_36586_2220.jpg',
  },
  {
    likeCnt: 7,
    imgUrl:
      'https://sportspie-pub.s3.ap-northeast-2.amazonaws.com/tournament/00000006/20240703151609457_NISI20220412_0000972545_web_%281%29.jpg',
  },
];
