import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { RESULTS } from 'react-native-permissions';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';
import { handleError } from '../utils/HandleError';
import { checkPermissions } from '../utils/PermissionUtils';
import { SP_PERMISSIONS } from '../common/constants/permissions';
import SPModal from './SPModal';
import {
  ACTIVE_OPACITY,
  ALBUM_PERMISSION_TEXT,
  CAMERA_PERMISSION_TEXT,
} from '../common/constants/constants';

function SPSelectPhotoModal({
  visible,
  animationType,
  transparent,
  backgroundStyle,
  hasDefault,
  title,
  contentText1,
  contentText2,
  contentText3,
  onClose,
  onComplete,
  crop,
  cropCircle,
  cropHeightRate,
  cropWithRate,
}) {
  /**
   * state
   */
  const deviceWidth = Dimensions.get('window').width;
  const [showModal, setShowModal] = useState(visible);
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [deniedModalText, setDeniedModalText] = useState('');

  /**
   * function
   */
  const checkCamerapermission = async () => {
    try {
      const result = await checkPermissions(SP_PERMISSIONS.CAMERA.permission);
      if (RESULTS.DENIED === result || RESULTS.BLOCKED === result) {
        setShowDeniedModal(true);
        setDeniedModalText(CAMERA_PERMISSION_TEXT);
        return false;
      }
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  const checkphotoLibraryPermission = async () => {
    try {
      const result = await checkPermissions(
        SP_PERMISSIONS.PHOTO_LIBRARY.permission,
      );
      if (RESULTS.DENIED === result || RESULTS.BLOCKED === result) {
        setShowDeniedModal(true);
        setDeniedModalText(ALBUM_PERMISSION_TEXT);
        return false;
      }
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  const onPhoto = async () => {
    const hasPermission = await checkCamerapermission();
    if (!hasPermission) return;

    const options = {
      useFrontCamera: true,
      mediaType: 'photo',
      multiple: false,
      cropping: false,
      compressImageQuality: 0.2,
    };
    if (crop) {
      options.cropping = true;
      options.width = deviceWidth;
      options.height =
        cropWithRate && cropHeightRate
          ? (deviceWidth * cropHeightRate) / cropWithRate
          : deviceWidth;
      if (cropCircle) options.cropperCircleOverlay = true;
    }

    try {
      const image = await ImagePicker.openCamera(options);
      const { mime, path } = image;
      const uriPath = path.split('//').pop();
      const imageName = path.split('/').pop();
      const imageType = mime;
      const fileUrl = `file://${uriPath}`;
      if (onComplete) onComplete({ fileUrl, imageName, imageType });
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        handleError(error);
      }
    }
  };

  const onAlbum = async () => {
    const hasPermission = await checkphotoLibraryPermission();
    if (!hasPermission) return;

    const options = {
      mediaType: 'photo',
      multiple: false,
      cropping: false,
      compressImageQuality: 0.2,
    };
    if (crop) {
      options.cropping = true;
      options.width = deviceWidth;
      options.height =
        cropWithRate && cropHeightRate
          ? (deviceWidth * cropHeightRate) / cropWithRate
          : deviceWidth;
      if (cropCircle) options.cropperCircleOverlay = true;
    }

    try {
      const image = await ImagePicker.openPicker(options);
      console.log('🚀 ~ onAlbum ~ image:', image);
      const { mime, path } = image;
      const uriPath = path.split('//').pop();
      const imageName = path.split('/').pop();
      const imageType = mime;
      const fileUrl = `file://${uriPath}`;
      if (onComplete) onComplete({ fileUrl, imageName, imageType });
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        handleError(error);
      }
    }
  };

  const onDefault = async () => {
    if (onComplete) await onComplete({});
  };

  const handleOnRequestCloseEvent = e => {
    setShowModal(false);
    setTimeout(() => {
      if (onClose) {
        onClose(false);
      }
    }, 0);
  };

  const handleOnPhoto = e => {
    setShowModal(false);
    setTimeout(async () => {
      if (onPhoto) {
        await onPhoto();
      }
      if (onClose) {
        await onClose(false);
      }
    }, 0);
  };

  const handleOnAlbum = e => {
    setShowModal(false);
    setTimeout(async () => {
      if (onAlbum) {
        await onAlbum();
      }
      if (onClose) {
        await onClose(false);
      }
    }, 0);
  };

  const handleOnDefault = e => {
    setShowModal(false);
    setTimeout(async () => {
      if (onDefault) {
        await onDefault();
      }
      if (onClose) {
        await onClose(false);
      }
    }, 0);
  };

  /**
   * useEffect
   */
  useEffect(() => {
    setShowModal(visible);
  }, [visible]);

  return (
    <View>
      <Modal
        transparent={transparent !== false}
        animationType={animationType || 'fade'}
        visible={visible !== undefined ? visible : showModal}
        onRequestClose={handleOnRequestCloseEvent}>
        <TouchableOpacity
          style={[styles.modalBackGroud, backgroundStyle]}
          activeOpacity={1}
          onPress={handleOnRequestCloseEvent}>
          <View
            style={[
              { backgroundColor: COLORS.white, padding: 16, width: '100%' },
            ]}>
            <View style={{ marginBottom: 16 }}>
              <Text style={[fontStyles.fontSize14_Bold]}>
                {title || '프로필 이미지 설정'}
              </Text>
            </View>
            <View style={{ rowGap: 8 }}>
              <TouchableOpacity
                onPress={handleOnPhoto}
                activeOpacity={ACTIVE_OPACITY}>
                <View style={{ paddingVertical: 8 }}>
                  <Text style={[fontStyles.fontSize12_Regular]}>
                    {contentText1 || '사진 촬영'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOnAlbum}
                activeOpacity={ACTIVE_OPACITY}>
                <View style={{ paddingVertical: 8 }}>
                  <Text style={[fontStyles.fontSize12_Regular]}>
                    {contentText2 || '앨범에서 사진 선택'}
                  </Text>
                </View>
              </TouchableOpacity>
              {hasDefault && (
                <TouchableOpacity
                  onPress={handleOnDefault}
                  activeOpacity={ACTIVE_OPACITY}>
                  <View style={{ paddingVertical: 8 }}>
                    <Text style={[fontStyles.fontSize12_Regular]}>
                      {contentText3 || '기본 이미지로 변경'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <SPModal
        title="권한이 필요합니다."
        contents={deniedModalText}
        visible={showDeniedModal}
        onClose={() => {
          setShowDeniedModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackGroud: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

export default SPSelectPhotoModal;
