import React, { memo, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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

function MoreInquiryRegist({ route }) {
  const inquiryData = route?.params?.inquiryData;
  const [title, setTitle] = useState(inquiryData?.title ?? '');
  const [content, setContent] = useState(inquiryData?.question ?? '');
  const trlRef = useRef({ current: { disabled: false } });
  const [registModalShow, setRegistModalShow] = useState(false);
  const [modifyModalShow, setModifyModalShow] = useState(false);

  // const handleSave = () => {
  //   Alert.alert(
  //     '저장하시겠습니까?',
  //     '',
  //     [
  //       {
  //         text: '취소',
  //         style: 'cancel',
  //       },
  //       { text: '저장', onPress: () => saveData() },
  //     ],
  //     { cancelable: true },
  //   );
  // };
  //
  // const saveData = async () => {
  //   const data = {
  //     title,
  //     question: content,
  //   };
  //   try {
  //     if (trlRef.current.disabled) return;
  //     trlRef.current.disabled = true;
  //
  //     const response = await apiPostQnaInsert(data);
  //
  //     NavigationService.navigate(navName.moreInquiry);
  //   } catch (error) {
  //     handleError(error);
  //   } finally {
  //     trlRef.current.disabled = false;
  //   }
  // };

  const regist = async () => {
    registCloseModal();
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const params = {
        title,
        question: content,
      };
      const { data } = await apiPostQnaInsert(params);
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
      const params = {
        title,
        question: content,
        qnaState: inquiryData.qnaState,
        qnaIdx: inquiryData.qnaIdx,
      };
      const { data } = await apiPutQnaModify(params);
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
  // const handleModify = () => {
  //   Alert.alert(
  //     '수정하시겠습니까?',
  //     '',
  //     [
  //       {
  //         text: '취소',
  //         style: 'cancel',
  //       },
  //       { text: '수정', onPress: () => modifyData() },
  //     ],
  //     { cancelable: true },
  //   );
  // };
  //
  // const modifyData = async () => {
  //   const data = {
  //     title,
  //     question: content,
  //     qnaState: inquiryData.qnaState,
  //     qnaIdx: inquiryData.qnaIdx,
  //   };
  //   try {
  //     if (trlRef.current.disabled) return;
  //     trlRef.current.disabled = true;
  //
  //     const response = await apiPutQnaModify(data);
  //
  //     NavigationService.navigate(navName.moreInquiry);
  //   } catch (error) {
  //     handleError(error);
  //   } finally {
  //     trlRef.current.disabled = false;
  //   }
  // };

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
  submitButton: {
    // marginTop: 'auto',
    marginHorizontal: 16,
    marginVertical: 24,
  },
});
