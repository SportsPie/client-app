import React, { memo } from 'react';
import { TOURNAMENT_STATE } from '../../common/constants/tournamentState';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import NavigationService from '../../navigation/NavigationService';
import { navName } from '../../common/constants/navName';
import SPImages from '../../assets/images';
import LinearGradient from 'react-native-linear-gradient';
import SPIcons from '../../assets/icon';
import fontStyles from '../../styles/fontStyles';

function TournamentBox({ item }) {
  const getStylesForTitle = type => {
    switch (type) {
      case TOURNAMENT_STATE.REGISTERING.code:
        return {
          titleBoxStyle: { backgroundColor: '#FF7C10' },
          titleTextStyle: { color: '#FFF' },
        };
      case TOURNAMENT_STATE.CLOSED.code:
        return {
          titleBoxStyle: { backgroundColor: '#D6D7E4' },
          titleTextStyle: { color: '#313779' },
        };
      default:
        return {
          titleBoxStyle: { backgroundColor: '#FFF' },
          titleTextStyle: { color: '#000' },
        };
    }
  };

  const { titleBoxStyle, titleTextStyle } = getStylesForTitle(
    item?.state?.code,
  );
  const gradientColors =
    item?.state?.code === TOURNAMENT_STATE.REGISTERING.code ||
    item?.state?.code === TOURNAMENT_STATE.CLOSED.code
      ? ['transparent', 'rgba(0,0,0,0.35)']
      : ['transparent', 'rgba(0,0,0,1)']; // 조건에 따라 그라디언트 색상 변경
  const { width, height } = useWindowDimensions();
  const aspectRatio = 16 / 9; // 이미지의 원본 비율
  const matchHeight = width <= 480 ? 246 : width / aspectRatio;

  console.log('item?.state?.code', item?.state?.code);
  return (
    <View style={[styles.contentsBox]}>
      <Pressable
        onPress={() =>
          NavigationService.navigate(navName.tournamentDetail, {
            tournamentIdx: item.trnIdx,
          })
        }>
        <View style={[styles.contentsImage, { height: matchHeight }]}>
          <ImageBackground
            source={
              item.thumbUrl ? { uri: item.thumbUrl } : SPImages.magazineImages
            }
            style={[styles.image, styles.matchImageBox]}>
            <LinearGradient colors={gradientColors} style={styles.gradient}>
              <View style={[styles.matchTypeBox, titleBoxStyle]}>
                <Text style={[styles.matchType, titleTextStyle]}>
                  {item?.state?.code === TOURNAMENT_STATE.UPCOMING.code
                    ? `${item.formattedOpenDate} 접수`
                    : item?.state?.desc}
                </Text>
              </View>
              {!(
                item?.state?.code === TOURNAMENT_STATE.REGISTERING.code ||
                item?.state?.code === TOURNAMENT_STATE.CLOSED.code
              ) && (
                <View style={styles.comingSoonBox}>
                  <Image source={SPIcons.icClock} />
                  <Text style={styles.comingSoonText}>Coming Soon!</Text>
                </View>
              )}
            </LinearGradient>
          </ImageBackground>
        </View>
        <View style={styles.matchTextBox}>
          <Text
            style={styles.matchTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.trnNm}
          </Text>
          <View style={styles.matchTextDetail}>
            <Text style={styles.detailText}>
              {item.formattedStartDate} - {item.formattedEndDate}
            </Text>
            <Text style={styles.verticalLine}>|</Text>
            <Text style={styles.detailText}>{item.trnAddr}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
export default memo(TournamentBox);

const styles = StyleSheet.create({
  tabTopBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  monthButtonTopBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthButtonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  monthText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentsBox: {
    flex: 1,
  },
  contentsText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#171719',
    lineHeight: 22,
    letterSpacing: 0.144,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  matchImageBox: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  matchTypeBox: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    backgroundColor: '#FF7C10',
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 16,
  },
  matchType: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  matchTextBox: {
    flexDirection: 'column',
    gap: 4,
    paddingTop: 8,
    marginBottom: 24,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 26,
    letterSpacing: -0.004,
  },
  matchTextDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 18,
    letterSpacing: 0.252,
  },
  verticalLine: {
    color: 'rgba(135, 141, 150, 0.22)',
  },
  comingSoonBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 37,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: 500,
    color: '#FFF',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  matching: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 0,
    flex: 1,
  },
  modalMonthButtonBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalMonthText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  monthList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
  },
  monthContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '33.33%',
    minHeight: 52,
    borderRadius: 8,
  },
  selectedMonth: {
    backgroundColor: '#FF7C10',
  },
  monthTextStyle: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 24,
    letterSpacing: 0.091,
  },
  disabledMonthText: {
    color: '#D6D3D7',
  },
  selectedMonthText: {
    color: '#FFF',
  },
  appealBox: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 32,
  },
  appealBtn: {
    flex: 1,
    backgroundColor: '#FF7C10',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  appealBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  appealOutlineBtn: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.32)',
    backgroundColor: '#FFF',
  },
  appealOutlineBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#313779',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
  },
  tabWrap: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 141, 150, 0.16)',
  },
  tabBox: { paddingVertical: 14, paddingHorizontal: 8 },
  tabText: {
    ...fontStyles.fontSize14_Semibold,
    color: 'rgba(46, 49, 53, 0.60)',
  },
  activeTabBox: { borderBottomWidth: 2, borderBottomColor: '#FB8225' },
  activeTabText: { color: '#FF7C10' },
  tabStyle: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabActive: {
    zIndex: 1,
  },
  tabInActive: {
    zIndex: 0,
    opacity: 0,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1C1E',
    lineHeight: 24,
    letterSpacing: 0.091,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
