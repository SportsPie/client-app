import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import { useDispatch, useSelector } from 'react-redux';
import {
  apiGetCommunityDetail,
  apiGetCommunityOpenFilters,
  apiGetMyInfo,
  apiPutCommunity,
} from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import { IS_YN } from '../../common/constants/isYN';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPHeader from '../../components/SPHeader';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import SPModal from '../../components/SPModal';
import SPSelectPhotoModal from '../../components/SPSelectPhotoModal';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { communityListAction } from '../../redux/reducers/list/communityListSlice';
import { academyCommunityListAction } from '../../redux/reducers/list/academyCommunityListSlice';
import { moreCommunityListAction } from '../../redux/reducers/list/moreCommunityListSlice';

// 커뮤니티 이미지 슬라이드
function CarouselSection({
  data,
  prevData = [],
  prevRemovePhoto,
  removePhoto,
}) {
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = 64;
  const itemHeight = 64;
  const itemGap = 8;
  if (prevData && prevData.length > 0) {
    prevData.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      item.prev = true;
    });
  }
  const list = [...prevData, ...data];

  const renderItem = ({ item, index }) => (
    <View>
      <Image
        source={{ uri: item.prev ? item.fileUrl : item.uri }}
        style={{
          width: itemWidth,
          height: itemHeight,
          borderRadius: 12,
          marginRight: itemGap,
        }}
      />
      <TouchableOpacity
        onPress={e => {
          e.stopPropagation();
          if (removePhoto) {
            if (item.prev) {
              prevRemovePhoto(index, item.fileIdx);
            } else {
              removePhoto(index - prevData.length);
            }
          }
        }}
        style={{ position: 'absolute', right: 4, top: 4 }}>
        <Image
          resizeMode="contain"
          source={SPIcons.icGrayCancel}
          style={{
            width: 16,
            height: 16,
          }}
        />
      </TouchableOpacity>
    </View>
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

/**
 * CommunityWrite
 */
function CommunityEdit({ route }) {
  const dispatch = useDispatch();
  /**
   * state
   */
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const academyIdx = route.params?.academyIdx;
  const feedIdx = route.params?.feedIdx;
  const [isAdmin, setIsAdmin] = useState(false);
  const [topFeed, setTopFeed] = useState(false);
  const [getTagListIsDone, setGetTagListIsDone] = useState(false);
  const [fstCall, setFstCall] = useState(false);

  const [communityDetail, setCommunityDetail] = useState({});
  // 기타사항
  const [contents, setContents] = useState('');
  const [tagList, setTagList] = useState([]);
  const [tags, setTags] = useState([]); // 구조 변경 하지 않은 순수 태그 리스트
  const [selectedTagList, setSelectedTagList] = useState([]);

  const [photoList, setPhotoList] = useState([]);
  const [prevPhotoList, setPrevPhotoList] = useState([]);
  const [removeFiles, setRemoveFiles] = useState([]); // idxs

  // modal
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showFixCheckModal, setShowFixCheckModal] = useState(false);

  const trlRef = useRef({ current: { disabled: false } });

  /**
   * api
   */

  const getUserInfo = async () => {
    if (!isLogin) {
      return;
    }
    try {
      const { data } = await apiGetMyInfo();
      if (
        communityDetail.academyIdx === data.data.academyIdx &&
        (data.data.academyAdmin || data.data.academyCreator)
      ) {
        setIsAdmin(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getFilterList = async () => {
    try {
      const { data } = await apiGetCommunityOpenFilters();
      setTags(data.data);
      let etc = null;
      const list = data.data
        .map(item => {
          if (item.codeSub === 'ETC') {
            etc = item;
            return null;
          }
          return { label: item.codeName, value: item.codeSub };
        })
        .filter(item => item);
      if (etc) {
        list.push({ label: etc.codeName, value: etc.codeSub });
      }
      setTagList(list);
    } catch (error) {
      handleError(error);
    }
    setGetTagListIsDone(true);
  };

  const getCommunityDetail = async () => {
    try {
      const { data } = await apiGetCommunityDetail(feedIdx);
      setCommunityDetail(data.data);
      setPrevPhotoList(data.data.files);
      setContents(data.data.contents);
      setTopFeed(data.data.topYn === IS_YN.Y);

      // tags
      const selectedTags = [];
      tags.forEach(tag => {
        if (data.data.tagsKo?.includes(tag.codeName)) {
          selectedTags.push(tag.codeSub);
        }
      });
      setSelectedTagList(selectedTags);
    } catch (error) {
      handleError(error);
    }
    setFstCall(true);
  };

  const editCommunity = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      if (!checkData()) return;
      const formData = new FormData();
      const params = {
        feedIdx,
        academyIdx,
        contents,
        topYn: isAdmin ? (topFeed ? IS_YN.Y : IS_YN.N) : IS_YN.N,
        tags: selectedTagList,
        removeFiles,
      };
      formData.append('dto', {
        string: JSON.stringify(params),
        type: 'application/json',
      });

      // photos
      if (photoList && photoList.length > 0) {
        photoList.forEach(item => {
          formData.append('files', item);
        });
      }

      const { data } = await apiPutCommunity(formData);
      const detailResponse = await apiGetCommunityDetail(feedIdx);
      dispatch(communityListAction.setListParamReset(true));
      dispatch(academyCommunityListAction.setListParamReset(true));
      const { data: communityDetail } = await apiGetCommunityDetail(feedIdx);
      setCommunityDetail(communityDetail.data);
      dispatch(
        moreCommunityListAction.modifyItem({
          idxName: 'feedIdx',
          idx: feedIdx,
          item: communityDetail.data,
        }),
      );
      Utils.openModal({
        title: '성공',
        body: '게시글 수정이 완료되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    } finally {
      trlRef.current.disabled = false;
    }
  };

  /**
   * function
   */

  const checkData = () => {
    if (!contents) {
      Utils.openModal({ title: '알림', body: '내용을 입력해 주세요.' });
      return false;
    }
    if (selectedTagList.length === 0) {
      Utils.openModal({
        title: '알림',
        body: '태그를 적어도 하나를 선택해주시기 바랍니다.',
      });
      return false;
    }
    return true;
  };

  const maxFilename = 60;
  const updatePhoto = ({ fileUrl, imageName, imageType }) => {
    const photo = {
      uri: fileUrl,
      name:
        imageName.length <= maxFilename
          ? imageName
          : imageName.substring(
              imageName.length - maxFilename,
              imageName.length,
            ),
      type: imageType,
    };
    if (prevPhotoList.length + photoList.length > 4) {
      Utils.openModal({
        title: '알림',
        body: '이미지는 5개까지 업로드 가능합니다.',
      });
      return;
    } // 이미지는 5개까지 업로드 가능
    setPhotoList(prev => [...prev, photo]);
  };

  const removePrevPhoto = (index, idx) => {
    const list = [...prevPhotoList];
    list.splice(index, 1);
    setPrevPhotoList(list);
    setRemoveFiles(prev => [...prev, idx]);
  };

  const removePhoto = index => {
    const list = [...photoList];
    list.splice(index, 1);
    setPhotoList(list);
  };

  const toggleButton = buttonText => {
    // ==== 수정된 부분
    setSelectedTagList(prevState =>
      prevState.includes(buttonText)
        ? prevState.filter(button => button !== buttonText)
        : [...prevState, buttonText],
    );
  };

  const openGallery = () => {
    if (prevPhotoList.length + photoList.length > 4) {
      Utils.openModal({
        title: '알림',
        body: '이미지는 5개까지 업로드 가능합니다.',
      });
    } else {
      setShowPhotoModal(true);
    }
  };

  const toggleCheckbox = () => {
    if (!topFeed) {
      setShowFixCheckModal(true);
    } else {
      setTopFeed(prevState => !prevState);
    }
  };

  /**
   * useEffect
   */

  useFocusEffect(
    useCallback(() => {
      getFilterList();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (getTagListIsDone) {
        getCommunityDetail();
      }
    }, [getTagListIsDone, tagList]),
  );

  useEffect(() => {
    if (communityDetail.academyIdx) {
      getUserInfo();
    }
  }, [communityDetail]);

  return (
    fstCall && (
      <DismissKeyboard>
        <SPKeyboardAvoidingView
          behavior="padding"
          isResize
          keyboardVerticalOffset={0}
          style={{
            flex: 1,
          }}>
          <SafeAreaView style={styles.container}>
            <SPHeader
              rightCancelText
              rightText="수정"
              rightTextStyle={{
                fontSize: 16,
                fontWeight: '600',
                color: '#313779',
                lineHeight: 24,
                letterSpacing: 0.091,
                minHeight: 28,
              }}
              onPressRightText={editCommunity}
            />

            <View style={styles.contentBox}>
              <View style={styles.textInputBox}>
                <ScrollView
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}>
                  <TextInput
                    value={contents}
                    onChange={e => {
                      if (e.nativeEvent.text?.length > 2000) return;
                      setContents(e.nativeEvent.text);
                    }}
                    multiline
                    textAlignVertical="top"
                    numberOfLines={3}
                    placeholder="내용을 입력해 주세요."
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.box}
                    placeholderTextColor="rgba(46, 49, 53, 0.60)"
                  />
                </ScrollView>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Text style={[styles.lengthCount, { paddingTop: 0 }]}>
                    {Utils.changeNumberComma(contents.length)} / 2,000
                  </Text>
                </View>
              </View>

              {/* 이미지 첨부 최대 5개까지 */}
              <View style={{ overflow: 'hidden', height: 64 }}>
                <CarouselSection
                  prevData={prevPhotoList}
                  prevRemovePhoto={removePrevPhoto}
                  data={photoList}
                  removePhoto={removePhoto}
                />
              </View>

              {/* 태그 최소 1개이상 필수 */}
              <View style={styles.tagBox}>
                <Text style={styles.tabText}>태그</Text>
                <View style={styles.buttonBox}>
                  {tagList &&
                    tagList.length > 0 &&
                    tagList.map((filterTag, index) => (
                      <Pressable
                        hitSlop={{
                          top: 8,
                          bottom: 8,
                          left: 8,
                          right: 8,
                        }}
                        key={index}
                        style={[
                          styles.button,
                          selectedTagList.includes(filterTag.value) &&
                            styles.activeButton, // ==== 수정된 부분
                        ]}
                        onPress={() => toggleButton(filterTag.value)} // ==== 수정된 부분
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            selectedTagList.includes(filterTag.value) &&
                              styles.activeButtonText, // ==== 수정된 부분
                          ]}>
                          #{filterTag.label}
                        </Text>
                      </Pressable>
                    ))}
                </View>
              </View>
            </View>

            {/* 갤러리 */}
            <View style={styles.bottomBox}>
              <View style={styles.galleryBox}>
                <TouchableOpacity
                  onPress={openGallery}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={SPIcons.icGallery}
                    style={{
                      width: 48,
                      height: 48,
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* 운영자일때 공지로 등록하기 체크박스 보여짐 */}
              {isAdmin && (
                <View>
                  <TouchableOpacity
                    style={styles.checkboxWrapper}
                    onPress={toggleCheckbox}>
                    <Image
                      source={
                        !topFeed ? SPIcons.icOutlineCheck : SPIcons.icChecked
                      }
                      style={{ width: 32, height: 32 }}
                    />
                    <Text style={styles.checkboxLabel}>공지로 등록하기</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <SPSelectPhotoModal
              visible={showPhotoModal}
              crop={false}
              onClose={async () => {
                setShowPhotoModal(false);
              }}
              onComplete={data => {
                updatePhoto(data);
              }}
            />
            <SPModal
              title="고정하기"
              contents={`게시물을 최대 3개까지만 고정할 수 있습니다. \n이 게시물을 고정하면 가장 오래된 \n고정 게시물이 해제됩니다.`}
              visible={showFixCheckModal}
              onConfirm={() => {
                setTopFeed(true);
              }}
              onCancel={() => {
                setShowFixCheckModal(false);
              }}
              onClose={() => {
                setShowFixCheckModal(false);
              }}
            />
          </SafeAreaView>
        </SPKeyboardAvoidingView>
      </DismissKeyboard>
    )
  );
}

export default memo(CommunityEdit);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentBox: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    padding: 16,
  },
  textInputBox: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  box: {
    flex: 1,
    minHeight: 456,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  lengthCount: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  tagBox: {
    flexDirection: 'column',
    gap: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  buttonBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  button: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: '#E6E9F1',
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#002672',
    lineHeight: 16,
  },
  activeButton: {
    backgroundColor: '#313779',
  },
  activeButtonText: {
    color: '#FFF',
  },
  bottomBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
};
