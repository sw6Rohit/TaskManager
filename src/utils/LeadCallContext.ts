import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'PENDING_LEAD_CALL';

export const rememberLeadCall = async (leadId: number, phoneNumber: string) => {
  await AsyncStorage.setItem(KEY, JSON.stringify({leadId, phoneNumber}));
};

export const clearLeadCall = () => AsyncStorage.removeItem(KEY);

export const resolveLeadCall = async (): Promise<number | null> => {
  const stored = await AsyncStorage.getItem(KEY);
  return stored ? JSON.parse(stored).leadId ?? null : null;
};
