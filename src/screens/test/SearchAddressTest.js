import React, { Component, memo } from 'react';
import Postcode from '@actbase/react-daum-postcode';

function SearchAddress() {
  const getAddressData = data => {
    let defaultAddress = '';
    console.log(data);

    if (data.buildingName === '') {
      defaultAddress = '';
    } else if (data.buildingName === 'N') {
      defaultAddress = `(${data.apartment})`;
    } else {
      defaultAddress = `(${data.buildingName})`;
    }

    console.log({
      zonecode: data.zonecode,
      address: data.address,
      defaultAddress,
    });
  };

  return (
    <Postcode
      style={{ width: '100%', height: '100%' }}
      jsOptions={{ animation: true }}
      onSelected={data => getAddressData(data)}
    />
  );
}

export default memo(SearchAddress);
