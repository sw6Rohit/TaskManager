import {NativeModules, PermissionsAndroid, Platform} from 'react-native';

export type SimOption = {
  label: string;
  value: string;
  phoneNumber: string;
  simSlot: number;
  carrierName: string;
};

export const getDeviceSimOptions = async (): Promise<SimOption[]> => {
  if (Platform.OS !== 'android') return [];
  const permissions = [
    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
  ];
  for (const permission of permissions) {
    if (!(await PermissionsAndroid.check(permission))) {
      throw new Error(
        'Allow Phone and Phone number permissions from the Dashboard or app settings, then retry.',
      );
    }
  }
  const sims = await NativeModules.SimModule.getSimInfo();
  return sims
    .filter((sim: any) => sim.slotIndex >= 0)
    .sort((a: any, b: any) => a.slotIndex - b.slotIndex)
    .map((sim: any) => ({
      label: `SIM ${sim.slotIndex + 1} · ${
        sim.phoneNumber || 'Number unavailable'
      }${sim.carrierName ? ` (${sim.carrierName})` : ''}`,
      value: String(sim.slotIndex + 1),
      phoneNumber: sim.phoneNumber || '',
      simSlot: sim.slotIndex + 1,
      carrierName: sim.carrierName || '',
    }));
};
