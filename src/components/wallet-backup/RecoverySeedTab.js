import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useCallback, useRef } from 'react';
import { COLORS } from '../../styles/colors';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { PrimaryButton } from '../PrimaryButton';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { SPToast } from '../SPToast';
import Utils from '../../utils/Utils';
import { ALBUM_PERMISSION_TEXT } from '../../common/constants/constants';
import { handleError } from '../../utils/HandleError';

function RecoverySeedTab({ data }) {
  const viewShotRef = useRef();

  const renderItem = useCallback(({ item, index }) => {
    return (
      <View
        style={[
          styles.itemContainer,
          {
            marginLeft: index % 2 === 0 ? 0 : 8,
          },
        ]}>
        <Text>
          {index + 1}. {Utils.capitalizeFirstLetter(item)}
        </Text>
      </View>
    );
  }, []);

  const onCaptureSeed = useCallback(() => {
    viewShotRef.current.capture().then(async uri => {
      try {
        await CameraRoll.save(uri, { type: 'photo' })
          .then(e => {
            SPToast.show({ text: '복구용 시드 이미지가 저장 되었습니다.' });
          })
          .catch(e => {
            if (e.message?.includes('Access to photo library was denied')) {
              Utils.alert('', ALBUM_PERMISSION_TEXT);
            } else {
              Utils.alert('', `복구용 시드 이미지 저장에 실패했습니다.`);
            }
          });
      } catch (error) {
        handleError(error);
      }
    });
  }, []);

  const onCopySeed = useCallback(() => {
    const mnemonic = data.join(' ');
    Utils.copyToClipboard(mnemonic);
  }, []);

  const renderFooter = useCallback(() => {
    return (
      <View style={styles.footerContainer}>
        <PrimaryButton
          buttonStyle={styles.button}
          text="이미지 저장"
          outlineButton
          onPress={onCaptureSeed}
        />
        <PrimaryButton
          buttonStyle={styles.button}
          text="복사하기"
          outlineButton
          onPress={onCopySeed}
        />
      </View>
    );
  }, []);

  return (
    <View>
      <ViewShot
        style={{
          backgroundColor: COLORS.white,
        }}
        ref={viewShotRef}>
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={item => item}
          renderItem={renderItem}
          scrollEnabled={false}
          contentContainerStyle={{
            rowGap: 8,
          }}
        />
      </ViewShot>
      {renderFooter()}
    </View>
  );
}

export default memo(RecoverySeedTab);

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: COLORS.fillNormal,
    width: (SCREEN_WIDTH - 40) / 2,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  footerContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignSelf: 'center',
    columnGap: 8,
  },
  button: {
    paddingHorizontal: 16,
  },
});
