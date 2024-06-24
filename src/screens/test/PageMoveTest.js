import React, { useCallback, useEffect } from 'react';
import { Button, ScrollView, Text } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { navName } from '../../common/constants/navName';
import Utils from '../../utils/Utils';
import NavigationService from '../../navigation/NavigationService';
import { authAction } from '../../redux/reducers/authSlice';
import { MqttUtils } from '../../utils/MqttUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/header';

function Buttons() {
  const navigation = NavigationService;
  const dispatch = useDispatch();
  return (
    <>
      <Button
        title="Home"
        onPress={() => {
          navigation.navigate(navName.pageMoveTest, { test: 'params test' });
        }}
      />
      <Button
        title="signed1"
        onPress={() => {
          navigation.navigate(navName.signedTestPage, { test: 'params test' });
        }}
      />
      <Button
        title="signed2"
        onPress={() => {
          navigation.navigate(navName.signedTestPage2);
        }}
      />
      <Button
        title="noSiigned1"
        onPress={() => {
          navigation.navigate(navName.noSignedTestPage);
        }}
      />
      <Button
        title="noSiigned2"
        onPress={() => {
          navigation.navigate(navName.noSignedTestPage2);
        }}
      />
      <Button
        title="common1"
        onPress={() => {
          navigation.navigate(navName.commonTestPage);
        }}
      />
      <Button
        title="common2"
        onPress={() => {
          navigation.navigate(navName.commonTestPage2);
        }}
      />
      <Button
        title="bottom1"
        onPress={() => {
          navigation.navigate(navName.bottomTest1);
        }}
      />
      <Button
        title="bottom2"
        onPress={() => {
          navigation.navigate(navName.bottomTest2);
        }}
      />
      <Button
        title="bottom3"
        onPress={() => {
          navigation.navigate(navName.bottomTest3);
        }}
      />
      <Button
        title="bottom4"
        onPress={() => {
          navigation.navigate(navName.bottomTest4);
        }}
      />
      <Button
        title="login"
        onPress={() => {
          dispatch(
            authAction.setAuth({
              accessToken: 'accessToken',
              refreshToken: 'refreshToken',
              isLogin: true,
            }),
          );
        }}
      />
      <Button
        title="logout"
        onPress={() => {
          Utils.logout();
        }}
      />
    </>
  );
}
function PageMoveTest({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="pageMoveTest" />
      <ScrollView>
        <Text>Home</Text>
        <Buttons navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}
function Login({ navigation, noMove }) {
  const route = useRoute()?.params;
  console.log('Login route', route);
  const dispatch = useDispatch();

  return (
    <ScrollView>
      <Text>loginTestPage</Text>
      <Button
        title="login"
        onPress={async () => {
          dispatch(
            authAction.setAuth({
              accessToken: 'accessToken',
              refreshToken: 'refreshToken',
              isLogin: true,
            }),
          );
          if (!noMove) {
            NavigationService.replace(
              route?.from || navName.pageMoveTest,
              route,
            );
          }
        }}
      />
      {/* <Buttons navigation={navigation} /> */}
    </ScrollView>
  );
}
function SignedTestPage({ navigation }) {
  const route = useRoute()?.params;
  console.log('SignedTestPage route', route);

  useFocusEffect(
    useCallback(() => {
      console.log('signedTestPage focus');
      return () => {
        console.log('signedTestPage blur');
      };
    }, []),
  );
  return (
    <ScrollView>
      <Text>signed</Text>
      <Buttons navigation={navigation} />
    </ScrollView>
  );
}
function SignedTestPage2({ navigation }) {
  useFocusEffect(
    useCallback(() => {
      console.log('signedTestPage2 focus');
      return () => {
        console.log('signedTestPage2 blur');
      };
    }, []),
  );
  return (
    <ScrollView>
      <Text>signed2</Text>
      <Buttons navigation={navigation} />
    </ScrollView>
  );
}
function NoSignedTestPage({ navigation }) {
  return (
    <ScrollView>
      <Text>nosigned</Text>
      <Buttons navigation={navigation} />
    </ScrollView>
  );
}
function NoSignedTestPage2({ navigation }) {
  return (
    <ScrollView>
      <Text>nosigned2</Text>
      <Buttons navigation={navigation} />
    </ScrollView>
  );
}

function CommonTestPage({ navigation }) {
  return (
    <ScrollView>
      <Text>common</Text>
      <Buttons navigation={navigation} />
    </ScrollView>
  );
}
function CommonTestPage2({ navigation }) {
  return (
    <ScrollView>
      <Text>common2</Text>
      <Buttons navigation={navigation} />
    </ScrollView>
  );
}

export {
  PageMoveTest,
  Login,
  SignedTestPage,
  SignedTestPage2,
  NoSignedTestPage,
  NoSignedTestPage2,
  CommonTestPage,
  CommonTestPage2,
};
