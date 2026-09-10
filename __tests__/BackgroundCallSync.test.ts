import {PermissionsAndroid} from 'react-native';
import {persistor, store} from '../src/redux/store';
import {syncCallLogsOnce} from '../src/utils/CallSyncService';
import {syncDisconnectedCallLogs} from '../src/utils/BackgroundCallSync';

jest.mock('../src/redux/store', () => ({
  persistor: {getState: jest.fn(), subscribe: jest.fn()},
  store: {getState: jest.fn()},
}));
jest.mock('../src/utils/CallSyncService', () => ({
  syncCallLogsOnce: jest.fn(),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  (persistor.getState as jest.Mock).mockReturnValue({bootstrapped: true});
  (store.getState as jest.Mock).mockReturnValue({
    user: {userInfo: {AgentId: 123}},
  });
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
});
afterEach(() => jest.useRealTimers());

test('syncs with the saved user and checks again for delayed call logs', async () => {
  const task = syncDisconnectedCallLogs();
  await jest.runAllTimersAsync();
  await task;
  expect(syncCallLogsOnce).toHaveBeenCalledTimes(3);
  expect(syncCallLogsOnce).toHaveBeenCalledWith(123);
});

test('does not upload when logged out or request permission in the background', async () => {
  (store.getState as jest.Mock).mockReturnValue({user: {userInfo: null}});
  const task = syncDisconnectedCallLogs();
  await jest.runAllTimersAsync();
  await task;
  expect(syncCallLogsOnce).not.toHaveBeenCalled();
  (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
  await syncDisconnectedCallLogs();
  expect(syncCallLogsOnce).not.toHaveBeenCalled();
});

test('waits for persistence before reading the user on a cold launch', async () => {
  (persistor.getState as jest.Mock).mockReturnValue({bootstrapped: false});
  const unsubscribe = jest.fn();
  (persistor.subscribe as jest.Mock).mockReturnValue(unsubscribe);
  const task = syncDisconnectedCallLogs();
  expect(store.getState).not.toHaveBeenCalled();
  (persistor.getState as jest.Mock).mockReturnValue({bootstrapped: true});
  (persistor.subscribe as jest.Mock).mock.calls[0][0]();
  await jest.runAllTimersAsync();
  await task;
  expect(unsubscribe).toHaveBeenCalled();
  expect(syncCallLogsOnce).toHaveBeenCalledWith(123);
});
