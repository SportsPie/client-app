import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView as View,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import { PrimaryButton } from './PrimaryButton';
import Utils from '../utils/Utils';
import Stepper from './Stepper';
import CloseCircle from '../assets/svg/CloseCircle';
import CheckboxChecked from '../assets/svg/CheckboxChecked';
import CheckboxUnchecked from '../assets/svg/CheckboxUnchecked';
import ChevronDown from '../assets/svg/ChevronDown';
import TextModal from './TextModal';
import { ENTRY_FEE_TYPE } from '../common/constants/entryFeeType';
import { handleError } from '../utils/HandleError';
import { apiGetTournamentMngTarget } from '../api/RestAPI';
import { ACTIVE_OPACITY } from '../common/constants/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Collapsible from 'react-native-collapsible';

// HandleComponent를 화살표 함수로 변경하고 memo로 감싸기
const HandleComponent = memo(() => (
  <View style={styles.handleContainer}>
    <View style={styles.handle} />
  </View>
));

const PaymentModal = forwardRef(
  (
    {
      onConfirm,
      isDuplicate = true,
      duplicateTarget = false,
      targetList = [],
      optionList = [],
      minCnt = 0,
      tournamentIdx,
    },
    ref,
  ) => {
    /**
     * state
     */
    const insets = useSafeAreaInsets();
    const hasOptions = optionList?.length > 0;
    const [personCount, setPersonCount] = useState(1);
    const [isOptionSelection, setIsOptionSelection] = useState(true);
    const modalRef = useRef();
    const [spModalVisible, setSpModalVisible] = useState(isDuplicate);
    const [minCntCheckModal, setMinCntCheckModal] = useState(false);

    const [openDropdown, setOpenDropdown] = useState(() => {
      const initialOpenSections = new Set(['participant']);
      optionList?.forEach(option => {
        if (option.requiredYn === 'Y') {
          initialOpenSections.add(option.opIdx);
        }
      });

      return initialOpenSections;
    });

    const [checkedItems, setCheckedItems] = useState(() => {
      const initialCheckedItems = {
        participant: {},
      };
      if (targetList?.length === 1) {
        initialCheckedItems.participant[targetList[0].targetIdx] = true;
      }

      optionList?.forEach(option => {
        initialCheckedItems[option.opIdx] = {};
        option?.itemList?.forEach(optionDetail => {
          if (initialCheckedItems?.[option.opIdx]?.[optionDetail.itemIdx])
            initialCheckedItems[option.opIdx][optionDetail.itemIdx] = false;
        });
      });
      return initialCheckedItems;
    });

    const [dropdownSelections, setDropdownSelections] = useState(() => {
      const initialSelections = {};
      if (targetList?.length === 1) {
        // eslint-disable-next-line prefer-destructuring
        initialSelections.participant = targetList[0];
      }
      optionList?.forEach(option => {
        initialSelections[option.opIdx] = option.multipleYn === 'Y' ? [] : null;
      });
      return initialSelections;
    });

    // 선택된 항목들의 수량을 관리하는 상태 추가
    const [selectedItemCounts, setSelectedItemCounts] = useState({});

    const snapPoints = useMemo(() => {
      if (!(targetList?.length > 1 || optionList?.length > 0)) {
        return [253];
      }

      if (hasOptions) {
        return ['70%'];
      }
      return [400];
    }, [targetList, hasOptions]);

    /**
     * function
     */

    const goNext = async () => {
      try {
        // 타겟 중복 신청 체크
        const { data } = await apiGetTournamentMngTarget(
          dropdownSelections?.participant?.targetIdx,
        );
        if (data.intended) {
          setSpModalVisible(true);
          return;
        }

        // 최소 인원 체크
        if (
          dropdownSelections?.participant?.entryFeeType ===
          ENTRY_FEE_TYPE.INDIVIDUAL.value
        ) {
          if (personCount < minCnt) {
            setMinCntCheckModal(true);
            return;
          }
        }

        // 결과 구조화
        const totalPrice = calculateTotalAmount();
        const selectedOption = optionList
          ?.map(option => {
            const selections = dropdownSelections[option.opIdx];
            if (selections) {
              return Array.isArray(selections)
                ? selections
                    .map(item => {
                      return {
                        opdIdx: item.itemIdx,
                        opCnt: selectedItemCounts[item.itemIdx] || 1,
                        optionName: item.itemName,
                        optionPrice: item.itemPrice,
                      };
                    })
                    .flat()
                : {
                    opdIdx: selections.itemIdx,
                    opCnt: selectedItemCounts[selections.itemIdx] || 1,
                    optionName: selections.itemName,
                    optionPrice: selections.itemPrice,
                  };
            }
            return null;
          })
          .flat()
          ?.filter(item => !!item);
        const result = {
          tournamentIdx,
          targetIdx: dropdownSelections?.participant?.targetIdx,
          targetName: dropdownSelections?.participant?.targetName,
          entryFeeType: dropdownSelections?.participant?.entryFeeType,
          personCount,
          totalPrice,
          selectedOption: selectedOption?.length > 0 ? selectedOption : null,
          minCnt,
        };

        if (onConfirm) onConfirm(result);
      } catch (error) {
        handleError(error);
      }
    };

    // 필수 옵션 선택 여부를 확인하는 함수
    const isRequiredOptionsSelected = useCallback(() => {
      // 참가자 선택은 항상 필수
      if (!dropdownSelections.participant) return false;

      if (hasOptions) {
        const requiredSections = optionList?.filter(
          section => section.requiredYn === 'Y',
        );
        return requiredSections.every(option => {
          const selection = dropdownSelections[option.opIdx];
          return (
            selection &&
            (Array.isArray(selection) ? selection.length > 0 : true)
          );
        });
      }

      return true;
    }, [dropdownSelections, hasOptions]);

    const show = useCallback(() => {
      modalRef?.current?.present();
    }, []);

    const hide = useCallback(() => {
      modalRef?.current?.dismiss();
    }, []);

    useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

    const handleDropdownPress = type => {
      setOpenDropdown(prev => {
        const newSet = new Set(prev);
        if (newSet.has(type)) {
          newSet.delete(type);
        } else {
          newSet.add(type);
        }
        return newSet;
      });
    };

    const handleDropdownSelect = (sectionId, selectedItem) => {
      // participant 섹션일 경우 별도 처리
      if (sectionId === 'participant') {
        setCheckedItems(prev => ({
          ...prev,
          participant: {
            ...Object.keys(prev.participant).reduce(
              (acc, key) => ({
                ...acc,
                [key]: false,
              }),
              {},
            ),
            [selectedItem.targetIdx]:
              !prev.participant?.[selectedItem.targetIdx],
          },
        }));

        setDropdownSelections(prev => ({
          ...prev,
          participant:
            prev.participant?.targetIdx === selectedItem.targetIdx
              ? null
              : selectedItem,
        }));

        setPersonCount(1);
        return;
      }

      const section = optionList?.find(s => s.opIdx === sectionId);
      if (section.multipleYn === 'Y') {
        // 복수 선택인 경우: 토글
        setCheckedItems(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            [selectedItem.itemIdx]: !prev[sectionId]?.[selectedItem.itemIdx],
          },
        }));

        setDropdownSelections(prev => {
          const currentSelections = prev[sectionId] || [];
          const isSelected = currentSelections.some(
            item => item.itemIdx === selectedItem.itemIdx,
          );

          return {
            ...prev,
            [sectionId]: isSelected
              ? currentSelections.filter(
                  item => item.itemIdx !== selectedItem.itemIdx,
                )
              : [...currentSelections, selectedItem],
          };
        });
      } else {
        // 단일 선택 경우: 기존 선택 모두 해제 후 새로운 선택
        setCheckedItems(prev => ({
          ...prev,
          [sectionId]: {
            [selectedItem.itemIdx]: !prev[sectionId]?.[selectedItem.itemIdx],
          },
        }));

        setDropdownSelections(prev => ({
          ...prev,
          [sectionId]:
            prev[sectionId]?.itemIdx === selectedItem.itemIdx
              ? null
              : selectedItem,
        }));
      }

      setSelectedItemCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[selectedItem.itemIdx];
        return newCounts;
      });
    };

    // 총 금액 계산 함수
    const calculateTotalAmount = useCallback(() => {
      let total = 0;

      // 참가 대상 금액 산
      if (dropdownSelections.participant) {
        total += dropdownSelections.participant.entryFee * personCount;
      }

      // 나머지 선택된 항목들의 금액 계산
      optionList?.forEach(option => {
        const selections = dropdownSelections[option.opIdx];
        if (selections) {
          const items = Array.isArray(selections) ? selections : [selections];
          items.forEach(item => {
            const count = selectedItemCounts[item.itemIdx] || 1;
            total += item.itemPrice * count;
          });
        }
      });

      return total;
    }, [dropdownSelections, personCount, selectedItemCounts]);

    // 개별 항목 수량 변경 핸들러
    const handleItemCountChange = (itemId, newCount) => {
      setSelectedItemCounts(prev => ({
        ...prev,
        [itemId]: newCount,
      }));
    };

    /**
     * useEffect
     */

    useEffect(() => {
      if (targetList?.length === 1) {
        setCheckedItems(prev => ({
          ...prev,
          participant: {
            [targetList[0]?.targetIdx]: true,
          },
        }));

        setDropdownSelections(prev => ({
          ...prev,
          participant: targetList[0],
        }));
      }
    }, [targetList]);

    useEffect(() => {
      setSpModalVisible(isDuplicate);
    }, [isDuplicate]);

    useEffect(() => {
      if (optionList?.length > 0) {
        setOpenDropdown(prev => {
          const newSet = new Set(prev);
          optionList.forEach(option => {
            if (option.requiredYn === 'Y') {
              newSet.add(option.opIdx);
            }
          });
          return newSet;
        });
      }
    }, [optionList]);

    /**
     * render
     */

    const renderOptionItem = (item, isParticipant = false) => {
      const isTeam =
        isParticipant && item?.entryFeeType === ENTRY_FEE_TYPE.TEAM.value;
      return (
        <View style={styles.optionItem}>
          <View style={styles.optionLabelWrapper}>
            <Text style={(styles.optionLabel, { flexShrink: 1 })}>
              {isParticipant ? item.targetName : item.itemName}
            </Text>
            {targetList?.length > 1 && optionList?.length > 0 && (
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={styles.removeButton}
                onPress={() => {
                  const sectionId = isParticipant
                    ? 'participant'
                    : optionList.find(option =>
                        option.itemList.some(
                          optionDetail => optionDetail.itemIdx === item.itemIdx,
                        ),
                      )?.opIdx;
                  if (sectionId) {
                    if (sectionId === 'participant') {
                      setDropdownSelections(prev => ({
                        ...prev,
                        [sectionId]: Array.isArray(prev[sectionId])
                          ? prev[sectionId].filter(
                              i => i.targetIdx !== item.targetIdx,
                            )
                          : null,
                      }));

                      setCheckedItems(prev => ({
                        ...prev,
                        [sectionId]: {
                          ...prev[sectionId],
                          [item.targetIdx]: false,
                        },
                      }));
                      setPersonCount(1);
                    } else {
                      setDropdownSelections(prev => ({
                        ...prev,
                        [sectionId]: Array.isArray(prev[sectionId])
                          ? prev[sectionId].filter(
                              i => i.itemIdx !== item.itemIdx,
                            )
                          : null,
                      }));

                      setCheckedItems(prev => ({
                        ...prev,
                        [sectionId]: {
                          ...prev[sectionId],
                          [item.itemIdx]: false,
                        },
                      }));

                      setSelectedItemCounts(prev => {
                        const newCounts = { ...prev };
                        delete newCounts[item.itemIdx];
                        return newCounts;
                      });
                    }
                  }
                }}>
                <CloseCircle width={24} height={24} />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles.optionValueWrapper,
              isTeam && isParticipant && { justifyContent: 'flex-end' },
            ]}>
            {!(isTeam && isParticipant) && (
              <Stepper
                maxValue={99}
                value={
                  isParticipant
                    ? personCount
                    : selectedItemCounts[
                        isParticipant ? item.targetIdx : item.itemIdx
                      ] || 1
                }
                onChange={newValue => {
                  if (isParticipant) {
                    setPersonCount(newValue);
                  } else {
                    handleItemCountChange(item.itemIdx, newValue);
                  }
                }}
              />
            )}
            {isParticipant ? (
              <Text style={styles.optionPrice}>
                {Utils.changeNumberComma(item.entryFee * personCount)}원
              </Text>
            ) : (
              <Text style={styles.optionPrice}>
                {Utils.changeNumberComma(
                  item.itemPrice * (selectedItemCounts[item.itemIdx] || 1),
                )}
                원
              </Text>
            )}
          </View>
        </View>
      );
    };

    const renderBackdrop = useCallback(
      props => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    const renderDropdownSections = () => (
      <View style={styles.dropdownSectionsContainer}>
        {optionList?.map(option => (
          <View key={option.opIdx} style={[styles.dropdownSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {option.requiredYn === 'Y' ? '옵션(필수)' : '옵션(선택)'}
              </Text>
              {option.multipleYn === 'Y' ? (
                <Text style={styles.sectionSubtitle}>복수 선택 가능</Text>
              ) : (
                <Text style={styles.sectionSubtitle}>최대 1개 선택가능</Text>
              )}
            </View>
            <View
              style={[
                styles.dropDownWrap,
                openDropdown.has(option.opIdx) && styles.dropDownWrapOpen,
              ]}>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={[styles.dropdownButton]}
                onPress={() => handleDropdownPress(option.opIdx)}>
                <Text style={(styles.dropdownButtonText, { flexShrink: 1 })}>
                  {option.opName}
                </Text>
                <View
                  style={[
                    openDropdown.has(option.opIdx) &&
                      styles.dropdownIconRotated,
                  ]}>
                  <ChevronDown width={24} height={24} />
                </View>
              </TouchableOpacity>
            </View>
            <Collapsible
              collapsed={!openDropdown.has(option.opIdx)}
              duration={500}
              style={styles.dropdownContent}>
              {option?.itemList?.map(optionDetail => (
                <TouchableOpacity
                  activeOpacity={ACTIVE_OPACITY}
                  key={`dropdown-${optionDetail.itemIdx}`}
                  style={styles.dropdownItem}
                  onPress={() =>
                    handleDropdownSelect(option.opIdx, optionDetail)
                  }>
                  <View style={styles.checkboxContainer}>
                    {checkedItems?.[option.opIdx]?.[optionDetail.itemIdx] ? (
                      <CheckboxChecked />
                    ) : (
                      <CheckboxUnchecked />
                    )}
                    <Text style={styles.dropdownItemText}>
                      {optionDetail.itemName}
                    </Text>
                  </View>
                  <Text style={styles.dropdownItemPrice}>
                    +{Utils.changeNumberComma(optionDetail.itemPrice)}원
                  </Text>
                </TouchableOpacity>
              ))}
            </Collapsible>
          </View>
        ))}
      </View>
    );

    const renderSelectedItems = () => (
      <View>
        {dropdownSelections.participant && (
          <View style={styles.selectedItemWrapper}>
            {renderOptionItem(dropdownSelections.participant, true)}
          </View>
        )}

        {optionList?.map(option => {
          const selections = dropdownSelections[option.opIdx];
          if (
            !selections ||
            (Array.isArray(selections) && selections.length === 0)
          ) {
            return null;
          }

          const items = Array.isArray(selections) ? selections : [selections];
          return items.map(item => (
            <View
              key={`selected-${item.itemIdx}`}
              style={styles.selectedItemWrapper}>
              {renderOptionItem(item)}
            </View>
          ));
        })}
      </View>
    );

    const renderContent = () => {
      return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <View
              style={[
                styles.optionsWrapper,
                !hasOptions && { paddingBottom: 16 },
              ]}>
              {(targetList?.length > 1 || optionList?.length > 0) && (
                <View>
                  <Text style={styles.headlineText}>참가 대상</Text>
                  <View
                    style={[
                      styles.dropDownWrap,
                      openDropdown.has('participant') &&
                        styles.dropDownWrapOpen,
                    ]}>
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      style={[styles.dropdownButton]}
                      onPress={() => handleDropdownPress('participant')}>
                      <Text
                        style={[
                          dropdownSelections.participant
                            ? styles.dropdownButtonTextSelected
                            : styles.dropdownButtonText,
                          { flexShrink: 1 },
                        ]}>
                        {dropdownSelections.participant?.targetName || '선택'}
                      </Text>
                      <View
                        style={[
                          openDropdown.has('participant') &&
                            styles.dropdownIconRotated,
                        ]}>
                        <ChevronDown width={24} height={24} />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <Collapsible
                    style={styles.dropdownContent}
                    collapsed={!openDropdown.has('participant')}
                    duration={500}>
                    {targetList?.map(item => (
                      <TouchableOpacity
                        activeOpacity={ACTIVE_OPACITY}
                        key={`dropdown-${item.targetIdx}`}
                        style={styles.dropdownItem}
                        onPress={() =>
                          handleDropdownSelect('participant', item)
                        }>
                        <View style={styles.checkboxContainer}>
                          {checkedItems.participant?.[item?.targetIdx] ? (
                            <CheckboxChecked style={styles.checkbox} />
                          ) : (
                            <CheckboxUnchecked style={styles.checkbox} />
                          )}
                          <Text style={styles.dropdownItemText}>
                            {item?.targetName}(
                            {ENTRY_FEE_TYPE[item?.entryFeeType]?.feeUnit})
                          </Text>
                        </View>
                        <Text style={styles.dropdownItemPrice}>
                          +{Utils.changeNumberComma(item?.entryFee)}원
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </Collapsible>
                </View>
              )}

              {optionList?.length > 0 && renderDropdownSections()}
              {renderSelectedItems()}
              <View style={[styles.totalWrapper]}>
                <Text style={styles.totalLabel}>총 금액</Text>
                <Text style={styles.totalAmount}>
                  {Utils.changeNumberComma(calculateTotalAmount())}원
                </Text>
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.bottomContainer,
              !hasOptions && styles.bottomContainerNoBorder,
            ]}>
            <PrimaryButton
              text="다음"
              buttonStyle={styles.button}
              onPress={goNext}
              disabled={!isRequiredOptionsSelected()}
            />
          </View>
        </View>
      );
    };

    // 최소 인원 체크 모달
    const minPersonModal = () => (
      <TextModal
        visible={minCntCheckModal}
        title="안내"
        content={
          <Text style={styles.contents}>
            참가 대상 인원은 {'\n'}
            최소{' '}
            <Text style={styles.boldText}>
              {`${Utils.changeNumberComma(minCnt)}명 이상`}
            </Text>
            {'\n'}
            선택해주시기 바랍니다.
          </Text>
        }
        confirmButtonText="확인"
        onConfirm={() => {
          setMinCntCheckModal(false);
        }}
        onClose={() => {
          setMinCntCheckModal(false);
        }}
      />
    );

    // 일반 중복 신청 모달
    const duplicateModal = () => (
      <TextModal
        visible={spModalVisible}
        title="안내"
        content={
          <Text style={styles.contents}>
            이미 해당 대회에 접수 신청 하셨습니다.{'\n'}
            중복 신청은 불가합니다.{'\n'}
            접수 내역은{' '}
            <Text style={styles.boldText}>아카데미 관리의 대회 접수 내역</Text>
            을{'\n'}
            통해 확인 가능합니다.
          </Text>
        }
        confirmButtonText="확인"
        onConfirm={() => {
          setSpModalVisible(false);
        }}
        onClose={() => {
          setSpModalVisible(false);
        }}
      />
    );

    // 특정 참가 대상 중복 신청 모달
    const targetDuplicateModal = () => (
      <TextModal
        visible={spModalVisible}
        title="안내"
        content={
          <Text style={styles.contents}>
            이미{' '}
            <Text style={styles.boldText}>
              {dropdownSelections?.participant?.targetName}
            </Text>
            에 접수 신청 하셨습니다.{'\n'}
            같은 대상에 중복 신청은 불가합니다.{'\n'}
            접수 내역은{' '}
            <Text style={styles.boldText}>아카데미 관리의 대회 접수 내역</Text>
            을{'\n'}
            통해 확인 가능합니다.
          </Text>
        }
        confirmButtonText="확인"
        onConfirm={() => {
          setSpModalVisible(false);
        }}
        onClose={() => {
          setSpModalVisible(false);
        }}
      />
    );

    return (
      <>
        {duplicateModal()}
        {targetDuplicateModal()}
        {minPersonModal()}
        <BottomSheetModal
          ref={modalRef}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          handleComponent={HandleComponent}
          animateOnMount={true}
          enableOverDrag={false}
          index={0}>
          {renderContent()}
        </BottomSheetModal>
      </>
    );
  },
);

export default memo(PaymentModal);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  button: {
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  content: {
    marginHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  amountText: {
    ...fontStyles.fontSize16_Semibold,
  },
  headlineText: {
    ...fontStyles.fontSize14_Regular,
    marginVertical: 8,
  },
  handleContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    width: 66,
    height: 5,
    backgroundColor: '#3C3C434D',
    borderRadius: 2.5,
    alignSelf: 'center',
  },
  totalWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 16,
    marginBottom: 8,
  },
  totalLabel: {
    ...fontStyles.fontSize18_Medium,
  },
  totalAmount: {
    ...fontStyles.fontSize20_Semibold,
    color: COLORS.orange,
  },
  perPersonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  perPersonAmount: {
    ...fontStyles.fontSize16_Semibold,
  },
  bottomContainer: {
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  bottomContainerNoBorder: {
    borderTopWidth: 0,
  },
  optionItem: {
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineBorder,
  },
  optionLabelWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  optionLabel: {
    ...fontStyles.fontSize16_Regular,
  },
  optionValueWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeButton: {
    // padding: 4,
  },
  removeButtonText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  optionPrice: {
    ...fontStyles.fontSize16_Semibold,
  },
  dropdownSection: {
    position: 'relative',
    marginTop: 16,
    zIndex: 1,
  },
  sectionHeader: {
    paddingVertical: 8,
  },
  sectionTitle: {
    ...fontStyles.fontSize14_Regular,
  },
  sectionSubtitle: {
    ...fontStyles.fontSize13_Regular,
    color: '#2E3135CC',
    marginBottom: 8,
  },
  dropDownWrap: {
    borderWidth: 1,
    borderColor: COLORS.lineBorder,
    borderRadius: 8,
  },
  dropDownWrapOpen: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    zIndex: 1,
  },
  dropdownButtonText: {
    ...fontStyles.fontSize16_Regular,
    color: '#2E3135CC',
  },
  dropdownButtonTextSelected: {
    ...fontStyles.fontSize16_Medium,
    color: COLORS.textDefault,
  },
  dropdownIcon: {
    transform: [{ rotate: '0deg' }],
  },
  dropdownIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownContent: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lineBorder,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -1,
    zIndex: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lineBorder,
    gap: 8,
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.lineBorder,
    borderRadius: 4,
    // marginRight: 8,
  },
  dropdownItemText: {
    flex: 1,
    ...fontStyles.fontSize16_Regular,
  },
  dropdownItemPrice: {
    ...fontStyles.fontSize16_Regular,
    color: '#1A1C1E',
    // color: COLORS.textPrimary,
  },
  optionsWrapper: {
    flex: 1,
  },
  selectedItemWrapper: {},
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
  },
  dropdownSectionsContainer: {
    marginBottom: 4,
  },

  closeButton: {
    paddingRight: 8,
  },
  dropdownContentExpanded: {
    maxHeight: '100%',
  },
  dropdownButtonOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  contents: {
    ...fontStyles.fontSize14_Regular,
    textAlign: 'center',
    color: '#2E3135CC',
  },
  boldText: {
    ...fontStyles.fontSize14_Semibold,
  },
});
