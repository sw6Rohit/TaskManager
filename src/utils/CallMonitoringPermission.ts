import {PermissionsAndroid, Platform} from 'react-native';

export const requestCallMonitoringPermission = async () => {
  if (Platform.OS !== 'android') return false;
  const permission = PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE;
  if (await PermissionsAndroid.check(permission)) return true;
  const result = await PermissionsAndroid.request(permission, {
    title: 'Call monitoring',
    message:
      'Allow phone access to detect when calls end and sync call logs in the background.',
    buttonPositive: 'Continue',
    buttonNegative: 'Cancel',
  });
  console.info(`[CallSync] phone permission=${result}`);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};
