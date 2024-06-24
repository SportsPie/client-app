/* eslint-disable no-param-reassign */

import { createSlice } from '@reduxjs/toolkit';

export const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    isChatRoomListPage: false,
    chatRoomList: [],
    chatList: [],
    roomId: '', // 현재 입장한 채팅방의 roomId
    participantList: [], // 현재 입장한 채팅방의 참여자 리스트
    notiYn: 'Y', // 현재 입장한 채팅방의 알림 여부
    messageTaskProcessing: false, // mqtt에서 받은 메시지 처리중인지 확인 // 앱 종료시 connection 끊고 messageTaskProcessing 값이 false로 변경된 후에 종료할 것
    messageShowMinTimeId: 0, // 이 시간보다 큰 timeId를 가진 메시지만 보여준다. (Notification)
    newMessageTimeId: 0, // 새로 들어온 채팅 메시지 TimeId
    moveRoomId: '', // Noti 클릭시 이동할 방의 RoomId
    notReadChatIsExists: false,
  },
  reducers: {
    enterChatRoomListPage: state => {
      state.isChatRoomListPage = true;
    },
    outChatRoomListPage: state => {
      state.isChatRoomListPage = false;
    },
    setChatRoomList: (state, action) => {
      state.chatRoomList = action.payload;
    },
    setChatList: (state, action) => {
      state.chatList = action.payload;
    },
    setChatRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setMessageTaskProcessing: (state, action) => {
      state.messageTaskProcessing = action.payload;
    },
    setMessageShowMinTimeId: (state, action) => {
      state.messageShowMinTimeId = action.payload;
    },
    setNewMessageTimeId: (state, action) => {
      state.newMessageTimeId = action.payload;
    },
    setParticipantList: (state, action) => {
      state.participantList = action.payload;
    },
    setNotiYn: (state, action) => {
      state.notiYn = action.payload;
    },
    setMoveRoomId: (state, action) => {
      state.moveRoomId = action.payload;
    },
    notReadChatIsExists: (state, action) => {
      state.notReadChatIsExists = action.payload;
    },
    resetChatRoomList: state => {
      state.chatRoomList = [];
    },
    resetChatList: state => {
      state.chatList = [];
    },
    resetChatRoomId: state => {
      state.roomId = '';
    },
    resetMessageShowMinTimeId: (state, action) => {
      state.messageShowMinTimeId = 0;
    },
    resetNewMessageTimeId: (state, action) => {
      state.newMessageTimeId = 0;
    },
    resetParticipantList: (state, action) => {
      state.participantList = [];
    },
    resetMoveRoomId: (state, action) => {
      state.moveRoomId = '';
    },
  },
});

export const chatSliceActions = chatSlice.actions;

export default chatSlice.reducer;
