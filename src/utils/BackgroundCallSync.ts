import {PermissionsAndroid} from 'react-native';
import {persistor, store} from '../redux/store';
import {syncCallLogsOnce} from './CallSyncService';

export const syncDisconnectedCallLogs = async () => {
  // A cold background launch must wait for the saved login to be restored.
  if (!persistor.getState().bootstrapped) {
    await new Promise<void>(resolve => {
      const unsubscribe = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  if (
    !(await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    ))
  ) {
    return;
  }

  // Some dialers write their call-log entry after the IDLE broadcast.
  for (const delay of [2000, 5000, 10000]) {
    await new Promise<void>(resolve => setTimeout(resolve, delay));
    const user = store.getState().user.userInfo;
    const userId = user?.AgentId || user?.linkId;
    if (!userId) {
      return;
    }
    await syncCallLogsOnce(userId);
  }
};
