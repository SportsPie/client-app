import React, { memo, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, View } from 'react-native';
import NaverMapView, {
  Align,
  Marker,
  showsMyLocationButton,
} from 'react-native-nmap/index';
import SPImages from '../assets/images';
import Utils from '../utils/Utils';
import AcademyItem from './search-academy/AcademyItem';

function SPMap({ hideMyLocation, center, data }) {
  const mapRef = useRef();
  const [showAcademyModal, setShowAcademyModal] = useState(false);
  const [academy, setAcademy] = useState({});
  const [dataList, setDataList] = useState([]);

  const changeMyLocation = e => {
    console.log('🚀 ~ changeMyLocation ~ e:', e);
    Alert.alert(
      '',
      '마커를 이동할까요 ?',
      [
        { text: '취소' },
        {
          text: '확인',
          onPress: () => {
            mapRef?.current?.animateToRegion(
              Utils.getLocationDelta(e?.latitude, e?.longitude, 500),
            );
          },
        },
      ],
      { cancelable: false },
    );
  };

  const locationHandler = e => {
    setShowAcademyModal(false);
    if (!hideMyLocation) {
      changeMyLocation(e);
    }
  };

  useEffect(() => {
    setShowAcademyModal(false);
  }, [data]);

  useEffect(() => {
    if (center) {
      mapRef?.current?.animateToRegion(
        Utils.getLocationDelta(center?.latitude, center?.longitude, 500),
      );
    }
  }, [center]);

  useEffect(() => {
    if (data && data.length > 0) {
      setDataList([...data]);
    }
  }, [data]);

  return (
    <View
      style={{
        flex: 1,
      }}>
      <NaverMapView
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        showsMyLocationButton={showsMyLocationButton}
        zoomControl={false}
        onMapClick={e => locationHandler(e)}
        onTouch={e => {
          Keyboard.dismiss();
          setShowAcademyModal(false);
        }}
        useTextureView>
        {!hideMyLocation && <Marker coordinate={center} />}

        {dataList &&
          dataList.length > 0 &&
          dataList.map((item, index) => {
            let academyName = item?.academyName;
            const textLength = academyName?.length;
            let imageId = 1;
            if (textLength >= 20) {
              imageId = 18;
              academyName = `${academyName?.slice(0, 17)}...`;
            } else if (textLength >= 3) {
              imageId = textLength - 2;
            } else {
              imageId = 1;
            }
            return (
              <Marker
                key={item.academyIdx || index}
                image={SPImages[`mapBadge${imageId}`]}
                onClick={() => {
                  setAcademy(item);
                  setShowAcademyModal(true);
                }}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                caption={{ text: academyName, align: Align.Center }}
              />
            );
          })}
      </NaverMapView>
      {showAcademyModal && (
        <AcademyItem
          item={academy}
          containerStyle={{
            position: 'absolute',
            bottom: 86,
            left: 16,
            right: 16,
          }}
        />
      )}
    </View>
  );
}

export default memo(SPMap);
