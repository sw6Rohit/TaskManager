import CallLogs from 'react-native-call-log';
import {PermissionsAndroid, Platform} from 'react-native';

export const getCallStats = async () => {
  const rawLogs = await CallLogs.loadAll();

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
  };
  console.log(rawLogs);

  rawLogs.forEach(log => {
    const {type, duration} = log;

    const dur = parseInt(duration);

    stats.durations.total += dur;

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
      case 'BLOCKED':
      case 'VOICEMAIL':
      case 'ANSWERED_EXTERNALLY':
        break;
      default:
        break;
    }
  });

  stats.neverAttended = stats.missed + stats.rejected;

  return stats;
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
