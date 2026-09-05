import {
  AppState,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import type {DisconnectedCall} from '../components/CallFeedbackModal';

type CallDetectorType = {
  getPendingCall: () => Promise<string | null>;
  clearPendingCall: () => Promise<void>;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
};

const callDetector = NativeModules.CallDetector as CallDetectorType | undefined;

const parseCall = (value: string | null): DisconnectedCall | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as DisconnectedCall;
  } catch {
    return null;
  }
};

export const subscribeToDisconnectedCalls = (
  onCall: (call: DisconnectedCall) => void,
) => {
  if (Platform.OS !== 'android' || !callDetector) {
    return () => {};
  }

  const deliverPendingCall = async () => {
    const call = parseCall(await callDetector.getPendingCall());
    if (call) {
      onCall(call);
    }
  };

  const eventEmitter = new NativeEventEmitter(NativeModules.CallDetector);
  const eventSubscription = eventEmitter.addListener(
    'CallDisconnected',
    (value: string) => {
      const call = parseCall(value);
      if (call) {
        onCall(call);
      }
    },
  );
  const appStateSubscription = AppState.addEventListener('change', state => {
    if (state === 'active') {
      deliverPendingCall();
    }
  });

  deliverPendingCall();

  return () => {
    eventSubscription.remove();
    appStateSubscription.remove();
  };
};

export const clearPendingDisconnectedCall = async () => {
  await callDetector?.clearPendingCall();
};
