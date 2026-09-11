import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules, Platform} from 'react-native';

// Kotlin owns both foreground and background uploads and their shared checkpoint.
export const configureNativeCallSync = async (userId: any) => {
  if (Platform.OS !== 'android') {
    return;
  }
  const timestamp = Number(await AsyncStorage.getItem('LAST_CALL_SYNC')) || 0;
  await NativeModules.CallDetector.configureCallSync(
    userId ? String(userId) : '',
    timestamp,
  );
};

export const syncCallLogsOnce = async (userId: any = 0, _roleId: any = 0) => {
  if (Platform.OS !== 'android' || !userId) {
    return;
  }
  try {
    await configureNativeCallSync(userId);
    const uploaded = await NativeModules.CallDetector.syncCallLogs();
    console.info(`[CallSync] Native sync complete: uploaded=${uploaded}`);
  } catch (error) {
    console.warn(`[CallSync] Native sync failed: ${(error as Error).message}`);
  }
};
