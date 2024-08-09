import React, {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect } from 'react';
import BackHandlerUtils from '../utils/BackHandlerUtils';
import SPIcons from '../assets/icon';
import NavigationService from '../navigation/NavigationService';
import { COLORS } from '../styles/colors';
import { ACTIVE_OPACITY } from '../common/constants/constants';

// eslint-disable-next-line import/no-mutable-exports
export let headerProps = {};
export const setHeaderProps = props => {
  headerProps = props;
};
export default function SPHeader({
  title = ' ',
  navigation,
  moveName,
  noLeftLogo,
  noLeftButton,
  leftCancleButton,
  leftButtonMoveName,
  leftButtonMoveParam,
  rightCancelButton,
  rightSettingButton,
  rightButtonMoveName,
  rightButtonMoveParam,
  addRightCancelButton,
  addRightButtonIcon,
  rightCancelText,
  rightTextMoveName,
  rightTextMoveParam,
  containerStyle,
  rightButtonIcon,
  rightIconStyle,
  rightText,
  rightTextStyle,
  titleStyle,
  onPressRightIcon,
  onPressAddRightIcon,
  onPressRightText,
  leftIconStyles,
  onPressLeftBtn,
  rightBasicButton,
  rightBasicAddButton,
  headerBackgroundColor = 'white',
  isTitleCentered,
  titleColor = 'black',
  leftButtonIcon,
  noBackHandlerEvent,
  ...props
}) {
  if (!noBackHandlerEvent) {
    headerProps = {
      title,
      navigation,
      moveName,
      noLeftLogo,
      noLeftButton,
      leftCancleButton,
      leftButtonMoveName,
      leftButtonMoveParam,
      rightCancelButton,
      rightButtonMoveName,
      rightButtonMoveParam,
      rightCancelText,
      rightTextMoveName,
      rightTextMoveParam,
      addRightCancelButton,
      addRightButtonIcon,
      containerStyle,
      rightButtonIcon,
      rightIconStyle,
      rightText,
      rightTextStyle,
      titleStyle,
      onPressRightIcon,
      onPressAddRightIcon,
      onPressRightText,
      leftIconStyles,
      onPressLeftBtn,
      leftButtonIcon,
      ...props,
    };
  }

  useEffect(() => {
    if (!noBackHandlerEvent) {
      BackHandlerUtils.addDefaultBackHandlerEvent();
    }
  }, []);

  const titleContainerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    paddingBottom: 2,
    // marginLeft: isTitleCentered ? 0 : 16, // 조건에 따라 marginLeft 조정
    marginLeft: 8,
    flexGrow: 1,
    flexShrink: 1,
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: headerBackgroundColor },
        containerStyle,
      ]}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {!noLeftButton ? (
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={[styles.leftButton]}
            onPress={() => {
              if (onPressLeftBtn) {
                return onPressLeftBtn();
              }
              if (moveName || leftButtonMoveName) {
                return NavigationService.navigate(
                  moveName || leftButtonMoveName,
                  leftButtonMoveParam,
                );
              }
              // navigation.pop();
              NavigationService.goBack();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Image
              source={
                leftButtonIcon || // 새로운 prop 우선 사용
                (leftCancleButton ? SPIcons.icNavCancle : SPIcons.icNavBack)
              }
              style={[styles.leftIcon, leftIconStyles]}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyView} />
        )}
        {(title || props.options.title) && (
          <View style={titleContainerStyle}>
            <Text
              style={[
                styles.title,
                titleStyle,
                { color: titleColor, paddingRight: 16 },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {title || props.options.title}
            </Text>
          </View>
        )}
      </View>
      {rightCancelButton && (
        <View style={styles.rightButton}>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            onPress={() => {
              if (onPressRightIcon) {
                return onPressRightIcon();
              }
              if (rightButtonMoveName) {
                NavigationService.navigate(
                  rightButtonMoveName,
                  rightButtonMoveParam,
                );
              } else {
                NavigationService.goBack();
              }
            }}>
            <Image
              source={rightButtonIcon || SPIcons.icNavCancle}
              style={[styles.rightIcon, rightIconStyle]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}
      {addRightCancelButton && (
        <View
          style={[
            styles.rightButton,
            {
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            onPress={() => {
              if (onPressRightIcon) {
                onPressRightIcon();
              } else if (rightButtonMoveName) {
                NavigationService.navigate(
                  rightButtonMoveName,
                  rightButtonMoveParam,
                );
              } else {
                NavigationService.goBack();
              }
            }}>
            <Image
              source={addRightButtonIcon || SPIcons.icNavCancle}
              style={[styles.rightIcon, styles.rightAddIconStyle]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}
      {rightSettingButton && (
        <View style={styles.rightButton}>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            onPress={() => {
              if (onPressRightIcon) {
                return onPressRightIcon();
              }
              if (rightButtonMoveName) {
                NavigationService.navigate(
                  rightButtonMoveName,
                  rightButtonMoveParam,
                );
              } else {
                NavigationService.goBack();
              }
            }}>
            <Image
              source={rightButtonIcon || SPIcons.icSetting}
              style={[styles.rightIcon, rightIconStyle]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}
      {rightCancelText && (
        <View style={styles.rightText}>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            onPress={() => {
              if (onPressRightText) {
                return onPressRightText();
              }
              if (rightTextMoveName) {
                NavigationService.navigate(
                  rightTextMoveName,
                  rightTextMoveParam,
                );
              } else {
                NavigationService.goBack();
              }
            }}>
            <Text style={[styles.rightTextStyle, rightTextStyle]}>
              {rightText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {rightBasicButton || rightBasicAddButton ? (
        <View style={styles.rightBasicButtonBox}>
          {rightBasicButton && (
            <View>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => {
                  if (onPressRightIcon) {
                    return onPressRightIcon();
                  }
                  if (rightButtonMoveName) {
                    NavigationService.navigate(
                      rightButtonMoveName,
                      rightButtonMoveParam,
                    );
                  } else {
                    NavigationService.goBack();
                  }
                }}>
                <Image
                  source={rightBasicButton}
                  style={[styles.rightIcon, rightIconStyle]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}
          {rightBasicAddButton && (
            <View>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => {
                  if (onPressAddRightIcon) {
                    return onPressAddRightIcon();
                  }
                  if (rightButtonMoveName) {
                    NavigationService.navigate(
                      rightButtonMoveName,
                      rightButtonMoveParam,
                    );
                  } else {
                    NavigationService.goBack();
                  }
                }}>
                <Image
                  source={rightBasicAddButton}
                  style={[styles.rightIcon, rightIconStyle]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // gap: 16,
    paddingHorizontal: 4,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border0,
  },
  title: {
    // ...fontStyles.fontSize16_Medium,
    fontSize: 24,
    fontWeight: 700,
    color: 700,
    lineHeight: 32,
    letterSpacing: -0.552,
    textAlign: 'left',
    flexShrink: 1,
    flexGrow: 1,
  },
  leftButton: {
    height: 28,
    width: 28,
    margin: 10,
  },
  leftIcon: {
    width: 28,
    height: 28,
    // tintColor: COLORS.black,
  },
  rightButton: {
    height: 12,
    minWidth: 18,
  },
  emptyView: {
    width: 0,
  },
  rightButtonBox: {
    flexDirection: 'row',
    gap: 16,
    height: '100%',
  },
  rightIcon: {
    width: 28,
    height: 28,
    margin: 10,
    // tintColor: COLORS.black,
  },
  rightAddIconStyle: {
    width: 28,
    height: 28,
  },
  // rightText: { height: 18, minWidth: 18 },
  rightText: {
    padding: 10,
  },
  rightBasicButtonBox: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 16,
    paddingBottom: 2,
  },
});
