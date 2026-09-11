import axios from 'axios';
import {getDeviceSimOptions} from '../src/utils/DeviceSimOptions';
import {
  syncEmployeeMobiles,
  fetchEmployeeMobiles,
} from '../src/utils/EmployeeMobileService';
jest.mock('axios', () => ({post: jest.fn()}));
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn().mockResolvedValue('device-A'),
}));
jest.mock('../src/redux/store', () => ({
  store: {getState: () => ({user: {userInfo: {token: 'test'}}})},
}));
jest.mock('../src/utils/DeviceSimOptions', () => ({
  getDeviceSimOptions: jest.fn(),
}));
const row = {
  Id: 10,
  EmployeeId: 7,
  DeviceId: 'device-A',
  SimSlot: 1,
  MobileNumber: '111',
  CarrierName: 'A',
  IsActive: true,
};
beforeEach(() => jest.clearAllMocks());
test('updates an existing SIM, adds the second, then fetches saved rows', async () => {
  (getDeviceSimOptions as jest.Mock).mockResolvedValue([
    {simSlot: 1, phoneNumber: '222', carrierName: 'A'},
    {simSlot: 2, phoneNumber: '333', carrierName: 'B'},
  ]);
  (axios.post as jest.Mock)
    .mockResolvedValueOnce({data: {isSuccess: true, data: [row]}})
    .mockResolvedValueOnce({data: [{Id: 10, Status: 'UPDATED'}]})
    .mockResolvedValueOnce({data: [{Id: 11, Status: 'INSERTED'}]})
    .mockResolvedValueOnce({data: [row]});
  await syncEmployeeMobiles(7);
  const payloads = (axios.post as jest.Mock).mock.calls.map(call => call[1]);
  expect(payloads.map(p => p.type)).toEqual([3, 2, 1, 3]);
  expect(payloads[0]).toMatchObject({type: 3, id: null, employeeId: 7});
  expect(payloads[1]).toMatchObject({
    id: 10,
    mobileNumber: '222',
    deviceId: 'device-A',
  });
  expect(payloads[2]).toMatchObject({employeeId: 7, simSlot: 2});
});
test('preserves a saved number when Android cannot detect it', async () => {
  (getDeviceSimOptions as jest.Mock).mockResolvedValue([
    {simSlot: 1, phoneNumber: '', carrierName: 'A'},
  ]);
  (axios.post as jest.Mock).mockResolvedValue({data: [row]});
  await syncEmployeeMobiles(7);
  expect(
    (axios.post as jest.Mock).mock.calls.map(call => call[1].type),
  ).toEqual([3, 3]);
});
test('treats SQL ERROR rows as failures even with HTTP 200', async () => {
  (axios.post as jest.Mock).mockResolvedValue({
    data: [{Status: 'ERROR', Message: 'Database failure'}],
  });
  await expect(fetchEmployeeMobiles(7)).rejects.toThrow('Database failure');
});

test('includes controller-required fields in read-only fetch', async () => {
  (axios.post as jest.Mock).mockResolvedValue({
    data: {isSuccess: true, data: []},
  });
  await fetchEmployeeMobiles(7);
  expect((axios.post as jest.Mock).mock.calls[0][1]).toMatchObject({
    type: 3,
    id: null,
    deviceId: 'not-applicable',
    mobileNumber: 'not-applicable',
    carrierName: 'not-applicable',
  });
});

test('does not insert a fabricated number when SIM number is unavailable', async () => {
  (getDeviceSimOptions as jest.Mock).mockResolvedValue([
    {simSlot: 1, phoneNumber: '', carrierName: ''},
  ]);
  (axios.post as jest.Mock).mockResolvedValue({data: []});
  await expect(syncEmployeeMobiles(7)).rejects.toThrow(
    'SIM numbers are unavailable',
  );
  expect(
    (axios.post as jest.Mock).mock.calls.map(call => call[1].type),
  ).toEqual([3]);
});
