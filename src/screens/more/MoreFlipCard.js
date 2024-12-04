import React, { memo, useEffect, useMemo } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import VipQrcode from './VipQrcode';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import SPImages from '../../assets/images';
import SPIcons from '../../assets/icon';
import FlipCard from '../../components/FlipCard';
import Avatar from '../../components/Avatar';
import fontStyles from '../../styles/fontStyles';
import { COLORS } from '../../styles/colors';
import { MAIN_FOOT } from '../../common/constants/mainFoot';
import { SPSvgs } from '../../assets/svg';

function MoreFlipCard({ isSol, member, academy, stats, point, width, height }) {
  /**
   * state
   */
  const isFlipped = useSharedValue(false);

  const avatarSize = SCREEN_WIDTH > 360 ? SCREEN_WIDTH * 0.5 : 170;

  /**
   * function
   */
  const handlePress = () => {
    if (isSol) {
      isFlipped.value = !isFlipped.value;
    }
  };

  /**
   * useEffect
   */
  useEffect(() => {
    if (!isSol) isFlipped.value = false;
  }, [isSol]);

  /**
   * render
   */

  const renderUserSection = useMemo(() => {
    return (
      <View style={styles.userSectionWrapper}>
        <View style={styles.userInfoWrapper}>
          {/* QR 버튼 */}
          <View style={{ position: 'absolute', top: 16, right: 16 }}>
            {isSol && (
              <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity
                  activeOpacity={1}
                  hitSlop={20}
                  onPress={handlePress}>
                  <SPSvgs.QrScanner />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={styles.avatar}>
              <Avatar
                sol={isSol}
                imageSize={avatarSize}
                imageURL={member?.userProfilePath ?? ''}
                borderRadius={16}
                disableEditMode
              />
            </View>

            <View style={styles.usernameWrapper}>
              <Text
                style={[
                  styles.usernameTitle,
                  { color: isSol ? COLORS.white : '#111', lineHeight: 26 },
                ]}>
                {member?.userNickName ?? ''}
              </Text>

              {member?.acdmyNm ? (
                <View style={styles.usernameContainer}>
                  {academy?.logoPath ? (
                    <Image
                      source={{ uri: academy?.logoPath }}
                      alt="아카데미 로고"
                      style={{ width: 24, height: 24, borderRadius: 6 }}
                    />
                  ) : (
                    <Image
                      source={SPIcons.icDefaultAcademy}
                      alt="기본 아이콘"
                      style={{ width: 24, height: 24, borderRadius: 6 }}
                    />
                  )}
                  <View
                    style={[
                      styles.usernameBox,
                      {
                        backgroundColor: isSol ? '#26467B' : '#D5D5D5',
                        flexShrink: 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.usernameText,
                        { color: isSol ? '#93DEFC' : 'rgba(46, 49, 53, 0.80)' },
                      ]}
                      numberOfLines={2} // 2줄까지 보여짐
                      ellipsizeMode="tail">
                      {member.acdmyNm ? member.acdmyNm : '-'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ height: 20 }} />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }, [member, academy, stats, point]);

  const regularContent = () => {
    return (
      <ImageBackground
        source={isSol ? SPImages.myInfoCardSol : SPImages.myInfoCard}
        style={[
          styles.imageBackground,
          width && { width },
          height && { height },
        ]}
        resizeMode="cover">
        {renderUserSection}
      </ImageBackground>
    );
  };

  const flippedContent = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={handlePress}>
        <ImageBackground
          source={isSol ? SPImages.myInfoCardSol : SPImages.myInfoCard}
          style={[
            styles.imageBackground,
            width && { width },
            height && { height },
          ]}
          resizeMode="cover">
          <View
            style={{
              flex: 1,
              width: '100%',
              padding: 16,
            }}>
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                borderRadius: 16,
              }}>
              <VipQrcode size={247} />
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlipCard
        isFlipped={isFlipped}
        cardStyle={[styles.flipCard, width && { width }, height && { height }]}
        RegularContent={regularContent()}
        FlippedContent={flippedContent()}
      />
    </View>
  );
}

export default memo(MoreFlipCard);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#b58df1',
    padding: 12,
    borderRadius: 48,
  },
  toggleButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  flipCard: {
    width: SCREEN_WIDTH - 32,
    height: 300,
  },
  imageBackground: {
    width: SCREEN_WIDTH - 32,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSectionWrapper: {
    height: '100%',
    width: '100%',
    padding: 4,
  },
  avatar: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 16,
  },
  userInfoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usernameWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingTop: 20,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
  },
  usernameBox: {
    backgroundColor: '#26467B',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.22)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  usernameTitle: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 28.9,
    letterSpacing: 0.2,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 26,
    letterSpacing: 0.091,
  },
  ageWrapperBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 4,
  },
  ageWrapper: {
    minWidth: 18,
    minHeight: 19,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#999',
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyStatisticWrapper: {
    backgroundColor: 'rgba(147, 222, 252, 0.30)',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  statisticWrapper: {
    flex: 1,
    alignItems: 'center',
    rowGap: 4,
    padding: 8,
  },
  verticalLine: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(147, 222, 252, 0.25)',
  },
  verticalLineNoSol: {
    backgroundColor: 'rgba(106, 106, 106, 0.30)',
  },
  statisticValueText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FFF',
    lineHeight: 15,
    letterSpacing: 0.203,
  },
  statisticValueTextNoSol: {
    color: '#111',
  },
  statisticValueBox: {
    backgroundColor: '#021152',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(147, 222, 252, 0.50)',
  },
  statisticValueNoSolBox: {
    backgroundColor: '#FF7C10',
    borderRadius: 5,
    borderColor: '#FF7C10',
  },
  statisticValueTitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#93DEFC',
    lineHeight: 16,
    letterSpacing: 0.302,
  },
  statisticValueTitleNoSol: { color: 'rgba(46, 49, 53, 0.80)' },
  socialTokenWrapper: {
    backgroundColor: COLORS.orange,
    padding: 16,
    borderRadius: 16,
    rowGap: 8,
  },
  tokenWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfoButton: {
    backgroundColor: '#FFE1D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 999,
  },
  userInfoButtonText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#000',
    lineHeight: 20,
  },
});
