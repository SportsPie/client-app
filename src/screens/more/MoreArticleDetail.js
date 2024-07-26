import moment from 'moment';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { useFocusEffect } from '@react-navigation/native';
import { handleError } from '../../utils/HandleError';
import {
  apiDeleteArticleBookmark,
  apiGetArticleDetail,
  apiGetArticleDetailForUser,
  apiPostArticleBookmark,
} from '../../api/RestAPI';
import { SPSvgs } from '../../assets/svg';
import { useSelector } from 'react-redux';

function MoreArticleDetail({ route }) {
  const boardIdx = route?.params?.boardIdx;
  const { isLogin, userIdx } = useSelector(selector => selector.auth);
  const trlRef = useRef({ current: { disabled: false } });
  const [articleDetail, setArticleDetail] = useState({});
  const [refresh, setRefresh] = useState(false);
  let imageHeight;
  const { width } = useWindowDimensions();

  if (width <= 480) {
    imageHeight = 219;
  } else {
    const aspectRatio = 328 / 219;
    imageHeight = (width - 32) / aspectRatio;
  }

  const getArticleDetail = async () => {
    try {
      let articleData;
      if (isLogin) {
        const { data } = await apiGetArticleDetailForUser(boardIdx);
        articleData = data;
      } else {
        const { data } = await apiGetArticleDetail(boardIdx);
        articleData = data;
      }
      setArticleDetail(articleData.data);
    } catch (error) {
      handleError(error);
    }
  };

  const addBookmark = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiPostArticleBookmark(boardIdx);
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  const removeBookmark = async () => {
    try {
      if (trlRef.current.disabled) return;
      trlRef.current.disabled = true;
      const { data } = await apiDeleteArticleBookmark(boardIdx);
      setRefresh(prev => !prev);
    } catch (error) {
      handleError(error);
    }
    trlRef.current.disabled = false;
  };

  useFocusEffect(
    useCallback(() => {
      getArticleDetail();
    }, [boardIdx, refresh]),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        {...(isLogin
          ? {
              rightContent: (
                <Pressable
                  onPress={() => {
                    if (articleDetail?.bookmarked) {
                      removeBookmark();
                    } else {
                      addBookmark();
                    }
                  }}
                  style={{ padding: 16 }}>
                  {articleDetail?.bookmarked ? (
                    <SPSvgs.Bookmarks />
                  ) : (
                    <SPSvgs.BookmarksOutline />
                  )}
                </Pressable>
              ),
            }
          : {})}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <View style={{ rowGap: 8 }}>
          <Text style={fontStyles.fontSize24_Bold}>{articleDetail?.title}</Text>
          <Text
            style={[
              fontStyles.fontSize12_Medium,
              {
                color: COLORS.labelNeutral,
              },
            ]}>
            {moment(articleDetail?.regDate).format('YYYY-MM-DD')}
          </Text>
          {articleDetail?.files?.length > 0 && (
            <Image
              style={[
                styles.image,
                {
                  height: imageHeight,
                },
              ]}
              source={{ uri: articleDetail.files[0].fileUrl }}
            />
          )}
        </View>

        <Text
          style={[
            fontStyles.fontSize14_Medium,
            {
              color: COLORS.labelNormal,
            },
          ]}>
          {articleDetail?.contents}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(MoreArticleDetail);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    rowGap: 16,
  },
  image: {
    width: '100%',
  },
});
