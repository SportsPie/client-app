import React, { memo, useEffect, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'moment/locale/ko';
import { apiCancelMatch, apiMatchCancelReason } from '../../api/RestAPI';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { handleError } from '../../utils/HandleError';
import SPIcons from '../../assets/icon';
import SPModal from '../../components/SPModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import DismissKeyboard from '../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';

const MC_CANCEL = 'MC_CANCEL';
const MC_REAPPLY = 'MC_REAPPLY';
const MC_ETC = 'MC_ETC';

function MatchingCancel({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const matchIdx = route?.params?.matchIdx;
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedReasonCode, setSelectedReasonCode] = useState('');
  const [cancelReason, setCancelReason] = useState([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [reapplyModalVisible, setReapplyModalVisible] = useState(false);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const cancelMatch = async type => {
    try {
      const param = {
        matchIdx,
        cancelReason: selectedReason,
      };

      const { data } = await apiCancelMatch(param);

      if (data) {
        switch (type) {
          case MC_CANCEL:
            NavigationService.navigate(navName.matchingSchedule);
            break;
          case MC_REAPPLY:
            NavigationService.navigate(navName.matchingRegist);
            break;
          default:
            NavigationService.navigate(navName.matchingSchedule);
            break;
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getMatchCancelReason = async () => {
    try {
      const { data } = await apiMatchCancelReason();

      if (data) {
        const cancelReasons = data.data;
        const etcItemIndex = cancelReasons.findIndex(
          item => item.codeSub === MC_ETC,
        );

        if (etcItemIndex !== -1) {
          const [etcItem] = cancelReasons.splice(etcItemIndex, 1);
          cancelReasons.push(etcItem);
        }
        setCancelReason(cancelReasons);
        setSelectedReason(cancelReasons[0]?.codeName);
        setSelectedReasonCode(cancelReasons[0]?.codeSub);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------
  const handleSelect = reason => {
    setSelectedReason(reason.codeName);
    setSelectedReasonCode(reason.codeSub);
    if (reason.codeSub === MC_ETC) {
      setSelectedReason('');
    }
  };

  const closeConfirmModal = () => {
    setConfirmModalVisible(false);
  };

  const closeReapplyModal = () => {
    setReapplyModalVisible(false);
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useEffect(() => {
    getMatchCancelReason();
  }, []);

  return (
    <DismissKeyboard>
      <SafeAreaView style={styles.radioContainer}>
        <Header closeIcon />

        <View style={styles.radioBox}>
          {cancelReason.map(item => (
            <TouchableOpacity
              style={styles.radioWrapper}
              onPress={() => handleSelect(item)}>
              <Image
                source={
                  selectedReasonCode === item.codeSub
                    ? SPIcons.icFillRadio
                    : SPIcons.icBasicRadio
                }
                style={{ width: 32, height: 32 }}
              />
              <Text style={styles.radioLabel}>{item.groupName}</Text>
              <Text style={styles.radioLabel}>
                {item.codeName ? item.codeName : '-'}
              </Text>
            </TouchableOpacity>
          ))}

          {selectedReasonCode === MC_ETC && (
            <View>
              <Text style={styles.radioSubLabel}>사유</Text>
              <TextInput
                style={styles.detailReasonInput}
                value={selectedReason}
                multiline
                textAlignVertical="top"
                numberOfLines={6}
                onChange={e => {
                  if (e.nativeEvent.text?.length > 100) return;
                  setSelectedReason(e.nativeEvent.text);
                }}
                placeholder="경기 취소 사유를 입력해주세요."
                autoCorrect={false}
                autoCapitalize="none"
                placeholderTextColor="#2E313599"
              />
            </View>
          )}
        </View>
        <View style={styles.appealBox}>
          <TouchableOpacity
            style={styles.appealOutlineBtn}
            onPress={() => setConfirmModalVisible(true)}>
            <Text style={styles.appealOutlineBtnText}>경기취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.appealBtn}
            onPress={() => setReapplyModalVisible(true)}>
            <Text style={styles.appealBtnText}>매칭 재등록</Text>
          </TouchableOpacity>
        </View>
        <SPModal
          title="경기취소"
          contents="매치를 취소하시겠습니까?"
          visible={confirmModalVisible}
          twoButton
          onConfirm={() => {
            cancelMatch(MC_CANCEL);
          }}
          onCancel={closeConfirmModal}
          onClose={closeConfirmModal}
        />
        <SPModal
          title="매칭 재등록"
          contents="매치를 취소하고 다시 새 매치를 등록할까요?"
          visible={reapplyModalVisible}
          twoButton
          onConfirm={() => {
            cancelMatch(MC_REAPPLY);
          }}
          onCancel={closeReapplyModal}
          onClose={closeReapplyModal}
        />
      </SafeAreaView>
    </DismissKeyboard>
  );
}

export default memo(MatchingCancel);

const styles = {
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  radioContainer: {
    flex: 1,
    flexDirection: 'column',
    // gap: 16,
    paddingHorizontal: 16,
    // paddingVertical: 24,
  },
  radioBox: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    paddingVertical: 24,
  },
  detailReasonInput: {
    minHeight: 98,
    marginTop: 4,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF671F',
    borderWidth: 1,
    borderColor: '#FF671F',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  radioSubLabel: {
    fontSize: 12,
    fontWeight: 400,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  appealBox: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 24,
  },
  appealBtn: {
    flex: 1,
    backgroundColor: '#FF671F',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  appealBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  appealOutlineBtn: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
  },
  appealOutlineBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
};
