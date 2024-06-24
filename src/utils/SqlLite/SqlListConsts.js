/** ==========================================================================
 * tables
 ========================================================================== */
const TABLES = {
  chatRoom: 'chatRoom',
  chatMessage: 'chatMessage',
  chatParticipant: 'chatParticipant',
  academies: 'academies',
  matches: 'matches',
  members: 'members',
  notification: 'notification',
};

/** ==========================================================================
 * columns
 ========================================================================== */
const COLUMNS = {
  chatRoom: {
    // columns : key 제외
    columns:
      'roomType, createUserType, createUserIdx, lastChat, regDate, updDate, memberCnt, targetAcademyIdx, matchIdx, targetUserIdx',
    column: {
      roomId: 'roomId',
      roomType: 'roomType', // GROUP, DIRECT
      createUserType: 'createUserType',
      createUserIdx: 'createUserIdx',
      lastChat: 'lastChat',
      regDate: 'regDate',
      updDate: 'updDate',
      memberCnt: 'memberCnt',
      targetAcademyIdx: 'targetAcademyIdx', // [[academyIdx]]
      matchIdx: 'matchIdx',
      targetUserIdx: 'targetUserIdx',
    },
    key: 'roomId',
  },
  chatMessage: {
    columns:
      'roomId, sendUserIdx, sendUserNm, sendUserType, msg, msgType, timeId, regDate, sendUserAcademyIdx',
    // msgType : CREATE_GROUP, INVITE, LEAVE, CHAT, READ
    column: {
      msgIdx: 'msgIdx',
      roomId: 'roomId',
      sendUserIdx: 'sendUserIdx',
      sendUserNm: 'sendUserNm',
      sendUserType: 'sendUserType',
      msg: 'msg',
      msgType: 'msgType',
      timeId: 'timeId',
      regDate: 'regDate',
      sendUserAcademyIdx: 'sendUserAcademyIdx', // [[academy]]
    },
    key: 'msgIdx',
  },
  chatParticipant: {
    columns:
      'roomId, roomNm, userIdx, userType, userNm, topic, fstMsgTimeId, readTimeId, notReadChatCnt, notiYn, regDate, updDate, academyIdx',
    column: {
      participantIdx: 'participantIdx',
      roomId: 'roomId',
      roomNm: 'roomNm',
      userIdx: 'userIdx',
      userType: 'userType',
      userNm: 'userNm',
      topic: 'topic',
      fstMsgTimeId: 'fstMsgTimeId',
      readTimeId: 'readTimeId',
      notReadChatCnt: 'notReadChatCnt', // 내가 읽지 않은 메시지 수
      notiYn: 'notiYn',
      regDate: 'regDate',
      updDate: 'updDate',
      academyIdx: 'academyIdx', // [[academy]]
    },
    key: 'participantIdx',
  },
  academies: {
    columns:
      'admIdx, academyName, description, addrCity, addrGu, addrDong, addressFull, latitude, longitude, rating, logoPath, logoName, phoneNo, workTime, certYn, openMatchPublicYn, autoApprovalYn, businessNo, openDate, ceoName, homepageUrl, instagramUrl, memo, delDate',
    column: {
      academyIdx: 'academyIdx',
      admIdx: 'admIdx',
      academyName: 'academyName',
      description: 'description',
      addrCity: 'addrCity',
      addrGu: 'addrGu',
      addrDong: 'addrDong',
      addressFull: 'addressFull',
      latitude: 'latitude',
      longitude: 'longitude',
      rating: 'rating',
      logoPath: 'logoPath',
      logoName: 'logoName',
      phoneNo: 'phoneNo',
      workTime: 'workTime',
      certYn: 'certYn',
      openMatchPublicYn: 'openMatchPublicYn',
      autoApprovalYn: 'autoApprovalYn',
      businessNo: 'businessNo',
      openDate: 'openDate',
      ceoName: 'ceoName',
      homepageUrl: 'homepageUrl',
      instagramUrl: 'instagramUrl',
      memo: 'memo',
      delDate: 'delDate',
    },
    key: 'academyIdx',
  },
  matches: {
    columns:
      'homeAcademyIdx, awayAcademyIdx, tournamentIdx, addressFull, matchPlace, addrCity, addrGu, addrDong, latitude, longitude, mbIdx, matchState, matchMethod, matchClassCode, matchClassName, matchClassNameEn, title, genderCode, description, hostScore, participantScore, closeDate, cancelReason, matchDate, matchTime',
    column: {
      matchIdx: 'matchIdx',
      homeAcademyIdx: 'homeAcademyIdx',
      awayAcademyIdx: 'awayAcademyIdx',
      tournamentIdx: 'tournamentIdx',
      addressFull: 'addressFull',
      matchPlace: 'matchPlace',
      addrCity: 'addrCity',
      addrGu: 'addrGu',
      addrDong: 'addrDong',
      latitude: 'latitude',
      longitude: 'longitude',
      mbIdx: 'mbIdx',
      matchState: 'matchState',
      matchMethod: 'matchMethod',
      matchClassCode: 'matchClassCode',
      matchClassName: 'matchClassName',
      matchClassNameEn: 'matchClassNameEn',
      title: 'title',
      genderCode: 'genderCode',
      description: 'description',
      hostScore: 'hostScore',
      participantScore: 'participantScore',
      closeDate: 'closeDate',
      cancelReason: 'cancelReason',
      matchDate: 'matchDate',
      matchTime: 'matchTime',
    },
    key: 'matchIdx',
  },
  members: {
    columns: `userLoginId, loginType, userName, userNickName, userGender, userBirthday, userPhoneNo, userRegion, userSubRegion, userProfilePath, userProfileName, userReferralCode, referredUserIdx, useYn, regDate, updDate, delDate, marketingDate`,
    column: {
      userIdx: 'userIdx',
      userLoginId: 'userLoginId',
      loginType: 'loginType',
      userName: 'userName',
      userNickName: 'userNickName',
      userGender: 'userGender',
      userBirthday: 'userBirthday',
      userPhoneNo: 'userPhoneNo',
      userRegion: 'userRegion',
      userSubRegion: 'userSubRegion',
      userProfilePath: 'userProfilePath',
      userProfileName: 'userProfileName',
      userReferralCode: 'userReferralCode',
      referredUserIdx: 'referredUserIdx',
      useYn: 'useYn',
      regDate: 'regDate',
      updDate: 'updDate',
      delDate: 'delDate',
      marketingDate: 'marketingDate',
    },
    key: 'userIdx',
  },
  notification: {
    columns: `userIdx, title, contents, icon, regDate, updDate, type, isRead`,
    column: {
      notiIdx: 'notiIdx',
      userIdx: 'userIdx',
      title: 'title',
      contents: 'contents',
      icon: 'icon',
      regDate: 'regDate',
      updDate: 'updDate',
      type: 'type',
      isRead: 'isRead',
    },
    key: 'notiIdx',
  },
};

/** ==========================================================================
 * sql
 ========================================================================== */
const SQL = {
  chatRoom: {
    create: `CREATE TABLE IF NOT EXISTS ${TABLES.chatRoom}(
                  ${COLUMNS.chatRoom.key} TEXT PRIMARY KEY,
                  ${COLUMNS.chatRoom.column.roomType} TEXT,
                  ${COLUMNS.chatRoom.column.createUserType} TEXT,
                  ${COLUMNS.chatRoom.column.createUserIdx} INTEGER,
                  ${COLUMNS.chatRoom.column.lastChat} TEXT,
                  ${COLUMNS.chatRoom.column.regDate} TEXT,
                  ${COLUMNS.chatRoom.column.updDate} TEXT,
                  ${COLUMNS.chatRoom.column.memberCnt} INTEGER,
                  ${COLUMNS.chatRoom.column.targetAcademyIdx} INTEGER,
                  ${COLUMNS.chatRoom.column.matchIdx} INTEGER,
                  ${COLUMNS.chatRoom.column.targetUserIdx} INTEGER
             )`,
  },
  chatMessage: {
    create: `CREATE TABLE IF NOT EXISTS ${TABLES.chatMessage} (
                                                         ${COLUMNS.chatMessage.key} INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         ${COLUMNS.chatMessage.column.roomId} INTEGER,
                                                         ${COLUMNS.chatMessage.column.sendUserIdx} INTEGER,
                                                         ${COLUMNS.chatMessage.column.sendUserNm} TEXT,
                                                         ${COLUMNS.chatMessage.column.sendUserType} TEXT,
                                                         ${COLUMNS.chatMessage.column.msg} TEXT,
                                                         ${COLUMNS.chatMessage.column.msgType} TEXT,
                                                         ${COLUMNS.chatMessage.column.timeId} INTEGER,
                                                         ${COLUMNS.chatMessage.column.regDate} TEXT,
                                                         ${COLUMNS.chatMessage.column.sendUserAcademyIdx} INTEGER
            )`,
  },
  chatParticipant: {
    create: `CREATE TABLE IF NOT EXISTS ${TABLES.chatParticipant}(
                                                                 ${COLUMNS.chatParticipant.key} INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                 ${COLUMNS.chatParticipant.column.roomId} TEXT,
                                                                 ${COLUMNS.chatParticipant.column.roomNm} TEXT,
                                                                 ${COLUMNS.chatParticipant.column.userIdx} INTEGER,
                                                                 ${COLUMNS.chatParticipant.column.userType} TEXT,
                                                                 ${COLUMNS.chatParticipant.column.userNm} TEXT,
                                                                 ${COLUMNS.chatParticipant.column.topic} TEXT,
                                                                 ${COLUMNS.chatParticipant.column.fstMsgTimeId} INTEGER,
                                                                 ${COLUMNS.chatParticipant.column.readTimeId} INTEGER,
                                                                 ${COLUMNS.chatParticipant.column.notReadChatCnt} INTEGER,
                                                                 ${COLUMNS.chatParticipant.column.notiYn} TEXT,
                                                                 ${COLUMNS.chatParticipant.column.regDate} TEXT,
                                                                 ${COLUMNS.chatParticipant.column.updDate} TEXT,
                                                                 ${COLUMNS.chatParticipant.column.academyIdx} INTEGER
             )`,
  },
  academies: {
    create: `CREATE TABLE IF NOT EXISTS ${TABLES.academies}(
                                                               ${COLUMNS.academies.key} INTEGER PRIMARY KEY,
                                                               ${COLUMNS.academies.column.admIdx} INTEGER,
                                                               ${COLUMNS.academies.column.academyName} TEXT,
                                                               ${COLUMNS.academies.column.description} TEXT,
                                                               ${COLUMNS.academies.column.addrCity} TEXT,
                                                               ${COLUMNS.academies.column.addrGu} TEXT,
                                                               ${COLUMNS.academies.column.addrDong} TEXT,
                                                               ${COLUMNS.academies.column.addressFull} TEXT,
                                                               ${COLUMNS.academies.column.latitude} TEXT,
                                                               ${COLUMNS.academies.column.longitude} TEXT,
                                                               ${COLUMNS.academies.column.rating} FLOAT,
                                                               ${COLUMNS.academies.column.logoPath} TEXT,
                                                               ${COLUMNS.academies.column.logoName} TEXT,
                                                               ${COLUMNS.academies.column.phoneNo} TEXT,
                                                               ${COLUMNS.academies.column.workTime} TEXT,
                                                               ${COLUMNS.academies.column.certYn} TEXT,
                                                               ${COLUMNS.academies.column.openMatchPublicYn} TEXT,
                                                               ${COLUMNS.academies.column.autoApprovalYn} TEXT,
                                                               ${COLUMNS.academies.column.businessNo} TEXT,
                                                               ${COLUMNS.academies.column.openDate} TEXT,
                                                               ${COLUMNS.academies.column.ceoName} TEXT,
                                                               ${COLUMNS.academies.column.homepageUrl} TEXT,
                                                               ${COLUMNS.academies.column.instagramUrl} TEXT,
                                                               ${COLUMNS.academies.column.memo} TEXT,
                                                               ${COLUMNS.academies.column.delDate} TEXT
        
             )`,
  },
  matches: {
    create: `CREATE TABLE IF NOT EXISTS ${TABLES.matches}(
                                                               ${COLUMNS.matches.key} INTEGER PRIMARY KEY,
                                                               ${COLUMNS.matches.column.homeAcademyIdx} INTEGER,
                                                               ${COLUMNS.matches.column.awayAcademyIdx} INTEGER,
                                                               ${COLUMNS.matches.column.tournamentIdx} INTEGER,
                                                               ${COLUMNS.matches.column.addressFull} TEXT,
                                                               ${COLUMNS.matches.column.matchPlace} TEXT,
                                                               ${COLUMNS.matches.column.addrCity} TEXT,
                                                               ${COLUMNS.matches.column.addrGu} TEXT,
                                                               ${COLUMNS.matches.column.addrDong} TEXT,
                                                               ${COLUMNS.matches.column.latitude} TEXT,
                                                               ${COLUMNS.matches.column.longitude} TEXT,
                                                               ${COLUMNS.matches.column.mbIdx} TEXT,
                                                               ${COLUMNS.matches.column.matchState} TEXT,
                                                               ${COLUMNS.matches.column.matchMethod} INTEGER,
                                                               ${COLUMNS.matches.column.matchClassCode} TEXT,
                                                               ${COLUMNS.matches.column.matchClassName} TEXT,
                                                               ${COLUMNS.matches.column.matchClassNameEn} TEXT,
                                                               ${COLUMNS.matches.column.title} TEXT,
                                                               ${COLUMNS.matches.column.genderCode} TEXT,
                                                               ${COLUMNS.matches.column.description} TEXT,
                                                               ${COLUMNS.matches.column.hostScore} INTEGER,
                                                               ${COLUMNS.matches.column.participantScore} INTEGER,
                                                               ${COLUMNS.matches.column.closeDate} TEXT,
                                                               ${COLUMNS.matches.column.cancelReason} TEXT,
                                                               ${COLUMNS.matches.column.matchDate} TEXT,
                                                               ${COLUMNS.matches.column.matchTime} TEXT
        
             )`,
  },
  members: {
    create: `CREATE TABLE IF NOT EXISTS ${TABLES.members}(
                                                               ${COLUMNS.members.key} INTEGER PRIMARY KEY,
                                                               ${COLUMNS.members.column.userLoginId} INTEGER,
                                                               ${COLUMNS.members.column.loginType} TEXT,
                                                               ${COLUMNS.members.column.userName} TEXT,
                                                               ${COLUMNS.members.column.userNickName} TEXT,
                                                               ${COLUMNS.members.column.userGender} TEXT,
                                                               ${COLUMNS.members.column.userBirthday} TEXT,
                                                               ${COLUMNS.members.column.userPhoneNo} TEXT,
                                                               ${COLUMNS.members.column.userRegion} TEXT,
                                                               ${COLUMNS.members.column.userSubRegion} TEXT,
                                                               ${COLUMNS.members.column.userProfilePath} TEXT,
                                                               ${COLUMNS.members.column.userProfileName} TEXT,
                                                               ${COLUMNS.members.column.userReferralCode} TEXT,
                                                               ${COLUMNS.members.column.referredUserIdx} INTEGER,
                                                               ${COLUMNS.members.column.useYn} TEXT,
                                                               ${COLUMNS.members.column.regDate} TEXT,
                                                               ${COLUMNS.members.column.updDate} TEXT,
                                                               ${COLUMNS.members.column.delDate} TEXT,
                                                               ${COLUMNS.members.column.marketingDate} TEXT
        
             )`,
  },
  notification: {
    create: `CREATE TABLE IF NOT EXISTS ${TABLES.notification}(
                                                               ${COLUMNS.notification.key} INTEGER PRIMARY KEY AUTOINCREMENT,
                                                               ${COLUMNS.notification.column.userIdx} INTEGER,
                                                               ${COLUMNS.notification.column.title} TEXT,
                                                               ${COLUMNS.notification.column.contents} TEXT,
                                                               ${COLUMNS.notification.column.icon} TEXT,
                                                               ${COLUMNS.notification.column.regDate} TEXT,
                                                               ${COLUMNS.notification.column.updDate} TEXT,
                                                               ${COLUMNS.notification.column.type} TEXT,
                                                               ${COLUMNS.notification.column.isRead} TEXT
             )`,
  },
};
export { TABLES, COLUMNS, SQL };
