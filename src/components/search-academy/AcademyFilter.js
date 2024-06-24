import { Modal, StyleSheet, Text, View } from 'react-native';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../styles/colors';
import Header from '../header';
import Selector from '../Selector';
import { apiGetAcdmyFilters } from '../../api/RestAPI';
import { handleError } from '../../utils/HandleError';
import Utils from '../../utils/Utils';
import { PrimaryButton } from '../PrimaryButton';
import { useFocusEffect } from '@react-navigation/native';

const AcademyFilter = forwardRef(
  ({ classType, teachingType, serviceType, onAcademyFilterSubmit }, ref) => {
    const insets = useSafeAreaInsets();

    const [isVisible, setIsVisible] = useState(false);
    const [classTypeList, setClassTypeList] = useState([]);
    const [selectedClassType, setSelectedClassType] = useState([]);
    const [teachingTypeList, setTeachingTypeList] = useState([]);
    const [selectedTeachingType, setSelectedTeachingType] = useState([]);
    const [serviceTypeList, setServiceTypeList] = useState([]);
    const [selectedServiceType, setSelectedServiceType] = useState([]);

    const show = useCallback(() => {
      setSelectedClassType([...(classType || [])]);
      setSelectedTeachingType([...(teachingType || [])]);
      setSelectedServiceType([...(serviceType || [])]);
      setIsVisible(true);
    }, [classType, teachingType, serviceType]);

    const hide = useCallback(() => {
      setIsVisible(false);
    }, []);

    useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

    const onResetValues = useCallback(() => {
      setSelectedClassType([]);
      setSelectedServiceType([]);
      setSelectedTeachingType([]);
    }, []);

    const onSubmit = useCallback(() => {
      hide();
      if (onAcademyFilterSubmit) {
        onAcademyFilterSubmit({
          classType: selectedClassType,
          teachingType: selectedTeachingType,
          serviceType: selectedServiceType,
        });
      }
    }, [selectedClassType, selectedServiceType, selectedTeachingType]);

    const getAcademyFilterList = async () => {
      try {
        const { data } = await apiGetAcdmyFilters();
        if (data.data) {
          const { CLASS, METHOD, SERVICE } = data.data;
          if (CLASS && CLASS.length > 0) {
            const list = CLASS.filter(v => !v.codeSub.includes('ETC')).map(
              v => {
                return {
                  id: Utils.UUIDV4(),
                  label: v.codeName,
                  value: v.codeSub,
                };
              },
            );
            setClassTypeList(list.reverse());
          }
          if (METHOD && METHOD.length > 0) {
            const list = METHOD.filter(v => !v.codeSub.includes('ETC')).map(
              v => {
                return {
                  id: Utils.UUIDV4(),
                  label: v.codeName,
                  value: v.codeSub,
                };
              },
            );
            setTeachingTypeList(list.reverse());
          }
          if (SERVICE && SERVICE.length > 0) {
            const list = SERVICE.filter(v => !v.codeSub.includes('ETC')).map(
              v => {
                return {
                  id: Utils.UUIDV4(),
                  label: v.codeName,
                  value: v.codeSub,
                };
              },
            );
            setServiceTypeList(list.reverse());
          }
        }
      } catch (error) {
        handleError(error);
      }
    };

    useEffect(() => {
      getAcademyFilterList();
    }, []);

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
          <View style={styles.content}>
            <Selector
              title="클래스"
              multiple
              options={classTypeList}
              onItemPress={setSelectedClassType}
              selectedOnItem={selectedClassType}
            />

            <Selector
              title="수업방식"
              multiple
              options={teachingTypeList}
              onItemPress={setSelectedTeachingType}
              selectedOnItem={selectedTeachingType}
            />

            <Selector
              title="서비스"
              multiple
              options={serviceTypeList}
              onItemPress={setSelectedServiceType}
              selectedOnItem={selectedServiceType}
            />

            <View style={styles.buttonsWrapper}>
              <PrimaryButton
                outlineButton
                text="재설정"
                buttonStyle={styles.leftButton}
                onPress={onResetValues}
              />
              <PrimaryButton
                text="결과보기"
                buttonStyle={styles.rightButton}
                onPress={onSubmit}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

export default memo(AcademyFilter);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingHorizontal: 16,
    flex: 1,
    rowGap: 24,
    paddingTop: 24,
  },
  buttonsWrapper: {
    flexDirection: 'row',
    columnGap: 8,
    marginTop: 'auto',
    paddingBottom: 24,
  },
  leftButton: {
    width: 98,
  },
  rightButton: {
    flex: 1,
  },
});
