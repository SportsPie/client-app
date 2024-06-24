/* eslint-disable array-callback-return */
/* eslint-disable react/no-array-index-key */
import { useFocusEffect } from '@react-navigation/native';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import SPIcons from '../assets/icon';
import { COLORS } from '../styles/colors';
import fontStyles from '../styles/fontStyles';
import Utils from '../utils/Utils';
import { ACTIVE_OPACITY } from '../common/constants/constants';

const SPPinCodeInput = forwardRef(({ length = 6, onComplete }, ref) => {
  const [pin, setPin] = useState('');

  const handleTextChange = text => {
    if (Utils.isInteger(text)) {
      if (text.length <= length) {
        setPin(text);
        if (text.length === length) {
          onComplete(text);
        }
      }
    }
  };

  // PIN을 클리어하는 메서드
  const clear = () => {
    setPin('');
  };

  const vibrate = () => {
    Vibration.vibrate(70);
  };

  // 외부에서 사용할 수 있는 메서드를 노출
  useImperativeHandle(ref, () => ({
    clear,
  }));

  useFocusEffect(
    useCallback(() => {
      clear();
      Keyboard.dismiss();
    }, []),
  );

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
      }}>
      <View style={styles.container}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={
              index < pin.length
                ? { ...styles.pinCircle, backgroundColor: COLORS.orange }
                : {
                    ...styles.pinCircle,
                    backgroundColor: COLORS.interactionInactive,
                  }
            }
          />
        ))}
        {/* <TextInput */}
        {/*  ref={inputRef} */}
        {/*  value={pin} */}
        {/*  onChangeText={handleTextChange} */}
        {/*  keyboardType="numeric" */}
        {/*  style={styles.hiddenInput} */}
        {/*  maxLength={length} */}
        {/*  autoFocus */}
        {/* /> */}
      </View>
      <View>
        {[...Array(4)].map((_, index) => {
          return (
            <View key={index} style={{ flexDirection: 'row' }}>
              {[...Array(3)].map((v, i) => {
                const text = index * 3 + i + 1;
                if (index < 3) {
                  return (
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      key={text}
                      onPress={() => {
                        vibrate();
                        handleTextChange(pin + text);
                      }}
                      style={styles.button}>
                      <Text style={styles.buttonText}>{text}</Text>
                    </TouchableOpacity>
                  );
                }
                if (text === 10) {
                  return <View key={text} style={styles.button} />;
                }
                if (text === 11) {
                  return (
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      key={text}
                      onPress={() => {
                        vibrate();
                        handleTextChange(`${pin}0`);
                      }}
                      style={styles.button}>
                      <Text style={styles.buttonText}>0</Text>
                    </TouchableOpacity>
                  );
                }
                if (text === 12) {
                  return (
                    <TouchableOpacity
                      activeOpacity={ACTIVE_OPACITY}
                      key={text}
                      onPress={() => {
                        const str = pin.substring(0, pin.length - 1);
                        vibrate();
                        handleTextChange(str);
                      }}
                      style={styles.button}>
                      <Image
                        source={SPIcons.icBackSpace}
                        style={[{ height: 24, width: 24 }]}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  );
                }
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 22,
  },
  pinCircle: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: COLORS.black,
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  button: {
    paddingVertical: 19,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...fontStyles.fontSize18_Semibold,
  },
});

export default memo(SPPinCodeInput);
