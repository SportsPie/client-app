import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { COLORS } from '../../styles/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../header';
import fontStyles from '../../styles/fontStyles';
import { FlatList } from 'react-native-gesture-handler';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { PrimaryButton } from '../PrimaryButton';
import { apiCityList, apiDongList, apiGuList } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import { useFocusEffect } from '@react-navigation/native';

const addrTypes = {
  city: 'city',
  gu: 'gu',
  dong: 'dong',
};

const AddressFilter = forwardRef(
  ({ city, gu, dong, onAddressFilterSubmit }, ref) => {
    const insets = useSafeAreaInsets();

    const [isVisible, setIsVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState(addrTypes.city);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedGu, setSelectedGu] = useState('');
    const [selectedDong, setSelectedDong] = useState('');
    const [cityList, setCityList] = useState([]);
    const [guList, setGuList] = useState([]);
    const [dongList, setDongList] = useState([]);

    const getCityList = async () => {
      try {
        const { data } = await apiCityList();
        setCityList(data.data);
        setGuList([]);
        setDongList([]);
      } catch (error) {
        handleError(error);
      }
    };

    const getGuList = async () => {
      try {
        const { data } = await apiGuList(selectedCity);
        setGuList(data.data);
        setDongList([]);
      } catch (error) {
        handleError(error);
      }
    };

    const getDongList = async () => {
      try {
        const { data } = await apiDongList(selectedCity, selectedGu);
        setDongList(data.data);
      } catch (error) {
        handleError(error);
      }
    };

    useFocusEffect(
      useCallback(() => {
        getCityList();
      }, []),
    );

    useEffect(() => {
      if (selectedTab === addrTypes.city) {
        if (selectedCity) {
          if (selectedCity !== '세종특별자치시') {
            getGuList();
          } else {
            getDongList();
          }
        }
      }
      if (selectedTab === addrTypes.gu) {
        if (selectedGu) {
          getDongList();
        }
      }
    }, [selectedCity, selectedGu, selectedTab]);

    const DATA = useMemo(() => {
      switch (selectedTab) {
        case addrTypes.city:
          return cityList ?? [];

        case addrTypes.gu:
          return guList ?? [];

        case addrTypes.dong:
          return dongList ?? [];

        default:
          return [];
      }
    }, [selectedTab, cityList, guList, dongList]);

    const show = useCallback(() => {
      setSelectedTab(addrTypes.city);
      setSelectedCity(city || '');
      setSelectedGu(gu || '');
      setSelectedDong(dong || '');
      setIsVisible(true);
    }, [city, gu, dong]);

    const hide = useCallback(() => {
      setIsVisible(false);
    }, []);

    useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

    const renderFilter = useMemo(() => {
      return (
        <View style={styles.filterWrapper}>
          <Pressable
            onPress={() => {
              setSelectedTab(addrTypes.city);
            }}
            style={styles.filterButton}>
            <Text
              style={[
                styles.filterButtonText,
                selectedTab === addrTypes.city && {
                  ...fontStyles.fontSize16_Semibold,
                  color: COLORS.labelNormal,
                },
              ]}>
              시/도
            </Text>
          </Pressable>
          {selectedCity !== '세종특별자치시' && (
            <Pressable
              disabled={!selectedCity}
              onPress={() => {
                setSelectedTab(addrTypes.gu);
              }}
              style={styles.filterButton}>
              <Text
                style={[
                  styles.filterButtonText,
                  selectedTab === addrTypes.gu && {
                    ...fontStyles.fontSize16_Semibold,
                    color: COLORS.labelNormal,
                  },
                ]}>
                시/군/구
              </Text>
            </Pressable>
          )}
          <Pressable
            disabled={!selectedGu}
            onPress={() => {
              setSelectedTab(addrTypes.dong);
            }}
            style={styles.filterButton}>
            <Text
              style={[
                styles.filterButtonText,
                selectedTab === addrTypes.dong && {
                  ...fontStyles.fontSize16_Semibold,
                  color: COLORS.labelNormal,
                },
              ]}>
              읍/면/동
            </Text>
          </Pressable>
        </View>
      );
    }, [selectedTab, selectedCity, selectedGu, DATA]);

    const handlePressItem = item => {
      switch (selectedTab) {
        case addrTypes.city:
          setSelectedCity(prev => (prev === item ? '' : item));
          setSelectedGu('');
          setSelectedDong('');
          break;
        case addrTypes.gu:
          setSelectedGu(prev => (prev === item ? '' : item));
          setSelectedDong('');
          break;
        case addrTypes.dong:
          setSelectedDong(prev => (prev === item ? '' : item));
          break;
        default:
          break;
      }
    };

    const renderAddressItem = useCallback(
      ({ item, index }) => {
        const isSelected =
          item === selectedCity || item === selectedGu || item === selectedDong;
        return (
          <Pressable
            onPress={() => handlePressItem(item)}
            style={[
              styles.addressItemWrapper,
              isSelected && {
                borderColor: COLORS.orange,
              },
              {
                marginLeft: index % 3 === 0 ? 0 : 8,
              },
            ]}>
            <Text
              numberOfLines={1}
              style={[
                styles.addressText,
                isSelected && {
                  ...fontStyles.fontSize16_Semibold,
                  color: COLORS.orange,
                },
              ]}>
              {item}
            </Text>
          </Pressable>
        );
      },
      [DATA, handlePressItem, selectedCity, selectedDong, selectedGu],
    );

    const onSubmit = useCallback(() => {
      hide();
      if (onAddressFilterSubmit) {
        onAddressFilterSubmit({
          city: selectedCity,
          gu: selectedGu,
          dong: selectedDong,
        });
      }
    }, [selectedCity, selectedGu, selectedDong]);

    return (
      <Modal visible={isVisible} animationType="slide">
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}>
          <Header closeIcon onLeftIconPress={hide} />

          {renderFilter}

          <FlatList
            data={DATA}
            numColumns={3}
            renderItem={renderAddressItem}
            // keyExtractor={item => item}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          />

          <PrimaryButton
            disabled={!selectedCity}
            text="검색"
            buttonStyle={styles.submitButton}
            onPress={onSubmit}
          />
        </View>
      </Modal>
    );
  },
);

export default memo(AddressFilter);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  filterWrapper: {
    flexDirection: 'row',
    columnGap: 8,
    padding: 16,
  },
  filterButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.peach,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    ...fontStyles.fontSize16_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.091,
    lineHeight: 24,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 16,
  },
  addressItemWrapper: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    width: (SCREEN_WIDTH - 49) / 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.lineBorder,
  },
  submitButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  addressText: {
    ...fontStyles.fontSize16_Medium,
    color: COLORS.labelAlternative,
    letterSpacing: 0.091,
  },
});
