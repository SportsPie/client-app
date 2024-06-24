import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { memo, useState } from 'react';
import { SPSvgs } from '../../assets/svg';
import Divider from '../Divider';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';

function QNAItem({ item }) {
  const [isCallapse, setIsCallapse] = useState(true);

  return (
    <View>
      <Pressable
        style={styles.questionWrapper}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsCallapse(!isCallapse);
        }}>
        <SPSvgs.LetterQ />

        <Text style={styles.titleText}>{item?.title ?? ''}</Text>

        <SPSvgs.ChevronDown
          style={{
            transform: [
              {
                rotate: isCallapse ? '0deg' : '180deg',
              },
            ],
          }}
        />
      </Pressable>

      {!isCallapse && (
        <View style={styles.answerWrapper}>
          <View style={styles.titleWrapper}>
            <SPSvgs.LetterA />

            <Text style={[fontStyles.fontSize16_Semibold, { flex: 1 }]}>
              여행자를 위한 10가지 필수 아이템 추천
            </Text>
          </View>

          <Text
            style={[
              fontStyles.fontSize14_Medium,
              { color: COLORS.labelNeutral },
            ]}>
            {item?.contents ?? ''}
          </Text>
        </View>
      )}

      <Divider />
    </View>
  );
}

export default memo(QNAItem);

const styles = StyleSheet.create({
  questionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
    padding: 16,
  },
  answerWrapper: {
    padding: 16,
    backgroundColor: COLORS.peach,
    rowGap: 16,
  },
  titleText: {
    ...fontStyles.fontSize16_Semibold,
    flex: 1,
    color: COLORS.darkBlue,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
});
