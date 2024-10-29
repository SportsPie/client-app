import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEB_URL } from '@env';
import Header from '../../components/header';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';

function VipQrcode({ size }) {
  // --------------------------------------------------
  // [ State ]
  // --------------------------------------------------
  const authState = useSelector(selector => selector.auth);
  const [url, setUrl] = useState('');

  // --------------------------------------------------
  // [ function ]
  // --------------------------------------------------

  const generateUrl = () => {
    const userCode = btoa(`${authState.userIdx}`);
    const webUrl = `${WEB_URL}/user-entry?userCode=${userCode}`;
    setUrl(webUrl);
  };

  // --------------------------------------------------
  // [ useEffect ]
  // --------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      generateUrl();
    }, []),
  );

  return (
    <View style={styles.container}>
      {url && (
        <View style={styles.qrWrapper}>
          <QRCode value={url} size={size || SCREEN_WIDTH / 2} />
        </View>
      )}
    </View>
  );
}

export default memo(VipQrcode);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  qrWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 16,
  },
});
