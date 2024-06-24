import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';
import { apiGetNoticesDetail } from '../../api/RestAPI';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import { handleError } from '../../utils/HandleError';
import moment from 'moment';
import Divider from '../Divider';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';

function NoticeItem({ item }) {
  const detailPage = async notice => {
    try {
      const response = await apiGetNoticesDetail(notice.boardIdx);
      const noticeDetail = response.data;
      NavigationService.navigate(navName.moreNoticeDetail, {
        noticeDetail,
      });
    } catch (error) {
      handleError(error);
    }
  };
  return (
    <View style={styles.container}>
      <Pressable style={styles.content} onPress={() => detailPage(item)}>
        <Text
          style={[
            fontStyles.fontSize16_Semibold,
            {
              color: COLORS.labelNormal,
              letterSpacing: 0.1,
            },
          ]}>
          {item.title}
        </Text>
        <Text
          style={[
            fontStyles.fontSize12_Medium,
            {
              color: COLORS.labelAlternative,
              letterSpacing: 0.3,
            },
          ]}>
          {moment(item.regDate).format('YYYY.MM.DD')}
        </Text>
      </Pressable>

      <Divider />
    </View>
  );
}

export default memo(NoticeItem);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    rowGap: 8,
  },
});
