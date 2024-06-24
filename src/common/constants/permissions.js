import { Platform } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';

export const SP_PERMISSIONS = {
  PHOTO_LIBRARY: {
    permission: Platform.select({
      android:
        Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    }),
    explanation: '사진 읽기 권한',
    errorMsg: 'noGrantedReadPhotoPermission', // 사진 읽기 권한이 허용되지 않았습니다.
  },
  PHOTO_LIBRARY_ADD_ONLY: {
    permission: Platform.select({
      android:
        Platform.Version >= 33
          ? 'success'
          : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
    }),
    explanation: '사진 저장 권한',
    errorMsg: 'notGrantedPhotoPermission', // 사진 저장 권한이 허용되지 않았습니다.
  },
  CAMERA: {
    permission: Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    }),
    explanation: '카메라 사용 권한',
    errorMsg: 'noGrantedCameraPermission', // 카메라 사용 권한이 허용되지 않았습니다.
  },
  VIDEO_LIBRARY: {
    permission: Platform.select({
      android:
        Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    }),
    explanation: '동영상 읽기 권한',
    errorMsg: 'noGrantedReadVideoPermission', // 동영상 읽기 권한이 허용되지 않았습니다.
  },
  VIDEO_LIBRARY_ADD_ONLY: {
    permission: Platform.select({
      android:
        Platform.Version >= 33
          ? 'success'
          : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
    }),
    explanation: '동영상 저장 권한',
    errorMsg: 'notGrantedVideoPermission', // 동영상 저장 권한이 허용되지 않았습니다.
  },
  LOCATION: {
    permission: Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    }),
    explanation: '위치 정보 사용 권한',
    errorMsg: 'noGrantedLocationPermission', // 위치 정보 사용 권한이 허용되지 않았습니다.
  },
};
