import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import { useDispatch, useSelector } from 'react-redux';
import {
  apiGetCommunityCommentList,
  apiGetCommunityDetail,
  apiGetCommunityOpenCommentList,
  apiGetCommunityOpenDetail,
  apiGetMyInfo,
  apiPatchCommunityLike,
  apiPatchCommunityUnLike,
  apiPostCommunityComment,
  apiPutCommunityComment,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { IS_YN } from '../../common/constants/isYN';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import Avatar from '../../components/Avatar';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPHeader from '../../components/SPHeader';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import SPLoading from '../../components/SPLoading';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import { SPToast } from '../../components/SPToast';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import AcademyJoinModal from './AcademyJoinModal';
import { academyCommunityCommentListAction } from '../../redux/reducers/list/academyCommunityCommentListSlice';
import { store } from '../../redux/store';
import { academyCommunityListAction } from '../../redux/reducers/list/academyCommunityListSlice';
import { navName } from '../../common/constants/navName';
import { moreCommunityListAction } from '../../redux/reducers/list/moreCommunityListSlice';
import ListEmptyView from '../../components/ListEmptyView';

// 커뮤니티 이미지 슬라이드
function CarouselSection({ data, openFileterModal, setSelectedImage }) {
  const screenWidth = Dimensions.get('window').width;
  const aspectRatio = 16 / 9; // 이미지의 원본 비율
  const minHeight = 328; // 최소 높이
  const calculatedHeight = screenWidth / aspectRatio; // 디바이스 크기에 비례하는 높이
  const dynamicHeight = Math.max(minHeight, calculatedHeight);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedImage(item.fileUrl);
        openFileterModal();
      }}>
      <Image
        source={{ uri: item.fileUrl }}
        style={[
          styles.image,
          styles.subBackgroundImage,
          { height: dynamicHeight },
        ]}
      />
    </TouchableOpacity>
  );
  return (
    <Carousel
      sliderWidth={screenWidth}
      itemWidth={screenWidth - 24}
      data={data}
      renderItem={renderItem}
      activeSlideAlignment="start"
      inactiveSlideScale={1}
      inactiveSlideOpacity={0.7}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      slideStyle={{ paddingRight: 8 }}
      vertical={false} // 수직 슬라이드 비활성화
    />
  );
}

function AcademyCommunityDetail({ route }) {
  /**
   * state
   */
  const listName = 'academyCommunityCommentList';
  const {
    page,
    list: commentList,
    refreshing,
    loading,
    isLast,
  } = useSelector(selector => selector[listName]);
  const dispatch = useDispatch();
  const noParamReset = route?.params?.noParamReset;
  const action = academyCommunityCommentListAction;

  const flatListRef = useRef();
  const insets = useSafeAreaInsets();

  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const academyIdx = route?.params.academyIdx;
  const contentsIdx = route?.params?.feedIdx || idx;

  const [userInfo, setUserInfo] = useState(null);

  const [isMine, setIsMine] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [feedDetail, setFeedDetail] = useState({});
  const [comment, setComment] = useState('');

  const [showOptionButton, setShowOptionButton] = useState(false);

  // list
  const [size, setSize] = useState(30);
  const [isFocus, setIsFocus] = useState(true);
  const [listCall, setListCall] = useState(false);

  // modal
  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [modifyCommentModalVisible, setModifyCommentModalVisible] =
    useState(false);
  const [isAdminFeed, setIsAdminFeed] = useState(false);
  const [isMyFeed, setIsMyFeed] = useState(false);
  const [isMyComment, setIsMyComment] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [changeEvent, setChangeEvent] = useState(false);
  const [selectedComment, setSelectedComment] = useState({});
  const [modifyComment, setModifyComment] = useState('');

  const [imageModalShow, setImageModalShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const trlRef = useRef({ current: { disabled: false } });
  const [keyboardAvoidingViewRefresh, setKeyboardAvoidingViewRefresh] =
    useState(false);

  /**
   * api
   */

  const getUserInfo = async () => {
    if (!isLogin) {
      setShowOptionButton(false);
      return;
    }
    try {
      const { data } = await apiGetMyInfo();
      if (
        academyIdx === data.data.academyIdx &&
        (data.data.academyAdmin || data.data.academyCreator)
      ) {
        setIsAdmin(true);
      }
      if (
        academyIdx === data.data.academyIdx &&
        (data.data.academyMember ||
          data.data.academyAdmin ||
          data.data.academyCreator)
      ) {
        setShowOptionButton(true);
      } else {
        setShowOptionButton(false);
      }
      if (data) {
        setUserInfo(data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getDetail = async () => {
    try {
      let response = null;
      if (isLogin) {
        response = await apiGetCommunityDetail(contentsIdx);
      } else {
        response = await apiGetCommunityOpenDetail(contentsIdx);
      }
      const detail = response?.data?.data;
      setFeedDetail(detail || {});

      if (detail) {
        setIsMyFeed(detail.isMine);
        setIsAdminFeed(detail.isAcademyCreator || detail.isAcademyAdmin);
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  const getCommentList = async () => {
    try {
      const params = {
        page,
        size,
      };
      let response = null;
      if (isLogin) {
        response = await apiGetCommunityCommentList(feedDetail.feedIdx, params);
      } else {
        response = await apiGetCommunityOpenCommentList(
          feedDetail.feedIdx,
          params,
        );
      }
      const data = response?.data;
      dispatch(action.setTotalCnt(data.data.totalCnt));
      dispatch(action.setIsLast(data.data.isLast));
      if (page === 1) {
        dispatch(action.setList(data.data.list));
      } else {
        const prevList = store.getState()[listName].list;
        dispatch(action.setList([...prevList, ...data.data.list]));
      }
      feedDetail.cntComment = data.data.totalCnt;
      dispatch(
        academyCommunityListAction.modifyItem({
          idxName: 'feedIdx',
          idx: feedDetail.feedIdx,
          item: feedDetail,
        }),
      );
      dispatch(
        moreCommunityListAction.modifyItem({
          idxName: 'feedIdx',
          idx: feedDetail.feedIdx,
          item: feedDetail,
        }),
      );
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
    dispatch(action.setRefreshing(false));
    dispatch(action.setLoading(false));
    setListCall(true);
  };

  const changeLike = async () => {
    if (!isLogin) {
      Utils.openModal({
        title: '로그인 필요',
        body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
        confirmEvent: MODAL_CLOSE_EVENT.login,
        cancelEvent: MODAL_CLOSE_EVENT.nothing,
      });
      return;
    }
    if (feedDetail.isLike) {
      await apiPatchCommunityUnLike(feedDetail.feedIdx);

      feedDetail.cntLike -= 1;
    } else {
      await apiPatchCommunityLike(feedDetail.feedIdx);

      feedDetail.cntLike += 1;
    }

    feedDetail.isLike = !feedDetail.isLike;
    setFeedDetail(prev => {
      return { ...prev };
    });
    dispatch(
      academyCommunityListAction.modifyItem({
        idxName: 'feedIdx',
        idx: feedDetail.feedIdx,
        item: feedDetail,
      }),
    );
    dispatch(
      moreCommunityListAction.modifyItem({
        idxName: 'feedIdx',
        idx: feedDetail.feedIdx,
        item: feedDetail,
      }),
    );
  };

  const [commentRegist, setCommentRegist] = useState(false);
  const registComment = async () => {
    setComment('');
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      if (!isLogin) {
        Utils.openModal({
          title: '로그인 필요',
          body: '로그인이 필요한 작업입니다. \n로그인 페이지로 이동하시겠습니까?',
          confirmEvent: MODAL_CLOSE_EVENT.login,
          cancelEvent: MODAL_CLOSE_EVENT.nothing,
        });
        return;
      }
      const params = {
        feedIdx: feedDetail.feedIdx,
        comment,
      };
      const { data } = await apiPostCommunityComment(params);
      feedDetail.cntComment += 1;
      setFeedDetail(prev => {
        return { ...prev };
      });
      Keyboard.dismiss();
      dispatch(
        academyCommunityListAction.modifyItem({
          idxName: 'feedIdx',
          idx: feedDetail.feedIdx,
          item: feedDetail,
        }),
      );
      dispatch(
        moreCommunityListAction.modifyItem({
          idxName: 'feedIdx',
          idx: feedDetail.feedIdx,
          item: feedDetail,
        }),
      );
      dispatch(action.refresh());
      setCommentRegist(true);
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  const editComment = async () => {
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const params = {
        commentIdx: selectedComment.commentIdx,
        comment: modifyComment,
      };
      const { data } = await apiPutCommunityComment(params);
      selectedComment.comment = modifyComment;
      dispatch(
        action.modifyItem({
          idxName: 'commentIdx',
          idx: selectedComment.commentIdx,
          item: selectedComment,
        }),
      );
      Keyboard.dismiss();
      closeModifyCommentModal();
      SPToast.show({ text: '댓글을 수정했어요' });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const openCommentModal = item => {
    setIsMyComment(item.isMine || item.userIdx === userInfo.userIdx);
    setSelectedComment(item);
    setCommentModalVisible(true);
  };
  const closeCommentModal = () => setCommentModalVisible(false);

  const openModifyCommentModal = () => {
    setModifyComment(selectedComment.comment);
    setModifyCommentModalVisible(true);
  };

  const closeModifyCommentModal = () => {
    setModifyCommentModalVisible(false);
  };

  const openImageModal = () => {
    setImageModalShow(true);
  };

  const closeImageModal = () => {
    setImageModalShow(false);
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        const prevPage = store.getState()[listName].page;
        dispatch(action.setPage(prevPage + 1));
      }
    }, 0);
  };

  const onRefresh = async noLoading => {
    dispatch(action.refresh(noLoading));
  };

  const onFocus = async () => {
    try {
      if (!noParamReset) {
        dispatch(action.reset());
        setIsFocus(true);
        setIsJoined(false);
        setSelectedComment({});
        setModifyComment({});
        setSelectedImage();
        NavigationService.replace(navName.academyCommunityDetail, {
          ...(route?.params || {}),
          noParamReset: true,
        });
        return;
      }
      await getUserInfo();
      await getDetail();
    } catch (error) {
      handleError(error);
    }
    setKeyboardAvoidingViewRefresh(prev => !prev);
    setIsFocus(false);
  };

  /**
   * useEffect
   */
  // useEffect(() => {
  //   onFocus();
  // }, [noParamReset]);
  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, [noParamReset]),
  );

  useEffect(() => {
    if (!isFocus && noParamReset) {
      getUserInfo();
    }
  }, [isJoined, noParamReset]);

  useEffect(() => {
    if (!isFocus && noParamReset) {
      onRefresh();
    }
  }, [isFocus, changeEvent, noParamReset]);

  useEffect(() => {
    if (noParamReset) {
      if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
        getCommentList();
      }
    }
  }, [page, isFocus, refreshing, noParamReset]);

  const renderDetail = () => {
    return (
      <View>
        <View style={styles.communityBox}>
          {/* 게시글 상단 정보 */}
          <View style={styles.communityRight}>
            {feedDetail.tagsKo?.map((item, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <View key={index} style={styles.communityTag}>
                  <Text style={styles.communityTagText}>#{item} </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.communityTitle}>
            <View style={styles.communityLeft}>
              <View style={styles.iconContainer}>
                {feedDetail.profilePath ? (
                  <Image
                    source={{ uri: feedDetail.profilePath }}
                    style={styles.icon}
                  />
                ) : (
                  <Image source={SPIcons.icPerson} style={styles.icon} />
                )}
                {feedDetail.isAcademyCreator && (
                  <Image
                    source={SPIcons.icSuperAdmin}
                    style={styles.overlayIcon}
                  />
                )}
                {!feedDetail.isAcademyCreator && feedDetail.isAcademyAdmin && (
                  <Image source={SPIcons.icAdmin} style={styles.overlayIcon} />
                )}
              </View>
              <View>
                <Text style={styles.name}>{feedDetail.userNickname}</Text>
                <Text style={styles.dateCreated}>
                  {moment(feedDetail.regDate).fromNow()}
                </Text>
              </View>
            </View>
          </View>

          {/* 내용 */}
          <View>
            <Text style={styles.communityText}>{feedDetail.contents}</Text>
          </View>
          {/* 이미지 슬라이드 */}
          {feedDetail.files && feedDetail.files.length > 0 && (
            <View style={{ overflow: 'hidden' }}>
              <CarouselSection
                data={feedDetail.files}
                openFileterModal={openImageModal}
                setSelectedImage={setSelectedImage}
              />
            </View>
          )}
          {/* 좋아요 */}
          <View style={styles.bottomBox}>
            <TouchableOpacity style={styles.bottomBtn} onPress={changeLike}>
              <View>
                <Image
                  source={
                    feedDetail.isLike
                      ? SPIcons.icFillHeart
                      : SPIcons.icGrayHeart
                  }
                />
              </View>
              <Text style={styles.number}>
                {Utils.changeNumberComma(feedDetail.cntLike)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          {/* 댓글창 */}
          <View
            style={[styles.communityBox, { gap: 16, borderBottomWidth: 0 }]}>
            <View style={[styles.bottomBox, { gap: 4 }]}>
              <View>
                <Image
                  source={SPIcons.icChatBubble}
                  style={{ width: 20, height: 20 }}
                />
              </View>
              {/* 댓글 수 */}
              <Text style={styles.number}>
                댓글 {Utils.changeNumberComma(feedDetail.cntComment)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <DismissKeyboard>
      <SPKeyboardAvoidingView
        key={keyboardAvoidingViewRefresh ? 'key1' : 'key2'}
        behavior="padding"
        isResize
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
        }}>
        <SafeAreaView style={styles.container}>
          <SPHeader
            noLeftLogo
            {...((showOptionButton &&
              !(feedDetail.topYn !== IS_YN.N && !isAdmin)) ||
            isMyFeed
              ? {
                  rightBasicButton: SPIcons.icOptionsVertical,
                  onPressRightIcon: openModal,
                }
              : {})}
          />
          {listCall ? (
            <View style={styles.communityContainer}>
              <FlatList
                key={loading ? 'loading' : 'loaded'}
                ref={flatListRef}
                data={commentList}
                style={{ flex: 1 }}
                ListHeaderComponent={renderDetail}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  if (page === 1 && commentRegist && commentList.length > 0) {
                    flatListRef.current.scrollToIndex({
                      animated: false,
                      index: 0,
                    });
                    setCommentRegist(false);
                  }
                }}
                renderItem={({ item, index }) => {
                  return (
                    <View
                      key={index}
                      style={[styles.replyBox, { paddingBottom: 24 }]}>
                      <View style={styles.communityTitle}>
                        <View style={styles.communityLeft}>
                          <View style={styles.iconContainer}>
                            {item.profilePath ? (
                              <Image
                                source={{ uri: item.profilePath }}
                                style={styles.icon}
                              />
                            ) : (
                              <Image
                                source={SPIcons.icPerson}
                                style={styles.icon}
                              />
                            )}
                          </View>
                          <View>
                            <Text style={styles.name}>{item.userNickname}</Text>
                            <Text style={styles.dateCreated}>
                              {moment(item.regDate).format('YYYY.MM.DD')}
                            </Text>
                          </View>
                        </View>
                        {isLogin && (
                          <TouchableOpacity
                            onPress={() => {
                              openCommentModal(item);
                            }}>
                            <Image
                              source={SPIcons.icOptionsVertical}
                              style={{ width: 24, height: 24 }}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.replySubBox}>
                        <Text style={styles.replySubText}>{item.comment}</Text>
                      </View>
                    </View>
                  );
                }}
                onEndReached={loadMoreProjects}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                  !loading ? (
                    <View style={{ flex: 1 }}>
                      <ListEmptyView text="댓글이 없습니다." />
                    </View>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <SPLoading />
                    </View>
                  )
                }
              />

              {/* 댓글창부분 */}
              <TouchableOpacity
                activeOpacity={1}
                style={styles.inputBox}
                onPress={e => e.stopPropagation()}>
                <Avatar
                  disableEditMode
                  imageURL={userInfo?.userProfilePath}
                  imageSize={24}
                />
                <TextInput
                  style={styles.textInput}
                  value={comment}
                  onChangeText={e => {
                    if (e?.length > 1000) return;
                    setComment(e);
                  }}
                  multiline={true}
                  placeholder="댓글을 남겨보세요.(최대 1000자)"
                  placeholderTextColor="rgba(46, 49, 53, 0.60)"
                  autoCorrect={false}
                  autoCapitalize="none"
                  numberOfLines={comment?.split('\n').length || 1}
                  textAlignVertical="center"
                  retrunKeyType="next"
                />
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}>
                  <View
                    style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                      disabled={!comment}
                      onPress={registComment}>
                      <Image
                        source={SPIcons.icSend}
                        style={{ width: 40, height: 28 }}
                      />
                    </TouchableOpacity>
                    <Text
                      style={{
                        ...fontStyles.fontSize11_Regular,
                        width: 57.1,
                        textAlign: 'center',
                        height: 14,
                        marginTop: 5,
                      }}>
                      {Utils.changeNumberComma(comment.length)}/1,000
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <AcademyJoinModal
                academyIdx={academyIdx}
                setIsJoined={setIsJoined}
              />

              {/* 더보기 모달 :: 게시글 */}
              <SPMoreModal
                visible={modalVisible}
                onClose={closeModal}
                isAdmin={isAdmin}
                type={MODAL_MORE_TYPE.FEED}
                idx={contentsIdx}
                targetUserIdx={feedDetail?.userIdx}
                onDelete={() => {
                  dispatch(academyCommunityListAction.refresh());
                  dispatch(moreCommunityListAction.refresh());
                }}
                onConfirm={() => {
                  NavigationService.goBack();
                }}
                adminButtons={
                  isMyFeed
                    ? [
                        MODAL_MORE_BUTTONS.EDIT,
                        MODAL_MORE_BUTTONS.REMOVE,
                        isAdminFeed
                          ? feedDetail?.topYn === IS_YN.Y
                            ? MODAL_MORE_BUTTONS.UNFIX
                            : MODAL_MORE_BUTTONS.FIX
                          : 'NOTHING',
                      ]
                    : [MODAL_MORE_BUTTONS.REMOVE]
                }
                memberButtons={
                  isMyFeed
                    ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
                    : feedDetail?.topYn === IS_YN.Y
                    ? 'NOTHING'
                    : [MODAL_MORE_BUTTONS.REPORT]
                }
              />

              {/* 더보기 모달 :: 댓글 */}
              <SPMoreModal
                visible={commentModalVisible}
                onClose={closeCommentModal}
                isAdmin={isAdmin}
                type={MODAL_MORE_TYPE.FEED_COMMENT}
                idx={selectedComment?.commentIdx}
                targetUserIdx={selectedComment?.userIdx}
                onModify={openModifyCommentModal}
                onDelete={() => {
                  dispatch(moreCommunityListAction.refresh());
                }}
                onConfirm={() => {
                  setChangeEvent(prev => !prev);
                }}
                adminButtons={
                  isMyComment
                    ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
                    : [MODAL_MORE_BUTTONS.REMOVE]
                }
                memberButtons={
                  isMyComment
                    ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
                    : [MODAL_MORE_BUTTONS.REPORT]
                }
              />
            </View>
          ) : (
            <SPLoading />
          )}

          <Modal
            animationType="fade"
            transparent
            visible={imageModalShow}
            onRequestClose={closeImageModal}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
              <View
                style={{
                  marginTop: insets.top,
                }}>
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
                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={{
                      width: '100%',
                      height: '100%',
                      resizeMode: 'contain',
                    }}
                  />
                )}
              </View>
            </SafeAreaView>
          </Modal>

          <Modal
            animationType="fade"
            transparent={false}
            visible={modifyCommentModalVisible}
            onRequestClose={closeModifyCommentModal}>
            <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
              <SPHeader
                title="댓글 수정"
                onPressLeftBtn={closeModifyCommentModal}
                rightCancelText
                rightText="완료"
                rightTextStyle={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#313779',
                  lineHeight: 24,
                  letterSpacing: 0.091,
                  minHeight: 28,
                }}
                onPressRightText={() => {
                  if (modifyComment) {
                    editComment();
                  } else {
                    Utils.openModal({
                      title: '확인 요청',
                      content: '댓글을 입력해주세요.',
                    });
                  }
                }}
              />
              <View style={{ flex: 1, padding: 16 }}>
                <TextInput
                  // style={styles.textInput}
                  // defaultValue={modifyComment}
                  value={modifyComment}
                  onChangeText={e => {
                    if (e?.length > 1000) return;
                    setModifyComment(e);
                  }}
                  multiline={true}
                  placeholder="댓글을 남겨보세요.(최대 1000자)"
                  placeholderTextColor="#1A1C1E"
                  autoFocus={true}
                  autoCorrect={false}
                  autoCapitalize="none"
                  textAlignVertical="top"
                  retrunKeyType="next"
                />
              </View>
              <Text
                style={{
                  ...fontStyles.fontSize14_Regular,
                  textAlign: 'right',
                  padding: 16,
                }}>
                {Utils.changeNumberComma(modifyComment.length)}/1,000
              </Text>
            </SafeAreaView>
          </Modal>
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

export default memo(AcademyCommunityDetail);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  communityContainer: {
    flex: 1,
  },
  communityBox: {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.16)',
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overlayIcon: {
    position: 'absolute',
    width: 16,
    height: 16,
    bottom: 0,
    right: 0,
  },
  communityTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  communityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
    marginBottom: 2,
  },
  dateCreated: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  communityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  communityTag: {
    backgroundColor: '#E6E9F1',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  communityTagText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#002672',
    lineHeight: 16,
  },
  communityText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  subBackgroundImage: {
    minWidth: 304,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bottomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  number: {
    minWidth: 14,
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  replyContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  replyBox: {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 16,
  },
  replySubBox: {
    paddingLeft: 48,
  },
  replySubText: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 22,
    letterSpacing: 0.203,
  },
  inputBox: {
    flexDirection: 'row',
    columnGap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    alignItems: 'center',
  },
  textInput: {
    maxHeight: 20 * 4,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1C1E',
    lineHeight: 14,
    letterSpacing: 0.203,
    margin: 0,
    padding: 0,
    // height: 'auto',
    // maxHeight: 20 * 3,
    // paddingTop: 0,
  },
  applyBtn: {
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    padding: 16,
  },
  input: {
    ...fontStyles.fontSize14_Medium,
    flex: 1,
    letterSpacing: 0.2,
    color: COLORS.labelNormal,
    top: -2,
  },
  submitCommentButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 8,
    borderRadius: 999,
    paddingVertical: 2,
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
};
