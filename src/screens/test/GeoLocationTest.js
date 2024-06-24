import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import GeoLocationUtils from '../../utils/GeoLocationUtils';

export default function GeoLocationTest() {
  const [geoLocation, setGeoLocation] = useState();
  const [watchLocation, setWatchLocation] = useState();
  const [watchId, setWatchId] = useState();
  const getLocation = async () => {
    const location = await GeoLocationUtils.getLocation();
    setGeoLocation(location);
    console.log('location', location);
  };

  const watchingLocation = async () => {
    const id = GeoLocationUtils.watchLocation(setWatchLocation);
    console.log('id', id);
    setWatchId(id);
  };

  useEffect(() => {
    alert(JSON.stringify(watchLocation));
  }, [watchLocation]);

  return (
    <View>
      <Text>gelocationTest</Text>
      <Button
        title="getLocation"
        onPress={() => {
          getLocation();
        }}
      />
      <Button
        title="watchLocation"
        onPress={() => {
          watchingLocation();
        }}
      />
      <Text>geoLocation : {JSON.stringify(geoLocation)}</Text>
      <Text>watch id : {watchId}</Text>
      <Text>watchLocation : {JSON.stringify(watchLocation)}</Text>
    </View>
  );
}
