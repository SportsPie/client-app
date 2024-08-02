/* eslint-disable react/no-array-index-key */
import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  apiGetCommunityOpenFilters,
  apiGetMyInfo,
  apiPostCommunity,
} from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { IS_YN } from '../../common/constants/isYN';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import DismissKeyboard from '../../components/DismissKeyboard';
import Divider from '../../components/Divider';
import SPSelectPhotoModal from '../../components/SPSelectPhotoModal';
import Header from '../../components/header';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import { SafeAreaView } from 'react-native-safe-area-context';
import SPIcons from '../../assets/icon';
import SPModal from '../../components/SPModal';
import { communityListAction } from '../../redux/reducers/list/communityListSlice';
import { academyCommunityListAction } from '../../redux/reducers/list/academyCommunityListSlice';

/**
 * CommunityWrite
 */
function CommunityWrite({ route }) {
  const dispatch = useDispatch();
  const trlRef = useRef({ current: { disabled: false } });

  /**
   * state
   */
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const academyIdx = route.params?.academyIdx;
  const [isAdmin, setIsAdmin] = useState(false);
  const [topFeed, setTopFeed] = useState(false);
  // 기타사항
  const [contents, setContents] = useState('');
  const [tagList, setTagList] = useState([]);
  const [selectedTagList, setSelectedTagList] = useState([]);

  // modal
  const [photoList, setPhotoList] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showFixCheckModal, setShowFixCheckModal] = useState(false);
  const inputRef = useRef(null);
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
        academyIdx === data.data.academyIdx &&
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
  };

  const registCommunity = async () => {
    try {
      // if (trlRef.current.disabled) return;
      if (trlRef.current.disabled) return;
      if (!checkData()) return;
      // trlRef.current.disabled = true;
      trlRef.current.disabled = true;
      const formData = new FormData();
      const params = {
        academyIdx,
        contents,
        topYn: isAdmin ? (topFeed ? IS_YN.Y : IS_YN.N) : IS_YN.N,
        tags: selectedTagList,
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

      const { data } = await apiPostCommunity(formData);
      dispatch(communityListAction.setListParamReset(true));
      dispatch(academyCommunityListAction.setListParamReset(true));
      dispatch(communityListAction.refresh());
      dispatch(academyCommunityListAction.refresh());
      Utils.openModal({
        title: '성공',
        body: '게시글 등록이 완료되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      trlRef.current.disabled = false;
      handleError(error);
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
    if (photoList.length > 4) {
      Utils.openModal({
        title: '알림',
        body: '이미지는 5개까지 업로드 가능합니다.',
      });
      return;
    } // 이미지는 5개까지 업로드 가능
    setPhotoList(prev => [...prev, photo]);
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
    if (photoList.length > 4) {
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
      getUserInfo();
      getFilterList();
    }, []),
  );

  const renderHeader = useMemo(() => {
    return (
      <Header
        rightContent={
          <Pressable onPress={registCommunity} style={{ padding: 10 }}>
            <Text style={styles.submitButtonText}>등록</Text>
          </Pressable>
        }
      />
    );
  }, [contents, selectedTagList, photoList]);

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
          {renderHeader}
          <TouchableOpacity
            onPress={() => inputRef.current.focus()}
            style={styles.inputSection}>
            <View style={[styles.inputSection, { paddingHorizontal: 0 }]}>
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}>
                <TextInput
                  ref={inputRef}
                  value={contents}
                  onChange={e => {
                    if (e.nativeEvent.text?.length > 2000) return;
                    setContents(e.nativeEvent.text);
                  }}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  numberOfLines={3}
                  placeholder="내용을 입력해 주세요."
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={styles.input}
                  placeholderTextColor="rgba(46, 49, 53, 0.60)"
                />
              </ScrollView>
              <Text style={styles.textLengthText}>
                {Utils.changeNumberComma(contents?.length ?? 0)}/2,000
              </Text>
            </View>
          </TouchableOpacity>

          {photoList && (
            <View>
              <ScrollView
                contentContainerStyle={styles.imageSection}
                horizontal
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}>
                {photoList?.map((image, index) => {
                  return (
                    <ImageBackground
                      style={styles.imageWrapper}
                      key={index}
                      source={{
                        uri: image?.uri,
                      }}>
                      <Pressable
                        onPress={() => {
                          removePhoto(index);
                        }}
                        hitSlop={8}>
                        <SPSvgs.CloseCircleFill
                          width={16}
                          height={16}
                          style={styles.closeIcon}
                          fill={COLORS.interactionInactive}
                        />
                      </Pressable>
                    </ImageBackground>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.hashtagSection}>
            <Text style={styles.titleText}>태그</Text>
            <View>
              <ScrollView
                contentContainerStyle={styles.hashtagContent}
                // horizontal
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}>
                {tagList?.map((tag, index) => {
                  const isSelected = selectedTagList.includes(tag.value);
                  return (
                    <Pressable
                      hitSlop={{
                        top: 8,
                        bottom: 8,
                        left: 8,
                        right: 8,
                      }}
                      onPress={() => toggleButton(tag.value)}
                      style={[
                        styles.hashtagButtonWrapper,
                        isSelected && { backgroundColor: COLORS.darkBlue },
                      ]}
                      key={index}>
                      <Text
                        style={[
                          styles.hashtagText,
                          isSelected && { color: COLORS.white },
                        ]}>
                        #{tag?.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          <View>
            <Divider />
            <View style={styles.bottomBox}>
              <Pressable
                disabled={photoList?.length === 5}
                onPress={openGallery}
                style={styles.pickImageButton}>
                <SPSvgs.Gallery
                  width={18}
                  height={18}
                  fill={
                    photoList?.length === 5
                      ? COLORS.lineBorder
                      : COLORS.darkBlue
                  }
                />
              </Pressable>
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
          </View>
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
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

export default memo(CommunityWrite);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    rowGap: 16,
  },
  submitButtonText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.darkBlue,
  },
  inputSection: {
    flex: 1,
    paddingHorizontal: 16,
    rowGap: 8,
  },
  input: {
    ...fontStyles.fontSize14_Medium,
    lineHeight: 20,
    flex: 1,
    letterSpacing: 0.2,
    color: COLORS.labelNormal,
  },
  textLengthText: {
    ...fontStyles.fontSize12_Regular,
    textAlign: 'right',
    color: COLORS.labelAlternative,
    letterSpacing: 0.3,
  },
  hashtagSection: {
    rowGap: 8,
  },
  titleText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelNeutral,
    letterSpacing: 0.3,
    paddingHorizontal: 16,
  },
  hashtagContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  hashtagButtonWrapper: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.indigo90,
  },
  hashtagText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.darkBlue,
  },
  pickImageButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    // marginHorizontal: 16,
    // marginVertical: 8,
  },
  imageSection: {
    paddingHorizontal: 16,
    columnGap: 8,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  closeIcon: {
    margin: 4,
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
});
