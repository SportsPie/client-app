import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
import { SPSvgs } from '../../assets/svg';
import { REPORT_TYPE } from '../../common/constants/reportType';
import Avatar from '../../components/Avatar';
import DismissKeyboard from '../../components/DismissKeyboard';
import Divider from '../../components/Divider';
import SPHeader from '../../components/SPHeader';
import Loading from '../../components/SPLoading';
import SPMoreModal, {
  MODAL_MORE_BUTTONS,
  MODAL_MORE_TYPE,
} from '../../components/SPMoreModal';
import { SPToast } from '../../components/SPToast';
import Header from '../../components/header';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';

function CommunityDetails({
  route,
  showHeader = true,
  showInputBox = true,
  showApplyButton = true,
  type = REPORT_TYPE.FEED,
  fromReport,
}) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const scrollRef = useRef();
  const targetRef = useRef();
  const insets = useSafeAreaInsets();

  const isLogin = useSelector(selector => selector.auth)?.isLogin;
  const contentsIdx = route?.params?.feedIdx;

  const [userInfo, setUserInfo] = useState({});
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
  const [isMyFeed, setIsMyFeed] = useState(false);
  const [isMyComment, setIsMyComment] = useState(false);
  const [changeEvent, setChangeEvent] = useState(false);
  const [selectedComment, setSelectedComment] = useState({});
  const [modifyComment, setModifyComment] = useState('');

  const [imageModalShow, setImageModalShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const trlRef = useRef({ current: { disabled: false } });

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const getUserInfo = async () => {
    if (!isLogin) {
      setShowOptionButton(false);
      return;
    }
    setShowOptionButton(true);

    try {
      const { data } = await apiGetMyInfo();

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
      }
    } catch (error) {
      handleError(error);
    }
    setIsFocus(false);
    setLoading(false);
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
    setRefreshing(false);
  };

  const changeLike = async () => {
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
      const params = {
        feedIdx: feedDetail.feedIdx,
        comment,
      };
      const { data } = await apiPostCommunityComment(params);
      feedDetail.cntComment += 1;
      setFeedDetail(prev => prev);
      setCommentList(prev => [data.data, ...prev]);
      Keyboard.dismiss();
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
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

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
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

  const loadMoreProjects = () => {
    setTimeout(() => {
      if (!isLast) {
        setPage(prevPage => prevPage + 1);
      }
    }, 0);
  };

  const onRefresh = async () => {
    setLoading(true);
    setPage(1);
    setIsLast(false);
    setCommentList([]);
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

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  // useFocusEffect(
  //   useCallback(() => {
  //     if (!isFocus) {
  //       getUserInfo();
  //     }
  //   }, [isFocus]),
  // );

  useFocusEffect(
    useCallback(() => {
      if (!isFocus) {
        onRefresh();
      }
    }, [isFocus, changeEvent]),
  );

  useEffect(() => {
    if ((!isFocus && refreshing) || (!refreshing && page > 1)) {
      getCommentList();
    }
  }, [page, isFocus, refreshing]);

  const renderHeader = useMemo(() => {
    return (
      <Header
        rightContent={
          showOptionButton && (
            <Pressable onPress={() => openModal()}>
              <SPSvgs.EllipsesVertical />
            </Pressable>
          )
        }
      />
    );
  }, [showOptionButton]);

  const renderImages = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const aspectRatio = 16 / 9; // 이미지의 원본 비율
    const minHeight = 200; // 최소 높이
    const calculatedHeight = screenWidth / aspectRatio; // 디바이스 크기에 비례하는 높이
    const dynamicHeight = Math.max(minHeight, calculatedHeight);

    const renderItem = ({ item: imageItem }) => {
      return (
        <Pressable
          onPress={() => {
            setSelectedImage(imageItem?.fileUrl);
            openImageModal();
          }}>
          <Image
            source={{ uri: imageItem?.fileUrl }}
            style={[
              styles.image,
              {
                height: dynamicHeight,
                marginLeft: 8,
              },
            ]}
          />
        </Pressable>
      );
    };

    return (
      <Carousel
        sliderWidth={SCREEN_WIDTH}
        itemWidth={SCREEN_WIDTH - 16 - 8}
        data={feedDetail?.files}
        renderItem={renderItem}
        activeSlideAlignment="start"
        inactiveSlideScale={1}
        inactiveSlideOpacity={0.7}
        slideStyle={{ paddingLeft: 8 }}
        vertical={false}
      />
    );
  }, [feedDetail]);

  const renderFeed = useMemo(() => {
    return (
      <View style={styles.feedSection}>
        <View style={styles.userInfoSection}>
          <Avatar
            disableEditMode
            imageSize={40}
            imageURL={feedDetail.profilePath}
          />
          <View style={{ rowGap: 2 }}>
            <Text style={styles.nameText}>{feedDetail?.userNickname}</Text>
            <Text style={styles.dateText}>
              {Utils.formatTimeAgo(feedDetail?.regDate)}
            </Text>
          </View>
        </View>

        <Text style={styles.contentText}>{feedDetail?.contents}</Text>

        {feedDetail?.files?.length > 0 && renderImages}

        <View style={styles.hashtagContainer}>
          {feedDetail?.tagsKo?.length > 0 &&
            feedDetail?.tagsKo.map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <View style={styles.hashtagWrapper} key={index}>
                <Text style={styles.hashtagText}>#{item}</Text>
              </View>
            ))}
        </View>

        <TouchableOpacity
          onPress={() => {
            changeLike();
          }}>
          <View style={styles.likeWrapper}>
            {feedDetail?.isLike ? (
              <SPSvgs.HeartFill width={20} height={20} />
            ) : (
              <SPSvgs.HeartOutline width={20} height={20} />
            )}
            <Text style={styles.reactCountText}>{feedDetail?.cntLike}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [feedDetail]);

  const renderComments = useMemo(() => {
    return (
      <View style={styles.reviewSection}>
        <View
          style={[
            styles.likeWrapper,
            {
              marginHorizontal: 0,
            },
          ]}>
          <SPSvgs.BubbleChatOutline
            width={20}
            height={20}
            fill={COLORS.darkBlue}
          />
          <Text style={styles.reactCountText}>
            댓글 {feedDetail?.cntComment}
          </Text>
        </View>

        <View ref={targetRef} style={styles.replyContainer}>
          {commentList && commentList.length > 0 ? (
            commentList.map((item, index) => {
              return (
                <View style={{ rowGap: 8 }} key={index}>
                  <View
                    style={[
                      styles.userInfoSection,
                      {
                        marginHorizontal: 0,
                        paddingVertical: 4,
                      },
                    ]}>
                    <Avatar
                      disableEditMode
                      imageSize={40}
                      imageURL={item.profilePath}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nameText}>{item?.userNickname}</Text>
                      <Text style={styles.dateText}>
                        {Utils.formatTimeAgo(item?.regDate)}
                      </Text>
                    </View>
                    <Pressable
                      hitSlop={12}
                      onPress={() => {
                        openCommentModal(item);
                      }}>
                      <SPSvgs.EllipsesVertical />
                    </Pressable>
                  </View>
                  <Text style={styles.commentText}>{item?.comment}</Text>
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
    );
  }, [commentList, loading]);

  const renderCommentInputSection = useMemo(() => {
    // 댓글창 부분
    return (
      <View>
        <Divider />
        <View style={styles.inputSection}>
          <Avatar
            disableEditMode
            imageURL={userInfo?.userProfilePath}
            imageSize={24}
          />
          <TextInput
            placeholder="댓글을 남겨보세요(최대 1000자)"
            style={styles.input}
            value={comment}
            onChangeText={e => {
              if (e?.length > 1000) return;
              setComment(e);
            }}
            autoCorrect={false}
            autoCapitalize="none"
            placeholderTextColor="rgba(46, 49, 53, 0.60)"
            multiline
            textAlignVertical="center"
            retrunKeyType="next"
          />
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity disabled={!comment} onPress={registComment}>
                <Image
                  source={SPIcons.icSend}
                  style={{ width: 40, height: 28 }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  ...fontStyles.fontSize11_Regular,
                  height: 14,
                  marginTop: 5,
                  width: 57.1,
                  textAlign: 'center',
                }}>
                {Utils.changeNumberComma(comment.length)}/1,000
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, [userInfo, comment]);

  return (
    <DismissKeyboard>
      <SafeAreaView style={styles.container}>
        <SPKeyboardAvoidingView
          behavior="padding"
          isResize
          keyboardVerticalOffset={0}
          style={styles.container}>
          {renderHeader}
          <ScrollView
            showsVerticalScrollIndicator={false}
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}>
            {renderFeed}
            <Divider />
            {renderComments}
          </ScrollView>
          {renderCommentInputSection}
        </SPKeyboardAvoidingView>
      </SafeAreaView>
      {/* 더보기 모달 :: 게시글 */}
      <SPMoreModal
        visible={modalVisible}
        onClose={closeModal}
        isAdmin={false}
        type={MODAL_MORE_TYPE.FEED}
        idx={contentsIdx}
        targetUserIdx={feedDetail?.userIdx}
        onConfirm={() => {
          NavigationService.goBack();
        }}
        memberButtons={
          isMyFeed
            ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
            : [MODAL_MORE_BUTTONS.REPORT]
        }
      />

      {/* 더보기 모달 :: 댓글 */}
      <SPMoreModal
        visible={commentModalVisible}
        onClose={closeCommentModal}
        isAdmin={false}
        type={MODAL_MORE_TYPE.FEED_COMMENT}
        idx={selectedComment?.commentIdx}
        targetUserIdx={selectedComment?.userIdx}
        onModify={openModifyCommentModal}
        onConfirm={() => {
          setChangeEvent(prev => !prev);
          getDetail();
        }}
        memberButtons={
          isMyComment
            ? [MODAL_MORE_BUTTONS.EDIT, MODAL_MORE_BUTTONS.REMOVE]
            : [MODAL_MORE_BUTTONS.REPORT]
        }
      />
      <Modal
        animationType="fade"
        transparent
        visible={imageModalShow}
        onRequestClose={closeImageModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.black }}>
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
          {/* 댓글창부분 */}

          <View style={{ flex: 1, padding: 16 }}>
            <TextInput
              style={styles.textInput}
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
            }}>
            {Utils.changeNumberComma(modifyComment.length)}/1,000
          </Text>
        </SafeAreaView>
      </Modal>
    </DismissKeyboard>
  );
}

export default memo(CommunityDetails);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  feedSection: {
    paddingVertical: 24,
    rowGap: 8,
  },
  hashtagText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.darkBlue,
  },
  hashtagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  hashtagWrapper: {
    backgroundColor: '#D6D7E4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    columnGap: 8,
  },
  nameText: {
    ...fontStyles.fontSize13_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.25,
    lineHeight: 18,
  },
  dateText: {
    ...fontStyles.fontSize11_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  contentText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.labelNormal,
    lineHeight: 22,
    letterSpacing: 0.2,
    paddingHorizontal: 16,
  },
  likeWrapper: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  reactCountText: {
    ...fontStyles.fontSize12_Semibold,
    color: COLORS.labelNeutral,
    letterSpacing: 0.3,
  },
  image: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    borderRadius: 12,
  },
  reviewSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 16,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    padding: 16,
  },
  input: {
    padding: 0,
    margin: 0,
    ...fontStyles.fontSize14_Medium,
    flex: 1,
    letterSpacing: 0.2,
    color: COLORS.labelNormal,
    maxHeight: 20 * 4,
    lineHeight: 14,
  },
  submitCommentButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 8,
    borderRadius: 999,
    paddingVertical: 2,
  },
  commentText: {
    ...fontStyles.fontSize14_Regular,
    color: COLORS.labelNeutral,
    lineHeight: 22,
    letterSpacing: 0.2,
    marginLeft: 48,
  },
  replyContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  noneText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 18,
    letterSpacing: 0.252,
    textAlign: 'center',
  },
});
