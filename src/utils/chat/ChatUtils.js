import { SERVER_TOPIC } from '@env';

import messaging from '@react-native-firebase/messaging';
import ChatMapper, { MESSAGE_TYPE, ROOM_TYPE } from './ChatMapper';

import { isMqttConnected, MqttUtils, waitConnect } from '../MqttUtils';
import { handleError } from '../HandleError';
import { store } from '../../redux/store';
import { chatSliceActions } from '../../redux/reducers/chatSlice';
import SqlLite from '../SqlLite/SqlLite';
import { TABLES } from '../SqlLite/SqlListConsts';
import { pushNotif } from '../FirebaseMessagingService';
import {
  apiGetChatAcademy,
  apiGetChatMatch,
  apiGetChatRoom,
  apiGetChatUser,
} from '../../api/RestAPI';
import { SPToast } from '../../components/SPToast';
import NavigationService from '../../navigation/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FCM_TYPE } from '../../common/constants/fcmType';
import Utils from '../Utils';

const chatUtils = {
  /**
   * user call function
   */
  /*
    생성 성공시 return { created: true, roomId };
    이미 있을 경우 return { created: false, roomId };
    실패시 : return false
   */
  createRoom: async (
    // eslint-disable-next-line default-param-last
    participantList = [], // [{userIdx, userType, userNm, academyIdx}] // 방 생성자 포함
    roomNm,
    forceCreate, // 참가자가 3명이상 일때 같은 참가자에 대한 방을 하나 더 만들고자 하면 true
    idx, // [academy] 방이 이미 존재하는지 확인하기 위해 사용하는 idx :: null일 경우 idx 대신 동일한 참가자여부가 있는지에 대한 여부로 확인한다.
  ) => {
    try {
      if (!isMqttConnected()) {
        try {
          await waitConnect();
        } catch (error) {
          Utils.openModal({
            title: '실패',
            body: '채팅방 생성에 성공하지 못했습니다. 잠시 후 다시 시도해주세요.',
          });
          return;
        }
      }
      const authState = store.getState().auth;
      const createUserIdx = authState.userIdx;
      const createUserType = authState.userType;
      const memberCnt = participantList.length;
      let roomType = ROOM_TYPE.DIRECT;

      // [[ [academy]
      if (!idx) {
        roomType = memberCnt > 2 ? ROOM_TYPE.GROUP : ROOM_TYPE.DIRECT;
      }
      // [academy] ]]

      const timeId = new Date().getTime();
      let roomId = null;

      // [academy] [[
      if (!idx) {
        roomId = `${createUserType}/${createUserIdx}/${timeId}/${idx}`;
      } else {
        roomId = `${createUserType}/${createUserIdx}/${idx}`;
      }
      // [academy] ]]

      // 이미 존재하는 방 또는 이미 참가자가 같은 방이 있을 경우 확인
      const room = await ChatMapper.selectChatRoomById(roomId);
      if (room) return { created: false, room };

      const participantIdxAndTypeList = participantList.map(v => {
        return { userIdx: v.userIdx, userType: v.userType };
      });
      const ExistsRoom = await ChatMapper.selectExistsRoomByParticipants(
        participantIdxAndTypeList,
      );

      // 1:1 방일 경우 재생성 불가능
      // [academy] [[ // 1:1 방일 경우 재생성 불가능할 경우 주석 해제
      // if (ExistsRoom && roomType === ROOM_TYPE.DIRECT) {
      //   return { created: false, room: ExistsRoom };
      // }
      // [academy] ]]

      // 참가자 인원이 같을 때 이미 방이 있어도 또다른 방을 새로 생성하고 싶다면 통과
      if (ExistsRoom && !forceCreate) {
        return { created: false, room: ExistsRoom };
      }

      const me = participantList.filter(
        ({ userType, userIdx }) =>
          `${userType}` === `${createUserType}` &&
          `${userIdx}` === `${createUserIdx}`,
      )?.[0];

      /* 참여자 추가 및 메시지 보내기 */
      if (roomType === ROOM_TYPE.DIRECT) {
        const you = participantList.filter(
          ({ userType, userIdx }) =>
            !(
              `${userType}` === `${createUserType}` &&
              `${userIdx}` === `${createUserIdx}`
            ),
        )?.[0];

        // 참여자 데이터 생성
        const participants = [
          {
            roomId,
            roomNm: you.userNm,
            userIdx: me.userIdx,
            userType: me.userType,
            userNm: me.userNm,
            fstMsgTimeId: timeId,
            readTimeId: timeId - 1,
            topic: chatUtils.getTopic(createUserType, createUserIdx),
            notiYn: 'Y',
            academyIdx: me.academyIdx, // [academy]
          },
          {
            roomId,
            roomNm: me.userNm,
            userIdx: you.userIdx,
            userType: you.userType,
            userNm: you.userNm,
            fstMsgTimeId: timeId,
            readTimeId: timeId - 1,
            topic: chatUtils.getTopic(you.userType, you.userIdx),
            notiYn: 'Y',
            academyIdx: you.academyIdx, // [academy]
          },
        ];

        const message = {
          roomId,
          roomType,
          sendUserIdx: me.userIdx,
          sendUserNm: me.userNm,
          sendUserType: me.userType,
          sendUserAcademyIdx: me.academyIdx, // [academy]
          msgType: MESSAGE_TYPE.CREATE_ROOM,
          participantList: participants,
          timeId,
          matchIdx: idx, // [academy]
        };

        // 메시지는 본인에게만 보낸다.
        await MqttUtils.send(
          chatUtils.getTopic(createUserType, createUserIdx),
          message,
        );
      } else {
        const roomName = `${participantList
          .map(({ userNm }) => userNm)
          .join(', ')}`;

        // 참여자 데이터 생성
        const participants = participantList.map(user => {
          return {
            roomId,
            roomNm: roomNm || roomName,
            userIdx: user.userIdx,
            userType: user.userType,
            userNm: user.userNm,
            fstMsgTimeId: timeId,
            readTimeId: timeId - 1,
            topic: chatUtils.getTopic(user.userType, user.userIdx),
            notiYn: 'Y',
          };
        });

        // 초대 메시지 보내기
        // topic = '/userType/userIdx'
        const message = {
          roomId,
          roomType,
          sendUserIdx: me.userIdx,
          sendUserNm: me.userNm,
          sendUserType: me.userType,
          msgType: MESSAGE_TYPE.CREATE_ROOM,
          participantList: participants,
          timeId,
        };

        await MqttUtils.send(
          chatUtils.getTopic(createUserType, createUserIdx),
          message,
        );
      }
      return { created: true, room: { roomId } };
    } catch (error) {
      console.log('createRoom error');
      handleError(error);
    }
    return false;
  },
  invite: async (
    roomId,
    invitedUserList = [], // [{userIdx, userNm, userType}] // 초대한 사람 제외
  ) => {
    if (!isMqttConnected()) {
      try {
        await waitConnect();
      } catch (error) {
        Utils.openModal({
          title: '실패',
          body: '초대하지 못했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }
    }
    const authState = store.getState().auth;
    const sendUserIdx = authState.userIdx;
    const sendUserNm = authState.userName;
    const sendUserType = authState.userType;

    try {
      const room = await ChatMapper.selectChatRoomById(roomId);
      const sender =
        await ChatMapper.selectParticipantByRoomIdAndUserTypeAndUserIdx({
          roomId,
          userType: sendUserType,
          userIdx: sendUserIdx,
        });
      const timeId = new Date().getTime();

      // 참가자 조회
      const participantList = await ChatMapper.selectParticipantList(roomId);

      // 초대 인원 나머지 정보 완성
      const invitedUsers = invitedUserList.map(user => {
        return {
          roomId,
          roomType: room.roomType,
          roomNm: sender.roomNm,
          userIdx: user.userIdx,
          userNm: user.userNm,
          userType: user.userType,
          fstMsgTimeId: timeId,
          readTimeId: timeId - 1,
          topic: chatUtils.getTopic(user.userType, user.userIdx),
          notiYn: 'Y',
        };
      });

      // 초대된 대상 포함하여 참가자 데이터 생성
      // eslint-disable-next-line no-restricted-syntax
      for (const invitedUser of invitedUsers) {
        participantList.push({
          roomId,
          roomType: room.roomType,
          roomNm: invitedUser.roomNm,
          userIdx: invitedUser.userIdx,
          userNm: invitedUser.userNm,
          userType: invitedUser.userType,
          fstMsgTimeId: timeId,
          readTimeId: timeId - 1,
          topic: chatUtils.getTopic(invitedUser.userType, invitedUser.userIdx),
          notiYn: invitedUser.notiYn,
        });
      }

      // 방 인원 수정
      await ChatMapper.updateRoomForMemberCnt(roomId);

      // 초대 메시지 보내기(초대된 대상 포함) :: 다른 기기에 로그인 되어있는 본인도 받아야 한다.
      const messageData = {
        roomId,
        roomNm: room.roomNm,
        roomType: room.roomType,
        sendUserIdx,
        sendUserNm,
        sendUserType,
        createUserType: room.createUserType,
        createUserIdx: room.createUserIdx,
        msgType: MESSAGE_TYPE.INVITE,
        invitedUserList: invitedUsers,
        participantList,
        timeId,
      };

      const topics = participantList.map(({ topic }) => topic);
      await chatUtils.sendInviteInGroupRoom(roomId, timeId);
      await MqttUtils.sendToMultipleTopics(topics, messageData);
      return true;
    } catch (error) {
      console.log('invite error');
      throw error;
    }
  },
  // 내가 방을 떠날 때
  leave: async roomId => {
    if (!isMqttConnected()) {
      try {
        await waitConnect();
      } catch (error) {
        Utils.openModal({
          title: '실패',
          body: '나가기에 성공하지 못했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }
    }
    const authState = store.getState().auth;
    const sendUserIdx = authState.userIdx;
    const sendUserNm = authState.userName;
    const sendUserType = authState.userType;

    try {
      // 방 참여자 정보 조회
      const room = await ChatMapper.selectChatRoomById(roomId);

      // 1:1 대화방일 경우 알림 없이 나감
      let topics = [];
      if (room.roomType === ROOM_TYPE.DIRECT) {
        topics = [chatUtils.getTopic(sendUserType, sendUserIdx)];
      } else {
        const participantList = await ChatMapper.selectParticipantList(roomId);
        topics = participantList.map(({ topic }) => topic);
      }

      const timeId = new Date().getTime();
      const message = {
        roomId,
        roomType: room.roomType,
        sendUserIdx,
        sendUserNm,
        sendUserType,
        // msg: `${sendUserNm}님이 방을 나갔습니다.`,
        msgType: MESSAGE_TYPE.LEAVE,
        timeId,
      };
      await MqttUtils.sendToMultipleTopics(topics, message);
      return true;
    } catch (error) {
      console.log('leave error');
      throw error;
    }
  },
  // 방 접근 시, 방에 있을 때 메시지 받았을 때
  read: async roomId => {
    try {
      if (!isMqttConnected()) {
        try {
          await waitConnect();
        } catch (error) {
          // Utils.openModal({
          //   title: '실패',
          //   body: 'MQTT 서버에 연결되어 있지 않습니다. 잠시 후 다시 시도해주세요.',
          // });
          return;
        }
      }
      const authState = store.getState().auth;
      const readUserIdx = authState.userIdx;
      const readUserType = authState.userType;
      // 참여자 정보 조회
      const room = await ChatMapper.selectChatRoomById(roomId);
      const participantList = await ChatMapper.selectParticipantList(roomId);
      // 자신을 포함한 토픽리스트로 자기 자신에게도 방 접근 메시지 보낸다.(다른 기기에접속한 자신에게도 메시지가 가도록 하기 위해서)
      const topics = participantList.map(({ topic }) => topic);

      const messageData = {
        roomId,
        roomType: room.roomType,
        roomNm: room.roomNm,
        sendUserIdx: readUserIdx, // 내가 읽은 메시지를 보냈던 사람
        sendUserType: readUserType,
        readTimeId: new Date().getTime(),
        msgType: MESSAGE_TYPE.READ,
      };
      await MqttUtils.sendToMultipleTopics(topics, messageData);
    } catch (error) {
      console.log('read error');
      handleError(error);
    }
  },
  updateRoomNm: async (roomId, roomNm) => {
    try {
      if (!isMqttConnected()) {
        try {
          await waitConnect();
        } catch (error) {
          Utils.openModal({
            title: '실패',
            body: '방이름 수정에 성공하지 못했습니다. 잠시 후 다시 시도해주세요.',
          });
          return;
        }
      }
      const authState = store.getState().auth;
      const topics = [
        chatUtils.getTopic(authState.userType, authState.userIdx),
        SERVER_TOPIC,
      ];
      const messageData = {
        roomId,
        sendUserType: authState.userType,
        sendUserIdx: authState.userIdx,
        roomNm,
        msgType: MESSAGE_TYPE.CHANGE_ROOM_NM,
      };
      await MqttUtils.sendToMultipleTopics(topics, messageData);
      return true;
    } catch (error) {
      console.log('updateRoomNm error');
      throw error;
    }
  },
  updateNotiYn: async (roomId, notiYn) => {
    try {
      if (!isMqttConnected()) {
        try {
          await waitConnect();
        } catch (error) {
          Utils.openModal({
            title: '실패',
            body: '알림 허용여부를 수정하지 못했습니다. 잠시 후 다시 시도해주세요.',
          });
          return;
        }
      }
      const authState = store.getState().auth;
      const topic = chatUtils.getTopic(authState.userType, authState.userIdx);
      const messageData = {
        roomId,
        sendUserType: authState.userType,
        sendUserIdx: authState.userIdx,
        msgType: MESSAGE_TYPE.CHANGE_NOTI_YN,
        notiYn,
      };
      await MqttUtils.send(topic, messageData);
    } catch (error) {
      console.log('updateNotiYn error');
      throw error;
    }
  },
  sendMessage: async (roomId, msg) => {
    try {
      if (!isMqttConnected()) {
        try {
          await waitConnect();
        } catch (error) {
          Utils.openModal({
            title: '실패',
            body: '메시지를 보내지 못했습니다. 잠시 후 다시 시도해주세요.',
          });
          return;
        }
      }
      if (!msg) return;
      const authState = store.getState().auth;
      const sendUserIdx = authState.userIdx;
      const sendUserNm = authState.userName;
      const sendUserType = authState.userType;

      const room = await ChatMapper.selectChatRoomById(roomId);
      const participantList = await ChatMapper.selectParticipantList(roomId);
      const topics = participantList.map(({ topic }) => topic);
      const timeId = new Date().getTime();

      // [[academy]] [[
      let me = null;
      if (room.roomType === ROOM_TYPE.DIRECT) {
        me = participantList.find(
          v => v.userType === sendUserType && v.userIdx === sendUserIdx,
        );
      }
      // [[academy]]  ]]

      await chatUtils.sendInviteInGroupRoom(roomId, timeId);

      const messageData = {
        roomId,
        roomType: room.roomType,
        sendUserIdx,
        sendUserNm,
        sendUserType,
        sendUserAcademyIdx: me?.academyIdx, // [[academy]]
        msg,
        msgType: MESSAGE_TYPE.CHAT,
        participantList,
        matchIdx: room.matchIdx, // [[academy]]
      };
      await MqttUtils.sendToMultipleTopics(topics, {
        ...messageData,
        timeId: timeId + 1,
      });
    } catch (error) {
      console.log('sendMessage error');
      handleError(error);
    }
  },
  sendInviteInGroupRoom: async (roomId, timeId) => {
    try {
      if (!isMqttConnected()) {
        try {
          await waitConnect();
        } catch (error) {
          Utils.openModal({
            title: '실패',
            body: '초대를 하지 못했습니다. 잠시 후 다시 시도해주세요.',
          });
          return;
        }
      }
      const authState = store.getState().auth;
      const sendUserIdx = authState.userIdx;
      const sendUserNm = authState.userName;
      const sendUserType = authState.userType;

      // 그룹 방 생성자가 첫번째 메시지를 보낼 때 :: 초대 메시지 보내기
      // 그룹 방 생성시는 메세지 0 이고, 방 생성자가 나갔다가 다시 초대된 경우에는 초대 메세지가 존재하므로 메시지 카운트가 0이 아니다.
      // 때문에 초대메시지는 유저의 첫번째 메시지 timeId보다 크면 안된다.
      const participantList = await ChatMapper.selectParticipantList(roomId);
      const room = await ChatMapper.selectChatRoomById(roomId);
      const messageCnt = await ChatMapper.countChatMessageByRoomId(roomId);
      const topics = participantList.map(({ topic }) => topic);

      if (
        messageCnt === 0 &&
        `${sendUserType}` === `${room.createUserType}` &&
        `${sendUserIdx}` === `${room.createUserIdx}` &&
        `${room.roomType}` !== ROOM_TYPE.DIRECT
      ) {
        await MqttUtils.sendToMultipleTopics(topics, {
          roomId,
          roomType: room.roomType,
          sendUserIdx,
          sendUserNm,
          sendUserType,
          msgType: MESSAGE_TYPE.GROUP_FST_MSG,
          participantList,
          timeId,
        });
      }
    } catch (error) {
      console.log('sendInviteInGroupRoom error');
      throw error;
    }
  },

  /**
   *  message received function
   */
  receivedCreateRoomMessage: async (userType, userIdx, message) => {
    try {
      const state = store.getState().chat;
      const isDirectRoom = message.roomType === ROOM_TYPE.DIRECT;

      // 참가자 추가
      await ChatMapper.insertParticipantList(message.participantList);

      // 방 생성
      const insertData = {
        roomId: message.roomId,
        roomType: message.roomType,
        createUserType: message.sendUserType,
        createUserIdx: message.sendUserIdx,
        lastChat: !isDirectRoom ? message.msg : '',
        memberCnt: message.participantList.length,
      };

      // [academy] [[
      if (isDirectRoom) {
        const you = message.participantList.find(
          v =>
            !(
              v.userType === message.sendUserType &&
              v.userIdx === message.sendUserIdx
            ),
        );
        insertData.targetAcademyIdx = you.academyIdx; // [academy]
        insertData.targetUserIdx = you.userIdx; // [academy]
        insertData.matchIdx = message.matchIdx; // [academy]
      }
      // [academy] ]]
      await ChatMapper.insertChatRoom(insertData);

      if (state.isChatRoomListPage) {
        const roomList = await ChatMapper.selectChatRoomList({
          userIdx,
          userType,
          paging: false,
        });
        store.dispatch(chatSliceActions.setChatRoomList(roomList));
      }

      if (state.isChatRoomListPage) {
        const roomList = await ChatMapper.selectChatRoomList({
          userIdx,
          userType,
          paging: false,
        });
        store.dispatch(chatSliceActions.setChatRoomList(roomList));
      }
    } catch (error) {
      console.log('receivedCreateRoomMessage error');
      handleError(error);
    }
  },
  receivedGroupFstMsg: async (myUserType, myUserIdx, message) => {
    try {
      const state = store.getState().chat;
      const isChatRoomPage = `${state.roomId}` === `${message.roomId}`;

      // TODO :: 만약 친구와 관련된 sql lite 테이블이 있을 경우 해당 테이블에서 이름 구해와서 각자 사용자에 맞는 이름을 넣도록 수정 필요
      const me = message.participantList.find(
        v => v.userType === myUserType && v.userIdx === myUserIdx,
      );
      const nameExceptMe = `${message.participantList
        .filter(
          ({ userType, userIdx }) =>
            !(
              `${me.userType}` === `${userType}` &&
              `${userIdx}` === `${me.userIdx}`
            ),
        )
        .map(({ userNm }) => userNm)
        .join(', ')}`;
      const inviteMsg = `${message.sendUserNm}님이 ${nameExceptMe}님을 초대했습니다.`;
      const data = { ...message, msg: inviteMsg };

      const myMessage =
        `${message.sendUserType}` === `${myUserType}` &&
        `${message.sendUserIdx}` === `${myUserIdx}`;
      let insertedMessage = '';

      if (myMessage) {
        // 메시지 추가
        insertedMessage = await ChatMapper.insertChatMessage(data);
      } else {
        // 방 추가
        await ChatMapper.insertChatRoom({
          roomId: message.roomId,
          roomType: message.roomType,
          createUserType: message.createUserType,
          createUserIdx: message.createUserIdx,
        });
        // 참가자 추가
        await ChatMapper.insertParticipantList(message.participantList);

        // 메시지 추가
        insertedMessage = await ChatMapper.insertChatMessage(data);

        // 방 인원 수정
        await ChatMapper.updateRoomForMemberCnt(message.roomId);
      }

      if (isChatRoomPage) {
        const chatList = [...(state.chatList ? state.chatList : [])];
        chatList.unshift(insertedMessage);
        store.dispatch(chatSliceActions.setChatList(chatList));
      }
    } catch (error) {
      console.log('receivedGroupFstMsg error');
      handleError(error);
    }
  },
  receivedChangeRoomMessage: async (userType, userIdx, message) => {
    try {
      const state = store.getState().chat;
      const isChatRoomPage = `${state.roomId}` === `${message.roomId}`;

      await ChatMapper.updateRoomNm({
        roomId: message.roomId,
        roomNm: message.roomNm,
        userType,
        userIdx,
      });
      if (isChatRoomPage) {
        SPToast.show({ text: '방 이름이 변경되었습니다.' });
      }
    } catch (error) {
      console.log('receivedChangeRoomMessage error');
      handleError(error);
    }
  },
  receivedChangeNotiYnMessage: async (userType, userIdx, message) => {
    try {
      console.log('receivedChangeNotiYnMessage');
      const state = store.getState().chat;
      const isChatRoomPage = `${state.roomId}` === `${message.roomId}`;
      await ChatMapper.updateNotiYn({
        roomId: message.roomId,
        notiYn: message.notiYn,
        userType,
        userIdx,
      });
      if (isChatRoomPage) {
        store.dispatch(chatSliceActions.setNotiYn(message.notiYn));
      }
    } catch (error) {
      console.log('receivedChangeNotiYnMessage error');
      handleError(error);
    }
  },
  // 초대 메시지를 받은 경우 :: 단체 방이 생성된 경우, 내가 초대된 경우, 누군가 초대된 경우
  receivedInviteMessage: async (myUserType, myUserIdx, message) => {
    try {
      // TODO :: 만약 친구와 관련된 sql lite 테이블이 있을 경우 해당 테이블에서 이름 구해와서 각자 사용자에 맞는 이름을 넣도록 수정 필요
      const msg = `${message.sendUserNm}님이 ${message.invitedUserList
        .map(({ userNm }) => userNm)
        .join(', ')}님을 초대했습니다.`;

      // 내가 초대한 것인지 확인
      const isInviteMe = message.invitedUserList.find(
        ({ userType, userIdx }) =>
          `${userType}` === `${myUserType}` && `${userIdx}` === `${myUserIdx}`,
      );

      // 초대인원 중 이미 참가되어있는 인원 제외
      let invitedList = [];
      const participantList = await ChatMapper.selectParticipantList(
        message.roomId,
      );
      invitedList = message.invitedUserList.filter(v => {
        const existsParticipant = participantList.find(
          x => x.userType === v.userType && x.userIdx === v.userIdx,
        );
        return !existsParticipant;
      });
      const data = { ...message, msg, invitedUserList: invitedList };

      if (isInviteMe) {
        // 내가 초대된 경우
        await chatUtils.inviteMe(myUserType, myUserIdx, data);
      } else {
        // 누군가 초대된 경우
        await chatUtils.someoneInvited(data);
      }
    } catch (error) {
      console.log('receivedInviteMessage error');
      handleError(error);
    }
  },
  // 내가 초대된 경우
  inviteMe: async (myUserType, myUserIdx, message) => {
    try {
      // 날 초대한 경우
      // 방 생성
      await ChatMapper.insertChatRoom({
        roomId: message.roomId,
        roomType: message.roomType,
        createUserType: message.createUserType,
        createUserIdx: message.createUserIdx,
      });

      // 참가자 추가
      message.participantList.forEach(v => {
        if (v.userType === myUserType && v.userIdx === myUserIdx) {
          // eslint-disable-next-line no-param-reassign
          v.notiYn = 'Y';
        }
      });
      await ChatMapper.insertParticipantList(message.participantList);

      // 메시지 추가
      await ChatMapper.insertChatMessage(message);

      // 방 인원 수정
      await ChatMapper.updateRoomForMemberCnt(message.roomId);
    } catch (error) {
      console.log('inviteMe error');
      handleError(error);
    }
  },
  // 누군가 초대된 경우
  someoneInvited: async message => {
    try {
      const state = store.getState().chat;
      const isChatRoomPage = `${state.roomId}` === `${message.roomId}`;

      // 참가자 추가
      const participantList = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const invitedUser of message.invitedUserList) {
        participantList.push({
          roomId: message.roomId,
          roomNm: message.roomNm,
          userIdx: invitedUser.userIdx,
          userNm: invitedUser.userNm,
          userType: invitedUser.userType,
          fstMsgTimeId: message.fstMsgTimeId,
          readTimeId: message.readTimeId,
          topic: chatUtils.getTopic(invitedUser.userType, invitedUser.userIdx),
        });
      }
      if (participantList.length > 0) {
        await ChatMapper.insertParticipantList(participantList);
      }

      // 메시지 추가
      const insertedMessage = await ChatMapper.insertChatMessage(message);

      // 방 인원 수정
      await ChatMapper.updateRoomForMemberCnt(message.roomId);

      if (isChatRoomPage) {
        const chatList = [...(state.chatList ? state.chatList : [])];
        chatList.unshift(insertedMessage);
        const plist = await ChatMapper.selectParticipantList(message.roomId);
        store.dispatch(chatSliceActions.setChatList(chatList));
        store.dispatch(chatSliceActions.setParticipantList(plist));
      }
    } catch (error) {
      console.log('someoneInvited error');
      handleError(error);
    }
  },
  // 방 떠남 메시지 받았을 경우
  receivedLeaveMessage: async (myUserType, myUserIdx, message) => {
    try {
      // TODO :: 만약 친구와 관련된 sql lite 테이블이 있을 경우 해당 테이블에서 이름 구해와서 각자 사용자에 맞는 이름을 넣도록 수정 필요
      const msg = `${message.sendUserNm}님이 방을 나갔습니다.`;
      const data = { ...message, msg };
      const chatState = store.getState().chat;
      const isChatRoomPage = `${chatState.roomId}` === `${data.roomId}`;
      const { isChatRoomListPage } = chatState;

      // 내가 나간 것인지 확인
      const isILeave =
        `${data.sendUserType}` === `${myUserType}` &&
        `${data.sendUserIdx}` === `${myUserIdx}`;
      if (isILeave) {
        // 메시지 제거
        await ChatMapper.deleteMessage(data.roomId);
        // 참가자 제거
        await ChatMapper.deleteParticipant(data.roomId);
        // 방 제거
        await ChatMapper.deleteChatRoom(data.roomId);

        // 방에 있을 경우 방 나가기
        if (isChatRoomPage) {
          NavigationService.goBack();
        }
        if (isChatRoomListPage) {
          const roomList = await ChatMapper.selectChatRoomList({
            userIdx: myUserIdx,
            userType: myUserType,
            paging: false,
          });
          store.dispatch(chatSliceActions.setChatRoomList(roomList));
        }
      } else {
        // 참가자 제거
        await ChatMapper.deleteParticipantByUserTypeAndUserIdx(
          data.roomId,
          data.sendUserType,
          data.sendUserIdx,
        );
        await ChatMapper.updateRoomForMemberCnt(data.roomId);
        // 1:1 대화방의 경우에는 떠남 메세지를 표시하지 않는다.
        if (data.roomType !== ROOM_TYPE.DIRECT) {
          // 메시지 추가
          const insertedMessage = await ChatMapper.insertChatMessage(data);

          if (isChatRoomPage) {
            const plist = await ChatMapper.selectParticipantList(data.roomId);
            const chatList = [
              ...(chatState.chatList ? chatState.chatList : []),
            ];
            chatList.unshift(insertedMessage);
            store.dispatch(chatSliceActions.setChatList(chatList));
            store.dispatch(chatSliceActions.setParticipantList(plist));
          }
        }
      }
    } catch (error) {
      console.log('receivedLeaveMessage error');
      handleError(error);
    }
  },
  // 유저가 방 안에 있다는 메시지 받았을 경우
  receivedReadMessage: async message => {
    try {
      const chatState = store.getState().chat;
      const authState = store.getState().auth;
      const isMyMessage =
        `${authState.userType}` === `${message.sendUserType}` &&
        `${authState.userIdx}` === `${message.sendUserIdx}`;
      const { isChatRoomListPage } = chatState;
      const isChatRoomPage = `${chatState.roomId}` === `${message.roomId}`;
      // 참여자 정보 수정
      await ChatMapper.updateParticipantForReadTimeId({
        roomId: message.roomId,
        userType: message.sendUserType,
        userIdx: message.sendUserIdx,
        readTimeId: message.readTimeId,
      });

      // 안읽은 메시지 수 수정
      const room = await ChatMapper.selectChatRoomById(message.roomId);
      if (room) {
        await ChatMapper.updateParticipantForNotReadChatCnt({
          roomId: message.roomId,
          userType: message.sendUserType,
          userIdx: message.sendUserIdx,
        });
      }
      if (isMyMessage) {
        // if(isChatRoomListPage){
        const roomList = await ChatMapper.selectChatRoomList({
          userIdx: authState.userIdx,
          userType: authState.userType,
          paging: false,
        });
        store.dispatch(chatSliceActions.setChatRoomList(roomList));
        // }
      }
      if (isChatRoomPage) {
        // 참여자 정보 수정
        const participants = JSON.parse(
          JSON.stringify(chatState.participantList),
        );
        if (participants.length > 0) {
          const participant = participants.find(
            v =>
              `${v.userIdx}` === `${message.sendUserIdx}` &&
              `${v.userType}` === `${message.sendUserType}`,
          );
          participant.readTimeId = message.readTimeId;
          store.dispatch(chatSliceActions.setParticipantList(participants));
        }
      }
    } catch (error) {
      console.log('receivedReadMessage error');
      handleError(error);
    }
  },
  receivedChatMessage: async (myUserType, myUserIdx, message) => {
    try {
      const chatState = store.getState().chat;
      const { isChatRoomListPage } = chatState;
      const isChatRoomPage = `${chatState.roomId}` === `${message.roomId}`;
      const { roomId, roomType } = message;
      // const me = participantList.find(
      //   v => v.userType === myUserType && v.userIdx === myUserIdx,
      // );
      const myMessage =
        `${message.sendUserType}` === `${myUserType}` &&
        `${message.sendUserIdx}` === `${myUserIdx}`;
      // 첫 메시지 여부
      const room = await ChatMapper.selectChatRoomById(roomId);
      if (!room) {
        // 방 추가
        const insertData = {
          roomId,
          roomType,
          memberCnt: message.participantList.length,
        };

        // [[academy]] [[
        if (roomType === ROOM_TYPE.DIRECT) {
          const you = message.participantList.find(
            v => !(v.userType === myUserType && v.userIdx === myUserIdx),
          );
          insertData.targetAcademyIdx = you.academyIdx; // [[academy]]
          insertData.targetUserIdx = you.userIdx; // [[academy]]
          insertData.matchIdx = message.matchIdx; // [[academy]]
        }
        // [[academy]] ]]
        await ChatMapper.insertChatRoom(insertData);
        message.participantList.forEach(v => {
          if (v.userType === myUserType && v.userIdx === myUserIdx) {
            // eslint-disable-next-line no-param-reassign
            v.notiYn = 'Y';
          }
        });
        // 참가자 추가
        await ChatMapper.insertParticipantList(message.participantList);

        // [[academy]] [[
        if (roomType === ROOM_TYPE.DIRECT) {
          // DB를 통해 데이터 조회
          const you = message.participantList.find(
            v => !(v.userType === myUserType && v.userIdx === myUserIdx),
          );
          const academy = await ChatMapper.selectAcademyByIdx(you.academyIdx);
          const match = await ChatMapper.selectMatchByIdx(message.matchIdx);
          const user = await ChatMapper.selectMemberByIdx(you.userIdx);
          if (!academy) {
            const academyResponse = await apiGetChatAcademy([you.academyIdx]);
            const academyList = academyResponse.data.data;
            await ChatMapper.insertAcademyList(academyList);
          }
          if (!match) {
            const matchResponse = await apiGetChatMatch([message.matchIdx]);
            const matchList = matchResponse.data.data;
            await ChatMapper.insertMatchList(matchList);
          }
          if (!user) {
            const memberResponse = await apiGetChatUser([you.userIdx]);
            const memberList = memberResponse.data.data;
            await ChatMapper.insertMemberList(memberList);
          }
        }
        // [[academy]] ]]
      }
      // 메시지 추가
      const insertedMessage = await ChatMapper.insertChatMessage(message);

      // 방의 마지막 메시지 수정
      await ChatMapper.updateRoomForLastChat(roomId, message.msg);

      // 참가자 안 읽은 메시지 수 수정
      await ChatMapper.updateParticipantForNotReadChatCnt({
        roomId,
        userType: myUserType,
        userIdx: myUserIdx,
      });

      const isExistsNotReadChat = await ChatMapper.isNotReadChatExists({
        userType: myUserType,
        userIdx: myUserIdx,
      });
      store.dispatch(chatSliceActions.notReadChatIsExists(isExistsNotReadChat));

      if (isChatRoomListPage) {
        const roomList = await ChatMapper.selectChatRoomList({
          userIdx: myUserIdx,
          userType: myUserType,
          paging: false,
        });
        store.dispatch(chatSliceActions.setChatRoomList(roomList));
      }
      if (isChatRoomPage) {
        // 읽음 표시를 위해 메시지 보내기
        await chatUtils.read(roomId);
        const chatList = [...(chatState.chatList ? chatState.chatList : [])];
        chatList.unshift(insertedMessage);
        store.dispatch(chatSliceActions.setChatList(chatList));
        if (!myMessage) {
          store.dispatch(chatSliceActions.setNewMessageTimeId(message.timeId));
        }
      } else {
        await chatUtils.showNotification(message);
      }
    } catch (error) {
      console.log('receivedChatMessage error');
      handleError(error);
    }
  },
  // 메시지 수신
  receivedMessage: async message => {
    try {
      const state = store.getState().auth;
      const { userType, userIdx } = state;
      switch (message.msgType) {
        case MESSAGE_TYPE.CREATE_ROOM:
          await chatUtils.receivedCreateRoomMessage(userType, userIdx, message);
          break;
        case MESSAGE_TYPE.GROUP_FST_MSG:
          await chatUtils.receivedGroupFstMsg(userType, userIdx, message);
          break;
        case MESSAGE_TYPE.CHANGE_ROOM_NM:
          await chatUtils.receivedChangeRoomMessage(userType, userIdx, message);
          break;
        case MESSAGE_TYPE.CHANGE_NOTI_YN:
          await chatUtils.receivedChangeNotiYnMessage(
            userType,
            userIdx,
            message,
          );
          break;
        case MESSAGE_TYPE.INVITE: {
          await chatUtils.receivedInviteMessage(userType, userIdx, message);
          break;
        }
        case MESSAGE_TYPE.LEAVE: {
          await chatUtils.receivedLeaveMessage(userType, userIdx, message);
          break;
        }
        case MESSAGE_TYPE.READ: {
          await chatUtils.receivedReadMessage(message);
          break;
        }
        case MESSAGE_TYPE.CHAT: {
          await chatUtils.receivedChatMessage(userType, userIdx, message);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.log('receivedMessage error');
      handleError(error);
    }
  },
  createChatTable: async () => {
    await SqlLite.createChatRoom();
    await SqlLite.createChatParticipant();
    await SqlLite.createChatMessage();
    await SqlLite.createAcademies(); // [academy]
    await SqlLite.createMatches(); // [academy]
    await SqlLite.createMembers(); // [academy]
  },
  dropChatTable: async () => {
    await SqlLite.dropTable(TABLES.chatMessage);
    await SqlLite.dropTable(TABLES.chatParticipant);
    await SqlLite.dropTable(TABLES.chatRoom);
    await SqlLite.dropTable(TABLES.academies); // [academy]
    await SqlLite.dropTable(TABLES.matches); // [academy]
    await SqlLite.dropTable(TABLES.members); // [academy]
  },
  reCreateChatTable: async () => {
    await SqlLite.dropTable(TABLES.chatMessage);
    await SqlLite.dropTable(TABLES.chatParticipant);
    await SqlLite.dropTable(TABLES.chatRoom);
    await SqlLite.dropTable(TABLES.academies); // [academy]
    await SqlLite.dropTable(TABLES.matches); // [academy]
    await SqlLite.dropTable(TABLES.members); // [academy]
    await SqlLite.createChatRoom();
    await SqlLite.createChatParticipant();
    await SqlLite.createChatMessage();
    await SqlLite.createAcademies(); // [academy]
    await SqlLite.createMatches(); // [academy]
    await SqlLite.createMembers(); // [academy]
  },
  enterChatRoomList: () => {
    store.dispatch(chatSliceActions.enterChatRoomListPage());
  },
  outChatRoomList: () => {
    store.dispatch(chatSliceActions.outChatRoomListPage());
    // store.dispatch(chatSliceActions.resetChatRoomList());
  },
  enterChatRoom: async roomId => {
    const state = store.getState().auth;
    const participants = await ChatMapper.selectParticipantList(roomId);
    const me = participants.find(
      v => v.userType === state.userType && v.userIdx === state.userIdx,
    );
    store.dispatch(chatSliceActions.setParticipantList(participants));
    store.dispatch(chatSliceActions.setChatRoomId(roomId));
    store.dispatch(chatSliceActions.resetNewMessageTimeId());
    store.dispatch(chatSliceActions.setNotiYn(me.notiYn));
    store.dispatch(chatSliceActions.resetMoveRoomId());
    chatUtils.read(roomId);
  },
  outChatRoom: () => {
    store.dispatch(chatSliceActions.outChatRoomListPage());
    store.dispatch(chatSliceActions.resetParticipantList());
    store.dispatch(chatSliceActions.resetChatRoomId());
    store.dispatch(chatSliceActions.resetChatList());
    store.dispatch(chatSliceActions.resetNewMessageTimeId());
  },
  /**
   * help function
   */
  getRoomListAndInsertFromServer: async () => {
    try {
      const { data } = await apiGetChatRoom();
      if (data.data.roomList && data.data.roomList.length > 0) {
        await ChatMapper.insertChatRoomList(data.data.roomList);
      }
      if (data.data.participantList && data.data.participantList.length > 0) {
        await ChatMapper.insertParticipantList(data.data.participantList);
      }
      if (data.data.matchList && data.data.matchList.length > 0) {
        await ChatMapper.insertMatchList(data.data.matchList);
      }
      if (data.data.academyList && data.data.academyList.length > 0) {
        await ChatMapper.insertAcademyList(data.data.academyList);
      }
      if (data.data.userList && data.data.userList.length > 0) {
        await ChatMapper.insertMemberList(data.data.userList);
      }
    } catch (error) {
      console.log('getRoomListAndInsertFromServer error');
      handleError(error);
    }
  }, // DB에서 채팅방 리스트 가져오기(전체 다 가져와야 한다.)
  getChatMessage: async () => {}, // DB에서 가져오기(일부만 가져온다.)
  showNotification: async message => {
    /*
     알림 거부시는 안 띄운다.
     알림 허가시는 최초 앱 시작시 연속으로 들어오는 메시지는 띄우지 않는다.(timeId로 비교 해서 이후의 것만 띄울 것 로그인시 앱 시작 timeId를 기억해두자) 시작 이후 들어온 메시지는 모두 다 띄운다.
     */
    const chatState = store.getState().chat;
    const authState = store.getState().auth;
    const pushAuthStatus = await messaging().hasPermission();
    const sender = await ChatMapper.selectMemberByIdx(message.sendUserIdx);
    const isMyMessage =
      `${authState.userType}` === `${message.sendUserType}` &&
      `${authState.userIdx}` === `${message.sendUserIdx}`;

    // 알림 표시
    // 알림 허용 확인
    const storedNotificationStates = await AsyncStorage.getItem(
      `notificationStates_${authState.userIdx}`,
    );
    const userNotiPermissions = JSON.parse(storedNotificationStates);

    if (
      !isMyMessage &&
      // me.notiYn === 'Y' && // 이 프로젝트에서는 notiYn 대신 userNotiPermissions로 확인
      userNotiPermissions[FCM_TYPE.MATCH] &&
      pushAuthStatus &&
      chatState.messageShowMinTimeId < message.timeId
    ) {
      const notiMessage = {
        data: {
          roomId: message.roomId,
          title: sender?.userNickName || '스포츠파이',
          body: message.msg,
        },
      };
      console.log('received chat message and open notify');
      await pushNotif(notiMessage);
    }
  },
  getTopic: (userType, userIdx) => {
    return `/${userType}/${userIdx}`;
  },
  waitChatCreated: async result => {
    try {
      if (result) {
        if (result?.created) {
          let tryCount = 50;
          let createSuccess = false;
          while (tryCount > 0) {
            tryCount -= 1;
            // eslint-disable-next-line no-await-in-loop
            const room = await ChatMapper.selectChatRoomById(
              result.room.roomId,
            );
            if (room) {
              createSuccess = true;
              break;
            }
            // eslint-disable-next-line no-await-in-loop
            await new Promise(resolve => {
              setTimeout(resolve, 300);
            });
          }
          if (createSuccess) {
            return true;
          }
          return false;
        }
        if (result.room?.roomId) {
          const room = await ChatMapper.selectChatRoomById(result.room.roomId);
          return !!room;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.log('waitChatCreated error', error);
      return false;
    }
  },
  waitLeave: async roomId => {
    try {
      let tryCount = 50;
      let removeSuccess = false;
      while (tryCount > 0) {
        tryCount -= 1;
        // eslint-disable-next-line no-await-in-loop
        const room = await ChatMapper.selectChatRoomById(roomId);
        if (!room) {
          removeSuccess = true;
          break;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => {
          setTimeout(resolve, 300);
        });
      }
      if (removeSuccess) {
        return true;
      }
      return false;
    } catch (error) {
      handleError(error);
    }
    return false;
  },
};
export default chatUtils;
