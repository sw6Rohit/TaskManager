import CallLogs from 'react-native-call-log';
import {PermissionsAndroid, Platform} from 'react-native';
import {NativeModules} from 'react-native';

const {SimModule} = NativeModules;

export const getCallStats = async () => {
  const rawLogs = await CallLogs.loadAll();
  const simList = await getSimList(); // 👈 NEW

  const stats = {
    total: rawLogs.length,
    incoming: 0,
    outgoing: 0,
    missed: 0,
    rejected: 0,
    neverAttended: 0,
    durations: {
      total: 0,
      incoming: 0,
      outgoing: 0,
    },
    logs: [], // 👈 store enriched logs
  };

  rawLogs.forEach(log => {
    const {type, duration} = log;
    const dur = parseInt(duration || '0');

    stats.durations.total += dur;

    // ✅ Get SIM Info
    const simInfo = getSimDetailsFromCall(log, simList);
    console.log(simInfo);

    const enrichedLog = {
      ...log,
      simSlot: simInfo.simSlot,
      carrier: simInfo.carrier,
    };

    stats.logs.push(enrichedLog);

    switch (type) {
      case 'INCOMING':
        stats.incoming++;
        stats.durations.incoming += dur;
        break;
      case 'OUTGOING':
        stats.outgoing++;
        stats.durations.outgoing += dur;
        break;
      case 'MISSED':
        stats.missed++;
        break;
      case 'REJECTED':
        stats.rejected++;
        break;
    }
  });

  stats.neverAttended = stats.missed + stats.rejected;

  return stats;
};
const getSimList = async () => {
  try {
    const sims = await SimModule.getSimInfo();
    return sims;
  } catch (e) {
    console.log('SIM error', e);
    return [];
  }
};
const getSimDetailsFromCall = (call: any, simList: any[]) => {
  if (!call.phoneAccountId) {
    return {simSlot: 'UNKNOWN', carrier: 'UNKNOWN'};
  }

  const match = simList.find(
    sim => String(sim.subscriptionId) === String(call.phoneAccountId),
  );

  if (!match) {
    return {simSlot: 'UNKNOWN', carrier: 'UNKNOWN'};
  }

  return {
    simSlot: match.slotIndex === 0 ? 'SIM1' : 'SIM2',
    carrier: match.carrierName,
  };
};

export const requestCallLogPermission = async () => {
  if (Platform.OS !== 'android') return false;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      {
        title: 'Call Log Permission',
        message: 'App needs access to your call logs',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
