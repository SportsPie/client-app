import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView as View,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SPSvgs } from '../../assets/svg';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { PrimaryButton } from '../PrimaryButton';
import Utils from '../../utils/Utils';

const SwapConfirmModal = forwardRef(
  ({ sendAmount, receiveAmount, remainAmount, onConfirm }, ref) => {
    const modalRef = useRef();

    const show = () => {
      modalRef?.current?.present();
    };

    const hide = () => {
      modalRef?.current?.close();
    };

    useImperativeHandle(ref, () => ({ show, hide }), []);

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
        enableDynamicSizing
        handleComponent={null}
        index={0}>
        <View style={styles.container}>
          <View style={styles.headerWrapper}>
            <Text style={styles.headlineText}>내역</Text>
            <Pressable onPress={hide}>
              <SPSvgs.Close width={24} height={24} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.itemWrapper}>
              <SPSvgs.SocialToken />
              <Text
                style={[
                  fontStyles.fontSize14_Semibold,
                  {
                    color: COLORS.labelNormal,
                  },
                ]}>
                보낼 수량
              </Text>
              <Text
                style={[
                  fontStyles.fontSize20_Semibold,
                  {
                    marginLeft: 'auto',
                  },
                ]}>
                {Utils.changeNumberComma(sendAmount)} P
              </Text>
            </View>

            <View style={styles.itemWrapper}>
              <SPSvgs.WalletToken />
              <Text
                style={[
                  fontStyles.fontSize14_Semibold,
                  {
                    color: COLORS.labelNormal,
                  },
                ]}>
                받을 수량
              </Text>
              <Text
                style={[
                  fontStyles.fontSize20_Semibold,
                  {
                    marginLeft: 'auto',
                  },
                ]}>
                {Utils.changeNumberComma(receiveAmount)} PIE
              </Text>
            </View>

            <View style={{ rowGap: 8 }}>
              <View
                style={[
                  styles.itemWrapper,
                  {
                    justifyContent: 'space-between',
                  },
                ]}>
                <Text
                  style={[
                    fontStyles.fontSize12_Medium,
                    {
                      color: COLORS.labelAlternative,
                      letterSpacing: 0.302,
                    },
                  ]}>
                  남은 소셜토큰
                </Text>
                <Text
                  style={[
                    fontStyles.fontSize13_Semibold,
                    {
                      color: COLORS.darkBlue,
                    },
                  ]}>
                  {Utils.changeNumberComma(remainAmount)}{' '}
                  <Text
                    style={[
                      fontStyles.fontSize12_Medium,
                      {
                        color: COLORS.labelNeutral,
                      },
                    ]}>
                    P
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          <PrimaryButton
            text="스왑실행"
            buttonStyle={styles.button}
            onPress={() => {
              hide();
              if (onConfirm) onConfirm();
            }}
          />
        </View>
      </BottomSheetModal>
    );
  },
);

export default memo(SwapConfirmModal);

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    rowGap: 24,
  },
  button: {
    borderRadius: 0,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  content: {
    paddingHorizontal: 16,
    rowGap: 16,
  },
  itemWrapper: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
  },
  headlineText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.black,
    letterSpacing: -0.004,
  },
});
