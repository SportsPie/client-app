import SqlLite from '../SqlLite/SqlLite';
import { COLUMNS, TABLES } from '../SqlLite/SqlListConsts';
import moment from 'moment/moment';

const notificationMapper = {
  selectNotificationList: async ({ userIdx, paging, page, size }) => {
    try {
      const selectSql = `SELECT notification.* FROM ${TABLES.notification} AS notification`;
      const condition = ` WHERE notification.${COLUMNS.notification.column.userIdx} = ${userIdx}`;
      const order = paging
        ? ` ORDER BY notification.${
            COLUMNS.notification.column.regDate
          } DESC LIMIT ${size} OFFSET ${(page ? page - 1 : 0) * size}`
        : `ORDER BY notification.${COLUMNS.notification.column.regDate} DESC`;
      return await SqlLite.customSql(selectSql + condition + order);
    } catch (error) {
      console.log('selectNotificationList error');
      return Promise.reject(error);
    }
  },
  selectNotReadCnt: async userIdx => {
    try {
      const selectSql = `SELECT COUNT(*) FROM ${TABLES.notification} AS notification`;
      const condition = ` WHERE notification.${COLUMNS.notification.column.isRead} != 'Y' AND notification.${COLUMNS.notification.column.userIdx} = ${userIdx}`;
      const result = await SqlLite.customSql(selectSql + condition);
      return result[0]['COUNT(*)'];
    } catch (error) {
      console.log('notification selectNotReadCnt error');
      return Promise.reject(error);
    }
  },
  insertNotification: async ({
    userIdx = '',
    title = '',
    contents = '',
    icon = '',
    type = '',
    linkUrl = '',
    isRead = 'N',
  }) => {
    try {
      const id = await SqlLite.insertOne(
        TABLES.notification,
        `${COLUMNS.notification.columns}`,
        [
          `${userIdx}`,
          `${title}`,
          `${contents}`,
          `${icon}`,
          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          null,
          `${type}`,
          `${linkUrl}`,
          `${isRead}`,
        ],
        true,
      );
      return await SqlLite.selectByIdx(
        TABLES.notification,
        COLUMNS.notification.key,
        `${id}`,
      );
    } catch (error) {
      console.log('insertNotification error');
      return Promise.reject(error);
    }
  },
  updateNotificationRead: async userIdx => {
    try {
      const updateDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      await SqlLite.update(
        TABLES.notification,
        `${COLUMNS.notification.column.updDate},${COLUMNS.notification.column.isRead}`,
        [updateDate, 'Y'],
        `${COLUMNS.notification.column.userIdx} = ? AND ${COLUMNS.notification.column.isRead} != 'Y'`,
        [`${userIdx}`],
      );
      return true;
    } catch (error) {
      console.log('updateNotificationRead error');
      return Promise.reject(error);
    }
  },
};
export default notificationMapper;
