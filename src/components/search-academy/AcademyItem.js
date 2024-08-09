import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SPSvgs } from '../../assets/svg';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';
import { COLORS } from '../../styles/colors';
import fontStyles from '../../styles/fontStyles';
import Utils from '../../utils/Utils';
import SPIcons from '../../assets/icon';
import SPImages from '../../assets/images';

function AcademyItem({ item, containerStyle }) {
  return (
    <Pressable
      onPress={() => {
        NavigationService.navigate(navName.academyDetail, {
          academyIdx: item?.academyIdx,
        });
      }}
      style={[styles.containerStyle, containerStyle]}>
      {item?.thumbPath ? (
        <Image
          source={{
            uri: item?.thumbPath,
          }}
          style={styles.image}
        />
      ) : (
        <Image source={SPImages.defaultAcademyThumb} style={styles.image} />
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.academyNameWrapper}>
          {/* <SPSvgs.Academic /> */}

          {item?.logoPath ? (
            <View style={styles.academyImg}>
              <Image source={{ uri: item.logoPath }} style={styles.logo} />
            </View>
          ) : (
            <View style={styles.academyImg}>
              <Image source={SPIcons.icMyAcademy} style={styles.logo} />
            </View>
          )}
          <Text numberOfLines={1} style={styles.academyName}>
            {item?.academyName}
          </Text>
        </View>
        <View>
          <View style={styles.ratingWrapper}>
            <Text style={styles.addressText}>
              {item?.addrCity} ・ {item?.addrGu}
            </Text>

            <View style={styles.divider} />

            {item.rating != null && (
              <View style={styles.starWrapper}>
                <SPSvgs.Star />
                <Text style={styles.addressText}>
                  {parseFloat(item.rating).toFixed(1)}
                </Text>
              </View>
            )}
            {item.rating != null && <View style={styles.divider} />}
            <Text style={styles.addressText}>리뷰 {item?.reviewCnt}</Text>
          </View>
        </View>
        <Text style={styles.phoneText}>
          대표번호{' '}
          <Text style={{ color: COLORS.labelNormal }}>
            {Utils.addHypenToPhoneNumber(item?.phoneNo)}
          </Text>
        </Text>
      </View>
    </Pressable>
  );
}

export default memo(AcademyItem);

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  academyNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginBottom: 16,
  },
  academyName: {
    ...fontStyles.fontSize16_Semibold,
    color: COLORS.labelNormal,
    letterSpacing: 0.091,
    lineHeight: 23,
    flex: 1,
  },
  addressText: {
    ...fontStyles.fontSize12_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.302,
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  starWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  divider: {
    height: 12,
    width: 1,
    backgroundColor: COLORS.lineBorder,
  },
  phoneText: {
    ...fontStyles.fontSize12_Medium,
    marginTop: 8,
    color: COLORS.labelAlternative,
    letterSpacing: 0.302,
  },
  academyImg: {
    width: 23,
    height: 23,
    backgroundColor: '#ADAFC9',
    borderRadius: 5,
  },
  logo: {
    width: 23,
    height: 23,
    borderRadius: 5,
  },
});
