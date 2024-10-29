import { store } from '../../redux/store';
import notificationMapper from './NotificationMapper';

const notificationUtils = {
  receivedNotification: async message => {
    try {
      const authState = store.getState().auth;
      const { userIdx } = authState;
      const title = message?.data?.title;
      const contents = message.data?.body;
      const type = message?.data?.type;
      const icon = message?.data?.icon;
      const linkUrl = message?.data?.linkUrl;
      await notificationMapper.insertNotification({
        userIdx,
        title,
        contents,
        icon,
        type,
        linkUrl,
        isRead: 'N',
      });
    } catch (error) {
      console.log('notification.receivedNotification error', error);
    }
  },
  read: async () => {
    try {
      const authState = store.getState().auth;
      const { userIdx } = authState;
      await notificationMapper.updateNotificationRead(userIdx);
    } catch (error) {
      console.log('notification.read error', error);
    }
  },
  getList: async ({ paging, page, size }) => {
    try {
      const authState = store.getState().auth;
      const { userIdx } = authState;
      return notificationMapper.selectNotificationList({
        userIdx,
        paging: true,
        page,
        size,
      });
    } catch (error) {
      console.log('notification.getList error', error);
    }
  },
  getNotReadCnt: async () => {
    try {
      const authState = store.getState().auth;
      const { userIdx } = authState;
      return notificationMapper.selectNotReadCnt(userIdx);
    } catch (error) {
      console.log('notification.getNotReadCnt error', error);
    }
  },
};
export default notificationUtils;
