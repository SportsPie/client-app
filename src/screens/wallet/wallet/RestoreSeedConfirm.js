import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { ALBUM_PERMISSION_TEXT } from '../../../common/constants/constants';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SPToast } from '../../../components/SPToast';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import { handleError } from '../../../utils/HandleError';
import Utils from '../../../utils/Utils';
import WalletUtils from '../../../utils/WalletUtils';
import Header from '../../../components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

function RestoreSeedConfirm() {
  const viewShotRef = useRef();
  const [mnemonicTextList, setMnemonicTextList] = useState([]);

  const saveComponentToGallery = async () => {
    if (viewShotRef.current) {
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
    }
  };

  const onFocus = async () => {
    const mnemonic = await WalletUtils.getWalletMnemonnic();
    setMnemonicTextList(mnemonic?.split(' ') || []);
  };

  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, []),
  );

  const renderItem = useCallback(({ item, index }) => {
    return (
      <View
        style={[
          styles.item,
          {
            marginLeft: index % 2 !== 0 ? 8 : 0,
          },
        ]}>
        <Text
          style={[
            fontStyles.fontSize14_Medium,
            {
              paddingVertical: 8,
            },
          ]}>
          {index + 1}. {Utils.capitalizeFirstLetter(item)}
        </Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header closeIcon />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrapper}>
          <Text style={styles.headerText}>
            {'복구시드를\n안전하게 확인하세요'}
          </Text>
          <Text style={styles.subheaderText}>
            {
              '종이에 적거나 안전한 곳에 보관하세요.\n해당 정보를 이용하면 언제든 지갑을 복구할 수 있어요.'
            }
          </Text>
        </View>

        <View style={{ rowGap: 16 }}>
          <ViewShot
            style={{
              backgroundColor: COLORS.white,
            }}
            ref={viewShotRef}>
            <FlatList
              scrollEnabled={false}
              data={mnemonicTextList}
              numColumns={2}
              renderItem={renderItem}
              keyExtractor={item => item}
              contentContainerStyle={{
                rowGap: 8,
              }}
            />
          </ViewShot>

          <View style={styles.buttonGroup}>
            <PrimaryButton
              text="이미지 저장"
              onPress={saveComponentToGallery}
              outlineButton
              buttonStyle={{
                paddingHorizontal: 20,
              }}
            />
            <PrimaryButton
              text="복사하기"
              onPress={() => {
                const mnemonic = mnemonicTextList.join(' ');
                Utils.copyToClipboard(mnemonic);
              }}
              outlineButton
              buttonStyle={{
                paddingHorizontal: 20,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(RestoreSeedConfirm);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    rowGap: 48,
    paddingHorizontal: 16,
  },
  headerWrapper: {
    alignItems: 'center',
    rowGap: 16,
  },
  headerText: {
    ...fontStyles.fontSize20_Semibold,
    textAlign: 'center',
  },
  subheaderText: {
    ...fontStyles.fontSize12_Medium,
    textAlign: 'center',
    color: COLORS.labelNeutral,
  },
  item: {
    width: (SCREEN_WIDTH - 40) / 2,
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: COLORS.fillNormal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
