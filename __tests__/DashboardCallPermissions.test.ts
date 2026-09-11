import {PermissionsAndroid, Platform} from 'react-native';
import {requestDashboardCallPermissions} from '../src/utils/DashboardCallPermissions';

beforeEach(() => {
  Platform.OS = 'android';
  jest.spyOn(PermissionsAndroid, 'requestMultiple').mockResolvedValue({});
});
afterEach(() => jest.restoreAllMocks());
test('dashboard requests missing phone and SIM permissions together', async () => {
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
  await requestDashboardCallPermissions();
  expect(PermissionsAndroid.requestMultiple).toHaveBeenCalledWith([
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
  ]);
});
test('does not prompt when already granted', async () => {
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
  await requestDashboardCallPermissions();
  expect(PermissionsAndroid.requestMultiple).not.toHaveBeenCalled();
});
