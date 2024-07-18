import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import { getStorage, setStorage } from '../utils/AsyncStorageUtils';
import { CONSTANTS } from '../common/constants/constants';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { SPSvgs } from '../assets/svg';
import { navName } from '../common/constants/navName';
import { wifiSliceActions } from '../redux/reducers/wifiSlice';
import NavigationService from '../navigation/NavigationService';

function NetModal({ props }) {
  const dispatch = useDispatch();
  const pageName = useSelector(selector => selector.nav)?.navName;
  const useWifi = useSelector(selector => selector.wifi)?.useWifi;
  const movePageName = useSelector(selector => selector.wifi)?.movePageName;
  const movePageParam = useSelector(selector => selector.wifi)?.movePageParam;
  const openNetModal = useSelector(selector => selector.wifi)?.openNetModal;
  const [dataModalShow, setDataModalShow] = useState(false);
  const [selected, setSelected] = useState(false);
  const [nextPageName, setNextPageName] = useState('');
  const [nextPageParam, setNextPageParam] = useState({});

  const netCheckList = [navName.training]; // 해당 페이지에 들어오면 Wifi 확인

  const dataModalOpen = (routeName, routeParam) => {
    setSelected(false);
    setDataModalShow(true);
    setNextPageName(routeName);
    setNextPageParam({ ...routeParam });
  };
  const dataModalClose = () => {
    setDataModalShow(false);
  };
  const handleDataOk = async neverShow => {
    await setStorage(CONSTANTS.DATA_CHECK_MODAL_NEVER_SHOW, neverShow);
    dispatch(wifiSliceActions.changeCanMove(true));
    dataModalClose();
    if (nextPageName) NavigationService.navigate(nextPageName, nextPageParam);
  };

  const dataOkCheck = async () => {
    if (!useWifi) {
      const neverShow = await getStorage(CONSTANTS.DATA_CHECK_MODAL_NEVER_SHOW);
      if (pageName && netCheckList.includes(pageName)) {
        if (!(neverShow === 'true')) {
          dataModalOpen(movePageName, movePageParam);
          dispatch(wifiSliceActions.changeMovePageName(''));
          dispatch(wifiSliceActions.changeMovePageParam({}));
        }
        dispatch(wifiSliceActions.changeCanMove(neverShow === 'true'));
      } else if (neverShow === 'true') {
        dispatch(wifiSliceActions.changeCanMove(true));
      } else {
        dispatch(wifiSliceActions.changeCanMove(false));
      }
    } else {
      dataModalClose();
      dispatch(wifiSliceActions.changeCanMove(true));
    }
  };

  useFocusEffect(
    useCallback(() => {
      dataOkCheck();
    }, [useWifi, pageName]),
  );

  useFocusEffect(
    useCallback(() => {
      if (openNetModal) {
        dataModalOpen(movePageName, movePageParam);
        dispatch(wifiSliceActions.changeMovePageName(''));
        dispatch(wifiSliceActions.changeMovePageParam({}));
        dispatch(wifiSliceActions.changeNetModalShow(false));
      }
    }, [openNetModal]),
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={dataModalShow}
      onRequestClose={dataModalClose}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={dataModalClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={e => {
            e.stopPropagation();
          }}
          style={[styles.modalContainer, { gap: 16 }]}>
          <View
            style={{
              alignItems: 'center',
              width: '100%',
              gap: 8,
            }}>
            <Text style={fontStyles.fontSize16_Bold}>데이터 사용 안내</Text>
            <Text
              style={{
                textAlign: 'center',
                ...fontStyles.fontSize13_Regular,
              }}>
              Wi-Fi 이외 네트워크(3G, LTE, 5G)를 사용 중입니다. {`\n`}이 경우
              데이터 요금이 발생할 수 있습니다.{`\n`} 데이터를
              사용하시겠습니까?`
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
              }}>
              <Pressable
                onPress={() => {
                  setSelected(prev => !prev);
                }}
                style={[
                  styles.checkbock,
                  {
                    borderColor: selected ? COLORS.orange : COLORS.lineBorder,
                    backgroundColor: selected ? COLORS.orange : COLORS.white,
                  },
                ]}
                hitSlop={18}>
                <SPSvgs.Check
                  fill={selected ? COLORS.white : 'transparent'}
                  width={16}
                  height={16}
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  setSelected(prev => !prev);
                }}>
                <Text style={styles.lableStyle}>다시 보지 않기</Text>
              </Pressable>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderColor: 'rgba(135, 141, 150, 0.16)',
            }}>
            <Pressable
              style={{
                flexGrow: 1,
                paddingVertical: 16,
                alignItems: 'center',
              }}
              onPress={() => {
                setDataModalShow(false);
              }}>
              <Text
                style={{
                  ...fontStyles.fontSize16_Medium,
                  color: 'rgba(46, 49, 53, 0.60)',
                }}>
                취소
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                handleDataOk(selected);
              }}
              style={{
                flexGrow: 1,
                paddingVertical: 16,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  ...fontStyles.fontSize16_Medium,
                  color: '#1A1C1E',
                }}>
                확인
              </Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  lableStyle: {
    ...fontStyles.fontSize12_Regular,
    color: COLORS.labelNormal,
    lineHeight: 18,
  },
  checkbock: {
    borderWidth: 1,
    width: 20,
    height: 20,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NetModal;
