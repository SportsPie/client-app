import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPSvgs } from '../../assets/svg';
import { COLORS } from '../../styles/colors';
import Selector from '../Selector';
import { PrimaryButton } from '../PrimaryButton';
import { isIphoneX } from '../../common/constants/constants';
import Utils from '../../utils/Utils';

const genderFilter = [
  {
    id: Utils.UUIDV4(),
    label: '남성',
    value: 'M',
  },
  {
    id: Utils.UUIDV4(),
    label: '여성',
    value: 'F',
  },
  {
    id: Utils.UUIDV4(),
    label: '혼성',
    value: 'X',
  },
];

const gameFormatFilter = [
  {
    id: Utils.UUIDV4(),
    label: '협의 후 결정',
    value: '0',
  },
  {
    id: Utils.UUIDV4(),
    label: '4 : 4',
    value: '4',
  },
  {
    id: Utils.UUIDV4(),
    label: '5 : 5',
    value: '5',
  },
  {
    id: Utils.UUIDV4(),
    label: '6 : 6',
    value: '6',
  },
  {
    id: Utils.UUIDV4(),
    label: '7 : 7',
    value: '7',
  },
  {
    id: Utils.UUIDV4(),
    label: '8 : 8',
    value: '8',
  },
  {
    id: Utils.UUIDV4(),
    label: '9 : 9',
    value: '9',
  },
  {
    id: Utils.UUIDV4(),
    label: '10 : 10',
    value: '10',
  },
  {
    id: Utils.UUIDV4(),
    label: '11 : 11',
    value: '11',
  },
];

const MatchingFilterModal = forwardRef((props, ref) => {
  const { onSubmitPress } = props;
  const insets = useSafeAreaInsets();

  const [isVisible, setIsVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState();
  const [selectedMethod, setSelectedMethod] = useState();

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const reset = useCallback(() => {
    setSelectedMethod('');
    setSelectedGender('');
  }, []);

  const handleSubmit = () => {
    onSubmitPress({ selectedGender, selectedMethod });
    hide();
  };

  const handleReset = () => {
    setSelectedMethod('');
    setSelectedGender('');
    onSubmitPress({ selectedGender: '', selectedMethod: '' });
    hide();
  };

  useImperativeHandle(ref, () => ({ show, hide, reset }), [show, hide]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={() => {
        hide();
      }}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}>
        <Pressable onPress={hide} style={styles.closeIcon}>
          <SPSvgs.Close />
        </Pressable>

        <View style={styles.content}>
          <Selector
            title="성별"
            options={genderFilter}
            onItemPress={value => {
              setSelectedGender(value);
            }}
            selectedOnItem={selectedGender}
          />

          <Selector
            title="경기방식"
            options={gameFormatFilter}
            onItemPress={value => {
              setSelectedMethod(value);
            }}
            selectedOnItem={selectedMethod}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <PrimaryButton
            outlineButton
            text="재설정"
            buttonStyle={styles.resetButton}
            onPress={handleReset}
          />
          <PrimaryButton
            text="결과보기"
            buttonStyle={styles.submitButton}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
});

export default memo(MatchingFilterModal);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  closeIcon: {
    paddingVertical: 16,
  },
  content: {
    rowGap: 24,
    paddingTop: 24,
    flex: 1,
  },
  buttonWrapper: {
    flexDirection: 'row',
    columnGap: 8,
    paddingBottom: isIphoneX() ? 0 : 24,
  },
  resetButton: {
    paddingHorizontal: 12,
  },
  submitButton: {
    flex: 1,
  },
});
