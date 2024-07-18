import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  Modal,
  ScrollView,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import { useSelector } from 'react-redux';
import {
  apiGetCommunityCommentList,
  apiGetCommunityDetail,
  apiGetCommunityFindFeed,
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
import { REPORT_TYPE } from '../../common/constants/reportType';
import Avatar from '../../components/Avatar';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPHeader from '../../components/SPHeader';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import Loading from '../../components/SPLoading';
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

function AcademyCommunityDetail({
  route,
  showHeader = true,
  showInputBox = true,
  showApplyButton = true,
  type = REPORT_TYPE.FEED,
  idx,
  fromReport,
}) {
  /**
   * state
   */

  const scrollRef = useRef();
  const targetRef = useRef();
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
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [loading, setLoading] = useState(true);
  const [totalCnt, setTotalCnt] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [commentList, setCommentList] = useState([]);

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
      switch (type) {
        case REPORT_TYPE.FEED: {
          if (isLogin) {
            response = await apiGetCommunityDetail(contentsIdx);
          } else {
            response = await apiGetCommunityOpenDetail(contentsIdx);
          }
          break;
        }
        case REPORT_TYPE.FEED_COMMENT: {
          response = await apiGetCommunityFindFeed(contentsIdx);
          break;
        }
        default:
          break;
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
      const data = response?.data?.data;
      setTotalCnt(data.totalCnt);
      setIsLast(data.isLast);
      if (page === 1) {
        setCommentList(data.list);
      } else {
        setCommentList(prev => [...prev, ...data.list]);
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
    setLoading(false);
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
  };

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
      setFeedDetail(prev => prev);
      setCommentList(prev => [data.data, ...prev]);
      Keyboard.dismiss();

      setTimeout(() => {
        handleScrollToElement();
      }, 0);
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
      setCommentList(prev => [...prev]);
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

  const handleScroll = event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isScrolledToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isScrolledToBottom) {
      loadMoreProjects();
    }
  };

  const handleScrollToElement = () => {
    if (targetRef.current) {
      targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        scrollRef.current.scrollTo({ x: 0, y: pageY - 60, animated: false });
      });
    }
  };

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
        setRefreshing(true);
      }
    }, 0);
  };

  const onRefresh = async () => {
    setPage(1);
    setIsLast(false);
    setCommentList([]);
    setLoading(true);
    setRefreshing(true);
  };

  const onFocus = async () => {
    try {
      await getUserInfo();
      await getDetail();
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus) {
        getUserInfo();
      }
    }, [isJoined]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus) {
        onRefresh();
      }
    }, [isFocus, changeEvent]),
  );

  useEffect(() => {
    if (!isFocus && refreshing) {
      setRefreshing(false);
      getCommentList();
    }
  }, [page, isFocus, refreshing]);

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
          {showHeader && (
            <SPHeader
              noLeftLogo
              {...(showOptionButton &&
              (!(feedDetail.topYn !== IS_YN.N && !isAdmin) || isMyFeed)
                ? {
                    rightBasicButton: SPIcons.icOptionsVertical,
                    onPressRightIcon: openModal,
                  }
                : {})}
            />
          )}
          <View style={styles.communityContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              ref={scrollRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}>
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
                      {!feedDetail.isAcademyCreator &&
                        feedDetail.isAcademyAdmin && (
                          <Image
                            source={SPIcons.icAdmin}
                            style={styles.overlayIcon}
                          />
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
                  <Text style={styles.communityText}>
                    {feedDetail.contents}
                  </Text>
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
                  <TouchableOpacity
                    style={styles.bottomBtn}
                    onPress={changeLike}
                    disabled={fromReport}>
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

              {/* 댓글창 */}
              <View
                style={[
                  styles.communityBox,
                  { gap: 16, borderBottomWidth: 0 },
                ]}>
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

                {/* 상세 댓글 */}
                <View ref={targetRef} style={styles.replyContainer}>
                  {commentList && commentList.length > 0 ? (
                    commentList.map((item, index) => {
                      return (
                        <View
                          /* eslint-disable-next-line react/no-array-index-key */
                          key={index}
                          style={styles.replyBox}>
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
                                <Text style={styles.name}>
                                  {item.userNickname}
                                </Text>
                                <Text style={styles.dateCreated}>
                                  {moment(item.regDate).format('YYYY.MM.DD')}
                                </Text>
                              </View>
                            </View>
                            {!fromReport && isLogin && (
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
                            <Text style={styles.replySubText}>
                              {item.comment}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  ) : loading ? (
                    <Loading />
                  ) : (
                    <View
                      style={[
                        styles.replyBox,
                        { justifyContent: 'center', alignItems: 'center' },
                      ]}>
                      <Text style={styles.noneText}>댓글이 없습니다.</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {showInputBox && (
              <View style={styles.inputBox}>
                <Avatar
                  disableEditMode
                  imageURL={userInfo?.userProfilePath}
                  imageSize={24}
                />
                <TextInput
                  style={styles.textInput}
                  defaultValue={comment}
                  onChangeText={e => {
                    if (e?.length > 1000) return;
                    setComment(e);
                  }}
                  multiline={true}
                  placeholder="댓글을 남겨보세요."
                  placeholderTextColor="rgba(46, 49, 53, 0.60)"
                  autoCorrect={false}
                  autoCapitalize="none"
                  numberOfLines={comment?.split('\n').length || 1}
                  textAlignVertical="center"
                  retrunKeyType="next"
                />
                <TouchableOpacity disabled={!comment} onPress={registComment}>
                  <Image
                    source={SPIcons.icSend}
                    style={{ width: 40, height: 28 }}
                  />
                </TouchableOpacity>
              </View>
            )}

            {!fromReport && (
              <AcademyJoinModal
                academyIdx={academyIdx}
                setIsJoined={setIsJoined}
              />
            )}

            {/* 더보기 모달 :: 게시글 */}
            <SPMoreModal
              visible={modalVisible}
              onClose={closeModal}
              isAdmin={isAdmin}
              type={MODAL_MORE_TYPE.FEED}
              idx={contentsIdx}
              targetUserIdx={feedDetail?.userIdx}
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
            <SafeAreaView style={{ flex: 1 }}>
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
                  style={styles.textInput}
                  defaultValue={modifyComment}
                  onChangeText={e => {
                    if (e?.length > 1000) return;
                    setModifyComment(e);
                  }}
                  multiline={true}
                  placeholder="댓글을 남겨보세요."
                  placeholderTextColor="#1A1C1E"
                  autoCorrect={false}
                  autoCapitalize="none"
                  textAlignVertical="top"
                  retrunKeyType="next"
                />
              </View>
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
    backgroundColor: '#D6D7E4',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  communityTagText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#313779',
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
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
    margin: 0,
    padding: 0,
    // height: 'auto',
    // maxHeight: 20 * 3,
    paddingTop: 0,
  },
  applyBtn: {
    backgroundColor: '#FF671F',
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
    maxHeight: 20 * 3,
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
