import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';
import Divider from './Divider';

function TopTabLabel(props) {
  const { state, navigation } = props;

  return (
    <View>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const label = route.name;

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

export default TopTabLabel;

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
