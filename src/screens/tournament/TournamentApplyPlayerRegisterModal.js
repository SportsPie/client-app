import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import moment from 'moment';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView as View,
} from '@gorhom/bottom-sheet';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SPSvgs } from '../../assets/svg';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { PrimaryButton } from '../../components/PrimaryButton';
import Utils from '../../utils/Utils';
import { GENDER } from '../../common/constants/gender';
import { POSITION_TYPE } from '../../common/constants/positionType';
import DatePicker from 'react-native-date-picker';
import SPKeyboardAvoidingView from '../../components/SPKeyboardAvoidingView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TournamentApplyPlayerRegisterModal = forwardRef(
  ({ sendAmount, receiveAmount, remainAmount, onConfirm }, ref) => {
    /**
     * state
     */
    const insets = useSafeAreaInsets();
    const trlRef = useRef({ current: { disabled: false } });
    const modalRef = useRef();

    const [spinning, setSpinning] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [playerGender, setPlayerGender] = useState(null);
    const isGenderMale = playerGender === GENDER.M.value;
    const isGenderFemale = playerGender === GENDER.F.value;

    const [showBirthCalendar, setShowBirthCalendar] = useState(false);
    const [playerBirthday, setPlayerBirthday] = useState('');
    const isBirthdaySelected = !!playerBirthday;

    const [playerPosition, setPlayerPosition] = useState(POSITION_TYPE.NO.code);
    const positionList = [
      POSITION_TYPE.FW.code,
      POSITION_TYPE.MF.code,
      POSITION_TYPE.DF.code,
      POSITION_TYPE.GK.code,
    ];

    const [playerUniformNumber, setPlayerUniformNumber] = useState();

    const isRequiredInputCompleted =
      !!playerName && !!playerGender && !!playerBirthday;

    /**
     * function
     */
    const show = () => {
      resetPlayerData();
      modalRef?.current?.present();
    };

    const hide = () => {
      modalRef?.current?.close();
    };

    useImperativeHandle(ref, () => ({ show, hide }), []);

    const resetPlayerData = () => {
      setPlayerName('');
      setPlayerGender(null);
      setPlayerBirthday('');
      setPlayerPosition(POSITION_TYPE.NO.code);
      setPlayerUniformNumber('');
    };

    const handleConfirm = e => {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      hide();
      setTimeout(() => {
        const params = {
          userIdx: new Date().getTime(),
          playerName,
          playerGender,
          playerBirth: playerBirthday,
          position: playerPosition,
          backNo: playerUniformNumber,
          directAdd: true,
        };
        if (onConfirm) onConfirm(params);
        resetPlayerData();
        trlRef.current.disabled = false;
      }, 0);
    };

    /**
     * render
     */

    const renderBackdrop = useCallback(
      props => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        ref={modalRef}
        snapPoints={['90%']}
        handleComponent={null}
        index={0}
        enablePanDownToClose={false}
        enableDismissOnPanMovement={false}>
        <SPKeyboardAvoidingView
          behavior="padding"
          isResize={true}
          keyboardVerticalOffset={0}
          style={{
            flex: 1,
            padding: 0,
            margin: 0,
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContentsContainer}>
              <View style={styles.headerWrapper}>
                <Text style={styles.headerTitle}>선수 정보 직접 입력</Text>
                <Pressable hitSlop={20} onPress={hide}>
                  <SPSvgs.Close width={24} height={24} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={{ rowGap: 16 }}>
                <View style={styles.formInputWrapper}>
                  <Text style={styles.formInputLabel}>선수 이름</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="선수 이름을 입력해주세요"
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={text => {
                      setPlayerName(text);
                    }}
                    maxLength={15}
                  />
                </View>
                <View style={styles.formInputWrapper}>
                  <Text style={styles.formInputLabel}>성별</Text>
                  <View style={styles.genderSelectWrapper}>
                    <Pressable
                      style={styles.genderToggleWrapper}
                      onPress={() => setPlayerGender(GENDER.M.value)}>
                      <View
                        style={[
                          styles.genderToggleIcon,
                          isGenderMale && styles.genderToggleIconActive,
                        ]}>
                        <SPSvgs.GenderMale
                          width={28}
                          height={28}
                          color={
                            isGenderMale
                              ? COLORS.white
                              : COLORS.interactionInactive
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.genderToggleText,
                          isGenderMale && styles.genderToggleTextActive,
                        ]}>
                        남자
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.genderToggleWrapper}
                      onPress={() => setPlayerGender(GENDER.F.value)}>
                      <View
                        style={[
                          styles.genderToggleIcon,
                          isGenderFemale && styles.genderToggleIconActive,
                        ]}>
                        <SPSvgs.GenderFemale
                          width={28}
                          height={28}
                          color={
                            isGenderFemale
                              ? COLORS.white
                              : COLORS.interactionInactive
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.genderToggleText,
                          isGenderFemale && styles.genderToggleTextActive,
                        ]}>
                        여자
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.formInputWrapper}>
                  <Text style={styles.formInputLabel}>생년월일</Text>
                  <Pressable
                    style={[styles.formTextInput, styles.calendarButtonWrapper]}
                    onPress={() => setShowBirthCalendar(true)}>
                    <Text
                      style={[
                        styles.playerBirthdayText,
                        isBirthdaySelected && styles.playerBirthdaySelected,
                      ]}>
                      {isBirthdaySelected
                        ? moment(playerBirthday).format('YYYY.MM.DD')
                        : '생년월일을 선택해주세요'}
                    </Text>
                    <SPSvgs.Calendar />
                  </Pressable>
                  <View>
                    <Modal
                      transparent={true}
                      visible={showBirthCalendar}
                      onRequestClose={() => {
                        setSpinning(false);
                        setShowBirthCalendar(false);
                      }}>
                      <TouchableOpacity
                        style={styles.calenderModalContainer}
                        activeOpacity={1}
                        onPressOut={() => {
                          setSpinning(false);
                          setShowBirthCalendar(false);
                        }}>
                        <View style={styles.modalContent}>
                          <View style={styles.modalTitle}>
                            <Text style={styles.modalTitleText}>
                              생년월일을 선택해주세요.
                            </Text>
                          </View>
                          <DatePicker
                            date={selectedDate}
                            mode="date"
                            onDateChange={date => {
                              setSelectedDate(date);
                            }}
                            onCancel={() => {
                              setSpinning(false);
                              setShowBirthCalendar(false);
                            }}
                            theme="light"
                            locale="ko"
                            is24hourSource="locale"
                            onStateChange={state => {
                              setSpinning(state === 'spinning');
                            }}
                            maximumDate={new Date()}
                          />
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity
                              style={styles.calenderCancelButton}
                              onPress={() => setShowBirthCalendar(false)}>
                              <Text style={styles.calenderCancelButtonText}>
                                취소
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.confirmButton,
                                { opacity: spinning ? 0.38 : 1 },
                              ]}
                              onPress={e => {
                                e.stopPropagation();
                                if (spinning) return;
                                setPlayerBirthday(
                                  moment(selectedDate).format('YYYY-MM-DD'),
                                );
                                setShowBirthCalendar(false);
                              }}>
                              <Text style={styles.confirmButtonText}>확인</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>
                </View>
                <View style={styles.formInputWrapper}>
                  <Text style={styles.formInputLabel}>포지션(선택)</Text>
                  <View style={styles.positionSelectWrapper}>
                    {positionList.map(position => {
                      const isSelected = position === playerPosition;
                      return (
                        <Pressable
                          key={`player_register_position_${position}`}
                          style={styles.positionToggle}
                          onPress={() =>
                            setPlayerPosition(
                              isSelected ? POSITION_TYPE.NO.code : position,
                            )
                          }>
                          <View
                            style={[
                              styles.positionToggleButton,
                              isSelected && styles.positionToggleButtonActive,
                            ]}>
                            <Text
                              style={[
                                styles.positionToggleText,
                                isSelected && styles.positionToggleTextActive,
                              ]}>
                              {position}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.formInputWrapper}>
                  <Text style={styles.formInputLabel}>등 번호(선택)</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder="등 번호를 입력해주세요"
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="numeric"
                    maxLength={2}
                    onChangeText={text => {
                      setPlayerUniformNumber(Utils.onlyNumber(text));
                    }}
                  />
                </View>
              </ScrollView>
              <View
                style={[
                  styles.bottomButtonWrapper,
                  { paddingBottom: insets.bottom },
                ]}>
                <PrimaryButton
                  text="취소"
                  onPress={hide}
                  outlineButton
                  buttonStyle={styles.cancelButton}
                  buttonTextStyle={styles.cancelButtonText}
                />
                <PrimaryButton
                  text="선수 추가"
                  disabled={!isRequiredInputCompleted}
                  onPress={e => {
                    e.stopPropagation();
                    handleConfirm(e);
                  }}
                  outlineButton
                  buttonStyle={[
                    styles.registerButton,
                    !isRequiredInputCompleted && styles.registerButtonDisabled,
                  ]}
                  buttonTextStyle={[
                    styles.registerButtonText,
                    !isRequiredInputCompleted &&
                      styles.registerButtonTextDisabled,
                  ]}
                />
              </View>
            </View>
          </View>
        </SPKeyboardAvoidingView>
      </BottomSheetModal>
    );
  },
);

export default memo(TournamentApplyPlayerRegisterModal);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    rowGap: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalContentsContainer: {
    flex: 1,
    rowGap: 24,
    paddingHorizontal: 16,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.black,
    letterSpacing: -0.24,
  },
  formInputWrapper: { rowGap: 4 },
  formInputLabel: { ...fontStyles.fontSize12_Regular, letterSpacing: 0.302 },
  formTextInput: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border0,
    ...fontStyles.fontSize14_Regular,
    letterSpacing: 0.203,
  },
  genderSelectWrapper: {
    flexDirection: 'row',
    columnGap: 8,
  },
  genderToggleWrapper: {
    rowGap: 4,
    alignItems: 'center',
  },
  genderToggleIcon: {
    width: 48,
    height: 48,
    padding: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border0,
    backgroundColor: COLORS.fillStrong,
  },
  genderToggleIconActive: {
    borderWidth: 0,
    backgroundColor: COLORS.orange,
  },
  genderToggleText: {
    ...fontStyles.fontSize14_Medium,
    color: 'rgba(46, 49, 53, 0.60)',
    letterSpacing: 0.203,
  },
  genderToggleTextActive: {
    color: COLORS.orange,
  },
  calendarButtonWrapper: {
    flexDirection: 'row',
    columnGap: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerBirthdayText: {
    ...fontStyles.fontSize14_Regular,
    color: 'rgba(46, 49, 53, 0.60)',
    letterSpacing: 0.203,
  },
  playerBirthdaySelected: {
    color: COLORS.labelNormal,
  },
  calendarModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  calendarModalContents: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  calendarTitle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  calendarTitleText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    textAlign: 'left',
  },
  positionSelectWrapper: {
    flexDirection: 'row',
    columnGap: 8,
  },
  positionToggle: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  positionToggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border0,
    backgroundColor: COLORS.fillStrong,
  },
  positionToggleButtonActive: {
    borderWidth: 0,
    backgroundColor: COLORS.orange,
  },
  positionToggleText: {
    ...fontStyles.fontSize14_Medium,
    color: 'rgba(46, 49, 53, 0.60)',
    letterSpacing: 0.203,
    textAlign: 'center',
  },
  positionToggleTextActive: {
    color: COLORS.white,
  },
  bottomButtonWrapper: {
    flexDirection: 'row',
    columnGap: 10,
    paddingVertical: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    borderColor: 'rgba(135, 141, 150, 0.32)',
  },
  cancelButtonText: { letterSpacing: 0.144 },
  registerButton: {
    flex: 1,
    borderColor: COLORS.orange,
  },
  registerButtonDisabled: {
    borderColor: COLORS.border0,
    backgroundColor: COLORS.white,
  },
  registerButtonText: {
    color: COLORS.orange,
    letterSpacing: 0.091,
  },
  registerButtonTextDisabled: {
    color: COLORS.labelDisable,
  },
  registerButtonActive: {},
  bottomButton: { paddingHorizontal: 16 },
  bottomButtonDisabled: {},
  bottomButtonText: { letterSpacing: 0.091 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 16,
  },
  calenderModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
    textAlign: 'left',
  },
  calendar: {
    width: '100%',
  },
  calenderCancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
    marginRight: 8,
    alignItems: 'center',
  },
  calenderCancelButtonText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 22,
    letterSpacing: 0.144,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF7C10',
    borderWidth: 1,
    borderColor: '#FF7C10',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 9,
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
  selectedBackground: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
