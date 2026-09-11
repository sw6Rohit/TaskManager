import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import {store} from '../redux/store';
import {getDeviceSimOptions, SimOption} from './DeviceSimOptions';

const URL =
  'https://studentapinew.university99.com/api/CallMonitoring/employee-mobile';
type MobileRecord = {
  id: number;
  employeeId: number;
  deviceId: string;
  simSlot: number;
  mobileNumber: string;
  carrierName: string;
  isActive: boolean;
};

const request = async (payload: object): Promise<any[]> => {
  const token = store.getState().user.userInfo?.token;
  const {data} = await axios.post(URL, payload, {
    timeout: 20000,
    headers: token ? {Authorization: `Bearer ${token}`} : {},
  });
  if (data?.isSuccess === false) {
    throw new Error(data.message || 'Employee mobile request failed');
  }
  const result = data?.data ?? data;
  const rows = Array.isArray(result)
    ? result
    : result && typeof result === 'object'
    ? [result]
    : null;
  if (!rows) {
    throw new Error('Unexpected employee-mobile response');
  }
  for (const row of rows) {
    const status = String(row.Status ?? row.status ?? '').toUpperCase();
    if (status === 'ERROR' || status === 'INVALID TYPE') {
      throw new Error(row.Message || row.message || status);
    }
  }
  return rows;
};

export const fetchEmployeeMobiles = async (
  employeeId: number,
): Promise<MobileRecord[]> => {
  if (!employeeId) {
    throw new Error('Employee is required');
  }
  // NULL means no ID filter in usp_EmpMobNumbers. Zero would return no records.
  // The controller requires these strings even for GET; the procedure ignores
  // them for type 3. These placeholders are never sent in an insert/update.
  const rows = await request({
    type: 3,
    id: null,
    employeeId,
    deviceId: 'not-applicable',
    mobileNumber: 'not-applicable',
    carrierName: 'not-applicable',
    simSlot: 1,
    isActive: true,
  });
  if (
    rows.some(
      row =>
        !Number(row.Id ?? row.id) || !Number(row.EmployeeId ?? row.employeeId),
    )
  ) {
    throw new Error('Unexpected employee-mobile record format');
  }
  return rows
    .map(row => ({
      id: Number(row.Id ?? row.id),
      employeeId: Number(row.EmployeeId ?? row.employeeId),
      deviceId: String(row.DeviceId ?? row.deviceId ?? ''),
      simSlot: Number(row.SimSlot ?? row.simSlot),
      mobileNumber: String(row.MobileNumber ?? row.mobileNumber ?? ''),
      carrierName: String(row.CarrierName ?? row.carrierName ?? ''),
      isActive: [true, 1, '1', 'true'].includes(row.IsActive ?? row.isActive),
    }))
    .filter(row => row.employeeId === employeeId && row.id > 0);
};

// Shared promise prevents duplicate inserts if the screen mounts twice.
const pending = new Map<number, Promise<MobileRecord[]>>();
export const syncEmployeeMobiles = (
  employeeId: number,
): Promise<MobileRecord[]> => {
  const existingTask = pending.get(employeeId);
  if (existingTask) {
    return existingTask;
  }
  const task = (async () => {
    const sims = await getDeviceSimOptions();
    if (!sims.length)
      throw new Error('No active SIMs detected. Check Phone permission.');
    const deviceId = await DeviceInfo.getUniqueId();
    let unavailable = 0;
    const records = await fetchEmployeeMobiles(employeeId);
    for (const sim of sims) {
      const existing =
        records.find(
          row =>
            row.deviceId === deviceId &&
            row.simSlot === sim.simSlot &&
            row.isActive,
        ) ||
        records.find(
          row => row.deviceId === deviceId && row.simSlot === sim.simSlot,
        );
      // Do not erase a saved number when the carrier no longer exposes it.
      const mobileNumber = sim.phoneNumber || existing?.mobileNumber || null;
      const carrierName = sim.carrierName || existing?.carrierName || 'Unknown';
      if (!mobileNumber) {
        unavailable++;
        continue;
      }
      if (
        existing?.isActive &&
        existing.mobileNumber === (mobileNumber || '') &&
        existing.carrierName === (carrierName || '')
      ) {
        continue;
      }
      await request({
        type: existing ? 2 : 1,
        id: existing?.id ?? null,
        employeeId,
        deviceId,
        simSlot: sim.simSlot,
        mobileNumber,
        carrierName,
        isActive: true,
      });
    }
    if (unavailable)
      throw new Error(
        'One or more SIM numbers are unavailable. Allow Phone number permission; if the carrier does not expose the number, enter it through the employee record.',
      );
    return fetchEmployeeMobiles(employeeId);
  })().finally(() => pending.delete(employeeId));
  pending.set(employeeId, task);
  return task;
};

export const employeeMobileOptions = (records: MobileRecord[]): SimOption[] =>
  records
    .filter(row => row.isActive)
    .map(row => ({
      label: `SIM ${row.simSlot} · ${row.mobileNumber || 'Number unavailable'}${
        row.carrierName ? ` (${row.carrierName})` : ''
      }`,
      value: String(row.id),
      phoneNumber: row.mobileNumber,
      simSlot: row.simSlot,
      carrierName: row.carrierName,
    }));
