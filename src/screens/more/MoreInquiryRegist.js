import React, { memo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPostQnaInsert, apiPutQnaModify } from '../../api/RestAPI';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import DismissKeyboard from '../../components/DismissKeyboard';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPInput from '../../components/SPInput';
import SPModal from '../../components/SPModal';
import Header from '../../components/header';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import fontStyles from '../../styles/fontStyles';
import { useDispatch } from 'react-redux';
import { moreInquiryListAction } from '../../redux/reducers/list/moreInquiryListSlice';
import SPSelectPhotoModal from '../../components/SPSelectPhotoModal';
import SPIcons from '../../assets/icon';
import Carousel from 'react-native-snap-carousel';

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
  let prev = [];
  if (prevData && prevData.length > 0) {
    prev = prevData.map(item => {
      return { ...item, prev: true };
    });
  }
  const list = [...prev, ...data];

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

function MoreInquiryRegist({ route }) {
  const dispatch = useDispatch();
  const inquiryData = route?.params?.inquiryData;
  const [title, setTitle] = useState(inquiryData?.title ?? '');
  const [content, setContent] = useState(inquiryData?.question ?? '');
  const trlRef = useRef({ current: { disabled: false } });
  const [registModalShow, setRegistModalShow] = useState(false);
  const [modifyModalShow, setModifyModalShow] = useState(false);

  const [photoList, setPhotoList] = useState([]);
  const [prevPhotoList, setPrevPhotoList] = useState(inquiryData?.files ?? []);
  const [removeFiles, setRemoveFiles] = useState([]); // idxs

  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const regist = async () => {
    registCloseModal();
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const formData = new FormData();
      const params = {
        title,
        question: content,
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
      const { data } = await apiPostQnaInsert(formData);
      dispatch(moreInquiryListAction.refresh());
      Utils.openModal({
        title: '성공',
        body: '문의가 저장되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const modify = async () => {
    modifyCloseModal();
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const formData = new FormData();
      const params = {
        title,
        question: content,
        qnaState: inquiryData.qnaState,
        qnaIdx: inquiryData.qnaIdx,
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

      const { data } = await apiPutQnaModify(formData);
      // dispatch(moreInquiryListAction.refresh());
      Utils.openModal({
        title: '성공',
        body: '문의가 수정되었습니다.',
        closeEvent: MODAL_CLOSE_EVENT.goBack,
      });
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
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
    // if (prevPhotoList.length + photoList.length > 4) {
    //   Utils.openModal({
    //     title: '알림',
    //     body: '이미지는 5개까지 업로드 가능합니다.',
    //   });
    //   return;
    // } // 이미지는 5개까지 업로드 가능
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

  const openGallery = () => {
    // if (prevPhotoList.length + photoList.length > 4) {
    //   Utils.openModal({
    //     title: '알림',
    //     body: '이미지는 5개까지 업로드 가능합니다.',
    //   });
    // } else {
    //   setShowPhotoModal(true);
    // }
    setShowPhotoModal(true);
  };

  const registOpenModal = () => {
    setRegistModalShow(true);
  };
  const registCloseModal = () => {
    setRegistModalShow(false);
  };

  const modifyOpenModal = () => {
    setModifyModalShow(true);
  };
  const modifyCloseModal = () => {
    setModifyModalShow(false);
  };

  return (
    <DismissKeyboard>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Header title="문의하기" />

        <View style={styles.container}>
          <SPInput
            title="제목"
            placeholder="제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
          />

          <View style={{ rowGap: 4 }}>
            <SPInput
              title="내용"
              numberOfLines={6}
              placeholder="문의 내용을 적어주세요"
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
              maxLength={1500}
            />
            <Text
              style={[
                fontStyles.fontSize12_Regular,
                {
                  marginLeft: 'auto',
                },
              ]}>
              {Utils.changeNumberComma(content?.length, true)}/1,500
            </Text>
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <CarouselSection
            prevData={prevPhotoList}
            prevRemovePhoto={removePrevPhoto}
            data={photoList}
            removePhoto={removePhoto}
          />
        </View>
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
        </View>
        {inquiryData ? (
          <PrimaryButton
            onPress={() => {
              modifyOpenModal();
            }}
            text="수정"
            buttonStyle={styles.submitButton}
            disabled={!title || !content}
          />
        ) : (
          <PrimaryButton
            onPress={() => {
              registOpenModal();
            }}
            text="저장"
            buttonStyle={styles.submitButton}
            disabled={!title || !content}
          />
        )}
        <SPModal
          title="문의하기 확인"
          contents="문의하기를 수정하시겠습니까?"
          visible={modifyModalShow}
          onConfirm={() => {
            modify();
          }}
          onCancel={() => {
            modifyCloseModal();
          }}
          onClose={() => {
            modifyCloseModal();
          }}
        />

        <SPModal
          title="문의하기 확인"
          contents="문의하기를 등록하시겠습니까?"
          visible={registModalShow}
          onConfirm={() => {
            regist();
          }}
          onCancel={() => {
            registCloseModal();
          }}
          onClose={() => {
            registCloseModal();
          }}
        />

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
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(MoreInquiryRegist);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    rowGap: 16,
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
  submitButton: {
    // marginTop: 'auto',
    marginHorizontal: 16,
    marginVertical: 24,
  },
});
