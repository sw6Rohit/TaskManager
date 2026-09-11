import {PermissionsAndroid, Platform} from 'react-native';
import {requestCallMonitoringPermission} from '../src/utils/CallMonitoringPermission';

beforeEach(() => {
  Platform.OS = 'android';
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
  jest
    .spyOn(PermissionsAndroid, 'request')
    .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
});
afterEach(() => jest.restoreAllMocks());

test('requests phone-state permission needed by the disconnect receiver', async () => {
  expect(await requestCallMonitoringPermission()).toBe(true);
  expect(PermissionsAndroid.request).toHaveBeenCalledWith(
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    expect.any(Object),
  );
});

test('does not prompt again when phone permission is granted', async () => {
  (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
  expect(await requestCallMonitoringPermission()).toBe(true);
  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
});

test('reports denied permission', async () => {
  (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
    PermissionsAndroid.RESULTS.DENIED,
  );
  expect(await requestCallMonitoringPermission()).toBe(false);
});
