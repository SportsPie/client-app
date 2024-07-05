import React, { memo, useCallback, useRef, useState } from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SPHeader from '../../components/SPHeader';
import SPIcons from '../../assets/icon';
import SPModal from '../../components/SPModal';
import { TextInput } from 'react-native-gesture-handler';
import { handleError } from '../../utils/HandleError';
import {
  apiDeleteAcademyConfigMngManagers,
  apiGetAcademyConfigMngManagers,
  apiGetAcademyConfigMngManagersFind,
  apiPostAcademyConfigMngManagers,
  apiPutAcademyConfigMngManagers,
} from '../../api/RestAPI';
import DismissKeyboard from '../../components/DismissKeyboard';
import Loading from '../../components/SPLoading';
import { GENDER } from '../../common/constants/gender';
import moment from 'moment';
import Utils from '../../utils/Utils';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { MODAL_CLOSE_EVENT } from '../../common/constants/modalCloseEvent';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function AcademyAdmin({ route }) {
  /**
   * state
   */
  const academyIdx = route?.params?.academyIdx;
  const [addGroupModalShow, setAddGroupModalShow] = useState(false);
  const [adminIdx, setAdminIdx] = useState(null);
  const [adminList, setAdminList] = useState([]);

  // modal
  const [modalShow, setModalShow] = useState(false);
  const [checkModalShow, setCheckModalShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const trlRef = useRef({ current: { disabled: false } });
  const [refresh, setRefresh] = useState(false);

  /**
   * api
   */

  const getAdminList = async () => {
    try {
      const { data } = await apiGetAcademyConfigMngManagers();
      if (data.data && data.data.length > 0) {
        const creator = data.data.find(v => v.creator);
        const admins = data.data.filter(v => !v.creator);
        admins.unshift(creator);
        setAdminList(data.data);
      }
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const changeToMember = async () => {
    closeModal();
    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const { data } = await apiDeleteAcademyConfigMngManagers(adminIdx);
      Utils.openModal({
        title: '성공',
        body: '해당 운영자를 운영자에서 해제하였습니다.',
      });
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */

  const openModal = idx => {
    setAdminIdx(idx);
    setModalShow(true);
  };
  const closeModal = () => {
    setModalShow(false);
  };

  const openCheckModal = () => {
    closeModal();
    setCheckModalShow(true);
  };

  const closeCheckModal = () => {
    setCheckModalShow(false);
  };

  const openFileterModal = () => {
    setAddGroupModalShow(true);
  };

  const closeFileterModal = () => {
    setAddGroupModalShow(false);
  };

  const modalHide = () => {
    setAddGroupModalShow(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getAdminList();
    }, [refresh]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <SPHeader
        title="운영자 관리"
        noLeftLogo
        rightBasicAddButton={SPIcons.icSearch}
        onPressAddRightIcon={() => openFileterModal()}
      />
      <View style={styles.contentList}>
        {adminList && adminList.length > 0 ? (
          adminList.map((item, index) => (
            <View key={index} style={styles.contentItem}>
              <View style={styles.contentBox}>
                {item.profilePath ? (
                  <View style={styles.iconContainer}>
                    <Image
                      source={{ uri: item.profilePath }}
                      style={styles.icon}
                    />
                    <Image
                      source={
                        item.creator ? SPIcons.icSuperAdmin : SPIcons.icAdmin
                      }
                      style={styles.overlayIcon}
                    />
                  </View>
                ) : (
                  <View style={styles.iconContainer}>
                    <Image source={SPIcons.icPerson} style={styles.icon} />
                    <Image
                      source={
                        item.creator ? SPIcons.icSuperAdmin : SPIcons.icAdmin
                      }
                      style={styles.overlayIcon}
                    />
                  </View>
                )}
                <Text style={styles.name}>{item.adminName}</Text>
              </View>
              {/* 관리자 또는 운영자 */}
              <View style={styles.contentBox}>
                <Text style={styles.rating}>
                  {item.creator ? '관리자' : '운영자'}
                </Text>
                {!item.creator && (
                  <TouchableOpacity
                    onPress={() => {
                      openModal(item.userIdx);
                    }}>
                    <Image source={SPIcons.icOptionsVertical} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : loading ? (
          <Loading />
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>운영자가 존재하지 않습니다.</Text>
          </View>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={modalShow}
        onRequestClose={closeModal}>
        <TouchableOpacity style={styles.overlay} onPress={closeModal}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.button} onPress={changeToMember}>
              <View style={styles.modalBox}>
                <Text style={styles.modalText}>운영자 해제</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <SPModal
        title="확인"
        contents="정말로 관리자 권한을 양도하시겠습니까?"
        visible={checkModalShow}
        onConfirm={() => {
          changeToSuperAdmin();
        }}
        onCancel={closeCheckModal}
        onClose={closeCheckModal}
      />

      {/* 운영자 관리 검색 */}
      <AdminSearch
        addGroupModalShow={addGroupModalShow}
        closeFileterModal={closeFileterModal}
        modalHide={modalHide}
        refreshing={() => {
          setRefresh(prev => !prev);
        }}
      />
    </SafeAreaView>
  );
}

export default memo(AcademyAdmin);

/* 관리자 검색 모달 */
function AdminSearch({
  addGroupModalShow,
  closeFileterModal,
  modalHide,
  refreshing,
}) {
  /**
   * state
   */
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState(false);
  const [searchAdminList, setSearchAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberIdx, setMemberIdx] = useState();
  const insets = useSafeAreaInsets();

  // modal
  const [modalShow, setModalShow] = useState(false);

  const trlRef = useRef({ current: { disabled: false } });
  /**
   * api
   */
  const getSearchAdmin = async () => {
    try {
      const params = {
        keyword,
      };
      const { data } = await apiGetAcademyConfigMngManagersFind(params);
      setSearchAdminList(data.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const changeToAdmin = async () => {
    closeModal();
    if (modalHide) modalHide();

    if (trlRef.current.disabled) return;
    trlRef.current.disabled = true;
    try {
      const { data } = await apiPostAcademyConfigMngManagers(memberIdx);
      Utils.openModal({
        title: '성공',
        body: '해당 유저를 운영자로 지정하였습니다.',
      });
      if (refreshing) refreshing();
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  /**
   * function
   */
  const openModal = idx => {
    setMemberIdx(idx);
    setModalShow(true);
  };
  const closeModal = () => {
    setModalShow(false);
  };

  /**
   * useEffect
   */
  useFocusEffect(
    useCallback(() => {
      if (addGroupModalShow) {
        setLoading(true);
        getSearchAdmin();
      }
    }, [addGroupModalShow, search]),
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={addGroupModalShow}
      onRequestClose={closeFileterModal}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
        <DismissKeyboard>
          <View style={{ flex: 1, marginTop: insets.top }}>
            <TouchableOpacity
              onPress={modalHide}
              style={{
                width: '100%',
                height: 60,
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}>
              <Image
                source={SPIcons.icNavCancle}
                style={[{ height: 28, width: 28 }]}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Image
                  source={SPIcons.icSearchGray}
                  style={{ width: 20, height: 20 }}
                />
                <TextInput
                  style={styles.textInput}
                  value={keyword}
                  placeholder="회원 이름을 입력해주세요"
                  placeholderTextColor="rgba(46, 49, 53, 0.60)"
                  onChangeText={text => {
                    if (text?.length > 50) return;
                    setKeyword(text);
                  }}
                  onSubmitEditing={() => {
                    setSearch(prev => !prev);
                  }}
                  returnKeyType="search"
                />
              </View>
              <View style={styles.subContainer}>
                {searchAdminList && searchAdminList.length > 0 ? (
                  searchAdminList.map((item, index) => (
                    <View key={index} style={styles.contentItem}>
                      <View style={styles.contentBox}>
                        {item.profilePath ? (
                          <View style={styles.iconContainer}>
                            <Image
                              source={{ uri: item.profilePath }}
                              style={styles.icon}
                            />
                            {item.creator && (
                              <Image
                                source={SPIcons.icSuperAdmin}
                                style={styles.overlayIcon}
                              />
                            )}
                            {!item.creator && item.admin && (
                              <Image
                                source={SPIcons.icAdmin}
                                style={styles.overlayIcon}
                              />
                            )}
                          </View>
                        ) : (
                          <View style={styles.iconContainer}>
                            <Image
                              source={SPIcons.icPerson}
                              style={styles.icon}
                            />
                            {item.creator && (
                              <Image
                                source={SPIcons.icSuperAdmin}
                                style={styles.overlayIcon}
                              />
                            )}
                            {!item.creator && item.admin && (
                              <Image
                                source={SPIcons.icAdmin}
                                style={styles.overlayIcon}
                              />
                            )}
                          </View>
                        )}
                        <View style={styles.subBox}>
                          <Text style={styles.subName}>{item.adminName}</Text>
                          <View style={styles.subInfo}>
                            <Text style={styles.subInfoText}>
                              {moment(item.adminBirth).format('YYYY.MM.DD')} (
                              {item.adminAge}세)
                            </Text>
                            <View style={styles.subCircle} />
                            <Text style={styles.subInfoText}>
                              {GENDER[item.adminGender]?.desc}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.contentBox}>
                        {item.admin || item.creator ? (
                          <View>
                            <Text
                              style={{
                                ...fontStyles.fontSize11_Medium,
                                color: COLORS.darkBlue,
                              }}>
                              {item.creator ? '관리자' : '운영자'}
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => {
                              openModal(item.userIdx);
                            }}>
                            <Image source={SPIcons.icOptionsVertical} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                ) : loading ? (
                  <Loading />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>내역이 존재하지 않습니다.</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </DismissKeyboard>
      </SafeAreaView>
      <Modal
        animationType="fade"
        transparent
        visible={modalShow}
        onRequestClose={closeModal}>
        <TouchableOpacity style={styles.overlay} onPress={closeModal}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.button} onPress={changeToAdmin}>
              <View style={styles.modalBox}>
                <Text style={styles.modalText}>운영자 지정</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overlayIcon: {
    position: 'absolute',
    width: 13.33,
    height: 13.33,
    bottom: 0,
    right: 0,
  },
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
  button: {
    width: '100%',
    paddingVertical: 16,
  },
  modalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF4EE',
    gap: 4,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  textInput: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 20,
    letterSpacing: 0.203,
    width: '100%',
  },
  name: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  rating: {
    fontSize: 11,
    fontWeight: 500,
    color: '#313779',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  subContainer: {
    flex: 1,
    paddingTop: 24,
  },
  subBox: {
    flexDirection: 'column',
    gap: 4,
  },
  subName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  subInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subInfoText: {
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.60)',
    lineHeight: 14,
    letterSpacing: 0.342,
  },
  subCircle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(135, 141, 150, 0.22)',
  },
};
