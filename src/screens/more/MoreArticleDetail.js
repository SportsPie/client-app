import moment from 'moment';
import React, { memo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function MoreArticleDetail({ route }) {
  const articleDetail = route?.params?.articleDetail;
  let imageHeight;
  const { width } = useWindowDimensions();

  if (width <= 480) {
    imageHeight = 219;
  } else {
    const aspectRatio = 328 / 219;
    imageHeight = (width - 32) / aspectRatio;
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <View style={{ rowGap: 8 }}>
          <Text style={fontStyles.fontSize24_Bold}>
            {articleDetail?.data?.title}
          </Text>
          <Text
            style={[
              fontStyles.fontSize12_Medium,
              {
                color: COLORS.labelNeutral,
              },
            ]}>
            {moment(articleDetail?.data?.regDate).format('YYYY-MM-DD')}
          </Text>
          {articleDetail?.data?.files.length > 0 && (
            <Image
              style={[
                styles.image,
                {
                  height: imageHeight,
                },
              ]}
              source={{ uri: articleDetail?.data?.files[0].fileUrl }}
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
          {articleDetail?.data?.contents}
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
