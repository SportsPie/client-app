import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import SPImages from '../../assets/images';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const Event = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedPositions, setSelectedPositions] = useState({
    first: null,
    second: null,
    third: null,
  });

  const updatePosition = position => {
    setSelectedPositions(prev => {
      // 1지망이 비어있으면 1지망에 넣고, 아니면 2지망, 그다음 3지망 순서로 채움
      if (!prev.first) return { ...prev, first: position };
      if (!prev.second) return { ...prev, second: position };
      if (!prev.third) return { ...prev, third: position };
      return prev; // 3지망까지 모두 선택되면 더 이상 업데이트하지 않음
    });
  };

  // 초기화 함수
  const resetPositions = () => {
    setSelectedPositions({
      first: null,
      second: null,
      third: null,
    });
  };

  return (
    <View style={styles.container}>
      {/* 모달을 여는 버튼 */}
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.openButtonText}>모달 열기</Text>
      </TouchableOpacity>

      {/* 모달 컴포넌트 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.imageContainer}>
            <View style={styles.titleGroup}>
              <Text style={styles.titleText}>포지션 선택</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetPositions}>
                <Text style={styles.resetButtonText}>초기화</Text>
              </TouchableOpacity>
            </View>
            <ImageBackground
              source={SPImages.positionImg}
              style={styles.imageBackground}
              resizeMode="contain">
              {/* 공격 버튼 */}
              <View style={[styles.bgButtonBox, styles.atButtonBox]}>
                <TouchableOpacity
                  style={[styles.button, styles.atButton]}
                  onPress={() => updatePosition('ST/CF/SS')}>
                  <Text style={[styles.buttonText, styles.whiteText]}>
                    ST/CF/SS
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.bgButtonGroup, styles.atButtonGroup]}>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.atButton]}
                    onPress={() => updatePosition('RWF/RW')}>
                    <Text style={[styles.buttonText, styles.whiteText]}>
                      RWF/RW
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.mdButton]}
                    onPress={() => updatePosition('CAM')}>
                    <Text style={[styles.buttonText]}>CAM</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.atButton]}
                    onPress={() => updatePosition('LWF/LW')}>
                    <Text style={[styles.buttonText, styles.whiteText]}>
                      LWF/LW
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 미드 버튼 */}
              <View style={[styles.bgButtonGroup, styles.mdButtonGroup]}>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.mdButton]}
                    onPress={() => updatePosition('RM')}>
                    <Text style={[styles.buttonText]}>RM</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.mdButton]}
                    onPress={() => updatePosition('CM')}>
                    <Text style={[styles.buttonText]}>CM</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.mdButton]}
                    onPress={() => updatePosition('LM')}>
                    <Text style={[styles.buttonText]}>LM</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.bgButtonBox, styles.mdButtonBox]}>
                <TouchableOpacity
                  style={[styles.button, styles.mdButton]}
                  onPress={() => updatePosition('CDM')}>
                  <Text style={styles.buttonText}>CDM</Text>
                </TouchableOpacity>
              </View>

              {/* 수비 버튼  */}
              <View style={[styles.bgButtonGroup, styles.dfButtonGroup]}>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.dfButton]}
                    onPress={() => updatePosition('RB/RWB')}>
                    <Text style={[styles.buttonText]}>RB/RWB</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.dfButton]}
                    onPress={() => updatePosition('CB')}>
                    <Text style={[styles.buttonText]}>CB</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.bgButtonBox]}>
                  <TouchableOpacity
                    style={[styles.button, styles.dfButton]}
                    onPress={() => updatePosition('LB/LWB')}>
                    <Text style={[styles.buttonText]}>LB/LWB</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 골키퍼 버튼 */}
              <View style={[styles.bgButtonBox, styles.gkButtonBox]}>
                <TouchableOpacity
                  style={[styles.button, styles.gkButton]}
                  onPress={() => updatePosition('GK')}>
                  <Text style={[styles.buttonText, styles.whiteText]}>GK</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>

            <View style={styles.positionGroup}>
              <View style={styles.positionBox}>
                <Text>1지망</Text>
                <Text>{selectedPositions.first || '-'}</Text>
              </View>

              <View style={styles.positionBox}>
                <Text>2지망</Text>
                <Text>{selectedPositions.second || '-'}</Text>
              </View>

              <View style={[styles.positionBox, { borderRightWidth: 0 }]}>
                <Text>3지망</Text>
                <Text>{selectedPositions.third || '-'}</Text>
              </View>
            </View>
            <View style={styles.buttonGroup}>
              {/* 모달을 닫는 버튼 */}
              <TouchableOpacity
                style={styles.buttonBox}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonBox}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  openButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명한 배경
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff', // 배경색은 흰색으로 설정
    padding: 24,
    // borderRadius: 16,
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 24,
  },
  resetButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF7C10',
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#FF7C10',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  buttonBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'rgba(46, 49, 53, 0.60)',
    fontSize: 14,
  },
  saveButtonText: {
    color: '#FF7C10',
    fontSize: 14,
  },
  button: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#1D1B20',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  bgButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  bgButtonBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  dfButtonGroup: {
    position: 'absolute',
    bottom: '14%',
  },
  atButtonGroup: {
    position: 'absolute',
    top: '28%',
  },
  gkButtonBox: {
    position: 'absolute',
    bottom: '0.5%',
  },
  atButtonBox: {
    position: 'absolute',
    top: '16%',
  },
  whiteText: {
    color: '#FFF',
  },
  gkButton: {
    backgroundColor: '#002672',
  },
  dfButton: {
    backgroundColor: '#97D59D',
  },
  //   mdButtonGroup: {
  //     paddingBottom: 11,
  //   },
  mdButtonBox: {
    position: 'absolute',
    bottom: '28%',
  },
  mdButton: {
    backgroundColor: '#FC0',
  },
  atButton: {
    backgroundColor: '#E01D1D',
  },

  positionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginVertical: 12,
  },
  positionBox: {
    flex: 1, // 동일한 크기로 차지
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: 'rgba(135, 141, 150, 0.22)',
  },
});

export default Event;
