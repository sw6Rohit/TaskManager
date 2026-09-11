import {NativeModules, PermissionsAndroid, Platform} from 'react-native';
import {getDeviceSimOptions} from '../src/utils/DeviceSimOptions';

beforeEach(() => {
  Platform.OS = 'android';
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
  NativeModules.SimModule = {
    getSimInfo: jest.fn().mockResolvedValue([
      {slotIndex: 1, phoneNumber: '', carrierName: 'Carrier B'},
      {slotIndex: 0, phoneNumber: '+911234567890', carrierName: 'Carrier A'},
    ]),
  };
});
afterEach(() => jest.restoreAllMocks());

test('orders SIM slots and includes a fallback when a number is unavailable', async () => {
  const options = await getDeviceSimOptions();
  expect(options.map(option => option.value)).toEqual(['1', '2']);
  expect(options[0].label).toContain('+911234567890');
  expect(options[1].label).toContain('Number unavailable');
  expect(options[1].label).toContain('Carrier B');
});

test('does not query subscriptions when phone permission is denied', async () => {
  (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
  jest
    .spyOn(PermissionsAndroid, 'request')
    .mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);
  await expect(getDeviceSimOptions()).rejects.toThrow('from the Dashboard');
  expect(NativeModules.SimModule.getSimInfo).not.toHaveBeenCalled();
  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
});
