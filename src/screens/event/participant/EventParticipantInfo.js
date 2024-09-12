import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import NavigationService from '../../../navigation/NavigationService';
import { navName } from '../../../common/constants/navName';
import fontStyles from '../../../styles/fontStyles';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { COLORS } from '../../../styles/colors';
import DismissKeyboard from '../../../components/DismissKeyboard';
import SPKeyboardAvoidingView from '../../../components/SPKeyboardAvoidingView';
import { apiGetEventOpenApplicantList } from '../../../api/RestAPI';
import { handleError } from '../../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';
import MenuTile from '../../../components/more-profile/MenuTile';
import { GENDER } from '../../../common/constants/gender';
import moment from 'moment';
import { MAIN_FOOT } from '../../../common/constants/mainFoot';
import { CAREER_TYPE } from '../../../common/constants/careerType';
import { SPSvgs } from '../../../assets/svg';
import MenuThree from '../../../components/more-profile/MenuThree';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useAppState } from '../../../utils/AppStateContext';

function EventParticipantInfo() {
  const [userDetail, setUserDetail] = useState({});
  const [userCareer, setUserCareer] = useState({});
  const [userPosition, setUserPosition] = useState({});
  const { participantInfo, setParticipantInfo } = useAppState();
  const getUserDetailInfo = async () => {
    try {
      const { data } = await apiGetEventOpenApplicantList(
        participantInfo.participationIdx,
      );
      setUserCareer(data.data.careerList);
      setUserDetail(data.data);
      setUserPosition(data.data.position);
    } catch (error) {
      handleError(error);
    }
  };

  const renderBodyStatistic = useMemo(() => {
    return (
      <View style={styles.basicInfoWrapper}>
        {/* 주 발, 발사이즈 */}
        <View style={styles.basicInfo}>
          <View style={styles.basicInfoContainer}>
            <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
              주 발
            </Text>
            <Text style={styles.basicNormalText}>
              {userDetail.mainFoot ? MAIN_FOOT[userDetail.mainFoot].desc : '-'}
            </Text>
          </View>

          <View style={styles.basicInfoContainer}>
            <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
              발사이즈
            </Text>
            <Text style={styles.basicNormalText}>
              {userDetail.shoeSize ? `${userDetail.shoeSize}mm` : '-'}
            </Text>
          </View>
        </View>

        {/* 키, 몸무게, 등번호 */}
        <View style={styles.basicInfo}>
          <View style={styles.basicInfoContainer}>
            <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
              키
            </Text>
            <Text style={styles.basicNormalText}>
              {userDetail.height ? `${userDetail.height}cm` : '-'}
            </Text>
          </View>

          <View style={styles.basicInfoContainer}>
            <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
              몸무게
            </Text>
            <Text style={styles.basicNormalText}>
              {userDetail.weight ? `${userDetail.weight}kg` : '-'}
            </Text>
          </View>

          <View style={styles.basicInfoContainer}>
            <Text style={[styles.contentsSubTitle, { fontWeight: 500 }]}>
              등번호
            </Text>
            <Text style={styles.basicNormalText}>
              {userDetail.backNo ? userDetail.backNo : '-'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.menuTileContainer,
            {
              width: '100%',
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color: COLORS.labelNeutral,
              },
            ]}>
            선수경력
          </Text>

          {userCareer?.length > 0 ? (
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: 8,
              }}>
              {userCareer.map((item, index) => {
                const lastItem = index === userCareer.length - 1;
                return (
                  <Fragment key={index}>
                    <Text style={[fontStyles.fontSize20_Semibold]}>
                      {CAREER_TYPE[item]?.desc}
                    </Text>
                    {!lastItem && <SPSvgs.Ellipse width={6} height={6} />}
                  </Fragment>
                );
              })}
            </View>
          ) : (
            <Text style={[fontStyles.fontSize20_Semibold]}>-</Text>
          )}
        </View>
        <View
          style={[
            styles.menuTileContainer,
            {
              width: '100%',
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color: COLORS.labelNeutral,
              },
            ]}>
            수상 경력
          </Text>
          <Text style={[fontStyles.fontSize20_Semibold]}>
            {userDetail.awards || '-'}
          </Text>
        </View>
        <View
          style={[
            styles.menuTileContainer,
            {
              width: '100%',
            },
          ]}>
          <Text
            style={[
              fontStyles.fontSize14_Medium,
              {
                color: COLORS.labelNeutral,
              },
            ]}>
            선호 플레이
          </Text>
          <Text style={[fontStyles.fontSize20_Semibold]}>
            {' '}
            {userDetail.preferredPlay || '-'}
          </Text>
        </View>
      </View>
    );
  }, [userDetail]);

  useFocusEffect(
    useCallback(() => {
      if (participantInfo.participationIdx) {
        getUserDetailInfo();
      }
    }, [participantInfo.participationIdx]),
  );

  return (
    <ScrollView style={{ paddingHorizontal: 16 }}>
      {renderBodyStatistic}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomButtonWrap: {},
  basicInfoWrapper: {
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 24,
    // paddingHorizontal: 16,
  },
  basicInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    backgroundColor: '#F1F5FF',
    padding: 16,
  },
  basicInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  contentsSubTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(46, 49, 53, 0.80)',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  contentsSubText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1C1E',
    lineHeight: 20,
    letterSpacing: 0.203,
  },
  basicNormalText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    lineHeight: 28,
    letterSpacing: -0.24,
  },
  menuTileContainer: {
    // backgroundColor: COLORS.fillNormal,
    backgroundColor: '#F1F5FF',
    borderWidth: 1,
    borderColor: 'rgba(135, 141, 150, 0.08)',
    borderRadius: 12,
    padding: 16,
    width: (SCREEN_WIDTH - 40) / 2,
    rowGap: 8,
  },
  button: {},
});

export default EventParticipantInfo;
