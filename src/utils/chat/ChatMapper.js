import moment from 'moment';
import SqlLite from '../SqlLite/SqlLite';
import { TABLES, COLUMNS } from '../SqlLite/SqlListConsts';
import CustomException from '../../common/exceptions/CustomException';

import { handleError } from '../HandleError';

export const USER_TYPE = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};
export const ROOM_TYPE = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
};
export const MESSAGE_TYPE = {
  CREATE_ROOM: 'CREATE_ROOM',
  GROUP_FST_MSG: 'GROUP_FST_MSG',
  CHANGE_ROOM_NM: 'CHANGE_ROOM_NM',
  CHANGE_NOTI_YN: 'CHANGE_NOTI_YN',
  INVITE: 'INVITE',
  LEAVE: 'LEAVE',
  CHAT: 'CHAT',
  READ: 'READ',
};

const chatMapper = {
  selectChatRoomListAll: async () => {
    try {
      return await SqlLite.selectAll(
        TABLES.chatRoom,
        `ORDER BY ${COLUMNS.chatRoom.key} DESC`,
      );
    } catch (error) {
      console.log('selectChatRoomListAll error');
      return Promise.reject(error);
    }
  },
  selectChatMessageListAll: async () => {
    try {
      return await SqlLite.customSql(
        `SELECT * FROM ${TABLES.chatMessage} AS message JOIN ${TABLES.chatRoom} AS room ON room.${COLUMNS.chatRoom.key} = message.${COLUMNS.chatMessage.column.roomId} ORDER BY ${COLUMNS.chatMessage.key} DESC`,
      );
    } catch (error) {
      console.log('selectChatMessageListAll error');
      return Promise.reject(error);
    }
  },
  selectParticipantListAll: async () => {
    try {
      return await SqlLite.selectAll(
        TABLES.chatParticipant,
        `ORDER BY ${COLUMNS.chatParticipant.key} DESC`,
      );
    } catch (error) {
      console.log('selectParticipantListAll error');
      return Promise.reject(error);
    }
  },
  selectChatRoomList: async ({
    userIdx,
    userType = USER_TYPE.MEMBER,
    paging,
    page,
    size,
  }) => {
    try {
      // [academy]
      const selectSql = `SELECT  members.*,
                                        participant.${
                                          COLUMNS.chatParticipant.column.roomNm
                                        }, 
                                        participant.${
                                          COLUMNS.chatParticipant.column
                                            .notReadChatCnt
                                        }, 
                                        academies.*, 
                                        ${COLUMNS.matches.columns
                                          .split(',')
                                          .map(v => {
                                            v.trim();
                                            if (
                                              v ===
                                              COLUMNS.matches.column.addressFull
                                            ) {
                                              return `matches.${v} as matchAddressFull`;
                                            }
                                            return `matches.${v}`;
                                          })},
                                        room.*
                                FROM ${TABLES.chatRoom} AS room 
                                JOIN ${TABLES.chatParticipant} AS participant 
                                    ON room.${
                                      COLUMNS.chatRoom.key
                                    } = participant.${
        COLUMNS.chatParticipant.column.roomId
      }
                                LEFT JOIN ${TABLES.academies} AS academies
                                    ON room.${
                                      COLUMNS.chatRoom.column.targetAcademyIdx
                                    } = academies.${COLUMNS.academies.key}
                                LEFT JOIN ${TABLES.matches} AS matches
                                    ON room.${
                                      COLUMNS.chatRoom.column.matchIdx
                                    } = matches.${COLUMNS.matches.key}
                                LEFT JOIN ${TABLES.members} AS members
                                          ON room.${
                                            COLUMNS.chatRoom.column
                                              .targetUserIdx
                                          } = members.${COLUMNS.members.key}
                                `;
      const condition = ` WHERE participant.${COLUMNS.chatParticipant.column.userIdx} = ${userIdx}
                                  AND participant.${COLUMNS.chatParticipant.column.userType} = '${userType}'`;
      const order = paging
        ? ` ORDER BY room.${COLUMNS.chatRoom.column.updDate} DESC, room.${
            COLUMNS.chatRoom.column.regDate
          } DESC LIMIT ${size} OFFSET ${(page ? page - 1 : 0) * size}`
        : `ORDER BY room.${COLUMNS.chatRoom.column.updDate} DESC, room.${COLUMNS.chatRoom.column.regDate} DESC`;
      return await SqlLite.customSql(selectSql + condition + order);
    } catch (error) {
      console.log('selectChatRoomList error');
      return Promise.reject(error);
    }
  },
  isNotReadChatExists: async ({ userIdx, userType = USER_TYPE.MEMBER }) => {
    try {
      // [academy]
      const selectSql = `SELECT room.*,
                                        participant.${COLUMNS.chatParticipant.column.roomNm}, 
                                        participant.${COLUMNS.chatParticipant.column.notReadChatCnt}
                                FROM ${TABLES.chatRoom} AS room 
                                JOIN ${TABLES.chatParticipant} AS participant 
                                    ON room.${COLUMNS.chatRoom.key} = participant.${COLUMNS.chatParticipant.column.roomId}
                                `;
      const condition = ` WHERE participant.${COLUMNS.chatParticipant.column.userIdx} = ${userIdx}
                                  AND participant.${COLUMNS.chatParticipant.column.userType} = '${userType}'
                                  AND participant.${COLUMNS.chatParticipant.column.notReadChatCnt} > 0`;
      const result = await SqlLite.customSql(selectSql + condition);
      return !!(result && result.length > 0);
    } catch (error) {
      console.log('isNotReadChatExists error');
      return Promise.reject(error);
    }
  },
  selectChatRoomListByRoomIdList: async (roomIdList = []) => {
    try {
      const selectSql = `SELECT room.* FROM ${TABLES.chatRoom} as room`;
      const condition = ` WHERE room.${COLUMNS.chatRoom.key} IN (${roomIdList
        .map(v => `'${v}'`)
        .join(',')})`;
      const order = `ORDER BY room.${COLUMNS.chatRoom.column.updDate} DESC, room.${COLUMNS.chatRoom.column.regDate} DESC`;
      return await SqlLite.customSql(selectSql + condition + order);
    } catch (error) {
      console.log('selectChatRoomListByRoomIdList error');
      return Promise.reject(error);
    }
  },
  // 특정 채팅방의 메시지 리스트 가져오기 :: message.timeId 를 받을 것
  // timeId : 채팅룸에 들어온 시점의 timeId를 통해서 채팅방 접근 이전과 이후를 구분한다.
  selectChatMessageList: async ({ roomId, paging, page, size, timeId }) => {
    try {
      // [academy]
      const selectSql = `SELECT *, message.* FROM ${TABLES.chatMessage} AS message
                                JOIN ${TABLES.chatRoom} AS room ON room.${COLUMNS.chatRoom.key} = message.${COLUMNS.chatMessage.column.roomId}
                                LEFT JOIN ${TABLES.academies} AS academies ON message.${COLUMNS.chatMessage.column.sendUserAcademyIdx} = academies.${COLUMNS.academies.key}
                                `;
      const condition = ` WHERE message.${COLUMNS.chatMessage.column.roomId} = '${roomId}'
                                  AND message.${COLUMNS.chatMessage.column.timeId} <= ${timeId}`;
      const order = paging
        ? ` ORDER BY message.${
            COLUMNS.chatMessage.column.timeId
          } DESC LIMIT ${size} OFFSET ${(page ? page - 1 : 0) * size}`
        : `ORDER BY message.${COLUMNS.chatMessage.column.timeId} DESC`;

      return await SqlLite.customSql(selectSql + condition + order);
    } catch (error) {
      console.log('selectChatMessageList error');
      return Promise.reject(error);
    }
  },
  selectParticipantList: async roomId => {
    try {
      // [academy]
      const selectSql = `SELECT *, participant.${COLUMNS.chatParticipant.column.academyIdx} FROM ${TABLES.chatParticipant} AS participant
                                JOIN ${TABLES.chatRoom} AS room ON room.${COLUMNS.chatRoom.key} = participant.${COLUMNS.chatParticipant.column.roomId}
                                LEFT JOIN ${TABLES.academies} AS academies ON participant.${COLUMNS.chatParticipant.column.academyIdx} = academies.${COLUMNS.academies.key}
                                `;
      const condition = ` WHERE participant.${COLUMNS.chatParticipant.column.roomId} = '${roomId}'`;

      return await SqlLite.customSql(selectSql + condition);
    } catch (error) {
      console.log('selectParticipantList error');
      return Promise.reject(error);
    }
  },
  selectChatRoomById: async chatRoomId => {
    try {
      return await SqlLite.selectByIdx(
        TABLES.chatRoom,
        COLUMNS.chatRoom.key,
        `${chatRoomId}`,
      );
    } catch (error) {
      console.log('selectChatRoomById error');
      return Promise.reject(error);
    }
  },
  selectChatMessageByIdx: async msgIdx => {
    try {
      return await SqlLite.selectByIdx(
        TABLES.chatMessage,
        COLUMNS.chatMessage.key,
        `${msgIdx}`,
      );
    } catch (error) {
      console.log('selectChatMessageByIdx error');
      return Promise.reject(error);
    }
  },
  selectAcademyByIdx: async academyIdx => {
    try {
      return await SqlLite.selectByIdx(
        TABLES.academies,
        COLUMNS.academies.key,
        `${academyIdx}`,
      );
    } catch (error) {
      console.log('selectAcademyByIdx error');
      return Promise.reject(error);
    }
  },
  selectMatchByIdx: async matchIdx => {
    try {
      return await SqlLite.selectByIdx(
        TABLES.matches,
        COLUMNS.matches.key,
        `${matchIdx}`,
      );
    } catch (error) {
      console.log('selectMatchByIdx error');
      return Promise.reject(error);
    }
  },
  selectMemberByIdx: async userIdx => {
    try {
      return await SqlLite.selectByIdx(
        TABLES.members,
        COLUMNS.members.key,
        `${userIdx}`,
      );
    } catch (error) {
      console.log('selectMemberByIdx error');
      return Promise.reject(error);
    }
  },
  selectParticipantByRoomIdAndUserTypeAndUserIdx: async ({
    roomId,
    userType,
    userIdx,
  }) => {
    try {
      const selectSql = `SELECT * FROM ${TABLES.chatParticipant} AS participant JOIN ${TABLES.chatRoom} AS room ON room.${COLUMNS.chatRoom.key} = participant.${COLUMNS.chatParticipant.column.roomId}`;
      const condition = ` WHERE participant.${COLUMNS.chatParticipant.column.roomId} = '${roomId}' AND participant.${COLUMNS.chatParticipant.column.userType} = '${userType}' AND participant.${COLUMNS.chatParticipant.column.userIdx} = ${userIdx}`;
      const result = await SqlLite.customSql(selectSql + condition);
      return result[0];
    } catch (error) {
      console.log('selectParticipantByRoomIdAndUserTypeAndUserIdx error');
      handleError(error);
    }
    return null;
  },
  selectNotReadCnt: async ({ roomId, userType, userIdx }) => {
    try {
      const participant =
        await chatMapper.selectParticipantByRoomIdAndUserTypeAndUserIdx({
          roomId,
          userType,
          userIdx,
        });
      const { readTimeId } = participant;
      const selectSql = `SELECT COUNT(*) FROM ${TABLES.chatMessage} AS message`;
      const condition = ` WHERE message.${COLUMNS.chatMessage.column.timeId} > ${readTimeId} AND message.${COLUMNS.chatMessage.column.msgType} = '${MESSAGE_TYPE.CHAT}' AND message.${COLUMNS.chatMessage.column.roomId} = '${roomId}'`;
      const result = await SqlLite.customSql(selectSql + condition);
      return result[0]['COUNT(*)'];
    } catch (error) {
      console.log('selectNotReadCnt error');
      return Promise.reject(error);
    }
  },
  selectParticipantByIdx: async participantIdx => {
    try {
      return await SqlLite.selectByIdx(
        TABLES.chatParticipant,
        COLUMNS.chatParticipant.key,
        `${participantIdx}`,
      );
    } catch (error) {
      console.log('selectParticipantByIdx error');
      return Promise.reject(error);
    }
  },
  // 만들려고 하는 방이 이미 있는 방인지 확인
  selectExistsRoomByParticipants: async (participantIdxAndTypeList = []) => {
    try {
      if (!participantIdxAndTypeList || participantIdxAndTypeList.length < 2) {
        throw new CustomException('participantIdxs is null or length < 2');
      }

      // 해당 조건에 대한 방이 이미 있는지 확인
      const sql = `WITH p1 AS (SELECT ${
        COLUMNS.chatParticipant.column.roomId
      }, count(*) as cnt FROM ${TABLES.chatParticipant} GROUP BY ${
        COLUMNS.chatParticipant.column.roomId
      }),
     p2 AS (SELECT ${
       COLUMNS.chatParticipant.column.roomId
     }, count(*) as cnt FROM ${
        TABLES.chatParticipant
      } WHERE (${participantIdxAndTypeList
        .map(
          v =>
            `(${COLUMNS.chatParticipant.column.userType} = '${v.userType}' and ${COLUMNS.chatParticipant.column.userIdx} = ${v.userIdx})`,
        )
        .join(' OR ')}) GROUP BY ${COLUMNS.chatParticipant.column.roomId})
      SELECT * FROM p1 JOIN p2 ON p1.${
        COLUMNS.chatParticipant.column.roomId
      } = p2.${
        COLUMNS.chatParticipant.column.roomId
      } WHERE p1.cnt = p2.cnt AND p1.cnt = ${participantIdxAndTypeList.length}
      `;
      const result = await SqlLite.customSql(sql);
      // 가장 최근에 사용한 룸 반환
      const roomIdList = result.map(v => v.roomId);
      const roomList = await chatMapper.selectChatRoomListByRoomIdList(
        roomIdList,
      );
      return roomList && roomList.length > 0 ? roomList[0] : null;
    } catch (error) {
      console.log('selectExistsRoomByParticipants error');
      return Promise.reject(error);
    }
  },
  countChatMessageByRoomId: async roomId => {
    try {
      return await SqlLite.count(
        TABLES.chatMessage,
        `${COLUMNS.chatMessage.column.roomId} = ?`,
        [roomId],
      );
    } catch (error) {
      console.log('countChatMessageByRoomId error');
      return Promise.reject(error);
    }
  },
  insertChatRoom: async ({
    roomId = '',
    roomType = '',
    createUserType = '',
    createUserIdx = '',
    lastChat = '',
    memberCnt = '',
    targetAcademyIdx,
    matchIdx,
    targetUserIdx,
  }) => {
    try {
      const id = await SqlLite.insertOne(
        TABLES.chatRoom,
        `${COLUMNS.chatRoom.key},${COLUMNS.chatRoom.columns}`,
        [
          `${roomId}`,
          `${roomType}`,
          `${createUserType}`,
          `${createUserIdx}`,
          `${lastChat}`,
          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          null,
          `${memberCnt}`,
          `${targetAcademyIdx}`,
          `${matchIdx}`,
          `${targetUserIdx}`,
        ],
        true,
      );
      return await SqlLite.selectByIdx(
        TABLES.chatRoom,
        COLUMNS.chatRoom.key,
        `${roomId}`,
      );
    } catch (error) {
      console.log('insertChatRoom error');
      return Promise.reject(error);
    }
  },
  insertChatMessage: async ({
    roomId = '',
    sendUserIdx = '',
    sendUserNm = '',
    sendUserType = '',
    msg = '',
    msgType = '',
    timeId = '',
    sendUserAcademyIdx, // [[academy]]
  }) => {
    try {
      const id = await SqlLite.insertOne(
        TABLES.chatMessage,
        COLUMNS.chatMessage.columns,
        [
          `${roomId}`,
          `${sendUserIdx}`,
          `${sendUserNm}`,
          `${sendUserType}`,
          `${msg}`,
          `${msgType}`,
          `${timeId}`,
          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          `${sendUserAcademyIdx}`,
        ],
        true,
      );
      return await SqlLite.selectByIdx(
        TABLES.chatMessage,
        COLUMNS.chatMessage.key,
        `${id}`,
      );
    } catch (error) {
      console.log('insertChatMessage error');
      return Promise.reject(error);
    }
  },
  insertParticipant: async ({
    roomId = '',
    roomNm = '',
    userIdx = '',
    userType = '',
    userNm = '',
    topic = '',
    fstMsgTimeId = 0,
    readTimeId = '',
    notReadChatCnt = '',
  }) => {
    try {
      const id = await SqlLite.insertOne(
        TABLES.chatParticipant,
        COLUMNS.chatParticipant.columns,
        [
          `${roomId}`,
          `${roomNm}`,
          `${userIdx}`,
          `${userType}`,
          `${userNm}`,
          `${topic}`,
          `${fstMsgTimeId}`,
          `${readTimeId}`,
          `${notReadChatCnt}`,
          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        ],
        true,
      );
      return await SqlLite.selectByIdx(
        TABLES.chatParticipant,
        COLUMNS.chatParticipant.key,
        `${id}`,
      );
    } catch (error) {
      console.log('insertParticipant error');
      return Promise.reject(error);
    }
  },
  insertChatRoomList: async (valueList = []) => {
    /*
    {
    roomId = '',
    roomType = '',
    createUserType = '',
    createUserIdx = '',
    lastChat = '',
    memberCnt = '',
    }
     */
    try {
      if (!valueList && valueList.length === 0) return Promise.reject();
      return await SqlLite.insertAll(
        TABLES.chatRoom,
        `${COLUMNS.chatRoom.key},${COLUMNS.chatRoom.columns}`,
        valueList,
      );
    } catch (error) {
      console.log('insertChatRoomList error');
      return Promise.reject(error);
    }
  },
  insertParticipantList: async (valueList = []) => {
    /*
    {
      roomId = '',
      roomNm = '',
      userIdx = '',
      userType = '',
      topic = '',
      fstMsgTimeId = 0,
      readTimeId = '',
      notReadChatCnt = '',
    },
     */
    try {
      if (!valueList && valueList.length === 0) return Promise.reject();
      return await SqlLite.insertAll(
        TABLES.chatParticipant,
        COLUMNS.chatParticipant.columns,
        valueList,
      );
    } catch (error) {
      console.log('insertParticipantList error');
      return Promise.reject(error);
    }
  },
  insertChatMessageList: async (valueList = []) => {
    /*
    {
    roomId = '',
    sendUserIdx = '',
    sendUserNm = '',
    sendUserType = '',
    msg = '',
    msgType = '',
    timeId = '',
  }
     */
    try {
      if (!valueList && valueList.length === 0) return Promise.reject();
      return await SqlLite.insertAll(
        TABLES.chatMessage,
        COLUMNS.chatMessage.columns,
        valueList,
      );
    } catch (error) {
      console.log('insertChatMessageList error');
      return Promise.reject(error);
    }
  },
  insertAcademyList: async (valueList = []) => {
    try {
      if (!valueList && valueList.length === 0) return Promise.reject();
      return await SqlLite.insertAll(
        TABLES.academies,
        `${COLUMNS.academies.key},${COLUMNS.academies.columns}`,
        valueList,
      );
    } catch (error) {
      console.log('insertAcademyList error');
      return Promise.reject(error);
    }
  },
  insertMatchList: async (valueList = []) => {
    try {
      if (!valueList && valueList.length === 0) return Promise.reject();
      return await SqlLite.insertAll(
        TABLES.matches,
        `${COLUMNS.matches.key},${COLUMNS.matches.columns}`,
        valueList,
      );
    } catch (error) {
      console.log('insertMatchList error');
      return Promise.reject(error);
    }
  },
  insertMemberList: async (valueList = []) => {
    try {
      if (!valueList && valueList.length === 0) return Promise.reject();
      return await SqlLite.insertAll(
        TABLES.members,
        `${COLUMNS.members.key},${COLUMNS.members.columns}`,
        valueList,
      );
    } catch (error) {
      console.log('insertMemberList error');
      return Promise.reject(error);
    }
  },
  updateRoomForLastChat: async (chatRoomId, lastChat) => {
    try {
      const updateDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      await SqlLite.update(
        TABLES.chatRoom,
        `${COLUMNS.chatRoom.column.lastChat},${COLUMNS.chatRoom.column.updDate}`,
        [`${lastChat}`, updateDate],
        `${COLUMNS.chatRoom.key} = ?`,
        [`${chatRoomId}`],
      );
      return true;
    } catch (error) {
      console.log('updateRoomForLastChat error');
      return Promise.reject(error);
    }
  },
  updateRoomForMemberCnt: async chatRoomId => {
    try {
      const participants = await chatMapper.selectParticipantList(chatRoomId);
      await SqlLite.update(
        TABLES.chatRoom,
        COLUMNS.chatRoom.column.memberCnt,
        [`${participants.length}`],
        `${COLUMNS.chatRoom.key} = ?`,
        [`${chatRoomId}`],
      );
      return true;
    } catch (error) {
      console.log('updateRoomForMemberCnt error');
      return Promise.reject(error);
    }
  },
  updateParticipantForReadTimeId: async ({
    roomId,
    userType,
    userIdx,
    readTimeId,
  }) => {
    try {
      return await SqlLite.update(
        TABLES.chatParticipant,
        COLUMNS.chatParticipant.column.readTimeId,
        [`${readTimeId}`],
        `${COLUMNS.chatParticipant.column.roomId} = ? AND ${COLUMNS.chatParticipant.column.userType} = ? AND ${COLUMNS.chatParticipant.column.userIdx} = ?`,
        [`${roomId}`, `${userType}`, `${userIdx}`],
      );
    } catch (error) {
      console.log('updateParticipantForReadTimeId error');
      return Promise.reject(error);
    }
  },
  updateParticipantForNotReadChatCnt: async ({ roomId, userType, userIdx }) => {
    try {
      const notReadCnt = await chatMapper.selectNotReadCnt({
        roomId,
        userType,
        userIdx,
      });
      return await SqlLite.update(
        TABLES.chatParticipant,
        `${COLUMNS.chatParticipant.column.notReadChatCnt}`,
        [`${notReadCnt}`],
        `${COLUMNS.chatParticipant.column.roomId} = ? AND ${COLUMNS.chatParticipant.column.userType} = ? AND ${COLUMNS.chatParticipant.column.userIdx} = ?`,
        [`${roomId}`, `${userType}`, `${userIdx}`],
      );
    } catch (error) {
      console.log('updateParticipantForNotReadChatCnt error');
      return Promise.reject(error);
    }
  },
  updateRoomNm: async ({ roomId, userType, userIdx, roomNm }) => {
    try {
      return await SqlLite.update(
        TABLES.chatParticipant,
        `${COLUMNS.chatParticipant.column.roomNm}`,
        [`${roomNm}`],
        `${COLUMNS.chatParticipant.column.roomId} = ? AND ${COLUMNS.chatParticipant.column.userType} = ? AND ${COLUMNS.chatParticipant.column.userIdx} = ?`,
        [`${roomId}`, `${userType}`, `${userIdx}`],
      );
    } catch (error) {
      console.log('updateRoomNm error');
      return Promise.reject(error);
    }
  },
  updateNotiYn: async ({ roomId, userType, userIdx, notiYn }) => {
    try {
      return await SqlLite.update(
        TABLES.chatParticipant,
        `${COLUMNS.chatParticipant.column.notiYn}`,
        [`${notiYn}`],
        `${COLUMNS.chatParticipant.column.roomId} = ? AND ${COLUMNS.chatParticipant.column.userType} = ? AND ${COLUMNS.chatParticipant.column.userIdx} = ?`,
        [`${roomId}`, `${userType}`, `${userIdx}`],
      );
    } catch (error) {
      console.log('updateNotiYn error');
      return Promise.reject(error);
    }
  },
  updateAcademyList: async valueList => {
    try {
      const conditionList = [];
      const conditionvalueList = [];
      valueList.forEach(v => {
        conditionList.push(`${COLUMNS.academies.key} = ?`);
        conditionvalueList.push([`${v[COLUMNS.academies.key]}`]);
      });
      return await SqlLite.updateALl(
        TABLES.academies,
        `${COLUMNS.academies.columns}`,
        valueList,
        conditionList,
        conditionvalueList,
      );
    } catch (error) {
      console.log('updateAcademies error');
      return Promise.reject(error);
    }
  },
  updateMatchList: async valueList => {
    try {
      const conditionList = [];
      const conditionvalueList = [];
      valueList.forEach(v => {
        conditionList.push(`${COLUMNS.matches.key} = ?`);
        conditionvalueList.push([`${v[COLUMNS.matches.key]}`]);
      });
      return await SqlLite.updateALl(
        TABLES.matches,
        `${COLUMNS.matches.columns}`,
        valueList,
        conditionList,
        conditionvalueList,
      );
    } catch (error) {
      console.log('updateMatches error');
      return Promise.reject(error);
    }
  },
  updateMemberList: async valueList => {
    try {
      const conditionList = [];
      const conditionvalueList = [];
      valueList.forEach(v => {
        conditionList.push(`${COLUMNS.members.key} = ?`);
        conditionvalueList.push([`${v[COLUMNS.members.key]}`]);
      });
      return await SqlLite.updateALl(
        TABLES.members,
        `${COLUMNS.members.columns}`,
        valueList,
        conditionList,
        conditionvalueList,
      );
    } catch (error) {
      console.log('updateMembers error');
      return Promise.reject(error);
    }
  },
  // 채팅방 나가기
  deleteChatRoom: async chatRoomId => {
    return SqlLite.delete(TABLES.chatRoom, `${COLUMNS.chatRoom.key} = ?`, [
      `${chatRoomId}`,
    ]);
  },
  deleteParticipant: async chatRoomId => {
    return SqlLite.delete(
      TABLES.chatParticipant,
      `${COLUMNS.chatParticipant.column.roomId} = ?`,
      [`${chatRoomId}`],
    );
  },
  deleteParticipantByUserTypeAndUserIdx: async (
    chatRoomId,
    userType,
    userIdx,
  ) => {
    return SqlLite.delete(
      TABLES.chatParticipant,
      `${COLUMNS.chatParticipant.column.roomId} = ? AND ${COLUMNS.chatParticipant.column.userType} = ? AND ${COLUMNS.chatParticipant.column.userIdx} = ?`,
      [`${chatRoomId}`, `${userType}`, `${userIdx}`],
    );
  },
  deleteMessage: async chatRoomId => {
    return SqlLite.delete(
      TABLES.chatMessage,
      `${COLUMNS.chatMessage.column.roomId} = ?`,
      [`${chatRoomId}`],
    );
  },
  dropChatRoom: async () => {
    return SqlLite.dropTable(TABLES.chatRoom);
  },
  dropChatMessage: async () => {
    return SqlLite.dropTable(TABLES.chatMessage);
  },
  dropParticipant: async () => {
    return SqlLite.dropTable(TABLES.chatParticipant);
  },
};

export default chatMapper;
