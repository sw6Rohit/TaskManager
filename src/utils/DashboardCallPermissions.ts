import {PermissionsAndroid, Platform} from 'react-native';

export const requestDashboardCallPermissions = async () => {
  if (Platform.OS !== 'android') return;
  const permissions = [
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
  ];
  const missing = [];
  for (const permission of permissions) {
    if (!(await PermissionsAndroid.check(permission))) missing.push(permission);
  }
  if (missing.length) await PermissionsAndroid.requestMultiple(missing);
};
