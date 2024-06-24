import AsyncStorage from '@react-native-async-storage/async-storage';

export const setStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, `${value}`);
    // console.log('성공적으로 저장되었습니다.');
  } catch (error) {
    console.log('저장에 실패하였습니다:', error);
  }
};

export const getStorage = async key => {
  try {
    const token = await AsyncStorage.getItem(key);
    if (token !== null) {
      return token;
    }
    return null;
  } catch (error) {
    console.log('가져오기에 실패하였습니다:', error);
    return null;
  }
};

export const removeStorage = async key => {
  try {
    await AsyncStorage.removeItem(key);
    // console.log('성공적으로 삭제되었습니다.');
  } catch (error) {
    console.log('삭제에 실패하였습니다:', error);
  }
};
