import React, { useState, useEffect, memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import 'moment/locale/ko';
import { handleError } from '../../utils/HandleError';
import { apiGetMatchDetail, apiSelectAcademy4Match } from '../../api/RestAPI';
import SPIcons from '../../assets/icon';
import SPModal from '../../components/SPModal';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { SPToast } from '../../components/SPToast';
import Header from '../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function MatchingSelectAcademy({ route }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const matchIdx = route?.params?.matchIdx;
  const [selectedAcademy, setSelectedAcademy] = useState();
  const [matchApplies, setMatchApplies] = useState([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // --------------------------------------------------
  // [ Api ]
  // --------------------------------------------------
  const selectAcademy4Match = async () => {
    try {
      const param = {
        matchIdx,
        academyIdx: selectedAcademy,
      };

      const { data } = await apiSelectAcademy4Match(param);
      if (data) {
        handleSubmit();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getMatchDetail = async () => {
    try {
      const { data } = await apiGetMatchDetail(matchIdx);

      if (data) {
        setMatchApplies(data.data.matchApplies);
        if (data.data.matchApplies.length > 0) {
          setSelectedAcademy(data.data.matchApplies[0].academyIdx);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  // --------------------------------------------------
  // [ Utils ]
  // --------------------------------------------------

  const handleSelect = academyIdx => {
    setSelectedAcademy(academyIdx);
  };

  const closeConfirmModal = () => {
    setConfirmModalVisible(false);
  };

  const handleSubmit = () => {
    SPToast.show({ text: '아카데미 매칭이 완료됐어요', visibilityTime: 3000 }); // 3초동안 보여짐
    NavigationService.navigate(navName.matchingDetail, {
      matchIdx,
    }); // 페이지 이동
  };

  // --------------------------------------------------
  // [ UseEffect ]
  // --------------------------------------------------
  useEffect(() => {
    getMatchDetail();
  }, []);

  return (
    <SafeAreaView style={styles.radioContainer}>
      <Header title="아카데미 선택" />

      {matchApplies.map((item, index) => (
        <TouchableOpacity
          /* eslint-disable-next-line react/no-array-index-key */
          key={index}
          style={styles.radioWrapper}
          onPress={() => handleSelect(item.academyIdx)}>
          <Image
            source={
              selectedAcademy === item.academyIdx
                ? SPIcons.icFillRadio
                : SPIcons.icBasicRadio
            }
            style={{ width: 32, height: 32, marginRight: 8 }}
          />
          <Text style={styles.radioLabel}>{item.groupName}</Text>
          {item.logoPath ? (
            <Image
              style={styles.academyDetailImage}
              source={{ uri: item.logoPath }}
            />
          ) : (
            <Image
              style={styles.academyDetailImage}
              source={SPIcons.icDefaultAcademy}
            />
          )}
          <Text style={styles.DetailTitleText}>
            {item.academyName ? item.academyName : '-'}
          </Text>
          {item.certYn === 'Y' && (
            <Image
              source={SPIcons.icCheckBadge}
              style={{ width: 20, height: 20 }}
            />
          )}
        </TouchableOpacity>
      ))}
      <View style={styles.subBtn}>
        <TouchableOpacity
          style={styles.subBtnBox}
          onPress={() => setConfirmModalVisible(true)}>
          <Text style={styles.subBtnText}>선택완료</Text>
        </TouchableOpacity>
      </View>
      <SPModal
        title="아카데미 선택"
        contents="상대 아카데미를 선택하시겠어요?"
        visible={confirmModalVisible}
        twoButton
        onConfirm={() => {
          selectAcademy4Match();
        }}
        onCancel={closeConfirmModal}
        onClose={closeConfirmModal}
      />
    </SafeAreaView>
  );
}

export default memo(MatchingSelectAcademy);

const styles = {
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  academyDetailImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    marginRight: 8,
  },
  DetailTitleText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#121212',
    lineHeight: 26,
    letterSpacing: -0.004,
    marginRight: 4,
    flexShrink: 1,
  },
  radioContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  subBtn: {
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    marginVertical: 24,
  },
  subBtnBox: {},
  subBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
};
