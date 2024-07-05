import React, { memo, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, View } from 'react-native';
import NaverMapView, {
  Align,
  Marker,
  showsMyLocationButton,
} from 'react-native-nmap/index';
import SPImages from '../assets/images';
import Utils from '../utils/Utils';
import AcademyItem from './search-academy/AcademyItem';
import { COLORS } from '../styles/colors';

function SPMap({ hideMyLocation, center, data }) {
  const mapRef = useRef();
  const [showAcademyModal, setShowAcademyModal] = useState(false);
  const [academyList, setAcademyList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();
  const [dataObj, setDataObj] = useState({});

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

  const selected = index => {
    // if (academyList && academyList.length > 0) {
    //   const selectedAcademy = academyList.find(item => item.academyIdx === idx);
    //   return !!selectedAcademy;
    // }
    // return false;
    return selectedIndex === index;
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
      const clusterData = data.reduce((acc, cur) => {
        const key = `${cur.latitude}-${cur.longitude}`;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(cur);

        return acc;
      }, {});
      setDataObj(clusterData);
    }
  }, [data]);

  useEffect(() => {
    if (!showAcademyModal) setSelectedIndex(null);
  }, [showAcademyModal]);

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
        onMapClick={e => {
          locationHandler(e);
          setSelectedIndex(null);
        }}
        onTouch={e => {
          Keyboard.dismiss();
          setShowAcademyModal(false);
        }}
        useTextureView>
        {!hideMyLocation && <Marker coordinate={center} />}

        {dataObj &&
          Object.keys(dataObj).length > 0 &&
          Object.keys(dataObj).map((key, index) => {
            if (dataObj[key]?.length > 1) {
              const [lat, lng] = key.split('-');
              return (
                <Marker
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  image={
                    selected(index)
                      ? SPImages.clickedMultipleBadge
                      : SPImages.multipleBadge
                  }
                  onClick={() => {
                    setSelectedIndex(index);
                    setAcademyList(dataObj[key]);
                    setShowAcademyModal(true);
                  }}
                  coordinate={{
                    latitude: Number(lat),
                    longitude: Number(lng),
                  }}
                  caption={{
                    text: `${dataObj[key].length}`,
                    align: Align.Center,
                  }}
                />
              );
            }
            const item = dataObj[key][0];
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
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                image={
                  selected(index)
                    ? SPImages[`clickedMapBadge${imageId}`]
                    : SPImages[`mapBadge${imageId}`]
                }
                onClick={() => {
                  setSelectedIndex(index);
                  setAcademyList([item]);
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
      {showAcademyModal && academyList?.length > 1 && (
        <AcademyPopup
          itemList={academyList}
          containerStyle={{
            position: 'absolute',
            bottom: 86,
            left: 0,
            right: 0,
            borderRadius: 16,
            backgroundColor: COLORS.white,
            maxHeight: 384,
          }}
        />
      )}
      {showAcademyModal && academyList?.length === 1 && (
        <AcademyItem
          item={academyList[0]}
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

function AcademyPopup({ itemList, containerStyle }) {
  return (
    <FlatList
      data={itemList}
      contentContainerStyle={[{ gap: 8, padding: 16 }]}
      style={[containerStyle]}
      keyExtractor={(item, index) => `academy-${index}`}
      renderItem={({ item }) => <AcademyItem item={item} />}
    />
  );
}

export default memo(SPMap);
