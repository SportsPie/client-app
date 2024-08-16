import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import fontStyles from '../../../styles/fontStyles';
import Avatar from '../../Avatar';
import SPIcons from '../../../assets/icon';
import Utils from '../../../utils/Utils';

function CommentInputSection({ onChangeText, onSubmit, userInfo, maxLength }) {
  const inputRef = useRef();
  const [comment, setComment] = useState('');

  const handleTextChange = useCallback(
    text => {
      if (text.length <= maxLength) {
        setComment(text);
        onChangeText(text); // 상위 컴포넌트로 텍스트 전달
      }
    },
    [onChangeText],
  );

  const handleSubmit = useCallback(() => {
    if (comment.trim().length > 0) {
      onSubmit(comment.trim()); // 댓글 제출 함수 호출
      setComment(''); // 입력 초기화
      inputRef.current.clear(); // TextInput 초기화
      Keyboard.dismiss();
    }
  }, [comment, onSubmit]);

  return (
    <View style={styles.inputBox}>
      <Avatar
        disableEditMode
        imageURL={userInfo?.userProfilePath}
        imageSize={24}
      />
      <TextInput
        ref={inputRef}
        style={styles.textInput}
        value={comment}
        onChangeText={handleTextChange}
        multiline
        placeholder="댓글을 남겨보세요.(최대 1000자)"
        placeholderTextColor="rgba(46, 49, 53, 0.60)"
        autoCorrect={false}
        autoCapitalize="none"
        // numberOfLines={comment?.split('\n').length || 1}
        textAlignVertical="center"
        retrunKeyType="next"
      />

      <View
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            disabled={!comment.trim()}
            onPress={handleSubmit}
            style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image source={SPIcons.icSend} style={{ width: 40, height: 28 }} />
          </TouchableOpacity>

          <Text
            style={{
              ...fontStyles.fontSize11_Regular,
              width: 57.1,
              textAlign: 'center',
              height: 14,
              marginTop: 5,
            }}>
            {Utils.changeNumberComma(comment.length)}/1,000
          </Text>
        </View>
      </View>
    </View>
  );
}

export default memo(CommentInputSection);

const styles = StyleSheet.create({
  textInput: {
    maxHeight: 20 * 4,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1C1E',
    lineHeight: 14,
    letterSpacing: 0.203,
    // top: 4,
    margin: 0,
    padding: 0,
    // height: 'auto',
    // maxHeight: 20 * 3,
    // paddingTop: 0,
  },
  inputBox: {
    flexDirection: 'row',
    columnGap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    alignItems: 'center',
  },
});
