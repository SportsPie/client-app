import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';
import Divider from './Divider';
import { navName } from '../common/constants/navName';

function TopEventTabLabel(props) {
  const { state, navigation } = props;

  return (
    <View>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          //   const label = route.name;
          let label;
          switch (route.name) {
            case navName.eventMyInfo:
              label = '내 정보'; // 한글로 라벨 설정
              break;
            case navName.eventSoccerBee:
              label = '사커비';
              break;
            case navName.eventVideoList:
              label = '영상 목록';
              break;
            case navName.eventComment:
              label = '응원 댓글';
              break;
            case navName.eventParticipantInfo:
              label = '참가자 정보'; // 한글로 라벨 설정
              break;
            default:
              label = route.name; // 기본적으로 name을 사용
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              style={[
                styles.itemWrapper,
                {
                  borderBottomColor: isFocused ? COLORS.orange : 'transparent',
                },
              ]}
              key={route?.key}
              onPress={onPress}>
              <Text
                style={[
                  fontStyles.fontSize14_Semibold,
                  {
                    color: isFocused ? COLORS.orange : COLORS.labelAlternative,
                    letterSpacing: 0.2,
                  },
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Divider />
    </View>
  );
}

export default TopEventTabLabel;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  itemWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 2,
  },
});
