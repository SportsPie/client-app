import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import { SPSvgs } from '../../assets/svg';
import { useFocusEffect } from '@react-navigation/native';

function TrainingStatus({ numberOfPie, numberPieComplete }) {
  let isCollapseRow = false;

  // 스탬프 리스트
  const [stampList, setStampList] = useState([]);

  // 스탬프 컴포넌트 렌더
  const renderPieItem = useCallback(
    ({ item, index }) => {
      // 5 배수 '완료' 스탬프
      if (index === 0 && item !== 1 && item <= numberPieComplete) {
        return (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <SPSvgs.StampBoost />
            <Text
              style={{
                ...fontStyles.fontSize16_Semibold,
                color: COLORS.white,
                position: 'absolute',
                top: '55%',
                paddingLeft: 2,
              }}>
              {item}회
            </Text>
          </View>
        );
      }

      // '일반' 스탬프
      if (item <= numberPieComplete) {
        return (
          <SPSvgs.Stamp
            width={55}
            height={55}
            style={{
              // marginTop: isCollapseRow && index <= 4 ? 10 : -2,
              marginTop: 10,
            }}
          />
        );
      }

      // 텍스트
      return (
        <View
          style={[
            styles.pieItem,
            {
              // marginTop: isCollapseRow && index <= 4 ? 13 : 0,
              marginTop: 13,
            },
          ]}>
          <Text style={styles.pieText}>
            {index === 5 &&
            stampList.length === 10 &&
            stampList[index - 1] + 1 !== +item
              ? '...'
              : item}
          </Text>
        </View>
      );
    },
    [stampList],
  );

  // 스탬프 데이터 전처리
  const formatStampList = (max, current) => {
    let formattedList = [];

    // 10개 이하
    if (max <= 10) {
      formattedList = new Array(max).fill('').map((_, index) => index + 1);
    }
    // 10개 초과
    else {
      // 완료 5개 이하
      if (current <= 5) {
        formattedList = new Array(10).fill('').map((_, index) => {
          if (index < 5) {
            return index + 1;
          }
          return max - (5 - (index % 5)) + 1;
        });
      }
      // 완료 5개 초과
      else {
        let startNumber = Math.floor(current / 5) * 5 + 1;
        startNumber = startNumber > current ? startNumber - 5 : startNumber;
        let listLength = max - startNumber + 1;

        // 중간생략 O
        if (listLength > 10) {
          formattedList = new Array(10).fill('').map((_, index) => {
            if (index < 5) {
              return startNumber + index;
            }
            return max - (5 - (index % 5)) + 1;
          });
        }
        // 중간생략 X
        else {
          if (listLength <= 5) {
            startNumber = startNumber - 5;
            listLength = max - startNumber + 1;

            formattedList = new Array(listLength).fill('').map((_, index) => {
              return startNumber + index;
            });
          } else {
            formattedList = new Array(listLength).fill('').map((_, index) => {
              return startNumber + index;
            });
          }
        }
      }
    }

    setStampList(formattedList);
  };

  // [ useFocusEffect ] 스탬프 데이터 전처리
  useFocusEffect(
    useCallback(() => {
      formatStampList(numberOfPie, numberPieComplete);
    }, [numberOfPie, numberPieComplete]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <Text style={styles.headerText}>나의 트레이닝 현황</Text>
        <Text style={styles.subheaderText}>
          클래스{' '}
          <Text
            style={{
              color: COLORS.orange,
            }}>
            {`총 ${numberPieComplete}회`}
          </Text>{' '}
          완료했어요! 조금만 더 힘내요!
        </Text>
      </View>

      {stampList && (
        <View style={styles.content}>
          <FlatList
            data={stampList}
            key={() => Utils.UUIDV4()}
            renderItem={renderPieItem}
            numColumns={5}
            scrollEnabled={false}
            contentContainerStyle={{
              rowGap: 16,
              alignSelf: 'center',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          />
        </View>
      )}
    </View>
  );
}

export default memo(TrainingStatus);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.darkBlue,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 24,
    rowGap: 24,
  },
  headerWrapper: {
    alignItems: 'center',
    rowGap: 8,
  },
  headerText: {
    ...fontStyles.fontSize18_Semibold,
    color: COLORS.white,
  },
  subheaderText: {
    ...fontStyles.fontSize14_Medium,
    color: COLORS.white,
  },
  content: {
    backgroundColor: COLORS.white,
    minHeight: 140,
    borderRadius: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  pieItem: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.lineBorder,
    marginHorizontal: 8,
  },
  pieText: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.labelAlternative,
  },
});
