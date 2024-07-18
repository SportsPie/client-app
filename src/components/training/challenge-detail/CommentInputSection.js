import {
  BottomSheetTextInput,
  BottomSheetView as View,
} from '@gorhom/bottom-sheet';
import React, { memo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { IS_IOS } from '../../../common/constants/constants';
import { COLORS } from '../../../styles/colors';
import fontStyles from '../../../styles/fontStyles';
import Avatar from '../../Avatar';

function CommentInputSection({ onChangeText, onSubmit }) {
  const inputRef = useRef();

  return (
    <View style={styles.container}>
      <Avatar disableEditMode imageSize={24} />

      <BottomSheetTextInput
        ref={inputRef}
        placeholder="댓글을 남겨보세요."
        placeholderTextColor={COLORS.labelAlternative}
        style={styles.input}
        onChangeText={text => {
          if (text?.length > 1000) return;
          onChangeText(text);
        }}
        onSubmitEditing={() => {
          onSubmit();
          inputRef.current.clear();
        }}
      />
    </View>
  );
}

export default memo(CommentInputSection);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: IS_IOS ? 16 : 0,
    borderTopColor: COLORS.lineBorder,
    columnGap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...fontStyles.fontSize14_Regular,
    height: '100%',
  },
});
