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
      await notificationMapper.insertNotification({
        userIdx,
        title,
        contents,
        icon,
        type,
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
};
export default notificationUtils;
