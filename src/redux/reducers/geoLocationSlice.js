/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

export const geoLocationSlice = createSlice({
  name: 'geoLocation',
  initialState: {
    latitude: '',
    longitude: '',
    timestamp: '',
    watchId: null,
  },
  reducers: {
    changeGeoLocationInfo: (state, action) => {
      const { latitude, longitude, timestamp } = action.payload;
      state.latitude = latitude;
      state.longitude = longitude;
      state.timestamp = timestamp;
    },
    changeId: (state, action) => {
      state.watchId = action.payload;
    },
  },
});

export const geoLocationSliceActions = geoLocationSlice.actions;

export default geoLocationSlice.reducer;
