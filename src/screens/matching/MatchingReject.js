import React, { memo, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import 'moment/locale/ko';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { apiRejectResult } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { SPToast } from '../../components/SPToast';
import SPModal from '../../components/SPModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';

function MatchingReject({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const matchIdx = route?.params?.matchIdx;
  // eslint-disable-next-line no-shadow
  const [memo, setMemo] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const rejectMatch = async () => {
    try {
      const param = {
        matchIdx,
        rejectReason: memo,
      };

      const { data } = await apiRejectResult(param);

      if (data) {
        handleSubmit();
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const handleSubmit = () => {
    SPToast.show({ text: '이의신청이 완료됐어요', visibilityTime: 3000 }); // 3초동안 보여짐
    NavigationService.navigate(navName.matchingDetail, {
      matchIdx,
    }); // 페이지 이동
  };

  const closeConfirmModal = () => {
    setConfirmModalVisible(false);
  };

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
          <Header closeIcon />

          <View style={{ flex: 1, gap: 4, padding: 16 }}>
            <Text style={styles.subTitle}>이의신청</Text>
            <TextInput
              value={memo}
              onChange={e => {
                if (e.nativeEvent.text?.length > 50) return;
                setMemo(e.nativeEvent.text);
              }}
              multiline
              textAlignVertical="top"
              numberOfLines={3}
              placeholder="경기결과에 대한 의견을 입력하세요"
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.box}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text style={[styles.lengthCount, { paddingTop: 0 }]}>
                {memo.length} / 50
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.mainBtn}
            onPress={() => setConfirmModalVisible(true)}>
            <Text style={styles.mainBtnText}>이의신청</Text>
          </TouchableOpacity>
          <SPModal
            title="이의신청"
            contents="경기결과에 이의신청 하시겠어요?"
            visible={confirmModalVisible}
            twoButton
            onConfirm={() => {
              rejectMatch();
            }}
            onCancel={closeConfirmModal}
            onClose={closeConfirmModal}
          />
        </SafeAreaView>
      </SPKeyboardAvoidingView>
    </DismissKeyboard>
  );
}

export default memo(MatchingReject);

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
    marginBottom: 4,
  },
  box: {
    minHeight: 98,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  boxText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  lengthCount: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 16,
    letterSpacing: 0.302,
    paddingTop: 4,
  },
  mainBtn: {
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  mainBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
};
