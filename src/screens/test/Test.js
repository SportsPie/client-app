import React from 'react';
import { Button, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { navName } from '../../common/constants/navName';
import NavigationService from '../../navigation/NavigationService';

export default function Test() {
  const navigation = NavigationService;
  return (
    <ScrollView style={{ rowGap: 10 }}>
      <Button
        title="페이지 이동 테스트"
        onPress={() => {
          navigation.navigate(navName.pageMoveTest);
        }}
      />
      <Button
        title="구글 로그인 (미완)"
        onPress={() => {
          navigation.navigate(navName.googleLogin);
        }}
      />
      <Button
        title="페이스북 로그인 : (미완)"
        onPress={() => {
          navigation.navigate(navName.fbLogin);
        }}
      />
      <Button
        title="본인인증"
        onPress={() => {
          navigation.navigate(navName.auth);
        }}
      />
      <Button
        title="위치 가져오기"
        onPress={() => {
          navigation.navigate(navName.geolocation);
        }}
      />
      <Button
        title="동영상 테스트"
        onPress={() => {
          navigation.navigate(navName.videoTest);
        }}
      />
      <Button
        title="MQTT 테스트"
        onPress={() => {
          navigation.navigate(navName.mqttTest);
        }}
      />
      <Button
        title="채팅 테스트 (작업중)"
        onPress={() => {
          navigation.navigate(navName.chatTest);
        }}
      />
      <Button
        title="유튜브 동영상 테스트"
        onPress={() => {
          navigation.navigate(navName.youtubeTest);
        }}
      />
      <Button
        title="달력 테스트"
        onPress={() => {
          navigation.navigate(navName.calendarTest);
        }}
      />
      <Button
        title="기기정보 테스트"
        onPress={() => {
          navigation.navigate(navName.deviceTest);
        }}
      />
      <Button
        title="인스타(웹) 테스트"
        onPress={() => {
          navigation.navigate(navName.instagramTest);
        }}
      />
      <Button
        title="네이버 지도 테스트"
        onPress={() => {
          navigation.navigate(navName.naverMapTest);
        }}
      />
      <Button
        title="주소 검색"
        onPress={() => {
          navigation.navigate(navName.searchAddressTest);
        }}
      />
      <Button
        title="월렛 테스트"
        onPress={() => {
          navigation.navigate(navName.socialToken);
        }}
      />
      <Button
        title="홈으로 이동"
        onPress={() => {
          navigation.navigate(navName.home);
        }}
      />
      <Button
        title="마이페이지 이동"
        onPress={() => {
          navigation.navigate(navName.moreMyInfo);
        }}
      />
    </ScrollView>
  );
}
