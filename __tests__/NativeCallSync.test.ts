import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules, Platform} from 'react-native';
import {
  configureNativeCallSync,
  syncCallLogsOnce,
} from '../src/utils/CallSyncService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue('123456'),
}));
beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'android';
  NativeModules.CallDetector = {
    configureCallSync: jest.fn().mockResolvedValue(null),
    syncCallLogs: jest.fn().mockResolvedValue(2),
  };
});

test('migrates the existing watermark and sends uploads through Kotlin', async () => {
  await syncCallLogsOnce(123);
  expect(AsyncStorage.getItem).toHaveBeenCalledWith('LAST_CALL_SYNC');
  expect(NativeModules.CallDetector.configureCallSync).toHaveBeenCalledWith(
    '123',
    123456,
  );
  expect(NativeModules.CallDetector.syncCallLogs).toHaveBeenCalledTimes(1);
});

test('clears the native login on logout', async () => {
  await configureNativeCallSync(0);
  expect(NativeModules.CallDetector.configureCallSync).toHaveBeenCalledWith(
    '',
    123456,
  );
});

test('does not upload without a user', async () => {
  await syncCallLogsOnce();
  expect(NativeModules.CallDetector.syncCallLogs).not.toHaveBeenCalled();
});
