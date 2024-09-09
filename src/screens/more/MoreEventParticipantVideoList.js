import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import SPSelectVideoModal from '../../components/SPSelectVideoModal';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { VIDEO_UPLOAD_TYPE } from '../../common/constants/VideoUploadType';

function EventParticipantVideoList() {
  const [loading, setLoading] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  // [ util ] 이벤트 참여 영상 업로드
  const uploadEventParticipantVideo = (type, fileUrl, videoName, videoType) => {
    switch (type) {
      case 'CAMERA':
        NavigationService.navigate(navName.addVideoDetail, {
          videoURL: fileUrl,
          videoName,
          videoType,
          uploadType: VIDEO_UPLOAD_TYPE.EVENT,
        });
        break;
      case 'ALBUM':
        NavigationService.navigate(navName.videoUploadPlayer, {
          videoURL: fileUrl,
          videoName,
          videoType,
          uploadType: VIDEO_UPLOAD_TYPE.EVENT,
        });
        break;
      default:
        break;
    }
  };

  return (
    <View>
      <Text>영상 목록</Text>
      <PrimaryButton
        onPress={() => {
          setShowSelectModal(true);
        }}
        text="동영상 업로드"
      />
      <SPSelectVideoModal
        title="동영상 업로드"
        visible={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        setLoading={setLoading}
        onComplete={({ type, fileUrl, videoName, videoType }) => {
          uploadEventParticipantVideo(type, fileUrl, videoName, videoType);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomButtonWrap: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  button: {},
});

export default EventParticipantVideoList;
