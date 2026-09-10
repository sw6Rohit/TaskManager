// services/CallSyncService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import CallLogs from 'react-native-call-log';
import {api} from './api';

const LAST_SYNC_KEY = 'LAST_CALL_SYNC';

const mapCallType = (type: number) => {
  switch (type) {
    case 1:
      return 'INCOMING';
    case 2:
      return 'OUTGOING';
    case 3:
      return 'MISSED';
    case 5:
      return 'REJECTED';
    default:
      return 'OTHER';
  }
};

export const syncCallLogsOnce = async (userid: any = 0, role_id: any = 0) => {
  console.log(userid);

  try {
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const lastTimestamp = lastSync ? Number(lastSync) : 0;

    const logs = await CallLogs.loadAll();

    // ✅ Filter new logs only
    const newLogs = logs.filter(
      (call: any) => Number(call.timestamp) > lastTimestamp,
    );


    console.log(' new logs ,', newLogs);

    if (newLogs.length === 0) {
      console.log('No new logs ,');
      return;
    }

    // ✅ Send API (one by one)
    for (const call of newLogs) {
      //   if (call?.name == 'Ajay 2') {
      //https://studentapinew.university99.com/api/CallMonitoring/insert-call
      // {
      //   "empl_id": 100167,
      //   "phone_Number": "8127919999",
      //   "employee_Code": "0",
      //   "role_id": 0,
      //   "date_Time": "2026-05-25T20:21:12.160Z",
      //   "call_Duration": 5,
      //   "call_Type": "1",
      //   "caller_Name": "rohit",
      //   "callerId": "0",
      //   "simNo": "1"
      // }
      await api.post('/CallMonitoring/insert-call', {
        empl_id: userid,
        phone_Number: call.phoneNumber,
        employee_Code: '0',
        role_id: 0,
        date_Time: new Date(Number(call.timestamp)).toISOString(),
        call_Duration: Number(call.duration),
        call_Type: call.rawType + '',
        caller_Name: call.name || 'Unknown',
        callerId: '0',
        simNo: '1',
      });
      //   }
    }

    // ✅ Save latest timestamp
    const latestTime = Math.max(
      ...newLogs.map((c: any) => Number(c.timestamp)),
    );

    await AsyncStorage.setItem(LAST_SYNC_KEY, latestTime.toString());

    console.log('✅ Synced:', newLogs.length);
  } catch (error) {
    console.log('❌ Sync Error:', error);
  }
};
