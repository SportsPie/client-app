import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function SPGoogleMap({
  defaultPosition,
  position,
  zoom,
  positionResetButton,
  setPosition,
  showClickPoint,
  markers = [],
  followsUserLocation,
  userLocationFastestInterval,
  userLocationUpdateInterval,
}) {
  /**
   * state
   */
  const [zoomLevel, setZoomLevel] = useState({
    latitudeDelta: zoom || 0.0922, // 확대 축소 레벨
    longitudeDelta: zoom || 0.0421, // 확대 축소 레벨
  });
  const [currentLocation, setCurrentLocation] = useState({}); // 실제 현재 위치
  const [location, setLocation] = useState({
    latitude: 35.1822875,
    longitude: 129.0790917,
    ...zoomLevel,
  }); // 현재 위치 표시 마커의 위치
  const [markerList, setMarkerList] = useState([
    // {
    //   title: 'marker1',
    //   desc: 'marker1 desc',
    //   latitude: 37.78825,
    //   longitude: -122.4324,
    // },
  ]);

  /**
   * event
   */
  const onPressMyPosition = e => {
    if (setPosition) setPosition(JSON.parse(JSON.stringify(currentLocation)));
    setLocation({ ...currentLocation, ...zoomLevel });
    setMarkerList(prev => [
      ...prev.filter(item => item.title !== 'Clicked'),
      {
        title: 'Clicked',
        ...currentLocation,
      },
    ]);
  };

  const onPressEvent = e => {
    const coordinate = JSON.parse(JSON.stringify(e.nativeEvent.coordinate));
    if (setPosition) setPosition(coordinate);
    setLocation({ ...coordinate, ...zoomLevel });
    // 선택한 곳에 마커를 찍습니다. 마커는 하나만 찍히도록 했습니다.
    if (showClickPoint || positionResetButton) {
      setMarkerList(prev => [
        ...prev.filter(item => item.title !== 'Clicked'),
        {
          title: 'Clicked',
          ...coordinate,
        },
      ]);
    }
  };

  /**
   * useEffect
   */
  useEffect(() => {
    if (position) {
      setLocation({ ...position, ...zoomLevel });
    }
    // 마커 리스트에 key를 추가하여 마커를 구분합니다.
    if (markers) {
      const list = markers.map((item, index) => {
        return { key: index, ...item };
      });
      setMarkerList([...list]);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {positionResetButton && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            height: 50,
            width: 100,
            zIndex: 999,
          }}>
          <Button title="my position" onPress={onPressMyPosition} />
        </View>
      )}
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        zoomEnabled
        showsUserLocation={positionResetButton} // 지도위에 사용자의 위치를 표시한다.
        userLocationAnnotationTitle="내 위치"
        followsUserLocation={followsUserLocation} // 사용자의 위치가 변경될 때 지도의 뷰포트가 자동으로 사용자의 현재 위치를 중심으로 업데이트 된다.
        userLocationPriority="high" // 위치 정보 정확도 :: high, balanced, low
        userLocationFastestInterval={userLocationFastestInterval || 5000} // 사용자의 위치 업데이트 사이의 최소 간격
        userLocationUpdateInterval={userLocationUpdateInterval || 5000} // 사용자의 위치 업데이트 사이의 최대 간격
        onUserLocationChange={e => {
          const { coordinate } = e.nativeEvent;
          setCurrentLocation(coordinate);
        }}
        onRegionChange={region => {
          setZoomLevel({
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
          });
        }}
        onPress={onPressEvent}
        onPoiClick={positionResetButton || showClickPoint ? onPressEvent : null}
        initialRegion={defaultPosition || location}
        region={location}>
        {markerList.map((item, index) => {
          return (
            <Marker
              /* eslint-disable-next-line react/no-array-index-key */
              key={index}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={item.title !== 'Clicked' ? item.title : ''}
              description={item.title !== 'Clicked' ? item.desc : ''}
              onPress={e => {
                e.stopPropagation();
                e.preventDefault();
                console.log('marker pressed');
              }}>
              {item.title !== 'Clicked' && (
                <View>
                  <View
                    style={{ width: 100, height: 20, backgroundColor: 'blue' }}>
                    <Text style={{ color: 'white' }}>marker child</Text>
                  </View>
                  <Callout>
                    <View style={{ width: 100, height: 40 }}>
                      <Text>{item.title}</Text>
                      <Text>{item.desc}</Text>
                    </View>
                  </Callout>
                </View>
              )}
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
