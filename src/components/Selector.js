import React, { memo, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import fontStyles from '../styles/fontStyles';
import { COLORS } from '../styles/colors';

// options: {
//     id: UUID, label, value
// }

function Selector({ title, options, onItemPress, multiple, selectedOnItem }) {
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (typeof selectedOnItem === 'object') {
      setSelectedItems(selectedOnItem);
    }
  }, [selectedOnItem]);

  const backgroundValue = useCallback(selected => {
    if (selected) {
      return COLORS.orange;
    }
    return '#878D9616';
  }, []);

  const borderColorValue = useCallback(selected => {
    if (selected) {
      return COLORS.orange;
    }
    return '#878D9622';
  }, []);

  const textColorValue = useCallback(selected => {
    if (selected) {
      return COLORS.white;
    }
    return COLORS.labelAlternative;
  }, []);

  const handleItemPress = useCallback(
    value => {
      if (!multiple) {
        // 단일 선택일 경우
        setSelectedItems(value);
        if (onItemPress) onItemPress(value);
      } else {
        // 다중 선택일 경우
        setSelectedItems(prevSelected => {
          if (prevSelected.includes(value)) {
            const newSelected = prevSelected.filter(item => item !== value);
            if (onItemPress) onItemPress(newSelected);
            return newSelected;
          }
          const newSelected = [...prevSelected, value];
          if (value === 'NONE') {
            if (onItemPress) onItemPress(['NONE']);
            return ['NONE'];
          }
          if (prevSelected.includes('NONE')) {
            if (onItemPress) onItemPress([value]);
            return [value];
          }
          if (onItemPress) onItemPress(newSelected);
          return newSelected;
        });
      }
    },
    [multiple, onItemPress],
  );

  const renderItem = useCallback(
    item => {
      const isSelected =
        selectedOnItem && !multiple
          ? selectedOnItem === item?.value
          : multiple
          ? selectedItems.includes(item.value)
          : item.value === selectedItems;

      return (
        <Pressable
          style={[
            styles.itemWrapper,
            {
              backgroundColor: backgroundValue(isSelected),
              borderColor: borderColorValue(isSelected),
            },
          ]}
          onPress={() => handleItemPress(item.value)}
          key={item.id}>
          <Text
            style={[
              styles.labelText,
              {
                color: textColorValue(isSelected),
              },
            ]}>
            {item.label}
          </Text>
        </Pressable>
      );
    },
    [
      selectedItems,
      handleItemPress,
      multiple,
      backgroundValue,
      borderColorValue,
      textColorValue,
      selectedOnItem,
    ],
  );

  return (
    <View style={styles.container}>
      {title && (
        <Text style={fontStyles.fontSize12_Regular}>{title ?? ''}</Text>
      )}

      <View style={styles.content}>
        {options?.map(item => renderItem(item))}
      </View>
    </View>
  );
}
export default memo(Selector);

const styles = StyleSheet.create({
  container: {
    rowGap: 4,
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemWrapper: {
    paddingHorizontal: 16,
    borderWidth: 1,
    paddingVertical: 4,
    borderRadius: 999,
  },
  labelText: {
    ...fontStyles.fontSize14_Medium,
  },
});
