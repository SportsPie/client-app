import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useMemo } from 'react';
import moment from 'moment';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import { NOTI_TYPE } from '../../screens/auth/AlarmPage';
import { SPSvgs } from '../../assets/svg';
import { store } from '../../redux/store';
import { navSliceActions } from '../../redux/reducers/navSlice';

function AlertItem({ item }) {
  const renderIcon = useMemo(() => {
    switch (item.icon) {
      case NOTI_TYPE.ACADEMY:
        return <SPSvgs.School width={24} height={24} />;
      case NOTI_TYPE.LOGO:
        return <SPSvgs.Social width={24} height={24} />;
      case NOTI_TYPE.COMMUNITY:
        return <SPSvgs.Comment width={24} height={24} />;
      case NOTI_TYPE.TOURNAMENT:
        return <SPSvgs.Champion width={24} height={24} />;
      case NOTI_TYPE.MATCH:
        return <SPSvgs.SoccerField width={24} height={24} />;
      case NOTI_TYPE.TRAINING:
        return <SPSvgs.PieTraining width={24} height={24} />;
      case NOTI_TYPE.POINT:
        return <SPSvgs.SocialToken width={24} height={24} />;
      case NOTI_TYPE.WALLET:
        return <SPSvgs.WalletToken width={24} height={24} />;
      default:
        break;
    }
  }, []);

  const renderDate = useMemo(() => {
    if (moment(item?.regDate).year() === moment().year()) {
      return moment(item?.regDate).format('M월 D일');
    }
    return moment(item?.regDate).format('YYYY년 M월 D일');
  }, [item?.regDate]);

  return (
    <Pressable
      style={[
        styles.container,
        item?.isRead !== 'Y' && {
          backgroundColor: COLORS.peach,
        },
      ]}
      onPress={() => {
        if (item?.linkUrl) {
          store.dispatch(navSliceActions.changeMoveUrl(item.linkUrl));
        }
      }}>
      {renderIcon}
      <View style={styles.content}>
        <View style={styles.labeledWrapper}>
          <Text numberOfLines={1} style={styles.labelText}>
            {item?.title}
          </Text>
          <Text style={styles.timeText}>{renderDate}</Text>
        </View>
        <Text style={styles.contentText}>{item?.contents}</Text>
      </View>
    </Pressable>
  );
}

export default memo(AlertItem);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    columnGap: 8,
  },
  labeledWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 8,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    rowGap: 8,
  },
  labelText: {
    ...fontStyles.fontSize14_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.203,
    flex: 1,
  },
  timeText: {
    ...fontStyles.fontSize14_Medium,
    color: 'rgba(46, 49, 53, 0.60)',
    letterSpacing: 0.203,
  },
  contentText: {
    ...fontStyles.fontSize16_Medium,
    lineHeight: 26,
    letterSpacing: 0.091,
    color: COLORS.labelNormal,
  },
});
