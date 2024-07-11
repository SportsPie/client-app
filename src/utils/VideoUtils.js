import ImagePicker from 'react-native-image-crop-picker';
import {
  Video,
  createVideoThumbnail,
  clearCache,
} from 'react-native-compressor';

// 예외 Class
const { CustomException } = require('../common/exceptions');

// 상수값
const KB_UNIT = 1024; // kb
const MB_UNIT = KB_UNIT * 1024; // mb
const MAX_DURATION_SEC = 300; // max seconds
const MAX_SIZE_MB = 20; // max mb

// 동영상 압축 옵션
const compressOptions = {
  compressionMethod: 'auto', // 'auto' or 'manual'
  progressDivider: 1,
  // bitrate: DEFAULT_BITRATE,
  // maxSize
  // compressionMethod
  // minimumFileSizeForCompress
  // getCancellationId: cancellationId => (cancellationVideoId = cancellationId),
};

/*************************************************************************************
 * 동영상 유틸
 *
 *  - 선택 ( 촬영, 앨범 )
 *  - 압축
 *  - 썸네일
 *  - 캐시 관리
 *************************************************************************************/
const VideoUtils = {
  /**
   * 동영상 선택 by 촬영
   * @param {function} pickerCallback - 성공 콜백 함수
   */
  openCamera: (pickerCallback = () => null) => {
    ImagePicker.openCamera({
      mediaType: 'video',
    })
      .then(video => {
        pickerCallback(video.path);
      })
      .catch(error => {
        // 선택 취소
        if (error.code === 'E_PICKER_CANCELLED') {
          return false;
        }
      });
  },

  /**
   * 동영상 선택 from 앨범
   * @param {function} pickerCallback - 성공 콜백 함수
   */
  openAlbum: (pickerCallback = () => null) => {
    ImagePicker.openPicker({
      mediaType: 'video',
    })
      .then(video => {
        pickerCallback(video.path);
      })
      .catch(error => {
        // 선택 취소
        if (error.code === 'E_PICKER_CANCELLED') {
          return false;
        }
      });
  },

  /**
   * 동영상 메타데이터 검증
   * @param {number} duration - 동영상 길이 sec
   * @param {number} size - 동영상 용량 sec
   */
  validateVideoMetaData: ({ duration = 0, size = 0 }) => {
    // 재생시간
    if (duration > MAX_DURATION_SEC) {
      throw new CustomException(
        `영상 길이는 ${Math.ceil(
          MAX_DURATION_SEC / 60,
        )}분을 초과할 수 없습니다.`,
      );
    }

    // 용량
    if (size <= 0 || size / MB_UNIT > MAX_SIZE_MB) {
      throw new CustomException(
        `영상 용량은 ${MAX_SIZE_MB}MB를 초과할 수 없습니다.`,
      );
    }
  },

  /**
   * 동영상 압축
   * @param {string} filePath - 타겟 동영상 파일 경로
   * @param {function} progressSetter - 진행 상태 콜백
   *
   * @returns {string} compressedPath - 압축 동영상 파일 경로
   */
  compressVideo: async (
    filePath = '',
    progressSetter = () => null,
    bitrate,
  ) => {
    try {
      let options = { ...compressOptions };

      if (bitrate) {
        options = {
          ...options,
          compressionMethod: 'manual',
          bitrate,
        };
      }

      console.log('options');
      console.log(options);

      return await Video.compress(filePath, options, progress => {
        progressSetter(Math.floor(progress * 100));
      });
    } catch (error) {
      if (error.code === 'EUNSPECIFIED') {
        throw new CustomException('확인되지 않는 파일입니다.');
      }
      throw new CustomException('동영상 압축에 실패했습니다.');
    }
  },

  /**
   * 썸네일 생성
   * @param {string} filePath - 타겟 동영상 파일 경로
   *
   * @returns {map<string,string>} thumbnail - 썸네일 파일 정보
   */
  getVideoThumbnail: async filePath => {
    try {
      return await createVideoThumbnail(filePath);
    } catch (error) {
      throw new CustomException('썸네일 생성에 실패했습니다.');
    }
  },

  /**
   * 썸네일 캐시 삭제
   *
   * @returns {null}
   */
  clearThubnailCache: async () => {
    await clearCache();
  },

  /**
   * 썸네일 이름 추출
   * @param {string} filePath - 타겟 썸네일 경로 ( Ex. file:///data/.../thumb-abc...1234 )
   * @param {string} mime - 타겟 썸네일 확장자 ( Ex. image/jpeg )
   *
   * @returns {string} thumbnailName - 썸네일 이름 ( = 파일명 + 확장자 )
   */
  extractThumbnailFileNameWithExt: (filePath, mime) => {
    const lastFileNameSlashIndex = filePath.lastIndexOf('/') + 1;
    const lastFileMimeSlashIndex = mime.lastIndexOf('/') + 1;

    const fileName = filePath.substring(
      lastFileNameSlashIndex,
      filePath.length,
    );
    const fileExt = mime.substring(lastFileMimeSlashIndex, mime.length);

    const fileNameWithExt = fileName + '.' + fileExt;
    return fileNameWithExt;
  },
};

export default VideoUtils;
