import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { SPSvgs } from '../../assets/svg';
import SPIcons from '../../assets/icon';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { useSelector } from 'react-redux';
import { TOURNAMENT_CONTENT_TYPE } from '../../common/constants/TournamentContentType';
import {
  apiGetTournamentContentList,
  apiPatchTournamentContentLike,
  apiPatchTournamentContentUnLike,
} from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import SPLoading from '../../components/SPLoading';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Utils from '../../utils/Utils';
import { DefaultToast } from '../../components/SPToast';

function TournamentSketchPicture({ route }) {
  /**
   * state
   */
  const insets = useSafeAreaInsets();
  const trlRef = useRef({ current: { disabled: false } });
  const flatListRef = useRef();
  const imageFlatListRef = useRef();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [pressedPhotoIndex, setPressedPhotoIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const tournamentIdx = route?.params?.tournamentIdx;

  const [page, setPage] = useState(1);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pictureList, setPictureList] = useState([]);

  const pageSize = 100;

  /**
   * api
   */
  const getSketchPictureList = async () => {
    const params = {
      tournamentIdx,
      userIdx,
      contentType: TOURNAMENT_CONTENT_TYPE.PICTURE,
      size: pageSize,
      page,
    };
    try {
      const { data } = await apiGetTournamentContentList(params);
      setTotalCnt(data.data.totalCnt);
      setIsLast(data.data.isLast);
      if (page === 1) {
        setPictureList(data.data.list);
      } else {
        setPictureList(prev => [...prev, ...data.data.list]);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setRefreshing(false);
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  };

  const changeLike = async (isLike, idx) => {
    try {
      if (!isLogin) return;
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const list = pictureList;
      if (isLike) {
        await apiPatchTournamentContentUnLike(idx);
        const findItem = list.find(item => item.contentsIdx === idx);
        findItem.cntLike -= 1;
        findItem.isLike = false;
        setPictureList(prev => [...prev]);
      } else {
        await apiPatchTournamentContentLike(idx);
        const findItem = list.find(item => item.contentsIdx === idx);
        findItem.cntLike += 1;
        findItem.isLike = true;
        setPictureList(prev => [...prev]);
      }
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const fileDownLoad = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const file = pictureList?.[currentPhotoIndex];
      if (file) await Utils.imageFileDownLoad(file.filePath, file.fileName);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const openPhotoModal = () => {
    setShowPhotoModal(true);
  };

  const openPressedPhotoModal = index => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(COLORS.black);
    }
    setPressedPhotoIndex(index);
    setCurrentPhotoIndex(index);
    openPhotoModal();
  };
  const closePhotoModal = () => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(COLORS.white);
    }
    setShowPhotoModal(false);
  };
  const getItemLayout = (data, index) => ({
    length: SCREEN_WIDTH, // 각 아이템의 너비
    offset: SCREEN_WIDTH * index, // 각 아이템까지의 오프셋
    index, // 인덱스
  });

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentPhotoIndex(viewableItems[0].index); // 현재 보여지는 아이템의 인덱스 업데이트
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const windowWidth = Dimensions.get('window').width;
  const imgHeight = (windowWidth - 8) / 3;

  const loadMoreProjects = () => {
    if (!isLast && pictureList?.length > 0) {
      setTimeout(() => {
        setPage(prev => prev + 1);
      }, 0);
    }
  };

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setIsLast(false);
    setPage(1);
    setPictureList([]);
    setRefreshing(true);
  }, []);

  /**
   * useEffect
   */
  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    if (refreshing || (!refreshing && page > 1)) {
      getSketchPictureList();
    }
  }, [page, refreshing]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          key={loading ? 'loading' : 'loaded'}
          data={pictureList}
          onEndReachedThreshold={0.5}
          keyExtractor={(item, idx) => item.contentsIdx}
          contentContainerStyle={[
            { rowGap: 4 },
            pictureList?.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreProjects}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          columnWrapperStyle={{ columnGap: 4 }}
          numColumns={3}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => openPressedPhotoModal(index)}>
              <Image
                source={{ uri: item.filePath }}
                style={{ aspectRatio: 1, height: imgHeight }}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyListView}>
                <Text
                  style={
                    styles.emptyText
                  }>{`사진이 업로드 될 예정입니다.\n잠시만 기다려 주세요.`}</Text>
              </View>
            ) : (
              <SPLoading />
            )
          }
        />
      </View>

      <Modal
        animationType="fade"
        visible={showPhotoModal}
        onRequestClose={closePhotoModal}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: COLORS.black,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}>
          <DefaultToast />
          <View style={styles.photoModalHeader}>
            <Pressable onPress={closePhotoModal} style={styles.padding10}>
              <Image
                source={SPIcons.icArrowLeftWhite}
                style={{ width: 28, height: 28 }}
              />
            </Pressable>
            <Text style={styles.photoModalHeaderTitle}>대회 스케치</Text>
            <Pressable onPress={fileDownLoad} style={styles.padding10}>
              <SPSvgs.Download width={28} height={28} fill={COLORS.white} />
            </Pressable>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FlatList
              ref={imageFlatListRef}
              key={showPhotoModal ? 'show' : 'hide'}
              data={pictureList}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={pressedPhotoIndex}
              pagingEnabled
              onEndReached={loadMoreProjects}
              onEndReachedThreshold={0.5}
              getItemLayout={getItemLayout}
              keyExtractor={(item, idx) => item.contentsIdx}
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
              renderItem={({ item: imageItem }) => {
                return (
                  <View
                    key={imageItem.contentsIdx}
                    style={{
                      flex: 1,
                      width: SCREEN_WIDTH,
                      height: '100%',
                    }}>
                    <View style={{ flex: 1 }}>
                      <Image
                        source={{ uri: imageItem.filePath }}
                        style={{
                          width: '100%',
                          height: '100%',
                          resizeMode: 'contain',
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        paddingVertical: 11,
                        marginRight: 8,
                        marginBottom: 8,
                      }}>
                      <TouchableOpacity
                        activeOpacity={1}
                        hitSlop={20}
                        onPress={() => {
                          changeLike(imageItem.isLike, imageItem.contentsIdx);
                        }}
                        style={styles.photoLikeCntBox}>
                        {imageItem.isLike ? (
                          <SPSvgs.HeartFill
                            width={18}
                            height={18}
                            fill={COLORS.white}
                          />
                        ) : (
                          <SPSvgs.HeartOutline
                            width={18}
                            height={18}
                            fill={COLORS.white}
                          />
                        )}
                        <Text style={styles.photoLikeCnt}>
                          {Utils.changeNumberComma(imageItem?.cntLike || 0)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export default memo(TournamentSketchPicture);

const styles = StyleSheet.create({
  emptyListView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...fontStyles.fontSize16_Regular,
    color: 'rgba(46,49,53,0.60)',
    letterSpacing: 0.203,
    textAlign: 'center',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(20, 22, 48, 0.48)',
    bakcgroundColor: 'rgba(10, 11, 24, 0.48)',
  },
  photoLikeCnt: {
    ...fontStyles.fontSize11_Semibold,
    color: 'rgba(225, 227, 230, 0.80)',
    letterSpacing: 0.342,
  },
});
