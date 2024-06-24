import React from 'react';
import { Text, Linking } from 'react-native';
import Hyperlink from 'react-native-hyperlink';

const InstagramTest = () => {
    return (
        <Hyperlink linkDefault={true}>
            <Text onPress={() => Linking.openURL('https://www.instagram.com/halcyon_best?igsh=MWxtcHdlMXJyeXJ2aw%3D%3D&utm_source=qr')}>인스타 이동</Text>
        </Hyperlink>
    );
};


export default InstagramTest;
